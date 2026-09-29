import { JSONPath } from 'jsonpath-plus';
import { JsonToolError } from './errors';
import { parseJson } from './parse';

export function query(text: string, path: string): unknown[] {
  const json = parseJson(text) as object;
  if (path.trim() === '') throw new JsonToolError('JSONPath expression is empty');
  try {
    return JSONPath({ path, json, eval: 'safe', wrap: true }) as unknown[];
  } catch (e) {
    throw new JsonToolError(`Invalid JSONPath: ${(e as Error).message}`);
  }
}
