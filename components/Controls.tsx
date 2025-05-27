
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ControlsProps {
  currentFrame: number;
  maxFrames: number;
  onNext: () => void;
  onPrev: () => void;
}

const Controls: React.FC<ControlsProps> = ({
  currentFrame,
  maxFrames,
  onNext,
  onPrev,
}) => {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-900 rounded-b-lg mt-auto">
      <button
        onClick={onPrev}
        disabled={currentFrame === 0}
        className="px-4 py-2 bg-brand-secondary text-white rounded-md hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
      >
        <ChevronLeft size={20} />
        <span>Prev (P)</span>
      </button>
      <span className="text-lg font-medium text-gray-300">
        Frame: {currentFrame + 1} / {maxFrames}
      </span>
      <button
        onClick={onNext}
        disabled={currentFrame === maxFrames - 1}
        className="px-4 py-2 bg-brand-secondary text-white rounded-md hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
      >
        <span>Next (N)</span>
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default Controls;
    