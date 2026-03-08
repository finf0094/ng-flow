import type {
  Box,
  Connection,
  CoordinateExtent,
  DefaultEdgeOptions,
  Dimensions,
  Edge,
  ElementData,
  Elements,
  GraphEdge,
  GraphNode,
  MaybeElement,
  Node,
  NodeLookup,
  Padding,
  PaddingWithUnit,
  Rect,
  ViewportTransform,
  XYPosition,
  XYZPosition,
} from '../types';

export function nodeToRect(node: GraphNode): Rect {
  return {
    ...(node.computedPosition || { x: 0, y: 0 }),
    width: node.dimensions.width || 0,
    height: node.dimensions.height || 0,
  };
}

export function getOverlappingArea(rectA: Rect, rectB: Rect): number {
  const xOverlap = Math.max(0, Math.min(rectA.x + rectA.width, rectB.x + rectB.width) - Math.max(rectA.x, rectB.x));
  const yOverlap = Math.max(0, Math.min(rectA.y + rectA.height, rectB.y + rectB.height) - Math.max(rectA.y, rectB.y));
  return Math.ceil(xOverlap * yOverlap);
}

export function getDimensions(node: HTMLElement): Dimensions {
  return { width: node.offsetWidth, height: node.offsetHeight };
}

export function clamp(val: number, min = 0, max = 1): number {
  return Math.min(Math.max(val, min), max);
}

export function clampPosition(position: XYPosition, extent: CoordinateExtent): XYPosition {
  return {
    x: clamp(position.x, extent[0][0], extent[1][0]),
    y: clamp(position.y, extent[0][1], extent[1][1]),
  };
}

export function getHostForElement(element: HTMLElement): Document {
  const doc = element.getRootNode() as Document;
  if ('elementFromPoint' in doc) {
    return doc;
  }
  return window.document;
}

export function isEdge<Data = ElementData>(element: MaybeElement): element is Edge<Data> {
  return element && typeof element === 'object' && 'id' in element && 'source' in element && 'target' in element;
}

export function isGraphEdge<Data = ElementData>(element: MaybeElement): element is GraphEdge<Data> {
  return isEdge(element) && 'sourceNode' in element && 'targetNode' in element;
}

export function isNode<Data = ElementData>(element: MaybeElement): element is Node<Data> {
  return element && typeof element === 'object' && 'id' in element && 'position' in element && !isEdge(element);
}

export function isGraphNode<Data = ElementData>(element: MaybeElement): element is GraphNode<Data> {
  return isNode(element) && 'computedPosition' in element;
}

export function parseNode(node: Node, existingNode?: GraphNode, parentNode?: string): GraphNode {
  const initialState = {
    id: node.id.toString(),
    type: node.type,
    dimensions: { width: 0, height: 0 },
    computedPosition: { z: 0, ...(node.position || { x: 0, y: 0 }) },
    handleBounds: { source: [], target: [] },
    draggable: undefined,
    selectable: undefined,
    connectable: undefined,
    focusable: undefined,
    selected: false,
    dragging: false,
    resizing: false,
    isParent: false,
    position: { x: 0, y: 0 },
    data: node.data ?? {},
  } as unknown as GraphNode;

  return Object.assign(existingNode ?? initialState, node, {
    id: node.id.toString(),
    parentNode,
  }) as GraphNode;
}

export function parseEdge(edge: Edge, existingEdge?: GraphEdge, defaultEdgeOptions?: DefaultEdgeOptions): GraphEdge {
  const initialState = {
    id: edge.id.toString(),
    type: edge.type ?? existingEdge?.type ?? 'default',
    source: edge.source.toString(),
    target: edge.target.toString(),
    sourceHandle: edge.sourceHandle?.toString(),
    targetHandle: edge.targetHandle?.toString(),
    updatable: (edge as any).updatable ?? (defaultEdgeOptions as any)?.updatable,
    selectable: edge.selectable ?? defaultEdgeOptions?.selectable,
    focusable: edge.focusable ?? defaultEdgeOptions?.focusable,
    data: (edge as any).data ?? {},
    label: edge.label ?? '',
    interactionWidth: edge.interactionWidth ?? defaultEdgeOptions?.interactionWidth,
    ...(defaultEdgeOptions ?? {}),
  } as unknown as GraphEdge;

  return Object.assign(existingEdge ?? initialState, edge, { id: edge.id.toString() }) as GraphEdge;
}

