export type StickerItem = {
  id: string;
  emoji: string;
  /** Position as percentage 0–100 of container width/height */
  x: number;
  y: number;
  /** Font size in canvas pixels */
  size: number;
  rotation: number;
};

export type TextItem = {
  id: string;
  text: string;
  /** Position as percentage 0–100 of container width/height */
  x: number;
  y: number;
  /** Font size in canvas pixels */
  size: number;
  color: string;
  fontFamily: string;
  bold: boolean;
  rotation: number;
};
