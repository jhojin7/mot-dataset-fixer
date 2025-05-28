import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FrameDisplay from './FrameDisplay';
import { Detection, Track } from '../types'; // Make sure this path is correct

describe('FrameDisplay component', () => {
  const mockOnSelectTrack = vi.fn();
  const mockDetections: Detection[] = [
    { id: 'D1', trackId: 'T1', box: { x: 10, y: 10, w: 20, h: 20 }, frame: 0, label: 'Car' },
    { id: 'D2', trackId: 'T2', box: { x: 30, y: 30, w: 15, h: 15 }, frame: 0, label: 'Pedestrian' },
  ];
  const mockTracks: Track[] = [
    { id: 'T1', label: 'Car', color: '#ff0000' },
    { id: 'T2', label: 'Pedestrian', color: '#00ff00' },
  ];

  it('renders the correct number of detections', () => {
    render(
      <FrameDisplay
        detectionsOnFrame={mockDetections}
        tracks={mockTracks}
        frameNumber={0}
        onSelectTrack={mockOnSelectTrack}
        selectedTrackIds={[]}
        frameWidth={800}
        frameHeight={600}
      />
    );
    // Each detection renders a div and a span for the label
    // We check for the main div container for each detection based on its title
    expect(screen.getByTitle('Track ID: T1 (Car)')).toBeInTheDocument();
    expect(screen.getByTitle('Track ID: T2 (Pedestrian)')).toBeInTheDocument();
  });

  it('calls onSelectTrack when a detection is clicked', () => {
    render(
      <FrameDisplay
        detectionsOnFrame={mockDetections}
        tracks={mockTracks}
        frameNumber={0}
        onSelectTrack={mockOnSelectTrack}
        selectedTrackIds={[]}
        frameWidth={800}
        frameHeight={600}
      />
    );
    fireEvent.click(screen.getByTitle('Track ID: T1 (Car)'));
    expect(mockOnSelectTrack).toHaveBeenCalledWith('T1');
  });

  it('applies selected styling to selected tracks', () => {
    render(
      <FrameDisplay
        detectionsOnFrame={mockDetections}
        tracks={mockTracks}
        frameNumber={0}
        onSelectTrack={mockOnSelectTrack}
        selectedTrackIds={['T1']}
        frameWidth={800}
        frameHeight={600}
      />
    );
    const detectionT1 = screen.getByTitle('Track ID: T1 (Car)');
    // Check for a style that indicates selection, e.g., box shadow or ring
    // This depends on the exact styling used in the component
    expect(detectionT1.style.boxShadow).toContain('10px'); // Example check, adjust as needed
  });

  it('displays the correct frame number', () => {
    render(
      <FrameDisplay
        detectionsOnFrame={mockDetections}
        tracks={mockTracks}
        frameNumber={5} // 0-indexed
        onSelectTrack={mockOnSelectTrack}
        selectedTrackIds={[]}
        frameWidth={800}
        frameHeight={600}
      />
    );
    // The component displays 1-based frame number
    expect(screen.getByText('Frame: 6')).toBeInTheDocument(); 
  });
  
  it('renders placeholder image with correct frame number text', () => {
    render(
      <FrameDisplay
        detectionsOnFrame={[]}
        tracks={[]}
        frameNumber={0}
        onSelectTrack={mockOnSelectTrack}
        selectedTrackIds={[]}
        frameWidth={800}
        frameHeight={600}
      />
    );
    const img = screen.getByAltText('Placeholder for Frame 1') as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toContain('Frame%201');
  });
});
