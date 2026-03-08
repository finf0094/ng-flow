import type { ClassFunc, Dimensions, ElementData, Position, StyleFunc, Styles, XYPosition, XYZPosition } from './flow';
import type { HandleConnectable, HandleElement, ValidConnectionFunc } from './handle';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ComponentType<T = any> = new (...args: any[]) => T;

/** Defined as [[x-from, y-from], [x-to, y-to]] */
export type CoordinateExtent = [
  extentFrom: [fromX: number, fromY: number],
  extentTo: [toX: number, toY: number],
];

export interface CoordinateExtentRange {
  range: 'parent' | CoordinateExtent;
  padding:
    | number
    | [padding: number]
    | [paddingY: number, paddingX: number]
    | [paddingTop: number, paddingX: number, paddingBottom: number]
    | [paddingTop: number, paddingRight: number, paddingBottom: number, paddingLeft: number];
}

export interface NodeHandleBounds {
  source: HandleElement[] | null;
  target: HandleElement[] | null;
}

export interface Node<Data = ElementData, Type extends string = string> {
  /** Unique node id */
  id: string;
  /** A node label */
  label?: string;
  /** initial node position x, y */
  position: XYPosition;
  /** node type, can be a default type or a custom type */
  type?: Type;
  /** handle position */
  targetPosition?: Position;
  /** handle position */
  sourcePosition?: Position;
  /** Disable/enable dragging node */
  draggable?: boolean;
  /** Disable/enable selecting node */
  selectable?: boolean;
  /** Disable/enable connecting node */
  connectable?: HandleConnectable;
  /** Disable/enable focusing node (a11y) */
  focusable?: boolean;
  /** Disable/enable deleting node */
  deletable?: boolean;
  /** element selector as drag handle for node */
  dragHandle?: string;
  /** called when used as target for new connection */
  isValidTargetPos?: ValidConnectionFunc;
  /** called when used as source for new connection */
  isValidSourcePos?: ValidConnectionFunc;
  /** define node extent, i.e. area in which node can be moved */
  extent?: CoordinateExtent | CoordinateExtentRange | 'parent';
  /** expands parent area to fit child node */
  expandParent?: boolean;
  /** define node as a child node by setting a parent node id */
  parentNode?: string;
  /**
   * Fixed width of node
   * You can pass a number (px) or string with units
   */
  width?: number | string;
  /**
   * Fixed height of node
   * You can pass a number (px) or string with units
   */
  height?: number | string;
  /** Additional class names */
  class?: string | string[] | Record<string, boolean> | ClassFunc<GraphNode<Data>>;
  /** Additional styles */
  style?: Styles | StyleFunc<GraphNode<Data>>;
  /** Is node hidden */
  hidden?: boolean;
  /** Angular component type to use for rendering */
  template?: ComponentType;
  /** Additional data that is passed to your custom components */
  data?: Data;
  zIndex?: number;
  ariaLabel?: string;
}

export interface GraphNode<Data = ElementData, Type extends string = string>
  extends Node<Data, Type> {
  /** absolute position in relation to parent elements + z-index */
  computedPosition: XYZPosition;
  handleBounds: NodeHandleBounds;
  /** node width, height */
  dimensions: Dimensions;
  isParent: boolean;
  selected: boolean;
  resizing: boolean;
  dragging: boolean;
  data: Data;
  type: Type;
}

/** these props are passed to node components */
export interface NodeProps<Data = ElementData, Type extends string = string> {
  /** unique node id */
  id: string;
  /** node type */
  type: Type;
  /** is node selected */
  selected: boolean;
  /** can node handles be connected */
  connectable: HandleConnectable;
  /** node x, y (relative) position on graph */
  position: XYPosition;
  /** dom element dimensions (width, height) */
  dimensions: Dimensions;
  /** node label */
  label?: string;
  /** called when used as target for new connection */
  isValidTargetPos?: ValidConnectionFunc;
  /** called when used as source for new connection */
  isValidSourcePos?: ValidConnectionFunc;
  /** parent node id */
  parentNodeId?: string;
  /** is node currently dragging */
  dragging: boolean;
  /** is node currently resizing */
  resizing: boolean;
  /** node z-index */
  zIndex: number;
  /** handle position */
  targetPosition?: Position;
  /** handle position */
  sourcePosition?: Position;
  /** drag handle query selector */
  dragHandle?: string;
  /** additional data of node */
  data: Data;
}

export type ToGraphNode<T extends Node> = GraphNode<
  T extends Node<infer Data> ? Data : never,
  T extends Node<any, infer Type> ? Type : never
>;
