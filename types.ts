export interface BoundingBox {
  x: number; // percentage
  y: number; // percentage
  w: number; // percentage
  h: number; // percentage
}

export interface Detection {
  id: string; // Unique ID for this detection instance, e.g., "T1_F0"
  trackId: string;
  box: BoundingBox;
  label: string;
  frame: number; // Frame number this detection appears in
}

export interface Track {
  id: string; // Unique ID for the track, e.g., "T1"
  label: string;
  color: string; 
}

// For UI state, to know which tracks are selected in the panel
export interface UITrack extends Track {
  isSelected: boolean;
}