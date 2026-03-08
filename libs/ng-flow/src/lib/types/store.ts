import type { GraphNode, Node } from './node';
import type { GraphEdge } from './edge';

export type NodeLookup = Map<string, GraphNode>;
export type EdgeLookup = Map<string, GraphEdge>;

export interface UpdateNodeDimensionsParams {
  id: string;
  nodeElement: HTMLDivElement;
  forceUpdate?: boolean;
}
