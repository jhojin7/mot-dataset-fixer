import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TrackPanel from './TrackPanel';
import { UITrack } from '../types'; // Make sure this path is correct

// Mock lucide-react icons
vi.mock('lucide-react', async () => {
  const actual = await vi.importActual('lucide-react');
  return {
    ...actual,
    CheckSquare: () => <svg data-testid="checksquare-icon" />,
    Square: () => <svg data-testid="square-icon" />,
    Users: () => <svg data-testid="users-icon" />,
    Scissors: () => <svg data-testid="scissors-icon" />,
    Edit3: () => <svg data-testid="edit3-icon" />,
  };
});

describe('TrackPanel component', () => {
  const mockOnSelectTrack = vi.fn();
  const mockOnMerge = vi.fn();
  const mockOnSplit = vi.fn();
  const mockOnEditLabel = vi.fn();

  const mockTracks: UITrack[] = [
    { id: 'T1', label: 'Car', color: '#ff0000', isSelected: true },
    { id: 'T2', label: 'Pedestrian', color: '#00ff00', isSelected: false },
    { id: 'T3', label: 'Bicycle', color: '#0000ff', isSelected: true },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all tracks', () => {
    render(
      <TrackPanel
        tracks={mockTracks}
        onSelectTrack={mockOnSelectTrack}
        onMerge={mockOnMerge}
        onSplit={mockOnSplit}
        onEditLabel={mockOnEditLabel}
        selectedTrackIds={['T1', 'T3']}
        focusedTrackId={null}
      />
    );
    expect(screen.getByText('T1')).toBeInTheDocument();
    expect(screen.getByText('Pedestrian')).toBeInTheDocument(); // Check by label
    expect(screen.getByText('T3')).toBeInTheDocument();
  });

  it('calls onSelectTrack when a track is clicked', () => {
    render(
      <TrackPanel
        tracks={mockTracks}
        onSelectTrack={mockOnSelectTrack}
        onMerge={mockOnMerge}
        onSplit={mockOnSplit}
        onEditLabel={mockOnEditLabel}
        selectedTrackIds={['T1', 'T3']}
        focusedTrackId={null}
      />
    );
    fireEvent.click(screen.getByText('T2').closest('div[role="button"]')!);
    expect(mockOnSelectTrack).toHaveBeenCalledWith('T2');
  });

  it('enables "Merge" button when 2 or more tracks are selected', () => {
    render(
      <TrackPanel
        tracks={mockTracks}
        onSelectTrack={mockOnSelectTrack}
        onMerge={mockOnMerge}
        onSplit={mockOnSplit}
        onEditLabel={mockOnEditLabel}
        selectedTrackIds={['T1', 'T3']} // 2 selected
        focusedTrackId={null}
      />
    );
    expect(screen.getByText(/Merge Selected/i).closest('button')).not.toBeDisabled();
  });

  it('disables "Merge" button when less than 2 tracks are selected', () => {
    render(
      <TrackPanel
        tracks={mockTracks}
        onSelectTrack={mockOnSelectTrack}
        onMerge={mockOnMerge}
        onSplit={mockOnSplit}
        onEditLabel={mockOnEditLabel}
        selectedTrackIds={['T1']} // 1 selected
        focusedTrackId={null}
      />
    );
    expect(screen.getByText(/Merge Selected/i).closest('button')).toBeDisabled();
  });

  it('calls onMerge when "Merge" button is clicked', () => {
    render(
      <TrackPanel
        tracks={mockTracks}
        onSelectTrack={mockOnSelectTrack}
        onMerge={mockOnMerge}
        onSplit={mockOnSplit}
        onEditLabel={mockOnEditLabel}
        selectedTrackIds={['T1', 'T3']}
        focusedTrackId={null}
      />
    );
    fireEvent.click(screen.getByText(/Merge Selected/i));
    expect(mockOnMerge).toHaveBeenCalledTimes(1);
  });

  it('enables "Split" and "Edit Label" buttons when exactly 1 track is selected', () => {
    const singleSelectedTrack = mockTracks.map(t => t.id === 'T1' ? {...t, isSelected: true} : {...t, isSelected: false});
    render(
      <TrackPanel
        tracks={singleSelectedTrack}
        onSelectTrack={mockOnSelectTrack}
        onMerge={mockOnMerge}
        onSplit={mockOnSplit}
        onEditLabel={mockOnEditLabel}
        selectedTrackIds={['T1']} // 1 selected
        focusedTrackId={'T1'}
      />
    );
    expect(screen.getByText(/Split Track/i).closest('button')).not.toBeDisabled();
    expect(screen.getByText(/Edit Label/i).closest('button')).not.toBeDisabled();
  });

  it('disables "Split" and "Edit Label" buttons when not exactly 1 track is selected', () => {
    const { rerender } = render(
      <TrackPanel
        tracks={mockTracks}
        onSelectTrack={mockOnSelectTrack}
        onMerge={mockOnMerge}
        onSplit={mockOnSplit}
        onEditLabel={mockOnEditLabel}
        selectedTrackIds={['T1', 'T3']} // 2 selected
        focusedTrackId={null}
      />
    );
    // With 2 tracks selected
    expect(screen.getByText(/Split Track/i).closest('button')).toBeDisabled();
    expect(screen.getByText(/Edit Label/i).closest('button')).toBeDisabled();
    
    // Re-render with 0 selected
    rerender( 
      <TrackPanel
        tracks={mockTracks.map(t => ({...t, isSelected: false}))}
        onSelectTrack={mockOnSelectTrack}
        onMerge={mockOnMerge}
        onSplit={mockOnSplit}
        onEditLabel={mockOnEditLabel}
        selectedTrackIds={[]} // 0 selected
        focusedTrackId={null}
      />
    );
    // With 0 tracks selected
    expect(screen.getByText(/Split Track/i).closest('button')).toBeDisabled();
    expect(screen.getByText(/Edit Label/i).closest('button')).toBeDisabled();
  });

  it('calls onSplit when "Split" button is clicked', () => {
     const singleSelectedTrack = mockTracks.map(t => t.id === 'T1' ? {...t, isSelected: true} : {...t, isSelected: false});
    render(
      <TrackPanel
        tracks={singleSelectedTrack}
        onSelectTrack={mockOnSelectTrack}
        onMerge={mockOnMerge}
        onSplit={mockOnSplit}
        onEditLabel={mockOnEditLabel}
        selectedTrackIds={['T1']}
        focusedTrackId={'T1'}
      />
    );
    fireEvent.click(screen.getByText(/Split Track/i));
    expect(mockOnSplit).toHaveBeenCalledTimes(1);
  });

  it('calls onEditLabel when "Edit Label" button is clicked', () => {
    const singleSelectedTrack = mockTracks.map(t => t.id === 'T1' ? {...t, isSelected: true} : {...t, isSelected: false});
    render(
      <TrackPanel
        tracks={singleSelectedTrack}
        onSelectTrack={mockOnSelectTrack}
        onMerge={mockOnMerge}
        onSplit={mockOnSplit}
        onEditLabel={mockOnEditLabel}
        selectedTrackIds={['T1']}
        focusedTrackId={'T1'}
      />
    );
    fireEvent.click(screen.getByText(/Edit Label/i));
    expect(mockOnEditLabel).toHaveBeenCalledTimes(1);
  });
  
  it('shows "No tracks available." if tracks array is empty', () => {
    render(
      <TrackPanel
        tracks={[]}
        onSelectTrack={mockOnSelectTrack}
        onMerge={mockOnMerge}
        onSplit={mockOnSplit}
        onEditLabel={mockOnEditLabel}
        selectedTrackIds={[]}
        focusedTrackId={null}
      />
    );
    expect(screen.getByText("No tracks available.")).toBeInTheDocument();
  });

});
