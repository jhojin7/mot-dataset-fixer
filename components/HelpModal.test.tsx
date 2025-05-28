import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HelpModal from './HelpModal';

// Mock the X icon from lucide-react
vi.mock('lucide-react', async () => {
  const actual = await vi.importActual('lucide-react');
  return {
    ...actual,
    X: () => <svg data-testid="x-icon" />,
  };
});

describe('HelpModal component', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls onClose when the "Close" button (X icon) is clicked', () => {
    render(<HelpModal onClose={mockOnClose} />);
    fireEvent.click(screen.getByLabelText('Close help'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the "Got it!" button is clicked', () => {
    render(<HelpModal onClose={mockOnClose} />);
    fireEvent.click(screen.getByText('Got it! (Esc)'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('displays keyboard shortcuts information', () => {
    render(<HelpModal onClose={mockOnClose} />);
    expect(screen.getByText('Help & Keyboard Shortcuts')).toBeInTheDocument();
    // Check for a few specific shortcuts to ensure content is rendered
    expect(screen.getByText('Frame Navigation')).toBeInTheDocument();
    expect(screen.getByText(/Next Frame/)).toBeInTheDocument();
    expect(screen.getByText('Track Operations')).toBeInTheDocument();
    expect(screen.getByText(/Toggle selection & focus/)).toBeInTheDocument();
  });
});
