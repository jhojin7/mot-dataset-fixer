import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Controls from './Controls';

describe('Controls component', () => {
  const mockOnPrev = vi.fn();
  const mockOnNext = vi.fn();

  it('disables the "Prev" button on the first frame', () => {
    render(<Controls currentFrame={0} maxFrames={10} onPrev={mockOnPrev} onNext={mockOnNext} />);
    expect(screen.getByText(/Prev/i).closest('button')).toBeDisabled();
  });

  it('disables the "Next" button on the last frame', () => {
    render(<Controls currentFrame={9} maxFrames={10} onPrev={mockOnPrev} onNext={mockOnNext} />);
    expect(screen.getByText(/Next/i).closest('button')).toBeDisabled();
  });

  it('calls onPrev when the "Prev" button is clicked', () => {
    render(<Controls currentFrame={1} maxFrames={10} onPrev={mockOnPrev} onNext={mockOnNext} />);
    fireEvent.click(screen.getByText(/Prev/i));
    expect(mockOnPrev).toHaveBeenCalledTimes(1);
  });

  it('calls onNext when the "Next" button is clicked', () => {
    render(<Controls currentFrame={0} maxFrames={10} onPrev={mockOnPrev} onNext={mockOnNext} />);
    fireEvent.click(screen.getByText(/Next/i));
    expect(mockOnNext).toHaveBeenCalledTimes(1);
  });

  it('displays the correct frame number', () => {
    render(<Controls currentFrame={5} maxFrames={10} onPrev={mockOnPrev} onNext={mockOnNext} />);
    expect(screen.getByText('Frame: 6 / 10')).toBeInTheDocument();
  });
});
