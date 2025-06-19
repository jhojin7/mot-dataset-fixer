import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Track, Detection, UITrack } from './types';
import { INITIAL_TRACKS, INITIAL_DETECTIONS, MAX_FRAMES, FRAME_WIDTH, FRAME_HEIGHT, TRACK_COLORS } from './constants';
import FrameDisplay from './components/FrameDisplay';
import TrackPanel from './components/TrackPanel';
import Controls from './components/Controls';
import HelpModal from './components/HelpModal';
import EditLabelModal from './components/EditLabelModal'; // Import new modal

// Add utility functions for dataset loading
const validateDataset = (data: any): { tracks: Track[], detections: Detection[] } | null => {
  try {
    if (!data || typeof data !== 'object') return null;
    
    const tracks = data.tracks || [];
    const detections = data.detections || [];
    
    // Validate tracks structure
    for (const track of tracks) {
      if (!track.id || !track.label || !track.color) return null;
    }
    
    // Validate detections structure
    for (const detection of detections) {
      if (!detection.id || !detection.trackId || !detection.box || 
          typeof detection.frame !== 'number' || !detection.label) return null;
      
      // Validate bounding box
      const box = detection.box;
      if (typeof box.x !== 'number' || typeof box.y !== 'number' || 
          typeof box.w !== 'number' || typeof box.h !== 'number') return null;
    }
    
    return { tracks, detections };
  } catch (error) {
    console.error('Error validating dataset:', error);
    return null;
  }
};

