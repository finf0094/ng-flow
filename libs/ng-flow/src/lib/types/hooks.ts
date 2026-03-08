import type { GraphEdge } from './edge';
import type { GraphNode } from './node';
import type { Connection, OnConnectStartParams } from './connection';
import type { ViewportTransform } from './zoom';
import type { EdgeChange, NodeChange } from './changes';

export type MouseTouchEvent = MouseEvent | TouchEvent;

export interface NodeMouseEvent {
  event: MouseTouchEvent;
  node: GraphNode;
}

export interface NodeDragEvent {
  event: MouseTouchEvent;
  node: GraphNode;
  nodes: GraphNode[];
}

export interface EdgeMouseEvent {
  event: MouseTouchEvent;
  edge: GraphEdge;
}

export interface EdgeUpdateEvent {
  event: MouseTouchEvent;
  edge: GraphEdge;
  connection: Connection;
}

export interface FlowEvents {
  nodesChange: NodeChange[];
  edgesChange: EdgeChange[];
  nodeDoubleClick: NodeMouseEvent;
  nodeClick: NodeMouseEvent;
  nodeMouseEnter: NodeMouseEvent;
  nodeMouseMove: NodeMouseEvent;
  nodeMouseLeave: NodeMouseEvent;
  nodeContextMenu: NodeMouseEvent;
  nodeDragStart: NodeDragEvent;
  nodeDrag: NodeDragEvent;
  nodeDragStop: NodeDragEvent;
  nodesInitialized: GraphNode[];
  connect: Connection;
  connectStart: { event?: MouseEvent | TouchEvent } & OnConnectStartParams;
  connectEnd: MouseEvent | TouchEvent | undefined;
  clickConnectStart: { event?: MouseEvent | TouchEvent } & OnConnectStartParams;
  clickConnectEnd: MouseEvent | TouchEvent | undefined;
  init: any;
  move: { event: any; flowTransform: ViewportTransform };
  moveStart: { event: any; flowTransform: ViewportTransform };
  moveEnd: { event: any; flowTransform: ViewportTransform };
  selectionDragStart: NodeDragEvent;
  selectionDrag: NodeDragEvent;
  selectionDragStop: NodeDragEvent;
  selectionContextMenu: { event: MouseEvent; nodes: GraphNode[] };
  selectionStart: MouseEvent;
  selectionEnd: MouseEvent;
  viewportChangeStart: ViewportTransform;
  viewportChange: ViewportTransform;
  viewportChangeEnd: ViewportTransform;
  paneScroll: WheelEvent | undefined;
  paneClick: MouseEvent;
  paneContextMenu: MouseEvent;
  paneMouseEnter: PointerEvent;
  paneMouseMove: PointerEvent;
  paneMouseLeave: PointerEvent;
  edgeContextMenu: EdgeMouseEvent;
  edgeMouseEnter: EdgeMouseEvent;
  edgeMouseMove: EdgeMouseEvent;
  edgeMouseLeave: EdgeMouseEvent;
  edgeDoubleClick: EdgeMouseEvent;
  edgeClick: EdgeMouseEvent;
  edgeUpdateStart: EdgeMouseEvent;
  edgeUpdate: EdgeUpdateEvent;
  edgeUpdateEnd: EdgeMouseEvent;
  error: Error;
}
