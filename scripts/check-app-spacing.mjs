import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const sizes = new Set(['0', '1', '1-5', '2', '3', '4', '5', '6', '8', '12', '16']);
const cssProperty = /^(?:padding|margin)(?:-(?:top|right|bottom|left|inline|block)(?:-(?:start|end))?)?$|^(?:gap|row-gap|column-gap)$/;
const jsxProperty = /^(?:padding|margin)(?:Top|Right|Bottom|Left|Inline|Block|InlineStart|InlineEnd|BlockStart|BlockEnd)?$|^(?:gap|rowGap|columnGap)$/;

export function isSharedSpacing(value) {
  // Responsive geometry may interpolate viewport space between shared endpoints.
  // Only sign reversal and doubling are allowed; arbitrary multipliers recreate a scale.
  let withoutTokens = value.replace(/var\(--app-space-([\d-]+)\)/g, (token, size) => sizes.has(size) ? '0' : token);
  // Shared modal positioning is viewport geometry, owned by the modal layer.
  withoutTokens = withoutTokens.replace(/var\(--xp-modal-top-offset, 6vh\)/g, '0');
  withoutTokens = withoutTokens.replace(/calc\(0 \* (?:-1|2)\)/g, '0');
  withoutTokens = withoutTokens.replace(/clamp\(0, -?(?:\d*\.)?\d+(?:vw|vh), 0\)/g, '0');
  return withoutTokens.trim().split(/\s+/).every(part => /^(?:0|auto|normal|inherit|initial|unset|revert)$/.test(part));
}

/** Records raw application spacing; authored document data is outside this scan. */
export function spacingViolations(file, source) {
  const violations = [];
  const record = (property, value, position) => {
    if (!isSharedSpacing(value)) violations.push({
      key: `${file}|${property}|${value.replace(/\s+/g, ' ').trim()}`,
      line: source.slice(0, position).split('\n').length
    });
  };
  if (/\.(?:css|scss)$/.test(file)) {
    // Preserve offsets while removing comments so commented examples are harmless.
    const clean = source.replace(/\/\*[\s\S]*?\*\/|^\s*\/\/[^\n\r]*/gm, comment => comment.replace(/[^\n\r]/g, ' '));
    for (const match of clean.matchAll(/(?:^|[;{}\n])\s*([\w-]+)\s*:\s*([^;{}]+)(?=[;}])/g)) {
      if (cssProperty.test(match[1])) record(match[1], match[2].replace(/\s*!important\s*$/, ''), match.index);
    }
  } else if (/\.[jt]sx$/.test(file)) {
    const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const declarations = [];
    const collect = node => {
      if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) declarations.push(node);
      ts.forEachChild(node, collect);
    };
    collect(tree);
    const inspectStyle = (expression, seen = new Set()) => {
      if (!expression || seen.has(expression)) return;
      seen.add(expression);
      if (ts.isIdentifier(expression)) {
        // Resolve the nearest enclosing declaration, including module-level style objects.
        for (let scope = expression.parent; scope; scope = scope.parent) {
          const declaration = declarations.find(candidate => candidate.name.text === expression.text && candidate.pos >= scope.pos && candidate.end <= scope.end);
          if (declaration) { inspectStyle(declaration.initializer, seen); break; }
        }
      } else if (ts.isParenthesizedExpression(expression) || ts.isAsExpression(expression) || ts.isSatisfiesExpression(expression)) {
        inspectStyle(expression.expression, seen);
      } else if (ts.isConditionalExpression(expression)) {
        inspectStyle(expression.whenTrue, seen);
        inspectStyle(expression.whenFalse, seen);
      } else if (ts.isObjectLiteralExpression(expression)) {
        for (const property of expression.properties) {
          if (ts.isSpreadAssignment(property)) { inspectStyle(property.expression, seen); continue; }
          if (!ts.isPropertyAssignment(property)) continue;
          const propertyName = ts.isComputedPropertyName(property.name) ? property.name.expression : property.name;
          const name = ts.isStringLiteralLike(propertyName) ? propertyName.text : propertyName.getText(tree);
          if (!jsxProperty.test(name)) continue;
          const value = property.initializer;
          // Dynamic inline spacing also needs an explicit debt entry, not a bypass.
          record(name, ts.isStringLiteral(value) ? value.text : value.getText(tree), property.pos);
        }
      }
    };
    const visit = node => {
      if (ts.isJsxAttribute(node) && node.name.getText(tree) === 'style' && node.initializer && ts.isJsxExpression(node.initializer)) {
        inspectStyle(node.initializer.expression);
      }
      ts.forEachChild(node, visit);
    };
    visit(tree);
  }
  return violations;
}

async function scan(root) {
  const result = [];
  async function walk(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      const relative = path.relative(root, absolute).replaceAll('\\', '/');
      if (entry.isDirectory()) {
        if (!['node_modules', '__tests__', 'fonts'].includes(entry.name) && relative !== 'sass/spacing') await walk(absolute);
      } else if (/\.(?:css|scss|jsx|tsx)$/.test(entry.name) && !/\.(?:test|spec)\./.test(entry.name)) {
        result.push(...spacingViolations(relative, await readFile(absolute, 'utf8')));
      }
    }
  }
  await walk(root);
  return result;
}

export function newViolations(violations, debt) {
  const remaining = { ...debt };
  return violations.filter(({ key }) => {
    if (remaining[key] > 0) { remaining[key]--; return false; }
    return true;
  });
}

async function main() {
  const directory = path.dirname(fileURLToPath(import.meta.url));
  const args = process.argv.slice(2);
  const argument = (name, fallback) => args.includes(name) ? path.resolve(args[args.indexOf(name) + 1]) : fallback;
  const root = argument('--root', path.resolve(directory, '../src'));
  const baseline = argument('--baseline', path.join(directory, 'app-spacing-debt.json'));
  const violations = await scan(root);
  if (args.includes('--record-debt')) {
    const debt = {};
    for (const { key } of violations) debt[key] = (debt[key] ?? 0) + 1;
    await writeFile(baseline, `${JSON.stringify(Object.fromEntries(Object.entries(debt).sort()), null, 2)}\n`);
    console.log(`Recorded ${violations.length} existing spacing declarations. Review this file; do not refresh it to bypass failures.`);
    return;
  }
  const debt = args.includes('--strict') ? {} : JSON.parse(await readFile(baseline, 'utf8'));
  const failures = newViolations(violations, debt);
  const current = {};
  for (const { key } of violations) current[key] = (current[key] ?? 0) + 1;
  const stale = Object.keys(debt).filter(key => debt[key] > (current[key] ?? 0));
  for (const key of stale) console.error(`Remove migrated spacing debt: ${key} (remaining: ${current[key] ?? 0}).`);
  if (stale.length) process.exitCode = 1;
  if (failures.length) {
    for (const failure of failures) console.error(`${failure.key.split('|')[0]}:${failure.line}: ${failure.key.split('|').slice(1).join(': ')} — use app-* utilities or --app-space-* tokens.`);
    process.exitCode = 1;
  } else if (!stale.length) console.log(`Application spacing check passed (${violations.length} legacy declarations remaining).`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
