import meta from "./meta.json";

export const DOTS: { [key: string]: { size: number; rotate: number[] } } =
  meta.DOTS;
export const SHAPES = Object.keys(DOTS);
export const GRID = meta.GRID;
export const COLORS = meta.COLORS;
