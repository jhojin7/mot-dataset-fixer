
import React from 'react';
import { X } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 p-6 md:p-8 rounded-lg shadow-2xl max-w-lg w-full text-gray-200 relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Close help"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-brand-secondary">Help & Keyboard Shortcuts</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-brand-accent mb-1">Frame Navigation</h3>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><kbd className="px-2 py-1 bg-gray-700 rounded text-sm">N</kbd> or <kbd className="px-2 py-1 bg-gray-700 rounded text-sm">ArrowRight</kbd>: Next Frame</li>
              <li><kbd className="px-2 py-1 bg-gray-700 rounded text-sm">P</kbd> or <kbd className="px-2 py-1 bg-gray-700 rounded text-sm">ArrowLeft</kbd>: Previous Frame</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-brand-accent mb-1">Track Operations</h3>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Click on a bounding box or track item: Toggle selection & focus</li>
              <li><kbd className="px-2 py-1 bg-gray-700 rounded text-sm">ArrowUp</kbd>: Focus previous track in list</li>
              <li><kbd className="px-2 py-1 bg-gray-700 rounded text-sm">ArrowDown</kbd>: Focus next track in list</li>
              <li><kbd className="px-2 py-1 bg-gray-700 rounded text-sm">Home</kbd>: Focus first track in list</li>
              <li><kbd className="px-2 py-1 bg-gray-700 rounded text-sm">End</kbd>: Focus last track in list</li>
              <li><kbd className="px-2 py-1 bg-gray-700 rounded text-sm">Spacebar</kbd>: Toggle selection for the focused track</li>
              <li><kbd className="px-2 py-1 bg-gray-700 rounded text-sm">E</kbd>: Edit label of selected track (exactly 1 selected)</li>
              <li><kbd className="px-2 py-1 bg-gray-700 rounded text-sm">F</kbd>: Merge selected tracks (at least 2 selected)</li>
              <li><kbd className="px-2 py-1 bg-gray-700 rounded text-sm">S</kbd>: Split selected track at current frame (exactly 1 selected)</li>
              <li><kbd className="px-2 py-1 bg-gray-700 rounded text-sm">Esc</kbd>: Deselect all tracks / Close this modal or Edit Label modal</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-brand-accent mb-1">Dataset Management</h3>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><strong>Load Dataset</strong>: Import existing MOT dataset from JSON file</li>
              <li><strong>Export Dataset</strong>: Save current state as JSON file</li>
              <li><strong>Reset</strong>: Return to default sample dataset</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-brand-accent mb-1">General</h3>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><kbd className="px-2 py-1 bg-gray-700 rounded text-sm">H</kbd>: Toggle this Help modal</li>
            </ul>
          </div>
        </div>

        <button 
            onClick={onClose} 
            className="mt-8 w-full py-2 px-4 bg-brand-primary text-white rounded-md hover:bg-blue-800 transition-colors font-semibold"
        >
            Got it! (Esc)
        </button>
      </div>
    </div>
  );
};

export default HelpModal;
