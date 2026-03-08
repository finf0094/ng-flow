import type { CSSProperties } from './flow';
import type { ClassFunc, ElementData, Position, StyleFunc, Styles } from './flow';
import type { GraphNode } from './node';
import type { ComponentType } from './node';

/** Edge markers */
export enum MarkerType {
  Arrow = 'arrow',
  ArrowClosed = 'arrowclosed',
}

export interface EdgeMarker {
  id?: string;
  type: MarkerType;
  color?: string;
  width?: number;
  height?: number;
  markerUnits?: string;
  orient?: string;
  strokeWidth?: number;
}

export interface MarkerProps {
  id: string;
  type: MarkerType | string;
  color?: string;
  width?: number;
  height?: number;
  markerUnits?: string;
  orient?: string;
  strokeWidth?: number;
}

export type EdgeMarkerType = string | MarkerType | EdgeMarker;

export type EdgeUpdatable = boolean | 'target' | 'source';

export interface EdgeLabelOptions {
  labelStyle?: CSSProperties;
  labelShowBg?: boolean;
  labelBgStyle?: CSSProperties;
  labelBgPadding?: [number, number];
  labelBgBorderRadius?: number;
}

export interface DefaultEdge<
  Data = ElementData,
  Type extends string = string,
> extends EdgeLabelOptions {
  /** Unique edge id */
  id: string;
  /** An edge label */
  label?: string;
  /** Edge type, can be a default type or a custom type */
  type?: Type;
  /** Source node id */
  source: string;
  /** Target node id */
  target: string;
  /** Source handle id */
  sourceHandle?: string | null;
  /** Target handle id */
  targetHandle?: string | null;
  /** Animated edge */
  animated?: boolean;
  /** EdgeMarker */
  markerStart?: EdgeMarkerType;
  /** EdgeMarker */
  markerEnd?: EdgeMarkerType;
  /** Disable/enable updating edge */
  updatable?: EdgeUpdatable;
  /** Disable/enable selecting edge */
  selectable?: boolean;
  /** Disable/enable focusing edge (a11y) */
  focusable?: boolean;
  /** Disable/enable deleting edge */
  deletable?: boolean;
  /** Additional class names */
  class?: string | string[] | Record<string, boolean> | ClassFunc<GraphEdge<Data>>;
  /** Additional styles */
  style?: Styles | StyleFunc<GraphEdge<Data>>;
  /** Is edge hidden */
  hidden?: boolean;
  /** Radius of mouse event triggers (to ease selecting edges), defaults to 2 */
  interactionWidth?: number;
  /** Angular component type to use for rendering */
  template?: ComponentType;
  /** Additional data that is passed to your custom components */
  data?: Data;
  zIndex?: number;
  ariaLabel?: string | null;
}

export interface SmoothStepPathOptions {
  offset?: number;
  borderRadius?: number;
}

export type SmoothStepEdgeType<Data = ElementData> = DefaultEdge<Data> & {
  type: 'smoothstep';
  pathOptions?: SmoothStepPathOptions;
};

export interface BezierPathOptions {
  curvature?: number;
}

export type BezierEdgeType<Data = ElementData> = DefaultEdge<Data> & {
  type: 'default';
  pathOptions?: BezierPathOptions;
};

export type Edge<Data = ElementData, Type extends string = string> =
  | DefaultEdge<Data, Type>
  | SmoothStepEdgeType<Data>
  | BezierEdgeType<Data>;

export type DefaultEdgeOptions = Omit<Edge, 'id' | 'source' | 'target' | 'sourceHandle' | 'targetHandle'>;

export interface EdgePositions {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
}

/** Internal edge type */
export type GraphEdge<
  Data = ElementData,
  Type extends string = string,
> = Edge<Data> & {
  selected: boolean;
  sourceNode: GraphNode;
  targetNode: GraphNode;
  data: Data;
  type: Type;
} & EdgePositions;

/** these props are passed to edge components */
export interface EdgeProps<Data = ElementData, Type extends string = string>
  extends EdgeLabelOptions,
    EdgePositions {
  id: string;
  sourceNode: GraphNode;
  targetNode: GraphNode;
  source: string;
  target: string;
  type: Type;
  label?: string;
  style?: CSSProperties;
  selected?: boolean;
  sourcePosition: Position;
  targetPosition: Position;
  sourceHandleId?: string;
  targetHandleId?: string;
  animated?: boolean;
  updatable?: boolean;
  markerStart: string;
  markerEnd: string;
  curvature?: number;
  interactionWidth?: number;
  data: Data;
}

export interface BaseEdgeProps extends EdgeLabelOptions {
  id?: string;
  labelX?: number;
  labelY?: number;
  path: string;
  label?: string;
  markerStart?: string;
  markerEnd?: string;
  interactionWidth?: number;
}

export type BezierEdgeProps = EdgePositions &
  BezierPathOptions &
  Omit<BaseEdgeProps, 'labelX' | 'labelY' | 'path'> &
  Pick<EdgeProps, 'sourcePosition' | 'targetPosition'>;

export type SimpleBezierEdgeProps = EdgePositions &
  Omit<BaseEdgeProps, 'labelX' | 'labelY' | 'path'> &
  Pick<EdgeProps, 'sourcePosition' | 'targetPosition'>;

export type StraightEdgeProps = EdgePositions & Omit<BaseEdgeProps, 'labelX' | 'labelY' | 'path'>;

export type StepEdgeProps = EdgePositions &
  Omit<BaseEdgeProps, 'labelX' | 'labelY' | 'path'> &
  Pick<EdgeProps, 'sourcePosition' | 'targetPosition'>;

export type SmoothStepEdgeProps = EdgePositions &
  Omit<BaseEdgeProps, 'labelX' | 'labelY' | 'path'> &
  Pick<EdgeProps, 'sourcePosition' | 'targetPosition'> &
  SmoothStepPathOptions;

export type ToGraphEdge<T extends Edge> = GraphEdge<
  T extends Edge<infer Data> ? Data : never,
  T extends Edge<never, infer Type> ? Type : never
>;
