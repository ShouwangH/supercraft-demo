/**
 * LOC (Lines of Code) checker script
 * Warns when files exceed 300 lines or functions exceed 80 lines
 * Non-blocking: exits 0 even with warnings
 */

import * as fs from 'fs';
import * as path from 'path';

const MAX_FILE_LINES = 300;
const MAX_FUNCTION_LINES = 80;
const SRC_DIR = path.join(process.cwd(), 'src');

interface Violation {
  file: string;
  type: 'file' | 'function';
  name?: string;
  lines: number;
  limit: number;
}

function countLines(content: string): number {
  return content.split('\n').filter(line => {
    const trimmed = line.trim();
    return trimmed.length > 0 && !trimmed.startsWith('//');
  }).length;
}

function findFunctions(content: string): Array<{ name: string; lines: number }> {
  const functions: Array<{ name: string; lines: number }> = [];
  const lines = content.split('\n');

  // Simple heuristic: find function/const declarations and count braces
  const funcPatterns = [
    /^(?:export\s+)?(?:async\s+)?function\s+(\w+)/,
    /^(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s*)?\(/,
    /^(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s*)?\s*\([^)]*\)\s*(?::\s*\w+)?\s*=>/,
  ];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    let match: RegExpMatchArray | null = null;

    for (const pattern of funcPatterns) {
      match = line.match(pattern);
      if (match) break;
    }

    if (match) {
      const funcName = match[1];
      let braceCount = 0;
      let started = false;
      let funcLines = 0;

      for (let j = i; j < lines.length; j++) {
        const currentLine = lines[j];
        funcLines++;

        for (const char of currentLine) {
          if (char === '{') {
            braceCount++;
            started = true;
          } else if (char === '}') {
            braceCount--;
          }
        }

        if (started && braceCount === 0) {
          functions.push({ name: funcName, lines: funcLines });
          break;
        }
      }
    }
    i++;
  }

  return functions;
}

function walkDir(dir: string): string[] {
  const files: string[] = [];

  if (!fs.existsSync(dir)) return files;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.next') {
        files.push(...walkDir(fullPath));
      }
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

function checkFile(filePath: string): Violation[] {
  const violations: Violation[] = [];
  const content = fs.readFileSync(filePath, 'utf-8');
  const relativePath = path.relative(process.cwd(), filePath);

  // Check file length
  const fileLines = countLines(content);
  if (fileLines > MAX_FILE_LINES) {
    violations.push({
      file: relativePath,
      type: 'file',
      lines: fileLines,
      limit: MAX_FILE_LINES,
    });
  }

  // Check function lengths (skip test files)
  if (!filePath.includes('.test.')) {
    const functions = findFunctions(content);
    for (const func of functions) {
      if (func.lines > MAX_FUNCTION_LINES) {
        violations.push({
          file: relativePath,
          type: 'function',
          name: func.name,
          lines: func.lines,
          limit: MAX_FUNCTION_LINES,
        });
      }
    }
  }

  return violations;
}

function main(): void {
  const files = walkDir(SRC_DIR);
  const allViolations: Violation[] = [];

  for (const file of files) {
    allViolations.push(...checkFile(file));
  }

  if (allViolations.length === 0) {
    console.log('✓ LOC check passed: No violations found');
    process.exit(0);
  }

  console.warn('\n⚠ LOC check warnings:\n');

  for (const v of allViolations) {
    if (v.type === 'file') {
      console.warn(`  ${v.file}: ${v.lines} lines (limit: ${v.limit})`);
    } else {
      console.warn(`  ${v.file} → ${v.name}(): ${v.lines} lines (limit: ${v.limit})`);
    }
  }

  console.warn(`\n  Total: ${allViolations.length} warning(s)\n`);

  // Non-blocking: exit 0 even with warnings
  process.exit(0);
}

main();