export function addEdge(edgeParams: Edge | Connection, edges: GraphEdge[]): GraphEdge[] {
  if (!edgeParams.source || !edgeParams.target) {
    console.warn('addEdge: source and target are required');
    return edges;
  }

  let edge: Edge;
  if (isEdge(edgeParams)) {
    edge = { ...edgeParams };
  } else {
    edge = { ...edgeParams, id: `${edgeParams.source}-${edgeParams.target}` } as Edge;
  }

  edge.id = edge.id.toString();

  if (connectionExists(edge, edges)) {
    return edges;
  }

  return [...edges, parseEdge(edge)];
}

export function updateEdge(oldEdge: GraphEdge, newConnection: Connection, edges: GraphEdge[]): GraphEdge[] {
  if (!newConnection.source || !newConnection.target) {
    console.warn('updateEdge: source and target are required');
    return edges;
  }

  const foundEdge = edges.findIndex((e) => e.id === oldEdge.id);

  if (foundEdge === -1) {
    console.warn(`updateEdge: Could not find edge with id: ${oldEdge.id}`);
    return edges;
  }

  const edge = { ...oldEdge, ...newConnection };
  const updatedEdges = [...edges];
  updatedEdges[foundEdge] = parseEdge(edge);
  return updatedEdges;
}

export function connectionExists(edge: Edge | Connection, elements: GraphEdge[]): boolean {
  return elements.some(
    (el) =>
      el.source === edge.source &&
      el.target === edge.target &&
      (el.sourceHandle === edge.sourceHandle || (!el.sourceHandle && !edge.sourceHandle)) &&
      (el.targetHandle === edge.targetHandle || (!el.targetHandle && !edge.targetHandle)),
  );
}

export function getOutgoers<T extends Node = Node>(node: T, nodes: T[], edges: GraphEdge[]): T[] {
  if (!node.id) {
    return [];
  }
  const outgoerIds = new Set(edges.filter((edge) => edge.source === node.id).map((edge) => edge.target));
  return nodes.filter((n) => outgoerIds.has(n.id));
}

export function getIncomers<T extends Node = Node>(node: T, nodes: T[], edges: GraphEdge[]): T[] {
  if (!node.id) {
    return [];
  }
  const incomersIds = new Set(edges.filter((edge) => edge.target === node.id).map((edge) => edge.source));
  return nodes.filter((n) => incomersIds.has(n.id));
}

export function getConnectedEdges<T extends Node = Node>(nodes: T[], edges: GraphEdge[]): GraphEdge[] {
  const nodeIds = new Set(nodes.map((n) => n.id));
  return edges.filter((edge) => nodeIds.has(edge.source) || nodeIds.has(edge.target));
}

