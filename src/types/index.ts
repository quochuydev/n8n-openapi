export interface OpenAPISpec {
  openapi?: string;
  swagger?: string;
  info: {
    title: string;
    version: string;
    description?: string;
  };
  servers?: Array<{ url: string; description?: string }>;
  paths: Record<string, PathItem>;
  components?: {
    securitySchemes?: Record<string, SecurityScheme>;
  };
  security?: Array<Record<string, string[]>>;
}

export interface PathItem {
  get?: Operation;
  post?: Operation;
  put?: Operation;
  patch?: Operation;
  delete?: Operation;
  options?: Operation;
  head?: Operation;
}

export interface Operation {
  operationId?: string;
  summary?: string;
  description?: string;
  parameters?: Parameter[];
  requestBody?: RequestBody;
  security?: Array<Record<string, string[]>>;
  tags?: string[];
}

export interface Parameter {
  name: string;
  in: 'query' | 'header' | 'path' | 'cookie';
  required?: boolean;
  description?: string;
  schema?: { type?: string };
}

export interface RequestBody {
  required?: boolean;
  content?: Record<string, { schema?: object }>;
}

export interface SecurityScheme {
  type: 'apiKey' | 'http' | 'oauth2' | 'openIdConnect';
  scheme?: string;
  bearerFormat?: string;
  name?: string;
  in?: string;
}

export interface N8nNode {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters: N8nHttpParameters;
}

export interface N8nHttpParameters {
  method: string;
  url: string;
  sendQuery?: boolean;
  queryParameters?: {
    parameters: Array<{ name: string; value: string }>;
  };
  sendHeaders?: boolean;
  headerParameters?: {
    parameters: Array<{ name: string; value: string }>;
  };
  options?: {
    description?: string;
  };
}

export interface N8nWorkflow {
  nodes: N8nNode[];
  connections: Record<string, unknown>;
}
