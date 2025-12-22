import { v4 as uuidv4 } from 'uuid';
import type { OpenAPISpec, Operation, N8nNode, N8nWorkflow } from '../types';

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'] as const;

export function convertToN8nNodes(spec: OpenAPISpec, baseUrl: string): N8nNode[] {
  const nodes: N8nNode[] = [];
  let row = 0;
  const colSpacing = 250;
  const rowSpacing = 150;

  for (const [path, pathItem] of Object.entries(spec.paths)) {
    let col = 0;

    for (const method of HTTP_METHODS) {
      const operation = pathItem[method] as Operation | undefined;
      if (!operation) continue;

      const node = createNode(
        method.toUpperCase(),
        path,
        baseUrl,
        operation,
        spec,
        [col * colSpacing, row * rowSpacing]
      );

      nodes.push(node);
      col++;
    }

    if (col > 0) row++;
  }

  return nodes;
}

function createNode(
  method: string,
  path: string,
  baseUrl: string,
  operation: Operation,
  spec: OpenAPISpec,
  position: [number, number]
): N8nNode {
  const name = operation.operationId || `${method} ${path}`;
  const url = `${baseUrl}${path}`;

  const queryParams = (operation.parameters || []).filter(p => p.in === 'query');
  const headerParams = (operation.parameters || []).filter(p => p.in === 'header');

  const authDescription = getAuthDescription(operation, spec);
  const description = [
    authDescription,
    operation.summary,
    operation.description
  ].filter(Boolean).join('\n');

  const node: N8nNode = {
    id: uuidv4(),
    name,
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4.3,
    position,
    parameters: {
      method,
      url,
    }
  };

  if (queryParams.length > 0) {
    node.parameters.sendQuery = true;
    node.parameters.queryParameters = {
      parameters: queryParams.map(p => ({ name: p.name, value: '' }))
    };
  }

  if (headerParams.length > 0) {
    node.parameters.sendHeaders = true;
    node.parameters.headerParameters = {
      parameters: headerParams.map(p => ({ name: p.name, value: '' }))
    };
  }

  if (description) {
    node.parameters.options = { description };
  }

  return node;
}

function getAuthDescription(operation: Operation, spec: OpenAPISpec): string {
  const security = operation.security || spec.security;
  if (!security || security.length === 0) return '';

  const schemes = spec.components?.securitySchemes || {};
  const authTypes: string[] = [];

  for (const requirement of security) {
    for (const schemeName of Object.keys(requirement)) {
      const scheme = schemes[schemeName];
      if (scheme) {
        if (scheme.type === 'http' && scheme.scheme === 'bearer') {
          authTypes.push('Bearer token');
        } else if (scheme.type === 'http' && scheme.scheme === 'basic') {
          authTypes.push('Basic auth');
        } else if (scheme.type === 'apiKey') {
          authTypes.push(`API Key (${scheme.in}: ${scheme.name})`);
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

export function createWorkflow(nodes: N8nNode[]): N8nWorkflow {
  return {
    nodes,
    connections: {}
  };
}
