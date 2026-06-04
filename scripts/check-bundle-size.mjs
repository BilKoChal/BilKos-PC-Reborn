#!/usr/bin/env node
/**
 * Bundle-size budget check (TODO 7.3).
 *
 * Reads the built `dist/assets/*.js` chunks and fails (exit 1) if any chunk
 * exceeds its budget. The primary goal is to catch **per-generation data
 * growth** early: each `GenNAdapter` chunk is code-split, so a Gen 3 adapter
 * that balloons (386 species + abilities/natures/larger tables) would show up
 * here before it regresses load time, rather than silently inflating the bundle.
 *
 * Budgets are gzip sizes (what actually ships) with a raw cap as a backstop.
 * Run AFTER `npm run build`:  `npm run build && npm run check:bundle`
 */
import { readdirSync, readFileSync, statSync } from 'fs';
import { gzipSync } from 'zlib';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ASSETS_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist', 'assets');

// Budgets in kilobytes. `gzip` is the enforced ceiling; `raw` is a backstop.
// Per-generation adapter chunks share one budget (applied to each gen chunk).
const PER_GEN_ADAPTER_BUDGET = { gzip: 100, raw: 400 };

// Named (non-gen) chunks. Matched by filename prefix (before the hash).
const NAMED_BUDGETS = {
  'vendor-react': { gzip: 80, raw: 220 },
  'vendor':       { gzip: 70, raw: 200 },
  'index':        { gzip: 110, raw: 420 },
};

const KB = 1024;

// Known non-gen chunk names, checked longest-prefix-first so `vendor-react`
// is not swallowed by `vendor`.
const NAMED_PREFIXES = ['vendor-react', 'vendor', 'index'];

/** Logical chunk name from a hashed filename. Vite hashes can contain hyphens
 *  (e.g. `Gen2Adapter-B-H6ibCp.js`), so we match known prefixes rather than
 *  trying to strip the hash by splitting on `-`. */
function logicalName(file) {
  const genMatch = file.match(/^(Gen\d+Adapter)-/);
  if (genMatch) return genMatch[1];
  for (const prefix of NAMED_PREFIXES) {
    if (file.startsWith(prefix + '-')) return prefix;
  }
  // Fallback (display only): drop the final `-<token>.js`.
  return file.replace(/-[^-]*\.js$/, '').replace(/\.js$/, '');
}

function listJsChunks() {
  let files;
  try {
    files = readdirSync(ASSETS_DIR);
  } catch {
    console.error(`✗ ${ASSETS_DIR} not found. Run \`npm run build\` first.`);
    process.exit(1);
  }
  return files
    .filter(f => f.endsWith('.js'))
    .map(f => {
      const full = join(ASSETS_DIR, f);
      const raw = statSync(full).size;
      const gzip = gzipSync(readFileSync(full)).length;
      return { file: f, name: logicalName(f), raw, gzip };
    });
}

function budgetFor(chunkName) {
  if (/^Gen\d+Adapter$/.test(chunkName)) return PER_GEN_ADAPTER_BUDGET;
  return NAMED_BUDGETS[chunkName] ?? null;
}

const chunks = listJsChunks();
const rows = [];
const failures = [];

for (const c of chunks) {
  const budget = budgetFor(c.name);
  const gzipKb = c.gzip / KB;
  const rawKb = c.raw / KB;
  let status = 'ok';
  if (budget) {
    if (gzipKb > budget.gzip || rawKb > budget.raw) {
      status = 'OVER';
      failures.push(
        `${c.name}: ${gzipKb.toFixed(1)} KB gz / ${rawKb.toFixed(1)} KB raw ` +
        `exceeds budget ${budget.gzip} KB gz / ${budget.raw} KB raw`
      );
    }
  } else {
    status = '—'; // no budget (informational)
  }
  rows.push({ name: c.name, gzip: gzipKb, raw: rawKb, budget, status });
}

// Print a table.
console.log('\nBundle size report (TODO 7.3)\n');
console.log('chunk'.padEnd(22), 'gzip'.padStart(10), 'raw'.padStart(11), '  budget(gz)  status');
for (const r of rows.sort((a, b) => b.gzip - a.gzip)) {
  console.log(
    r.name.padEnd(22),
    `${r.gzip.toFixed(1)} KB`.padStart(10),
    `${r.raw.toFixed(1)} KB`.padStart(11),
    `  ${(r.budget ? String(r.budget.gzip) : '-').padStart(8)}    ${r.status}`
  );
}

if (failures.length) {
  console.error('\n✗ Bundle budget exceeded:\n' + failures.map(f => '  - ' + f).join('\n'));
  console.error('\nIf this growth is expected, raise the budget in scripts/check-bundle-size.mjs.\n');
  process.exit(1);
}
console.log('\n✓ All budgeted chunks within limits.\n');
