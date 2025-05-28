import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EditLabelModal from './EditLabelModal';
import { Track } from '../types'; // Make sure this path is correct

// Mock the X and Check icons
vi.mock('lucide-react', async () => {
  const actual = await vi.importActual('lucide-react');
  return {
    ...actual,
    X: () => <svg data-testid="x-icon" />,
    Check: () => <svg data-testid="check-icon" />,
    Search: () => <svg data-testid="search-icon" />,
  };
});

describe('EditLabelModal component', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();
  const mockTargetTrack: Track = { id: 'T1', label: 'Car', color: '#ff0000' };
  const mockExistingLabels = ['Car', 'Pedestrian', 'Bicycle'];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    render(
      <EditLabelModal
        isOpen={false}
        onClose={mockOnClose}
        onSave={mockOnSave}
        targetTrack={mockTargetTrack}
        existingLabels={mockExistingLabels}
      />
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders when isOpen is true and targetTrack is provided', () => {
    render(
      <EditLabelModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        targetTrack={mockTargetTrack}
        existingLabels={mockExistingLabels}
      />
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText('New Label')).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockTargetTrack.label)).toBeInTheDocument();
  });

  it('focuses the input field when opened', () => {
    render(
      <EditLabelModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        targetTrack={mockTargetTrack}
        existingLabels={mockExistingLabels}
      />
    );
    expect(screen.getByLabelText('New Label')).toHaveFocus();
  });

  it('calls onClose when the "Close" button (X icon) is clicked', () => {
    render(
      <EditLabelModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        targetTrack={mockTargetTrack}
        existingLabels={mockExistingLabels}
      />
    );
    fireEvent.click(screen.getByLabelText('Close'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
  
  it('calls onClose when the "Cancel" button is clicked', () => {
    render(
      <EditLabelModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        targetTrack={mockTargetTrack}
        existingLabels={mockExistingLabels}
      />
    );
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onSave with the correct arguments when "Save" button is clicked', () => {
    const newLabel = 'Updated Car';
    render(
      <EditLabelModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        targetTrack={mockTargetTrack}
        existingLabels={mockExistingLabels}
      />
    );
    const input = screen.getByLabelText('New Label');
    fireEvent.change(input, { target: { value: newLabel } });
    fireEvent.click(screen.getByText('Save'));
    expect(mockOnSave).toHaveBeenCalledWith(mockTargetTrack.id, newLabel);
  });

  it('shows suggestions when typing in the input field', () => {
    render(
      <EditLabelModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        targetTrack={mockTargetTrack}
        existingLabels={mockExistingLabels}
      />
    );
    const input = screen.getByLabelText('New Label');
    fireEvent.focus(input); // Ensure suggestions are shown on focus with initial value
    fireEvent.change(input, { target: { value: 'Pe' } }); // type to trigger suggestions
    expect(screen.getByText('Pedestrian')).toBeInTheDocument();
  });

  it('updates the input field when a suggestion is clicked', () => {
    render(
      <EditLabelModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        targetTrack={mockTargetTrack}
        existingLabels={mockExistingLabels}
      />
    );
    const input = screen.getByLabelText('New Label') as HTMLInputElement;
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'Pe' } }); // type to trigger suggestions
    fireEvent.click(screen.getByText('Pedestrian'));
    expect(input.value).toBe('Pedestrian');
  });
  
  it('Save button is disabled if input is empty or only whitespace', () => {
    render(
      <EditLabelModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        targetTrack={mockTargetTrack}
        existingLabels={mockExistingLabels}
      />
    );
    const input = screen.getByLabelText('New Label');
    const saveButton = screen.getByText('Save').closest('button');

    fireEvent.change(input, { target: { value: '' } });
    expect(saveButton).toBeDisabled();

    fireEvent.change(input, { target: { value: '   ' } });
    expect(saveButton).toBeDisabled();
    
    fireEvent.change(input, { target: { value: 'Valid Label' } });
    expect(saveButton).not.toBeDisabled();
  });

});
