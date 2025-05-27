import { Track, Detection } from './types';

export const MAX_FRAMES = 30; // 0 to 29

export const TRACK_COLORS: string[] = [
  '#EF4444', // Red
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#6366F1', // Indigo
  '#EC4899', // Pink
  '#8B5CF6', // Violet
  '#D946EF', // Fuchsia
  '#06B6D4', // Cyan
  '#F97316', // Orange
];

export const INITIAL_TRACKS: Track[] = [
  { id: 'T1', label: 'Pedestrian', color: TRACK_COLORS[0] },
  { id: 'T2', label: 'Pedestrian', color: TRACK_COLORS[1] },
  { id: 'T3', label: 'Cyclist', color: TRACK_COLORS[2] }, // Changed label for variety
  { id: 'T4', label: 'Vehicle', color: TRACK_COLORS[3] }, // Changed label for variety
];

const generateDetections = (): Detection[] => {
  const detections: Detection[] = [];

  // Track T1 (Pedestrian, complete)
  // Starts at (10, 20), moves right (dx=1.5) and down (dy=0.5)
  const t1_w = 5, t1_h = 15;
  for (let i = 0; i < MAX_FRAMES; i++) {
    detections.push({
      id: `T1_F${i}`,
      trackId: 'T1',
      box: { x: 10 + 1.5 * i, y: 20 + 0.5 * i, w: t1_w, h: t1_h },
      label: 'Pedestrian',
      frame: i,
    });
  }

  // Track T2 (Pedestrian, part 1)
  // Starts at (40, 30), moves right (dx=1.8) and down (dy=0.8) for frames 0-14
  const t2_w = 6, t2_h = 16;
  for (let i = 0; i < Math.floor(MAX_FRAMES / 2); i++) {
    detections.push({
      id: `T2_F${i}`,
      trackId: 'T2',
      box: { x: 40 + 1.8 * i, y: 30 + 0.8 * i, w: t2_w, h: t2_h },
      label: 'Pedestrian',
      frame: i,
    });
  }

  // Track T3 (Cyclist, part 2 - to be merged with T2, or label changed)
  // Starts slightly offset from T2's end, from frame 15-29
  // Continues movement pattern: x starts ~40+1.8*15, y starts ~30+0.8*15
  const t3_start_x = 40 + 1.8 * Math.floor(MAX_FRAMES / 2) + 5; // Offset for visual break
  const t3_start_y = 30 + 0.8 * Math.floor(MAX_FRAMES / 2) + 5; // Offset for visual break
  for (let i = Math.floor(MAX_FRAMES / 2); i < MAX_FRAMES; i++) {
    detections.push({
      id: `T3_F${i}`,
      trackId: 'T3',
      box: { 
        x: t3_start_x + 1.8 * (i - Math.floor(MAX_FRAMES / 2)), 
        y: t3_start_y + 0.8 * (i - Math.floor(MAX_FRAMES / 2)), 
        w: t2_w, // Same size as T2 for potential merge demo
        h: t2_h  // Same size as T2 for potential merge demo
      },
      label: 'Cyclist', // Initial label for T3 detections
      frame: i,
    });
  }

  // Track T4 (Vehicle)
  // Starts at (80, 60), moves left (dx=-2) and slightly up (dy=-0.2)
  const t4_w = 15, t4_h = 10;
  for (let i = 0; i < MAX_FRAMES; i++) {
    detections.push({
      id: `T4_F${i}`,
      trackId: 'T4',
      box: { x: 80 - 2 * i, y: 60 - 0.2 * i, w: t4_w, h: t4_h },
      label: 'Vehicle', // Initial label for T4 detections
      frame: i,
    });
  }
  
  // Cap x and y to be within 0-95 for w/h of 5-15 to prevent overflow,
  // while still allowing some to go partially off-screen.
  return detections.map(det => ({
    ...det,
    box: {
      ...det.box,
      x: Math.max(0, Math.min(100 - det.box.w, det.box.x)),
      y: Math.max(0, Math.min(100 - det.box.h, det.box.y)),
    }
  }));
};

export const INITIAL_DETECTIONS: Detection[] = generateDetections();

export const FRAME_WIDTH = 800;
export const FRAME_HEIGHT = 600;