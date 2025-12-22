import type { OpenAPISpec, Operation } from '../../types';
import type { N8nNode } from '../../types';
import { HTTP_METHODS, createNode, removeDuplicateHeaders, type AuthHeader } from './shared';

export function convertSwagger2(spec: OpenAPISpec, baseUrl: string): N8nNode[] {
  const nodes: N8nNode[] = [];
  let row = 0;
  const colSpacing = 250;
  const rowSpacing = 150;

  for (const [path, pathItem] of Object.entries(spec.paths)) {
    let col = 0;

    for (const method of HTTP_METHODS) {
      const operation = pathItem[method] as Operation | undefined;
      if (!operation) continue;

      const queryParams = (operation.parameters || []).filter(p => p.in === 'query');
      const headerParams = (operation.parameters || []).filter(p => p.in === 'header');
      const authHeaders = getAuthHeaders(operation, spec);
      const authDescription = getAuthDescription(operation, spec);

      const node = createNode({
        method: method.toUpperCase(),
        path,
        baseUrl,
        operationId: operation.operationId,
        summary: operation.summary,
        description: operation.description,
        queryParams,
        headerParams,
        authHeaders,
        authDescription,
        position: [col * colSpacing, row * rowSpacing],
      });

      nodes.push(node);
      col++;
    }

    if (col > 0) row++;
  }

  return nodes;
}

function getAuthHeaders(operation: Operation, spec: OpenAPISpec): AuthHeader[] {
  const security = operation.security || spec.security;
  if (!security || security.length === 0) return [];

  // Swagger 2.0 uses securityDefinitions instead of components.securitySchemes
  const schemes = spec.securityDefinitions || {};
  const headers: AuthHeader[] = [];

  for (const requirement of security) {
    for (const schemeName of Object.keys(requirement)) {
      const scheme = schemes[schemeName];
      if (scheme) {
        if (scheme.type === 'apiKey' && scheme.in === 'header' && scheme.name) {
          // Check if it's a Bearer token pattern (Authorization header)
          if (scheme.name === 'Authorization') {
            headers.push({ name: 'Authorization', value: 'Bearer {{token}}' });
          } else {
            headers.push({ name: scheme.name, value: '{{apiKey}}' });
          }
        } else if (scheme.type === 'basic') {
          headers.push({ name: 'Authorization', value: 'Basic {{credentials}}' });
        } else if (scheme.type === 'oauth2') {
          headers.push({ name: 'Authorization', value: 'Bearer {{token}}' });
        }
      }
    }
  }

  return removeDuplicateHeaders(headers);
}

function getAuthDescription(operation: Operation, spec: OpenAPISpec): string {
  const security = operation.security || spec.security;
  if (!security || security.length === 0) return '';

  // Swagger 2.0 uses securityDefinitions
  const schemes = spec.securityDefinitions || {};
  const authTypes: string[] = [];

  for (const requirement of security) {
    for (const schemeName of Object.keys(requirement)) {
      const scheme = schemes[schemeName];
      if (scheme) {
        if (scheme.type === 'apiKey') {
          if (scheme.name === 'Authorization') {
            authTypes.push('Bearer token');
          } else {
            authTypes.push(`API Key (${scheme.in}: ${scheme.name})`);
          }
        } else if (scheme.type === 'basic') {
          authTypes.push('Basic auth');
        } else if (scheme.type === 'oauth2') {
          authTypes.push('OAuth2');
        } else {
          authTypes.push(scheme.type);
        }
      }
    }
  }

  if (authTypes.length === 0) return '';
  return `Auth: ${[...new Set(authTypes)].join(', ')}`;
}
