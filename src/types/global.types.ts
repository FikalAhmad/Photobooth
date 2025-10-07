export type FilterSettings = {
  grayscale: number[];
  brightness: number[];
  retroFilter: number[];
  saturate: number[];
  softFilter: number[];
};

export type CapturedImage = {
  src: string;
  filters: FilterSettings;
  mirrored: boolean;
  fitCamera: boolean;
};

export type Frame = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Filters = {
  grayscale: number;
  brightness: number;
  retroFilter: number;
  saturate: number;
  softFilter: number;
};
