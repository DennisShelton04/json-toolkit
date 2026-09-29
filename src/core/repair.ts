import { jsonrepair } from 'jsonrepair';
import { JsonToolError } from './errors';

/** Fixes common mistakes (comments, trailing commas, single quotes, unquoted keys, missing brackets). */
export function repair(text: string, indent: 2 | 4 | '\t' = 2): string {
  if (text.trim() === '') throw new JsonToolError('Input is empty');
  try {
    return JSON.stringify(JSON.parse(jsonrepair(text)), null, indent);
  } catch (e) {
    throw new JsonToolError(`Unable to repair: ${(e as Error).message}`);
  }
}
