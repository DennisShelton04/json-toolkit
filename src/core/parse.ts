import { JsonToolError } from './errors';
import { validate } from './validate';

/** Strict JSON.parse that throws a JsonToolError with the location of the first problem. */
export function parseJson(text: string): unknown {
  if (text.trim() === '') throw new JsonToolError('Input is empty');
  try {
    return JSON.parse(text);
  } catch {
    const first = validate(text).errors[0];
    throw new JsonToolError(first?.message ?? 'Invalid JSON', first?.line, first?.column);
  }
}
