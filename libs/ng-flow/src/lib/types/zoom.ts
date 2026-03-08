import type { Selection } from 'd3-selection';
import type { ZoomBehavior } from 'd3-zoom';
import type { Rect, XYPosition } from './flow';

export type D3Zoom = ZoomBehavior<HTMLDivElement, unknown>;
export type D3Selection = Selection<HTMLDivElement, unknown, null, undefined>;
export type D3ZoomHandler = (this: HTMLDivElement, event: any, d: unknown) => void;

export enum PanOnScrollMode {
  Free = 'free',
  Vertical = 'vertical',
  Horizontal = 'horizontal',
}

export interface TransitionOptions {
  duration?: number;
}

export type PaddingUnit = 'px' | '%';
export type PaddingWithUnit = `${number}${PaddingUnit}` | number;

export type Padding =
  | PaddingWithUnit
  | {
      top?: PaddingWithUnit;
      right?: PaddingWithUnit;
      bottom?: PaddingWithUnit;
      left?: PaddingWithUnit;
      x?: PaddingWithUnit;
      y?: PaddingWithUnit;
    };

export type FitViewParams = {
  padding?: Padding;
  includeHiddenNodes?: boolean;
  minZoom?: number;
  maxZoom?: number;
  nodes?: string[];
} & TransitionOptions;

export interface ViewportTransform {
  x: number;
  y: number;
  zoom: number;
}

export type SetCenterOptions = TransitionOptions & {
  zoom?: number;
};

export type FitBoundsOptions = TransitionOptions & {
  padding?: Padding;
};

export type FitView = (fitViewOptions?: FitViewParams) => Promise<boolean>;
export type Project = (position: XYPosition) => XYPosition;
export type SetCenter = (x: number, y: number, options?: SetCenterOptions) => Promise<boolean>;
export type FitBounds = (bounds: Rect, options?: FitBoundsOptions) => Promise<boolean>;
export type ZoomInOut = (options?: TransitionOptions) => Promise<boolean>;
export type ZoomTo = (zoomLevel: number, options?: TransitionOptions) => Promise<boolean>;
export type GetViewport = () => ViewportTransform;
export type SetViewport = (transform: ViewportTransform, options?: TransitionOptions) => Promise<boolean>;

export interface ViewportFunctions {
  zoomIn: ZoomInOut;
  zoomOut: ZoomInOut;
  zoomTo: ZoomTo;
  setViewport: SetViewport;
  setTransform: SetViewport;
  getViewport: GetViewport;
  getTransform: GetViewport;
  fitView: FitView;
  setCenter: SetCenter;
  fitBounds: FitBounds;
  project: Project;
}
