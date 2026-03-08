export type CSSProperties = Record<string, string | number | null | undefined>;
import type { CoordinateExtent, CoordinateExtentRange, GraphNode, Node } from './node';
import type { DefaultEdgeOptions, Edge, EdgeUpdatable, GraphEdge } from './edge';
import type {
  Connection,
  ConnectionLineOptions,
  ConnectionLineType,
  ConnectionLookup,
  ConnectionMode,
  ConnectionStatus,
  Connector,
  OnConnectStartParams,
} from './connection';
import type { PanOnScrollMode, ViewportTransform } from './zoom';
import type { EdgeChange, NodeChange } from './changes';
import type { ValidConnectionFunc } from './handle';

// todo: should be object type
export type ElementData = any;

/** A flow element (after parsing into state) */
export type FlowElement<
  NodeData = ElementData,
  EdgeData = ElementData,
> = GraphNode<NodeData> | GraphEdge<EdgeData>;

export type FlowElements<
  NodeData = ElementData,
  EdgeData = ElementData,
> = FlowElement<NodeData, EdgeData>[];

/** Initial elements (before parsing into state) */
export type Element<
  NodeData = ElementData,
  EdgeData = ElementData,
> = Node<NodeData> | Edge<EdgeData>;

export type Elements<
  NodeData = ElementData,
  EdgeData = ElementData,
> = Element<NodeData, EdgeData>[];

export type MaybeElement = Node | Edge | Connection | FlowElement | Element;

/** Handle Positions */
export enum Position {
  Left = 'left',
  Top = 'top',
  Right = 'right',
  Bottom = 'bottom',
}

export interface XYPosition {
  x: number;
  y: number;
}

export type XYZPosition = XYPosition & { z: number };

export interface Dimensions {
  width: number;
  height: number;
}

export interface Box extends XYPosition {
  x2: number;
  y2: number;
}

export interface Rect extends Dimensions, XYPosition {}

export type SnapGrid = [x: number, y: number];

export interface SelectionRect extends Rect {
  startX: number;
  startY: number;
}

export enum SelectionMode {
  Partial = 'partial',
  Full = 'full',
}

export interface FlowExportObject {
  nodes: Node[];
  edges: Edge[];
  position: [x: number, y: number];
  zoom: number;
  viewport: ViewportTransform;
}

export type FlowImportObject = { [key in keyof FlowExportObject]?: FlowExportObject[key] };

export type Styles = CSSProperties & Record<string, string | number | undefined>;

export type ClassFunc<ElementType extends FlowElement = FlowElement> = (element: ElementType) => string | void;
export type StyleFunc<ElementType extends FlowElement = FlowElement> = (element: ElementType) => Styles | void;

export interface FlowProps {
  id?: string;
  modelValue?: Elements;
  nodes?: Node[];
  edges?: Edge[];
  connectionMode?: ConnectionMode;
  connectionLineType?: ConnectionLineType | null;
  connectionLineStyle?: CSSProperties | null;
  connectionLineOptions?: ConnectionLineOptions;
  connectionRadius?: number;
  isValidConnection?: ValidConnectionFunc | null;
  deleteKeyCode?: string | null;
  selectionKeyCode?: string | boolean | null;
  multiSelectionKeyCode?: string | null;
  zoomActivationKeyCode?: string | null;
  panActivationKeyCode?: string | null;
  snapToGrid?: boolean;
  snapGrid?: SnapGrid;
  onlyRenderVisibleElements?: boolean;
  edgesUpdatable?: EdgeUpdatable;
  nodesDraggable?: boolean;
  nodesConnectable?: boolean;
  nodeDragThreshold?: number;
  elementsSelectable?: boolean;
  selectNodesOnDrag?: boolean;
  panOnDrag?: boolean | number[];
  minZoom?: number;
  maxZoom?: number;
  defaultViewport?: Partial<ViewportTransform>;
  translateExtent?: CoordinateExtent;
  nodeExtent?: CoordinateExtent | CoordinateExtentRange;
  defaultMarkerColor?: string;
  zoomOnScroll?: boolean;
  zoomOnPinch?: boolean;
  panOnScroll?: boolean;
  panOnScrollSpeed?: number;
  panOnScrollMode?: PanOnScrollMode;
  paneClickDistance?: number;
  zoomOnDoubleClick?: boolean;
  preventScrolling?: boolean;
  selectionMode?: SelectionMode;
  edgeUpdaterRadius?: number;
  fitViewOnInit?: boolean;
  connectOnClick?: boolean;
  applyDefault?: boolean;
  autoConnect?: boolean | Connector;
  noDragClassName?: string;
  noWheelClassName?: string;
  noPanClassName?: string;
  defaultEdgeOptions?: DefaultEdgeOptions;
  elevateEdgesOnSelect?: boolean;
  elevateNodesOnSelect?: boolean;
  disableKeyboardA11y?: boolean;
  edgesFocusable?: boolean;
  nodesFocusable?: boolean;
  autoPanOnConnect?: boolean;
  autoPanOnNodeDrag?: boolean;
  autoPanSpeed?: number;
}
