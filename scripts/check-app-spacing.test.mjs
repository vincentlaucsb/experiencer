import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isSharedSpacing, spacingViolations, newViolations } from './check-app-spacing.mjs';
import { compile } from 'sass';
import { fileURLToPath } from 'node:url';

test('accepts the closed shared scale and structural resets', () => {
  assert.ok(isSharedSpacing('0 auto'));
  assert.ok(isSharedSpacing('var(--app-space-1-5) var(--app-space-4)'));
  assert.ok(isSharedSpacing('calc(var(--app-space-6) * -1) 0'));
  assert.ok(isSharedSpacing('var(--xp-modal-top-offset, 6vh) var(--app-space-4)'));
  assert.ok(isSharedSpacing('clamp(var(--app-space-12), 12vh, calc(var(--app-space-16) * 2)) auto'));
  for (const value of ['14px', '.65rem', 'var(--app-space-7)', 'var(--feature-padding)', 'calc(1rem + 2px)']) assert.equal(isSharedSpacing(value), false);
  for (const value of ['calc(var(--app-space-4) * 1.1)', 'clamp(12px, 3vw, var(--app-space-8))', '12vh', 'clamp(var(--app-space-7), 3vw, var(--app-space-8))']) assert.equal(isSharedSpacing(value), false);
});

test('checks multiline and compact CSS, logical spacing and ignores comments', () => {
  const result = spacingViolations('panel.scss', '/* padding: 99px; */\n.panel { padding: 14px; gap: 0; margin-inline-start: 3px; }\n.child { padding: var(--app-space-4) !important; }');
  assert.equal(result.length, 2);
  assert.equal(result[0].line, 2);
  assert.match(result[1].key, /margin-inline-start/);
});

test('checks JSX inline strings, numbers and dynamic spacing without inspecting document data', () => {
  const result = spacingViolations('Panel.tsx', 'const document = { padding: "12px" }; const view = <div style={{ padding: 12, gap: "var(--app-space-2)", marginTop: size, paddingInline: "3px" }} />;');
  assert.equal(result.length, 3);
  assert.equal(spacingViolations('Panel.tsx', "const view = <div style={{ ['padding']: 13 }} />;").length, 1);
});

test('legacy debt permits only the recorded number of identical declarations', () => {
  const violation = { key: 'panel.css|padding|14px', line: 1 };
  const debt = { [violation.key]: 1 };
  assert.equal(newViolations([violation], debt).length, 0);
  assert.equal(newViolations([violation, violation], debt).length, 1);
  assert.equal(newViolations([{ ...violation, key: 'panel.css|padding|15px' }], debt).length, 1);
  assert.equal(debt[violation.key], 1);
});

test('checks referenced, spread and conditional style objects', () => {
  const source = 'const base = { padding: "14px" }; const style = { ...base, gap: "var(--app-space-2)" }; const view = <div style={active ? style : { margin: 12 }} />;';
  assert.equal(spacingViolations('Panel.tsx', source).length, 2);
});

test('real Sass publishes the closed rem scale and utilities at each breakpoint', () => {
  const css = compile(fileURLToPath(new URL('../src/sass/spacing/index.scss', import.meta.url))).css;
  assert.equal((css.match(/--app-space-[\d-]+:/g) ?? []).length, 11);
  assert.match(css, /--app-space-4: 1rem/);
  assert.match(css, /--app-space-1-5: 0\.375rem/);
  for (const prefix of ['', 'sm-', 'md-']) {
    assert.ok(css.includes(`.app-${prefix}px-4`));
    assert.ok(css.includes(`.app-${prefix}gap-2`));
  }
  assert.ok(css.includes('padding-left: var(--app-space-4) !important;'));
  assert.ok(!css.includes('.app-p-7 '));
  assert.ok(!css.includes('.app-p-2-5 '));
});
