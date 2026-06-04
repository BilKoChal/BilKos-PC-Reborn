// @vitest-environment happy-dom
/**
 * SaveTabBar interaction tests (TODO §5 — extend component tests to interactions).
 *
 * Renders the real tab bar and exercises the core interactions: switching tabs,
 * closing a tab, opening a new save, closing all — plus an axe a11y check.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { SaveTabBar, type SaveTab } from '../components/editor/SaveTabBar';

const tabs: SaveTab[] = [
  { id: 't1', filename: 'gold.sav', version: 'Gold', isDirty: false },
  { id: 't2', filename: 'crystal.sav', version: 'Crystal', isDirty: true },
];

function setup(overrides: Partial<React.ComponentProps<typeof SaveTabBar>> = {}) {
  const props = {
    tabs,
    activeTabId: 't1',
    onSwitchTab: vi.fn(),
    onCloseTab: vi.fn(),
    onOpenNew: vi.fn(),
    onCloseAll: vi.fn(),
    ...overrides,
  };
  render(<SaveTabBar {...props} />);
  return props;
}

describe('<SaveTabBar>', () => {
  it('renders nothing when there are no tabs', () => {
    const { container } = render(
      <SaveTabBar tabs={[]} activeTabId={null} onSwitchTab={() => {}} onCloseTab={() => {}} onOpenNew={() => {}} onCloseAll={() => {}} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('shows a tab per save with its filename', () => {
    setup();
    expect(screen.getByText('gold.sav')).toBeInTheDocument();
    expect(screen.getByText('crystal.sav')).toBeInTheDocument();
  });

  it('switches tab on click', () => {
    const props = setup();
    fireEvent.click(screen.getByText('crystal.sav'));
    expect(props.onSwitchTab).toHaveBeenCalledWith('t2');
  });

  it('closes a tab via its labelled close button', () => {
    const onCloseTab = vi.fn();
    setup({ onCloseTab });
    fireEvent.click(screen.getByLabelText('Close crystal.sav'));
    expect(onCloseTab).toHaveBeenCalled();
    // Second arg is the tab id.
    expect(onCloseTab.mock.calls[0]![1]).toBe('t2');
  });

  it('opens a new save and closes all via the toolbar buttons', () => {
    const props = setup();
    fireEvent.click(screen.getByLabelText('Open New Save'));
    fireEvent.click(screen.getByLabelText('Close All Tabs'));
    expect(props.onOpenNew).toHaveBeenCalledOnce();
    expect(props.onCloseAll).toHaveBeenCalledOnce();
  });

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <SaveTabBar tabs={tabs} activeTabId="t1" onSwitchTab={() => {}} onCloseTab={() => {}} onOpenNew={() => {}} onCloseAll={() => {}} />,
    );
    const results = await axe(container);
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
