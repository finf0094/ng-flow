import type { CSSProperties } from './flow';
import type { Position } from './flow';
import type { GraphNode } from './node';
import type { HandleElement, HandleType } from './handle';
import type { Edge, EdgeMarkerType } from './edge';

/** Connection line types (same as default edge types) */
export enum ConnectionLineType {
  Bezier = 'default',
  SimpleBezier = 'simple-bezier',
  Straight = 'straight',
  Step = 'step',
  SmoothStep = 'smoothstep',
}

export interface ConnectionLineOptions {
  type?: ConnectionLineType;
  style?: CSSProperties;
  class?: string;
  markerEnd?: EdgeMarkerType;
  markerStart?: EdgeMarkerType;
}

/** Connection params that are passed when onConnect is called */
export interface Connection {
  /** Source node id */
  source: string;
  /** Target node id */
  target: string;
  /** Source handle id */
  sourceHandle?: string | null;
  /** Target handle id */
  targetHandle?: string | null;
}

export type NodeConnection = Connection & {
  edgeId: string;
};

export type Connector = (
  params: Connection,
) => Promise<(Connection & Partial<Edge>) | false> | ((Connection & Partial<Edge>) | false);

export type ConnectionStatus = 'valid' | 'invalid';

/** The source nodes params when connection is initiated */
export interface OnConnectStartParams {
  /** Source node id */
  nodeId?: string;
  /** Source handle id */
  handleId: string | null;
  /** Source handle type */
  handleType?: HandleType;
}

/** Connection modes, when set to loose all handles are treated as source */
export enum ConnectionMode {
  Strict = 'strict',
  Loose = 'loose',
}

export interface ConnectionLineProps {
  sourceX: number;
  sourceY: number;
  sourcePosition: Position;
  targetX: number;
  targetY: number;
  targetPosition: Position;
  sourceNode: GraphNode;
  sourceHandle: HandleElement | null;
  targetNode: GraphNode | null;
  targetHandle: HandleElement | null;
  markerStart: string;
  markerEnd: string;
  connectionStatus: ConnectionStatus | null;
}

export type ConnectionLookup = Map<string, Map<string, NodeConnection>>;
