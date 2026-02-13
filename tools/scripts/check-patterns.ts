#!/usr/bin/env tsx
/**
 * Architecture Pattern Checker
 *
 * Validates that code follows architecture patterns (aligned with WebTree):
 * - Progressive layering (functions → classes → repositories)
 * - Feature-based organization
 * - Type safety
 * - Error handling
 * - Separation of concerns
 *
 * Usage:
 *   pnpm check:patterns
 *   or
 *   tsx tools/scripts/check-patterns.ts
 */

import { readFileSync } from "fs";
import { glob } from "glob";
import path from "path";

const APP_DIR = "apps/dapp";

interface PatternViolation {
  file: string;
  rule: string;
  message: string;
  line?: number;
}

const violations: PatternViolation[] = [];

function addViolation(
  file: string,
  rule: string,
  message: string,
  line?: number,
) {
  violations.push({ file, rule, message, line });
}

// Check 1: Service functions in correct location
function checkServiceLocation() {
  const serviceFiles = glob.sync(`${APP_DIR}/lib/services/**/*.ts`, {
    ignore: ["node_modules/**"],
  });

  for (const file of serviceFiles) {
    const content = readFileSync(file, "utf-8");

    const hasClassExport = /^export\s+class\s+\w+/.test(content);
    const hasFunctionExport = /^export\s+(async\s+)?function\s+\w+/.test(
      content,
    );

    if (hasClassExport && !hasFunctionExport) {
      addViolation(
        file,
        "Service Pattern",
        "Service files should export functions in Phase 1, not classes. Consider refactoring to functions or moving to Phase 2.",
      );
    }
  }
}

