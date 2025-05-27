
import React from 'react';
import { Detection, Track } from '../types';

interface FrameDisplayProps {
  detectionsOnFrame: Detection[];
  tracks: Track[]; // All tracks to get color/label info
  frameNumber: number;
  onSelectTrack: (trackId: string) => void;
  selectedTrackIds: string[];
  frameWidth: number;
  frameHeight: number;
}

const FrameDisplay: React.FC<FrameDisplayProps> = ({
  detectionsOnFrame,
  tracks,
  frameNumber,
  onSelectTrack,
  selectedTrackIds,
  frameWidth,
  frameHeight
}) => {
  const trackMap = new Map(tracks.map(t => [t.id, t]));
  
  // Use currentFrame (which is frameNumber) for the placeholder text
  const placeholderImageUrl = `https://placehold.co/${frameWidth}x${frameHeight}/2D3748/A0AEC0/png?text=Frame%20${frameNumber + 1}&font=sans-serif`;


  return (
    <div className="relative bg-gray-700 rounded-md overflow-hidden select-none shadow-inner" style={{ width: frameWidth, height: frameHeight }}>
      <img 
        src={placeholderImageUrl}
        alt={`Placeholder for Frame ${frameNumber + 1}`}
        className="absolute inset-0 w-full h-full object-cover opacity-30" // Reduced opacity to make boxes clearer
      />
      {detectionsOnFrame.map(det => {
        const trackInfo = trackMap.get(det.trackId);
        if (!trackInfo) return null;

        const isSelected = selectedTrackIds.includes(det.trackId);
        const boxStyle: React.CSSProperties = { 
          left: `${det.box.x}%`,
          top: `${det.box.y}%`,
          width: `${det.box.w}%`,
          height: `${det.box.h}%`,
          borderColor: trackInfo.color,
          boxShadow: isSelected ? `0 0 10px 3px ${trackInfo.color}` : `0 0 5px 1px ${trackInfo.color}80`,
        };

        const ringClasses = isSelected ? `ring-4 ring-opacity-75 ring-[${trackInfo.color}]` : '';

        return (
          <div
            key={det.id}
            className={`absolute border-2 rounded cursor-pointer transition-all duration-150 ease-in-out ${ringClasses}`}
            style={boxStyle} 
            onClick={() => onSelectTrack(det.trackId)}
            title={`Track ID: ${det.trackId} (${det.label})`}
          >
            <span 
              className="absolute -top-5 left-0 text-xs px-1 rounded"
              style={{ backgroundColor: trackInfo.color, color: '#FFFFFF' }}
            >
              {det.trackId}
            </span>
          </div>
        );
      })}
      <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-sm px-2 py-1 rounded">
        Frame: {frameNumber + 1} {/* Display 1-based frame number */}
      </div>
    </div>
  );
};

export default FrameDisplay;