const App: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>(INITIAL_TRACKS);
  const [detections, setDetections] = useState<Detection[]>(INITIAL_DETECTIONS);
  const [currentFrame, setCurrentFrame] = useState<number>(0);
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([]);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [focusedTrackId, setFocusedTrackId] = useState<string | null>(null);
  const [isEditLabelModalOpen, setIsEditLabelModalOpen] = useState<boolean>(false);
  const [trackToEditLabel, setTrackToEditLabel] = useState<Track | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const nextTrackNumericIdRef = useRef<number>(
    INITIAL_TRACKS.reduce((maxId, track) => {
      const numericPart = parseInt(track.id.replace('T', ''), 10);
      return Math.max(maxId, isNaN(numericPart) ? 0 : numericPart);
    }, 0) + 1
  );
  
  const nextColorIndexRef = useRef<number>(INITIAL_TRACKS.length % TRACK_COLORS.length);


  const handleNextFrame = useCallback(() => {
    setCurrentFrame(prev => Math.min(prev + 1, MAX_FRAMES - 1));
  }, []);

  const handlePrevFrame = useCallback(() => {
    setCurrentFrame(prev => Math.max(prev - 1, 0));
  }, []);

  const handleToggleTrackSelection = useCallback((trackId: string) => {
    setSelectedTrackIds(prevSelected =>
      prevSelected.includes(trackId)
        ? prevSelected.filter(id => id !== trackId)
        : [...prevSelected, trackId]
    );
    setFocusedTrackId(trackId); 
  }, []);

  const handleMergeTracks = useCallback(() => {
    if (selectedTrackIds.length < 2) {
      alert("Please select at least two tracks to merge.");
      return;
    }

    const sortedSelectedIds = [...selectedTrackIds].sort();
    const targetTrackId = sortedSelectedIds[0];
    const targetTrack = tracks.find(t => t.id === targetTrackId);
    if (!targetTrack) return;

    const idsToMerge = sortedSelectedIds.slice(1);

    setDetections(prevDetections =>
      prevDetections.map(det =>
        idsToMerge.includes(det.trackId) ? { ...det, trackId: targetTrackId, label: targetTrack.label } : det
      )
    );

    setTracks(prevTracks =>
      prevTracks.filter(track => !idsToMerge.includes(track.id))
    );

    setSelectedTrackIds([targetTrackId]); 
    setFocusedTrackId(targetTrackId);
    alert(`Tracks ${idsToMerge.join(', ')} merged into ${targetTrackId}.`);
  }, [selectedTrackIds, tracks]);


  const handleSplitTrack = useCallback(() => {
    if (selectedTrackIds.length !== 1) {
      alert("Please select exactly one track to split.");
      return;
    }
    const trackToSplitId = selectedTrackIds[0];
    const trackToSplit = tracks.find(t => t.id === trackToSplitId);

    if (!trackToSplit) {
      alert("Selected track not found.");
      return;
    }

    const detectionsToMove = detections.filter(
      det => det.trackId === trackToSplitId && det.frame >= currentFrame
    );

    if (detectionsToMove.length === 0) {
      alert(`No detections for track ${trackToSplitId} at or after frame ${currentFrame} to move to a new track.`);
      return;
    }
    
    const newTrackId = `T${nextTrackNumericIdRef.current++}`;
    const newTrackColor = TRACK_COLORS[nextColorIndexRef.current];
    nextColorIndexRef.current = (nextColorIndexRef.current + 1) % TRACK_COLORS.length;

    const newTrack: Track = {
      id: newTrackId,
      label: trackToSplit.label, // Inherit label
      color: newTrackColor,
    };

    setTracks(prevTracks => [...prevTracks, newTrack]);
    setDetections(prevDetections =>
      prevDetections.map(det => {
        if (det.trackId === trackToSplitId && det.frame >= currentFrame) {
          return { ...det, trackId: newTrackId }; // Label is inherited with newTrack.label by detection components
        }
        return det;
      })
    );
    
    setSelectedTrackIds([trackToSplitId]);
    setFocusedTrackId(trackToSplitId);

    alert(`Track ${trackToSplitId} split. Detections from frame ${currentFrame} onwards moved to new track ${newTrackId}.`);

  }, [selectedTrackIds, tracks, detections, currentFrame]);

  const handleOpenEditLabelModal = useCallback(() => {
    if (selectedTrackIds.length === 1 && focusedTrackId) {
      const track = tracks.find(t => t.id === focusedTrackId);
      if (track) {
        setTrackToEditLabel(track);
        setIsEditLabelModalOpen(true);
      }
    } else {
      alert("Please select exactly one track to edit its label.");
    }
  }, [selectedTrackIds, focusedTrackId, tracks]);

  const handleCloseEditLabelModal = useCallback(() => {
    setIsEditLabelModalOpen(false);
    setTrackToEditLabel(null);
  }, []);

  const handleSaveTrackLabel = useCallback((trackId: string, newLabel: string) => {
    setTracks(prevTracks =>
      prevTracks.map(t => (t.id === trackId ? { ...t, label: newLabel } : t))
    );
    setDetections(prevDetections =>
      prevDetections.map(det =>
        det.trackId === trackId ? { ...det, label: newLabel } : det
      )
    );
    handleCloseEditLabelModal();
  }, [handleCloseEditLabelModal]);

  // File loading and export functions
  const handleLoadDataset = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        const validated = validateDataset(data);
        
        if (!validated) {
          setLoadError('Invalid dataset format. Please check the file structure.');
          return;
        }

        // Update the data
        setTracks(validated.tracks);
        setDetections(validated.detections);
        setCurrentFrame(0);
        setSelectedTrackIds([]);
        setLoadError(null);
        
        // Update the next track ID counter
        const maxTrackId = validated.tracks.reduce((maxId, track) => {
          const numericPart = parseInt(track.id.replace('T', ''), 10);
          return Math.max(maxId, isNaN(numericPart) ? 0 : numericPart);
        }, 0);
        nextTrackNumericIdRef.current = maxTrackId + 1;
        
        alert('Dataset loaded successfully!');
      } catch (error) {
        setLoadError('Error parsing JSON file. Please check the file format.');
        console.error('Error loading dataset:', error);
      }
    };
    
    reader.readAsText(file);
    // Reset the input value so the same file can be loaded again
    event.target.value = '';
  }, []);

  const handleExportDataset = useCallback(() => {
    const dataset = {
      tracks,
      detections,
      metadata: {
        exportedAt: new Date().toISOString(),
        totalFrames: MAX_FRAMES,
        version: '1.0'
      }
    };

    const dataStr = JSON.stringify(dataset, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `mot-dataset-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [tracks, detections]);

  const handleResetDataset = useCallback(() => {
    if (confirm('Are you sure you want to reset to the default dataset? All changes will be lost.')) {
      setTracks(INITIAL_TRACKS);
      setDetections(INITIAL_DETECTIONS);
      setCurrentFrame(0);
      setSelectedTrackIds([]);
      setLoadError(null);
      nextTrackNumericIdRef.current = INITIAL_TRACKS.reduce((maxId, track) => {
        const numericPart = parseInt(track.id.replace('T', ''), 10);
        return Math.max(maxId, isNaN(numericPart) ? 0 : numericPart);
      }, 0) + 1;
      alert('Dataset reset to default.');
    }
  }, []);

  const getUniqueLabels = useMemo(() => {
    const allLabels = tracks.map(t => t.label);
    return [...new Set(allLabels)].sort();
  }, [tracks]);


  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditLabelModalOpen || showHelp) { 
        if (event.key.toLowerCase() === 'escape') {
            if (isEditLabelModalOpen) handleCloseEditLabelModal();
            if (showHelp) setShowHelp(false);
        }
        return; // Don't process other shortcuts if a modal is open
      }

      if (document.activeElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
        return;
      }
      
      const availableTrackIds = tracks.map(t => t.id);

      if (['arrowup', 'arrowdown', 'home', 'end', ' '].includes(event.key.toLowerCase())) {
         if (availableTrackIds.length > 0) {
            event.preventDefault(); 
         }
      }
      
      switch (event.key.toLowerCase()) {
        case 'n':
        case 'arrowright':
          if (!event.altKey && !event.ctrlKey && !event.metaKey) handleNextFrame();
          break;
        case 'p':
        case 'arrowleft':
          if (!event.altKey && !event.ctrlKey && !event.metaKey) handlePrevFrame();
          break;
        case 'f': // Changed from 'm'
          if (selectedTrackIds.length >= 2) {
            handleMergeTracks();
          } else {
            alert("Select at least two tracks to merge using 'F'.");
          }
          break;
        case 's':
          if (selectedTrackIds.length === 1) {
            handleSplitTrack();
          } else {
             alert("Select exactly one track to split using 'S'.");
          }
          break;
        case 'e': // Changed from 'l'
            if (selectedTrackIds.length === 1) {
                handleOpenEditLabelModal();
            } else {
                alert("Select exactly one track to edit its label using 'E'.");
            }
            break;
        case 'h':
           setShowHelp(prev => !prev);
           break;
        case 'escape':
            setSelectedTrackIds([]);
            setFocusedTrackId(null); 
          break;
        case 'arrowdown':
          if (availableTrackIds.length > 0) {
            const currentIdx = focusedTrackId ? availableTrackIds.indexOf(focusedTrackId) : -1;
            const nextIdx = Math.min(availableTrackIds.length -1, currentIdx + 1);
            if(currentIdx === -1 && availableTrackIds.length > 0) setFocusedTrackId(availableTrackIds[0]);
            else if (nextIdx !== currentIdx) setFocusedTrackId(availableTrackIds[nextIdx]);
          }
          break;
        case 'arrowup':
          if (availableTrackIds.length > 0) {
            const currentIdx = focusedTrackId ? availableTrackIds.indexOf(focusedTrackId) : 0;
            const prevIdx = Math.max(0, currentIdx - 1);
            if (prevIdx !== currentIdx) setFocusedTrackId(availableTrackIds[prevIdx]);
          }
          break;
        case 'home':
           if (availableTrackIds.length > 0) {
            setFocusedTrackId(availableTrackIds[0]);
          }
          break;
        case 'end':
          if (availableTrackIds.length > 0) {
            setFocusedTrackId(availableTrackIds[availableTrackIds.length - 1]);
          }
          break;
        case ' ': 
          if (focusedTrackId) {
            event.preventDefault();
            handleToggleTrackSelection(focusedTrackId);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
      handleNextFrame, handlePrevFrame, handleMergeTracks, handleSplitTrack, 
      selectedTrackIds, showHelp, tracks, focusedTrackId, handleToggleTrackSelection,
      isEditLabelModalOpen, handleOpenEditLabelModal, handleCloseEditLabelModal
    ]);

  const currentFrameDetections = detections.filter(
    det => det.frame === currentFrame
  );

  const uiTracks: UITrack[] = tracks.map(track => ({
    ...track,
    isSelected: selectedTrackIds.includes(track.id),
  })).sort((a,b) => { 
      const aNum = parseInt(a.id.replace('T', ''), 10);
      const bNum = parseInt(b.id.replace('T', ''), 10);
      if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
      return a.id.localeCompare(b.id);
  });

  return (
    <div className="flex flex-col h-screen bg-brand-dark p-4 md:p-6 space-y-4 overflow-hidden">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-brand-primary">MOT Dataset Fixer</h1>
        
        <div className="flex flex-wrap gap-2 items-center">
          {/* Dataset Management Controls */}
          <div className="flex gap-2 items-center">
            <input
              type="file"
              accept=".json"
              onChange={handleLoadDataset}
              style={{ display: 'none' }}
              id="dataset-file-input"
            />
            <label
              htmlFor="dataset-file-input"
              className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm cursor-pointer"
            >
              Load Dataset
            </label>
            <button
              onClick={handleExportDataset}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              Export Dataset
            </button>
            <button
              onClick={handleResetDataset}
              className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
            >
              Reset
            </button>
          </div>
          
          <button 
              onClick={() => setShowHelp(true)}
              className="px-4 py-2 bg-brand-secondary text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              aria-label="Open help dialog"
          >
              Help (H)
          </button>
        </div>
      </header>

      {/* Error Display */}
      {loadError && (
        <div className="bg-red-600 text-white p-3 rounded-md flex justify-between items-center">
          <span>{loadError}</span>
          <button
            onClick={() => setLoadError(null)}
            className="ml-4 text-red-200 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex flex-1 flex-col md:flex-row gap-4 overflow-hidden">
        <div className="md:w-3/4 flex flex-col bg-gray-800 p-2 rounded-lg shadow-xl">
          <FrameDisplay
            detectionsOnFrame={currentFrameDetections}
            tracks={tracks} 
            frameNumber={currentFrame}
            onSelectTrack={handleToggleTrackSelection}
            selectedTrackIds={selectedTrackIds}
            frameWidth={FRAME_WIDTH}
            frameHeight={FRAME_HEIGHT}
          />
          <Controls
            currentFrame={currentFrame}
            maxFrames={MAX_FRAMES}
            onNext={handleNextFrame}
            onPrev={handlePrevFrame}
          />
        </div>
        <div className="md:w-1/4 bg-gray-800 p-4 rounded-lg shadow-xl overflow-y-auto">
          <TrackPanel
            tracks={uiTracks}
            onSelectTrack={handleToggleTrackSelection}
            onMerge={handleMergeTracks}
            onSplit={handleSplitTrack}
            onEditLabel={handleOpenEditLabelModal} // Pass new handler
            selectedTrackIds={selectedTrackIds}
            focusedTrackId={focusedTrackId}
          />
        </div>
      </div>
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      {isEditLabelModalOpen && trackToEditLabel && (
        <EditLabelModal
          isOpen={isEditLabelModalOpen}
          onClose={handleCloseEditLabelModal}
          onSave={handleSaveTrackLabel}
          targetTrack={trackToEditLabel}
          existingLabels={getUniqueLabels}
        />
      )}
       <footer className="text-center text-xs text-gray-500 pt-2">
        Tip: Use 'N'/'P' for frames, 'F' to Merge, 'S' to Split, 'E' to Edit Label. Arrow keys & Space to select. 'Esc' to Deselect/Close. 'H' for Help.
      </footer>
    </div>
  );
};

export default App;
