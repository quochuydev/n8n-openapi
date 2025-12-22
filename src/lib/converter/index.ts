import type { OpenAPISpec } from '../../types';
import type { N8nNode, N8nWorkflow } from '../../types';
import { convertOpenAPI3 } from './openapi3';
import { convertSwagger2 } from './swagger2';
import { createWorkflow } from './shared';

export function convertToN8nNodes(spec: OpenAPISpec, baseUrl: string): N8nNode[] {
  if (isSwagger2(spec)) {
    return convertSwagger2(spec, baseUrl);
  }
  return convertOpenAPI3(spec, baseUrl);
}

function isSwagger2(spec: OpenAPISpec): boolean {
  // Swagger 2.0 uses "swagger": "2.0"
  // OpenAPI 3.x uses "openapi": "3.x.x"
  return spec.swagger !== undefined && spec.swagger.startsWith('2');
}

export { createWorkflow };
