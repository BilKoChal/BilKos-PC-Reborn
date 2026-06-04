// @vitest-environment happy-dom
/**
 * LegalityBadge render tests (TODO §5 — first component tests).
 *
 * Exercises the real component in a DOM: tone/headline rendering, the
 * accessible label, and the issues popover toggling open to list findings.
 * This is the harness's first proof that React components can be render-tested.
 */
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { LegalityBadge } from '../components/editor/pokemon/LegalityBadge';
import { LegalitySeverity, type LegalityAnalysis } from '../lib/legality';

const mk = (...severities: LegalitySeverity[]): LegalityAnalysis => ({
  analyzed: true,
  valid: !severities.includes(LegalitySeverity.Invalid),
  summary: 'test summary',
  results: severities.map((severity, i) => ({ severity, category: 'IVs', comment: `finding ${i}` })),
});

describe('<LegalityBadge>', () => {
  it('shows "Not analyzed" for a null analysis', () => {
    render(<LegalityBadge analysis={null} />);
    expect(screen.getByRole('button', { name: /legality: not analyzed/i })).toBeInTheDocument();
  });

  it('shows "Looks legal" when all checks pass', () => {
    render(<LegalityBadge analysis={mk(LegalitySeverity.Valid)} />);
    expect(screen.getByText('Looks legal')).toBeInTheDocument();
  });

  it('summarises issue count and exposes the summary as a title', () => {
    render(<LegalityBadge analysis={mk(LegalitySeverity.Invalid, LegalitySeverity.Invalid)} />);
    const btn = screen.getByRole('button', { name: /legality: 2 issues/i });
    expect(btn).toHaveAttribute('title', 'test summary');
  });

  it('toggles a popover that lists the notable findings (not plain Valid ones)', () => {
    render(<LegalityBadge analysis={mk(LegalitySeverity.Valid, LegalitySeverity.Fishy, LegalitySeverity.Invalid)} />);
    const toggle = screen.getByRole('button', { name: /legality:/i });

    // Closed initially.
    expect(screen.queryByText(/finding 1/)).not.toBeInTheDocument();

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    // The Fishy (index 1) and Invalid (index 2) findings show; the Valid (0) does not.
    expect(screen.getByText(/finding 1/)).toBeInTheDocument();
    expect(screen.getByText(/finding 2/)).toBeInTheDocument();
    expect(screen.queryByText(/finding 0/)).not.toBeInTheDocument();
    // Advisory disclaimer is present so we never imply a full guarantee.
    expect(screen.getByText(/structural checks only/i)).toBeInTheDocument();
  });

  it('shows the all-clear message in the popover when there are no issues', () => {
    render(<LegalityBadge analysis={mk(LegalitySeverity.Valid)} />);
    fireEvent.click(screen.getByRole('button', { name: /legality:/i }));
    expect(screen.getByText(/no structural problems found/i)).toBeInTheDocument();
  });

  it('has no axe accessibility violations (open, with findings)', async () => {
    const { container } = render(
      <LegalityBadge analysis={mk(LegalitySeverity.Fishy, LegalitySeverity.Invalid)} />,
    );
    fireEvent.click(screen.getByRole('button', { name: /legality:/i }));
    const results = await axe(container);
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
