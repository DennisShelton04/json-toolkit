import { parse, printParseErrorCode, visit, type ParseError } from 'jsonc-parser';
import { offsetToPosition } from './errors';

export interface Problem {
  message: string;
  line: number;
  column: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: Problem[];
  warnings: Problem[];
}

const MESSAGES: Record<string, string> = {
  InvalidSymbol: 'Invalid symbol',
  InvalidNumberFormat: 'Invalid number format',
  PropertyNameExpected: 'Property name expected (keys must be double-quoted strings)',
  ValueExpected: 'Value expected',
  ColonExpected: 'Colon expected',
  CommaExpected: 'Comma expected',
  CloseBraceExpected: "Closing '}' expected",
  CloseBracketExpected: "Closing ']' expected",
  EndOfFileExpected: 'Unexpected content after the end of the document',
  InvalidCommentToken: 'Comments are not allowed in JSON',
  UnexpectedEndOfComment: 'Unterminated comment',
  UnexpectedEndOfString: 'Unterminated string',
  UnexpectedEndOfNumber: 'Unexpected end of number',
  InvalidUnicode: 'Invalid unicode escape sequence',
  InvalidEscapeCharacter: 'Invalid escape character',
  InvalidCharacter: 'Invalid character in string',
};

export function validate(text: string): ValidationResult {
  if (text.trim() === '') {
    return {
      valid: false,
      errors: [{ message: 'Input is empty', line: 1, column: 1 }],
      warnings: [],
    };
  }

  const parseErrors: ParseError[] = [];
  parse(text, parseErrors, { allowTrailingComma: false, disallowComments: true });

  const errors: Problem[] = parseErrors.map((e) => {
    const code = printParseErrorCode(e.error);
    return { message: MESSAGES[code] ?? code, ...offsetToPosition(text, e.offset) };
  });

  const warnings: Problem[] = [];
  const keyStack: Set<string>[] = [];
  visit(text, {
    onObjectBegin: () => {
      keyStack.push(new Set());
    },
    onObjectEnd: () => {
      keyStack.pop();
    },
    onObjectProperty: (key, offset) => {
      const keys = keyStack[keyStack.length - 1];
      if (!keys) return;
      if (keys.has(key)) {
        warnings.push({ message: `Duplicate key "${key}"`, ...offsetToPosition(text, offset) });
      }
      keys.add(key);
    },
  });

  return { valid: errors.length === 0, errors, warnings };
}
