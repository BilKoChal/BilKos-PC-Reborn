// @vitest-environment happy-dom
/**
 * DropZone render tests (TODO §2 / §5).
 *
 * Verifies the new busy state: while a save is parsing the zone shows a loading
 * label and suppresses click-to-open so a second file can't be queued mid-parse.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { DropZone } from '../components/home/DropZone';

describe('<DropZone>', () => {
  it('shows the idle prompt by default', () => {
    render(<DropZone onFilesSelected={() => {}} />);
    expect(screen.getByText(/click or drag files/i)).toBeInTheDocument();
  });

  it('shows the loading label when busy', () => {
    render(<DropZone onFilesSelected={() => {}} isBusy />);
    expect(screen.getByText(/loading save/i)).toBeInTheDocument();
    expect(screen.queryByText(/click or drag files/i)).not.toBeInTheDocument();
  });

  it('does not open the file picker on click while busy', () => {
    render(<DropZone onFilesSelected={() => {}} isBusy />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click').mockImplementation(() => {});

    // Click the monitor housing (the clickable region).
    fireEvent.click(screen.getByText(/loading save/i));
    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('opens the file picker on click when idle', () => {
    render(<DropZone onFilesSelected={() => {}} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click').mockImplementation(() => {});

    fireEvent.click(screen.getByText(/click or drag files/i));
    expect(clickSpy).toHaveBeenCalled();
  });

  it('has no axe accessibility violations while busy', async () => {
    const { container } = render(<DropZone onFilesSelected={() => {}} isBusy />);
    const results = await axe(container);
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
