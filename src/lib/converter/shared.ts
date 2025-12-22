import { v4 as uuidv4 } from 'uuid';
import type { N8nNode, N8nWorkflow } from '../../types';

export const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'] as const;

export interface AuthHeader {
  name: string;
  value: string;
}

export interface NodeParams {
  method: string;
  path: string;
  baseUrl: string;
  operationId?: string;
  summary?: string;
  description?: string;
  queryParams: Array<{ name: string }>;
  headerParams: Array<{ name: string }>;
  authHeaders: AuthHeader[];
  authDescription: string;
  position: [number, number];
}

export function createNode(params: NodeParams): N8nNode {
  const {
    method,
    path,
    baseUrl,
    operationId,
    summary,
    description,
    queryParams,
    headerParams,
    authHeaders,
    authDescription,
    position,
  } = params;

  const name = operationId || `${method} ${path}`;
  const url = `${baseUrl}${path}`;

  const allHeaders = [
    ...headerParams.map(p => ({ name: p.name, value: '' })),
    ...authHeaders,
  ];

  const fullDescription = [authDescription, summary, description]
    .filter(Boolean)
    .join('\n');

  const node: N8nNode = {
    id: uuidv4(),
    name,
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4.3,
    position,
    parameters: {
      method,
      url,
    },
  };

  if (queryParams.length > 0) {
    node.parameters.sendQuery = true;
    node.parameters.queryParameters = {
      parameters: queryParams.map(p => ({ name: p.name, value: '' })),
    };
  }

  if (allHeaders.length > 0) {
    node.parameters.sendHeaders = true;
    node.parameters.headerParameters = {
      parameters: allHeaders,
    };
  }

  if (fullDescription) {
    node.parameters.options = { description: fullDescription };
  }

  return node;
}

export function createWorkflow(nodes: N8nNode[]): N8nWorkflow {
  return {
    nodes,
    connections: {},
  };
}

export function removeDuplicateHeaders(headers: AuthHeader[]): AuthHeader[] {
  const seen = new Set<string>();
  return headers.filter(h => {
    if (seen.has(h.name)) return false;
    seen.add(h.name);
    return true;
  });
}
