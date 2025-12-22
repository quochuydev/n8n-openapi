import yaml from 'js-yaml';
import type { OpenAPISpec } from '../types';

export function parseOpenAPI(input: string): OpenAPISpec {
  let spec: OpenAPISpec;

  // Try JSON first
  try {
    spec = JSON.parse(input);
  } catch {
    // Try YAML
    try {
      spec = yaml.load(input) as OpenAPISpec;
    } catch {
      throw new Error('Invalid OpenAPI spec: not valid JSON or YAML');
    }
  }

  // Basic validation
  if (!spec.paths) {
    throw new Error('Invalid OpenAPI spec: missing "paths"');
  }

  if (!spec.openapi && !spec.swagger) {
    throw new Error('Invalid OpenAPI spec: missing "openapi" or "swagger" version');
  }

  return spec;
}

export function getBaseUrl(spec: OpenAPISpec): string {
  // OpenAPI 3.x format
  if (spec.servers && spec.servers.length > 0) {
    return spec.servers[0].url;
  }

  // Swagger 2.0 format
  if (spec.host) {
    const scheme = spec.schemes?.[0] || 'https';
    const basePath = spec.basePath || '';
    return `${scheme}://${spec.host}${basePath}`;
  }

  return '';
}

export interface Server {
  url: string;
  description?: string;
}

export function getServers(spec: OpenAPISpec): Server[] {
  if (spec.servers && spec.servers.length > 0) {
    return spec.servers.map(s => ({
      url: s.url,
      description: s.description,
    }));
  }
  return [];
}
