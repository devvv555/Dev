/**
 * StarkScript Lexer & AST Parser
 * 
 * A domain-specific declarative programming language invented for PSGIM academic
 * attendance audits, debarment theorem proving, and placement skill vector verification.
 */

export type TokenType =
  | 'PROTOCOL'
  | 'STUDENT'
  | 'IN'
  | 'BATCH'
  | 'POLICY'
  | 'COURSE'
  | 'ATTENDED'
  | 'CONDUCTED'
  | 'HOURS'
  | 'FACULTY'
  | 'EXECUTE'
  | 'SCAN'
  | 'IF'
  | 'THEN'
  | 'ELSE'
  | 'EMIT'
  | 'EVALUATE'
  | 'PLACEMENT_FIT'
  | 'REQUIRE'
  | 'MATCH'
  | 'IDENTIFIER'
  | 'STRING'
  | 'NUMBER'
  | 'PERCENTAGE'
  | 'LBRACE'
  | 'RBRACE'
  | 'LPAREN'
  | 'RPAREN'
  | 'COLON'
  | 'EQUALS'
  | 'LESS_THAN'
  | 'GREATER_THAN'
  | 'EOF';

export interface Token {
  type: TokenType;
  value: string;
  line: number;
}

export function tokenizeStarkScript(code: string): Token[] {
  const tokens: Token[] = [];
  const lines = code.split('\n');

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const rawLine = lines[lineNum];
    // Strip comments
    const line = rawLine.replace(/\/\/.*$/, '');
    let i = 0;

    while (i < line.length) {
      const char = line[i];

      // Whitespace
      if (/\s/.test(char)) {
        i++;
        continue;
      }

      // Symbols
      if (char === '{') { tokens.push({ type: 'LBRACE', value: '{', line: lineNum + 1 }); i++; continue; }
      if (char === '}') { tokens.push({ type: 'RBRACE', value: '}', line: lineNum + 1 }); i++; continue; }
      if (char === '(') { tokens.push({ type: 'LPAREN', value: '(', line: lineNum + 1 }); i++; continue; }
      if (char === ')') { tokens.push({ type: 'RPAREN', value: ')', line: lineNum + 1 }); i++; continue; }
      if (char === ':') { tokens.push({ type: 'COLON', value: ':', line: lineNum + 1 }); i++; continue; }
      if (char === '=') { tokens.push({ type: 'EQUALS', value: '=', line: lineNum + 1 }); i++; continue; }
      if (char === '<') { tokens.push({ type: 'LESS_THAN', value: '<', line: lineNum + 1 }); i++; continue; }
      if (char === '>') { tokens.push({ type: 'GREATER_THAN', value: '>', line: lineNum + 1 }); i++; continue; }

      // Strings
      if (char === '"' || char === "'") {
        const quote = char;
        let str = '';
        i++;
        while (i < line.length && line[i] !== quote) {
          str += line[i];
          i++;
        }
        i++; // skip closing quote
        tokens.push({ type: 'STRING', value: str, line: lineNum + 1 });
        continue;
      }

      // Numbers & Percentages
      if (/\d/.test(char)) {
        let numStr = '';
        while (i < line.length && /[\d.]/.test(line[i])) {
          numStr += line[i];
          i++;
        }
        if (i < line.length && line[i] === '%') {
          i++;
          tokens.push({ type: 'PERCENTAGE', value: numStr, line: lineNum + 1 });
        } else {
          tokens.push({ type: 'NUMBER', value: numStr, line: lineNum + 1 });
        }
        continue;
      }

      // Identifiers & Keywords
      if (/[A-Za-z_]/.test(char)) {
        let ident = '';
        while (i < line.length && /[A-Za-z0-9_]/.test(line[i])) {
          ident += line[i];
          i++;
        }

        const upper = ident.toUpperCase();
        switch (upper) {
          case 'PROTOCOL': tokens.push({ type: 'PROTOCOL', value: ident, line: lineNum + 1 }); break;
          case 'STUDENT': tokens.push({ type: 'STUDENT', value: ident, line: lineNum + 1 }); break;
          case 'IN': tokens.push({ type: 'IN', value: ident, line: lineNum + 1 }); break;
          case 'BATCH': tokens.push({ type: 'BATCH', value: ident, line: lineNum + 1 }); break;
          case 'POLICY': tokens.push({ type: 'POLICY', value: ident, line: lineNum + 1 }); break;
          case 'COURSE': tokens.push({ type: 'COURSE', value: ident, line: lineNum + 1 }); break;
          case 'ATTENDED': tokens.push({ type: 'ATTENDED', value: ident, line: lineNum + 1 }); break;
          case 'CONDUCTED': tokens.push({ type: 'CONDUCTED', value: ident, line: lineNum + 1 }); break;
          case 'HOURS': tokens.push({ type: 'HOURS', value: ident, line: lineNum + 1 }); break;
          case 'FACULTY': tokens.push({ type: 'FACULTY', value: ident, line: lineNum + 1 }); break;
          case 'EXECUTE': tokens.push({ type: 'EXECUTE', value: ident, line: lineNum + 1 }); break;
          case 'SCAN': tokens.push({ type: 'SCAN', value: ident, line: lineNum + 1 }); break;
          case 'IF': tokens.push({ type: 'IF', value: ident, line: lineNum + 1 }); break;
          case 'THEN': tokens.push({ type: 'THEN', value: ident, line: lineNum + 1 }); break;
          case 'ELSE': tokens.push({ type: 'ELSE', value: ident, line: lineNum + 1 }); break;
          case 'EMIT': tokens.push({ type: 'EMIT', value: ident, line: lineNum + 1 }); break;
          case 'EVALUATE': tokens.push({ type: 'EVALUATE', value: ident, line: lineNum + 1 }); break;
          case 'PLACEMENT_FIT': tokens.push({ type: 'PLACEMENT_FIT', value: ident, line: lineNum + 1 }); break;
          case 'REQUIRE': tokens.push({ type: 'REQUIRE', value: ident, line: lineNum + 1 }); break;
          case 'MATCH': tokens.push({ type: 'MATCH', value: ident, line: lineNum + 1 }); break;
          default:
            tokens.push({ type: 'IDENTIFIER', value: ident, line: lineNum + 1 });
            break;
        }
        continue;
      }

      // Skip unknown character
      i++;
    }
  }

  tokens.push({ type: 'EOF', value: '', line: lines.length + 1 });
  return tokens;
}
