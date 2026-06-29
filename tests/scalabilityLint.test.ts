/**
 * Scalability lint guard (TODO 7.4).
 *
 * Enforces — as a test, since the project has no ESLint setup yet (7.1) — the two
 * invariants the adapter architecture depends on:
 *
 *   1. No `as any` casts in app source. They erase the type safety that the
 *      Canonical Data Model + type guards provide.
 *   2. No ad-hoc `generation === N` (or `!==`, `>=`, …) branches. Generation
 *      facts must come from adapter capability flags / metadata, and extension
 *      discrimination must use the `isGenNExtension` type guards — NOT inline
 *      numeric comparisons scattered through UI/logic. This is what keeps
 *      "adding a generation = adding data" true.
 *
 * The single sanctioned place for `ext.generation === N` is `lib/canonicalModel.ts`,
 * where the `isGenNExtension` / `isGenNSaveExtension` type guards are defined — those
 * guards are the abstraction everything else must funnel through, so that file is
 * allowlisted.
 *
 * When ESLint lands (7.1), this can be re-expressed as a `no-restricted-syntax`
 * rule; until then this test provides the same enforcement and runs in CI.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const ROOTS = ['lib', 'components', 'context'];
const REPO_ROOT = join(__dirname, '..');

// Files allowed to compare `.generation` / a `generation` param to a number literal:
//  - canonicalModel.ts: defines the `isGenNExtension` type guards (the abstraction
//    everything else funnels through).
//  - entityFormat.ts: a pure crypto utility whose PID→block-order seed formula
//    genuinely differs by generation number (Gen 3 `pid % 24` vs Gen 4/5
//    `((pid>>13)&31) % 24`) — an intrinsic algorithm difference keyed on a numeric
//    parameter, not on adapter/save state, so no capability flag can express it.
const GENERATION_COMPARISON_ALLOWLIST = [
  'lib/canonicalModel.ts',
  'lib/core/entityFormat.ts',
  // Phase 1.8: gen2/saveData.ts is a Gen 2-specific module where generation
  // checks are expected (same pattern as canonicalModel.ts type guards).
  'lib/generations/gen2/saveData.ts',
];

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry.startsWith('.')) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walk(full));
    else if (/\.(ts|tsx)$/.test(entry)) out.push(full);
  }
  return out;
}

/** Strip line/block comments and string/template literals so we only scan code. */
function stripCommentsAndStrings(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, ' ')   // block comments
    .replace(/\/\/[^\n]*/g, ' ')          // line comments
    .replace(/'(?:\\.|[^'\\])*'/g, "''")  // single-quoted strings
    .replace(/"(?:\\.|[^"\\])*"/g, '""')  // double-quoted strings
    .replace(/`(?:\\.|[^`\\])*`/g, '``'); // template literals
}

const allFiles = ROOTS.flatMap(r => walk(join(REPO_ROOT, r)));

describe('Scalability lint guard (TODO 7.4)', () => {
  it('finds source files to scan', () => {
    expect(allFiles.length).toBeGreaterThan(20);
  });

  it('contains no `as any` casts in app source', () => {
    const offenders: string[] = [];
    for (const file of allFiles) {
      const code = stripCommentsAndStrings(readFileSync(file, 'utf8'));
      if (/\bas\s+any\b/.test(code)) offenders.push(relative(REPO_ROOT, file));
    }
    expect(offenders, `\`as any\` found in:\n${offenders.join('\n')}`).toEqual([]);
  });

  it('has no ad-hoc generation comparisons outside the type-guard file (Phase 1.9: name-insensitive)', () => {
    const offenders: string[] = [];
    for (const file of allFiles) {
      const rel = relative(REPO_ROOT, file).replace(/\\/g, '/');
      if (GENERATION_COMPARISON_ALLOWLIST.includes(rel)) continue;
      const code = stripCommentsAndStrings(readFileSync(file, 'utf8'));
      // Phase 1.9: expanded to match common aliases (`generation`, `gen`, `genNum`,
      // `currentGen`) — the old regex only matched `generation`, so `gen === 2`
      // in sprites.ts bypassed the lint. Also match `.generation` (property access).
      const re = /\b(?:generation|gen|genNum|currentGen)\s*(?:\.)?\s*(?:generation)?\s*(===|!==|==|!=|>=|<=|>|<)\s*\d/g;
      const hits = code.match(re);
      if (hits) offenders.push(`${rel}: ${hits.join(', ')}`);
    }
    expect(offenders, `Ad-hoc generation comparisons (use adapter flags / isGenNExtension):\n${offenders.join('\n')}`).toEqual([]);
  });

  it('allowlisted canonicalModel.ts is where the type guards legitimately live', () => {
    const guardFile = readFileSync(join(REPO_ROOT, 'lib/canonicalModel.ts'), 'utf8');
    // Sanity: the guards we rely on actually exist there.
    expect(guardFile).toMatch(/isGen2Extension/);
    expect(guardFile).toMatch(/ext\.generation === 2/);
  });

  // ── CDM field-creep guard (§3 — genExtension discipline) ──
  // The Canonical Data Model contract: generation-specific data lives in
  // `genExtension`, NOT as optional fields on `CanonicalPokemon`. Optional core
  // fields are how the model silently rots into a per-generation grab-bag, so
  // every new one must be a conscious decision — enforced here, not by review.
  //
  // The two sanctioned exceptions are `heldItemId?` / `heldItemName?`: deliberately
  // mirrored to the top level for O(1) UI access, with `genExtension` as the source
  // of truth (documented at their definition). A NEW optional field fails this test
  // until it is either moved into a genExtension or added to this allowlist with a
  // documented justification.
  it('CanonicalPokemon has no un-allowlisted optional fields (genExtension discipline)', () => {
    const CDM_OPTIONAL_FIELD_ALLOWLIST = ['heldItemId', 'heldItemName'];

    const src = readFileSync(join(REPO_ROOT, 'lib/canonicalModel.ts'), 'utf8');
    const start = src.indexOf('export interface CanonicalPokemon {');
    expect(start, 'CanonicalPokemon interface not found').toBeGreaterThanOrEqual(0);
    // Walk to the matching closing brace of the interface block.
    const bodyStart = src.indexOf('{', start) + 1;
    let depth = 1;
    let i = bodyStart;
    for (; i < src.length && depth > 0; i++) {
      if (src[i] === '{') depth++;
      else if (src[i] === '}') depth--;
    }
    const body = stripCommentsAndStrings(src.slice(bodyStart, i - 1));

    // Top-level optional members look like `  name?: Type` (ignore nested objects).
    const optionalFields = [...body.matchAll(/(?:^|\n)\s*(\w+)\s*\?\s*:/g)].map((m) => m[1]!);
    const unexpected = optionalFields.filter((f) => !CDM_OPTIONAL_FIELD_ALLOWLIST.includes(f));

    expect(
      unexpected,
      `New optional field(s) on CanonicalPokemon: ${unexpected.join(', ')}.\n` +
        `Generation-specific data must live in genExtension, not as optional core fields.\n` +
        `If this is a deliberate universal mirror, add it to CDM_OPTIONAL_FIELD_ALLOWLIST with a justification.`,
    ).toEqual([]);
  });
});
