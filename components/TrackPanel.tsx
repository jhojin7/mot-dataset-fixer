
import React from 'react';
import { UITrack } from '../types';
import { CheckSquare, Square, Users, Scissors, Edit3 } from 'lucide-react'; // Added Edit3 icon

interface TrackPanelProps {
  tracks: UITrack[];
  onSelectTrack: (trackId: string) => void;
  onMerge: () => void;
  onSplit: () => void;
  onEditLabel: () => void; // New prop
  selectedTrackIds: string[]; 
  focusedTrackId: string | null;
}

const TrackPanel: React.FC<TrackPanelProps> = ({
  tracks,
  onSelectTrack,
  onMerge,
  onSplit,
  onEditLabel, // New prop
  selectedTrackIds,
  focusedTrackId,
}) => {
  if (!tracks.length) {
    return <div className="text-gray-400">No tracks available.</div>;
  }

  const canMerge = selectedTrackIds.length >= 2;
  const canSplit = selectedTrackIds.length === 1;
  const canEditLabel = selectedTrackIds.length === 1; // Condition for new button

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-semibold mb-4 text-brand-secondary">Tracks</h2>
      <div className="flex-grow overflow-y-auto space-y-2 pr-1 mb-4">
        {tracks.map(track => {
          const isFocused = focusedTrackId === track.id;
          return (
            <div
              key={track.id}
              onClick={() => onSelectTrack(track.id)}
              className={`
                p-3 rounded-lg cursor-pointer flex items-center justify-between transition-all duration-150 ease-in-out
                ${track.isSelected ? 'bg-brand-secondary ring-2 ring-brand-accent' : 'bg-gray-700 hover:bg-gray-600'}
                ${isFocused ? 'outline outline-2 outline-offset-1 outline-sky-400' : ''}
              `}
              role="button"
              aria-pressed={track.isSelected}
              tabIndex={0} 
            >
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 rounded-sm" style={{ backgroundColor: track.color }} aria-hidden="true"></div>
                <div>
                  <span className="font-medium text-white">{track.id}</span>
                  <span className="text-xs text-gray-400 block">{track.label}</span>
                </div>
              </div>
              {track.isSelected ? 
                <CheckSquare size={20} className="text-brand-accent" aria-label="Selected" /> : 
                <Square size={20} className="text-gray-500" aria-label="Not selected" />}
            </div>
          );
        })}
      </div>
      <div className="space-y-3 pt-2 border-t border-gray-700">
        <button
          onClick={onEditLabel}
          disabled={!canEditLabel}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-white flex items-center justify-center space-x-2
                      transition-all duration-150 ease-in-out
                      ${canEditLabel ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-600 cursor-not-allowed opacity-50'}`}
        >
          <Edit3 size={20} />
          <span>Edit Label (E)</span>
        </button>
        <button
          onClick={onMerge}
          disabled={!canMerge}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-white flex items-center justify-center space-x-2
                      transition-all duration-150 ease-in-out
                      ${canMerge ? 'bg-brand-accent hover:bg-yellow-600' : 'bg-gray-600 cursor-not-allowed opacity-50'}`}
        >
          <Users size={20} />
          <span>Merge Selected (F)</span>
        </button>
        <button
          onClick={onSplit}
          disabled={!canSplit}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-white flex items-center justify-center space-x-2
                      transition-all duration-150 ease-in-out
                      ${canSplit ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-600 cursor-not-allowed opacity-50'}`}
        >
          <Scissors size={20} />
          <span>Split Track (S)</span>
        </button>
      </div>
    </div>
  );
};

export default TrackPanel;
