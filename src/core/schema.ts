import Ajv, { type ErrorObject } from 'ajv';
import Ajv2019 from 'ajv/dist/2019';
import Ajv2020 from 'ajv/dist/2020';
import { JsonToolError } from './errors';
import { parseJson } from './parse';

export interface SchemaError {
  path: string;
  message: string;
}

export interface SchemaResult {
  valid: boolean;
  errors: SchemaError[];
}

function pickValidator(schema: Record<string, unknown>) {
  const draft = String(schema.$schema ?? '');
  const opts = { allErrors: true, strict: false };
  if (draft.includes('2020-12')) return new Ajv2020(opts);
  if (draft.includes('2019-09')) return new Ajv2019(opts);
  return new Ajv(opts);
}

function toPath(instancePath: string): string {
  if (!instancePath) return '$';
  return (
    '$' +
    instancePath
      .split('/')
      .slice(1)
      .map((p) => p.replace(/~1/g, '/').replace(/~0/g, '~'))
      .map((p) =>
        /^\d+$/.test(p) ? `[${p}]` : /^[A-Za-z_$][\w$]*$/.test(p) ? `.${p}` : `['${p}']`,
      )
      .join('')
  );
}

function describe(e: ErrorObject): string {
  if (e.keyword === 'additionalProperties') {
    return `must NOT have additional property "${(e.params as { additionalProperty: string }).additionalProperty}"`;
  }
  if (e.keyword === 'enum') {
    return `must be one of ${JSON.stringify((e.params as { allowedValues: unknown[] }).allowedValues)}`;
  }
  return e.message ?? e.keyword;
}

export function validateSchema(dataText: string, schemaText: string): SchemaResult {
  const data = parseJson(dataText);
  let schema: unknown;
  try {
    schema = parseJson(schemaText);
  } catch (e) {
    throw new JsonToolError(
      `Schema: ${(e as Error).message}`,
      (e as JsonToolError).line,
      (e as JsonToolError).column,
    );
  }
  if (schema === null || typeof schema !== 'object' || Array.isArray(schema)) {
    throw new JsonToolError('Schema must be a JSON object');
  }

  let check;
  try {
    check = pickValidator(schema as Record<string, unknown>).compile(schema as object);
  } catch (e) {
    throw new JsonToolError(`Invalid schema: ${(e as Error).message}`);
  }

  const valid = check(data) as boolean;
  return {
    valid,
    errors: (check.errors ?? []).map((e) => ({
      path: toPath(e.instancePath),
      message: describe(e),
    })),
  };
}