export function getRectOfNodes(nodes: GraphNode[]): Rect {
  if (nodes.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  const minX = Math.min(...nodes.map((node) => node.computedPosition.x));
  const minY = Math.min(...nodes.map((node) => node.computedPosition.y));
  const maxX = Math.max(...nodes.map((node) => node.computedPosition.x + (node.dimensions?.width ?? 0)));
  const maxY = Math.max(...nodes.map((node) => node.computedPosition.y + (node.dimensions?.height ?? 0)));

  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

export function getNodesInside(
  nodes: GraphNode[],
  rect: Rect,
  transform: ViewportTransform = { x: 0, y: 0, zoom: 1 },
  partially = false,
  excludeNonSelectableNodes = false,
): GraphNode[] {
  const paneRect = {
    x: (rect.x - transform.x) / transform.zoom,
    y: (rect.y - transform.y) / transform.zoom,
    width: rect.width / transform.zoom,
    height: rect.height / transform.zoom,
  };

  return nodes.filter((node) => {
    const { computedPosition: pos = { x: 0, y: 0 } } = node;
    const { width, height } = node.dimensions;

    if (excludeNonSelectableNodes && !node.selectable) {
      return false;
    }

    const overlappingArea = getOverlappingArea(paneRect, {
      x: pos.x,
      y: pos.y,
      width,
      height,
    });
    const notInitialized = typeof width === 'undefined' || typeof height === 'undefined' || width === 0 || height === 0;

    const partiallyVisible = partially && overlappingArea > 0;
    const area = width * height;
    return notInitialized || partiallyVisible || overlappingArea >= area;
  });
}

export function getTransformForBounds(
  bounds: Rect,
  width: number,
  height: number,
  minZoom: number,
  maxZoom: number,
  padding?: Padding,
): ViewportTransform {
  let paddingValue: { top: number; right: number; bottom: number; left: number };

  if (typeof padding === 'undefined') {
    paddingValue = { top: 0, right: 0, bottom: 0, left: 0 };
  } else if (typeof padding === 'number') {
    paddingValue = { top: padding, right: padding, bottom: padding, left: padding };
  } else if (typeof padding === 'string') {
    const v = parseFloat(padding) || 0;
    paddingValue = { top: v, right: v, bottom: v, left: v };
  } else {
    const top = parsePaddingWithUnit(padding.top ?? padding.y ?? 0);
    const right = parsePaddingWithUnit(padding.right ?? padding.x ?? 0);
    const bottom = parsePaddingWithUnit(padding.bottom ?? padding.y ?? 0);
    const left = parsePaddingWithUnit(padding.left ?? padding.x ?? 0);
    paddingValue = { top, right, bottom, left };
  }

  const xZoom = (width - paddingValue.left - paddingValue.right) / bounds.width;
  const yZoom = (height - paddingValue.top - paddingValue.bottom) / bounds.height;
  const zoom = clamp(Math.min(xZoom, yZoom), minZoom, maxZoom);

  const transformedBoundsWidth = bounds.width * zoom;
  const transformedBoundsHeight = bounds.height * zoom;
  const x = (width - transformedBoundsWidth) / 2 - bounds.x * zoom;
  const y = (height - transformedBoundsHeight) / 2 - bounds.y * zoom;

  return { x, y, zoom };
}

function parsePaddingWithUnit(padding: PaddingWithUnit): number {
  if (typeof padding === 'number') return padding;
  const v = parseFloat(padding);
  return isNaN(v) ? 0 : v;
}

export function getBoundsofRects(rect1: Rect, rect2: Rect): Rect {
  const bounds = getBoundingRect([rectToBox(rect1), rectToBox(rect2)]);
  return boxToRect(bounds);
}

export function rectToBox(rect: Rect): Box {
  return { x: rect.x, y: rect.y, x2: rect.x + rect.width, y2: rect.y + rect.height };
}

export function boxToRect(box: Box): Rect {
  return { x: box.x, y: box.y, width: box.x2 - box.x, height: box.y2 - box.y };
}

export function getBoundingRect(boxes: Box[]): Box {
  const { x, y } = boxes.reduce(
    (acc, box) => ({ x: Math.min(acc.x, box.x), y: Math.min(acc.y, box.y) }),
    { x: Infinity, y: Infinity },
  );
  const { x2, y2 } = boxes.reduce(
    (acc, box) => ({ x2: Math.max(acc.x2, box.x2), y2: Math.max(acc.y2, box.y2) }),
    { x2: -Infinity, y2: -Infinity },
  );
  return { x, y, x2, y2 };
}

export function pointToRendererPoint(
  { x, y }: XYPosition,
  transform: ViewportTransform,
  snapToGrid: boolean,
  snapGrid: [number, number],
): XYPosition {
  const position = {
    x: (x - transform.x) / transform.zoom,
    y: (y - transform.y) / transform.zoom,
  };
  if (snapToGrid) {
    return snapPosition(position, snapGrid);
  }
  return position;
}

export function rendererPointToPoint(
  { x, y }: XYPosition,
  transform: ViewportTransform,
): XYPosition {
  return {
    x: x * transform.zoom + transform.x,
    y: y * transform.zoom + transform.y,
  };
}

export function snapPosition(position: XYPosition, snapGrid: [number, number] = [15, 15]): XYPosition {
  return {
    x: snapGrid[0] * Math.round(position.x / snapGrid[0]),
    y: snapGrid[1] * Math.round(position.y / snapGrid[1]),
  };
}

export function getMarkerId(marker: any, prefix = ''): string {
  if (typeof marker === 'string') {
    return marker;
  }
  if (typeof marker === 'object') {
    const suffix = Object.entries(marker)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join(',');
    return `${prefix}marker-${suffix}`;
  }
  return '';
}

export function wheelDelta(event: WheelEvent): number {
  const delta = event.deltaMode === 1 ? 0.05 : event.deltaMode ? 1 : 0.002;
  const MAX_WHEEL_DELTA = 8;
  return -clamp(event.deltaY * delta, -MAX_WHEEL_DELTA, MAX_WHEEL_DELTA);
}

export function isMacOs(): boolean {
  return typeof navigator !== 'undefined' && /Mac/.test(navigator.platform);
}