// Check 2: No direct Supabase/DB in API routes (use services)
function checkAPIRoutes() {
  const apiFiles = glob.sync(`${APP_DIR}/app/api/**/*.ts`, {
    ignore: ["node_modules/**"],
  });

  for (const file of apiFiles) {
    const content = readFileSync(file, "utf-8");

    const hasDirectSupabase = /from\s+['"]@supabase\/supabase-js['"]/.test(
      content,
    );
    const usesService = /from\s+['"]@\/lib\/services/.test(content);

    if (hasDirectSupabase && !usesService) {
      addViolation(
        file,
        "Separation of Concerns",
        "API routes should use service functions, not direct Supabase calls. Move database logic to lib/services/",
      );
    }
  }
}

// Check 3: Types defined in shared/types or @hack/types
function checkTypeDefinitions() {
  const serviceFiles = glob.sync(`${APP_DIR}/lib/services/**/*.ts`, {
    ignore: ["node_modules/**"],
  });

  for (const file of serviceFiles) {
    const content = readFileSync(file, "utf-8");

    const hasInlineTypes = /(interface|type)\s+\w+\s*[={]/.test(content);
    const importsTypes =
      /from\s+['"]@\/shared\/types|from\s+['"]@hack\/types['"]/.test(content) ||
      /from\s+['"]@\/lib\/shared\/types/.test(content);

    if (hasInlineTypes && !importsTypes) {
      const lines = content.split("\n");

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const nextLine = i + 1 < lines.length ? lines[i + 1] : "";
        if (
          (/^export\s+(interface|type)\s+\w+/.test(line) ||
            /^export\s+type\s+\w+\s*=/.test(line)) &&
          !line.includes("// ALLOWED") &&
          !nextLine.includes("// ALLOWED")
        ) {
          addViolation(
            file,
            "Type Organization",
            `Types should be defined in shared/types or @hack/types, not inline. Found at line ${i + 1}: ${line.trim()}`,
            i + 1,
          );
        }
      }
    }
  }
}

// Check 4: Error handling in services
function checkErrorHandling() {
  const serviceFiles = glob.sync(`${APP_DIR}/lib/services/**/*.ts`, {
    ignore: ["node_modules/**"],
  });

  for (const file of serviceFiles) {
    const content = readFileSync(file, "utf-8");

    const asyncFunctions =
      content.match(/export\s+async\s+function\s+\w+/g) || [];
    const hasErrorHandling = /throw\s+new|try\s*\{|catch\s*\(/.test(content);

    if (asyncFunctions.length > 0 && !hasErrorHandling) {
      addViolation(
        file,
        "Error Handling",
        "Service functions should include error handling. Use try/catch or throw custom errors.",
      );
    }
  }
}

// Check 5: No 'any' types
function checkNoAnyTypes() {
  const tsFiles = glob.sync(`${APP_DIR}/**/*.{ts,tsx}`, {
    ignore: [
      "node_modules/**",
      "**/*.d.ts",
      "**/dist/**",
      "**/.next/**",
      "**/tools/**",
      "**/packages/**",
    ],
  });

  for (const file of tsFiles) {
    const content = readFileSync(file, "utf-8");

    const anyMatches = content.match(/:\s*any\b/g);
    if (anyMatches) {
      const lines = content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const nextLine = i + 1 < lines.length ? lines[i + 1] : "";
        if (
          line.includes(": any") &&
          !line.includes("// ALLOWED") &&
          !nextLine.includes("// ALLOWED")
        ) {
          addViolation(
            file,
            "Type Safety",
            `Avoid 'any' types. Use 'unknown' or proper types. Found at line ${i + 1}`,
            i + 1,
          );
        }
      }
    }
  }
}

// Check 6: Function complexity (lines)
function checkFunctionComplexity() {
  const serviceFiles = glob.sync(`${APP_DIR}/lib/services/**/*.ts`, {
    ignore: ["node_modules/**"],
  });
  const MAX_FUNCTION_LINES = 100;

  for (const file of serviceFiles) {
    const content = readFileSync(file, "utf-8");
    const lines = content.split("\n");

    const functionRegex = /export\s+(async\s+)?function\s+(\w+)/g;
    let match;

    while ((match = functionRegex.exec(content)) !== null) {
      const functionName = match[2];
      const startIndex = match.index;

      let braceCount = 0;
      let inFunction = false;
      let functionStartLine = 0;
      let functionEndLine = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineStart = content.indexOf(
          line,
          i > 0 ? content.indexOf(lines[i - 1]) + lines[i - 1].length : 0,
        );

        if (lineStart <= startIndex && startIndex < lineStart + line.length) {
          inFunction = true;
          functionStartLine = i;
        }

        if (inFunction) {
          braceCount += (line.match(/{/g) || []).length;
          braceCount -= (line.match(/}/g) || []).length;

          if (braceCount === 0 && i > functionStartLine) {
            functionEndLine = i;
            break;
          }
        }
      }

      const functionLines = functionEndLine - functionStartLine + 1;

      if (functionLines > MAX_FUNCTION_LINES) {
        addViolation(
          file,
          "Function Complexity",
          `Function '${functionName}' is ${functionLines} lines (max: ${MAX_FUNCTION_LINES}). Consider refactoring or splitting.`,
          functionStartLine + 1,
        );
      }
    }
  }
}

// Check 7: Feature-based structure
function checkFeatureStructure() {
  const serviceFiles = glob.sync(`${APP_DIR}/lib/services/**/*.ts`, {
    ignore: ["node_modules/**"],
  });

  for (const file of serviceFiles) {
    const fileName = path.basename(file, ".ts");
    const dirName = path.dirname(file);

    const expectedDir = `lib/services/${fileName}`;
    if (!dirName.includes(fileName) && fileName !== "index") {
      console.warn(
        "Consider organizing " +
          file +
          " by feature (e.g., lib/services/" +
          fileName +
          "/)",
      );
    }
  }
}

function runChecks() {
  console.log("Running architecture pattern checks...\n");

  checkServiceLocation();
  checkAPIRoutes();
  checkTypeDefinitions();
  checkErrorHandling();
  checkNoAnyTypes();
  checkFunctionComplexity();
  checkFeatureStructure();

  if (violations.length > 0) {
    const violationCount = violations.length.toString();
    console.error("\nFound " + violationCount + " pattern violation(s):\n");

    const grouped = violations.reduce(
      (acc, v) => {
        if (!acc[v.rule]) acc[v.rule] = [];
        acc[v.rule].push(v);
        return acc;
      },
      {} as Record<string, PatternViolation[]>,
    );

    for (const [rule, ruleViolations] of Object.entries(grouped)) {
      const count = ruleViolations.length.toString();
      console.error("\n" + rule + " (" + count + " violation(s)):");
      ruleViolations.forEach((v) => {
        const lineInfo = v.line ? ":" + v.line.toString() : "";
        console.error("  " + v.file + lineInfo);
        console.error("    " + v.message + "\n");
      });
    }

    console.error("\nFix these violations before committing.\n");
    process.exit(1);
  } else {
    console.log("All architecture pattern checks passed!\n");
    process.exit(0);
  }
}

runChecks();

export { runChecks, violations };
