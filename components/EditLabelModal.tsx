import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Track } from '../types';
import { X, Check, Search } from 'lucide-react';

interface EditLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (trackId: string, newLabel: string) => void;
  targetTrack: Track | null;
  existingLabels: string[];
}

const EditLabelModal: React.FC<EditLabelModalProps> = ({
  isOpen,
  onClose,
  onSave,
  targetTrack,
  existingLabels,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && targetTrack) {
      setInputValue(targetTrack.label);
      inputRef.current?.focus();
      setShowSuggestions(false); // Initially hide suggestions on open/refocus
    }
  }, [isOpen, targetTrack]);

  const filteredSuggestions = useMemo(() => {
    if (!inputValue || !showSuggestions) return [];
    const lowerInput = inputValue.toLowerCase();
    return existingLabels.filter(
      label => label.toLowerCase().includes(lowerInput) && label.toLowerCase() !== lowerInput
    ).slice(0, 5); // Limit to 5 suggestions
  }, [inputValue, existingLabels, showSuggestions]);

  const handleSave = () => {
    if (targetTrack && inputValue.trim()) {
      onSave(targetTrack.id, inputValue.trim());
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setShowSuggestions(true); // Show suggestions when user types
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };
  
  const handleInputFocus = () => {
    // Show suggestions if there's input, otherwise wait for typing
    if (inputValue.trim() !== '') {
        setShowSuggestions(true);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalContentRef.current && !modalContentRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'Enter') {
        if (document.activeElement === inputRef.current && inputValue.trim()) {
          handleSave();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handleSave, inputValue]);


  if (!isOpen || !targetTrack) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true" aria-labelledby="editLabelModalTitle">
      <div ref={modalContentRef} className="bg-gray-800 p-6 md:p-8 rounded-lg shadow-2xl max-w-md w-full text-gray-200 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X size={24} />
        </button>
        <h2 id="editLabelModalTitle" className="text-2xl font-bold mb-2 text-brand-secondary">
          Edit Label for Track <span className="text-amber-400">{targetTrack.id}</span>
        </h2>
        <p className="text-sm text-gray-400 mb-6">Current label: <span className="font-semibold">{targetTrack.label}</span></p>

        <div className="relative">
          <label htmlFor="labelInput" className="block text-sm font-medium text-gray-300 mb-1">
            New Label
          </label>
          <div className="relative">
             <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              id="labelInput"
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              placeholder="Type new label or select suggestion"
              className="w-full pl-10 pr-3 py-2.5 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-brand-accent focus:border-brand-accent"
            />
          </div>
          {showSuggestions && filteredSuggestions.length > 0 && (
            <ul className="absolute z-10 w-full bg-gray-700 border border-gray-600 rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg">
              {filteredSuggestions.map(suggestion => (
                <li
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-4 py-2 hover:bg-gray-600 cursor-pointer text-sm"
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
           {showSuggestions && inputValue.trim() && !existingLabels.map(l => l.toLowerCase()).includes(inputValue.toLowerCase().trim()) && (
             <p className="text-xs text-gray-400 mt-2">Press Enter to create new label: "{inputValue.trim()}"</p>
           )}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row-reverse gap-3">
          <button
            onClick={handleSave}
            disabled={!inputValue.trim()}
            className={`w-full sm:w-auto py-2.5 px-6 rounded-md font-semibold text-white flex items-center justify-center space-x-2 transition-colors
                        ${inputValue.trim() ? 'bg-brand-primary hover:bg-blue-800' : 'bg-gray-600 opacity-50 cursor-not-allowed'}`}
          >
            <Check size={20} />
            <span>Save</span>
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto py-2.5 px-6 bg-gray-600 hover:bg-gray-500 text-gray-200 rounded-md font-semibold transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditLabelModal;