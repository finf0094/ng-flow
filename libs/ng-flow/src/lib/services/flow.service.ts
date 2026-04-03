import {
  Injectable,
  signal,
  computed,
  Signal,
  WritableSignal,
  InjectionToken,
  effect,
} from '@angular/core';
import { Subject } from 'rxjs';
import { zoomIdentity } from 'd3-zoom';
import type {
  ComponentType,
  Connection,
  ConnectionLineOptions,
  ConnectionLineType,
  ConnectionLookup,
  ConnectionMode,
  ConnectionStatus,
  ConnectingHandle,
  Connector,
  CoordinateExtent,
  CoordinateExtentRange,
  D3Selection,
  D3Zoom,
  D3ZoomHandler,
  DefaultEdgeOptions,
  Dimensions,
  Edge,
  EdgeChange,
  EdgeLookup,
  EdgeUpdatable,
  FlowElement,
  FlowElements,
  FlowExportObject,
  FlowImportObject,
  FlowProps,
  GraphEdge,
  GraphNode,
  Node,
  NodeChange,
  NodeLookup,
  OnConnectStartParams,
  PanOnScrollMode,
  Rect,
  SelectionMode,
  SelectionRect,
  SnapGrid,
  UpdateNodeDimensionsParams,
  ValidConnectionFunc,
  ViewportTransform,
  XYPosition,
} from '../types';
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  clamp,
  connectionExists,
  createEdgeRemoveChange,
  createNodeRemoveChange,
  getConnectedEdges,
  getDimensions,
  getIncomers,
  getNodesInside,
  getOutgoers,
  getOverlappingArea,
  getRectOfNodes,
  getTransformForBounds,
  isMacOs,
  nodeToRect,
  parseEdge,
  parseNode,
  pointToRendererPoint,
  rendererPointToPoint,
  snapPosition,
} from '../utils';
import {
  ConnectionLineType as ConnectionLineTypeEnum,
  ConnectionMode as ConnectionModeEnum,
  PanOnScrollMode as PanOnScrollModeEnum,
  Position,
  SelectionMode as SelectionModeEnum,
} from '../types';

export const FLOW_SERVICE_TOKEN = new InjectionToken<FlowService>(
  'FlowService',
);

@Injectable()
export class FlowService {
  // ---- state signals ----
  readonly id: WritableSignal<string> = signal(
    `flow-${Math.random().toString(36).slice(2, 9)}`,
  );

  readonly nodes: WritableSignal<GraphNode[]> = signal([]);
  readonly edges: WritableSignal<GraphEdge[]> = signal([]);
  readonly connectionLookup: WritableSignal<ConnectionLookup> = signal(
    new Map(),
  );

  readonly nodeLookup: Signal<NodeLookup> = computed(() => {
    const map = new Map<string, GraphNode>();
    this.nodes().forEach((n) => map.set(n.id, n));
    return map;
  });
  readonly edgeLookup: WritableSignal<EdgeLookup> = signal(new Map());

  readonly initialized: WritableSignal<boolean> = signal(false);

  readonly dimensions: WritableSignal<Dimensions> = signal({
    width: 0,
    height: 0,
  });
  readonly viewport: WritableSignal<ViewportTransform> = signal({
    x: 0,
    y: 0,
    zoom: 1,
  });

  readonly d3Zoom: WritableSignal<D3Zoom | null> = signal(null);
  readonly d3Selection: WritableSignal<D3Selection | null> = signal(null);
  readonly d3ZoomHandler: WritableSignal<D3ZoomHandler | null> = signal(null);

  readonly minZoom: WritableSignal<number> = signal(0.5);
  readonly maxZoom: WritableSignal<number> = signal(2);

  readonly translateExtent: WritableSignal<CoordinateExtent> = signal([
    [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY],
    [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY],
  ]);
  readonly nodeExtent: WritableSignal<
    CoordinateExtent | CoordinateExtentRange
  > = signal([
    [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY],
    [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY],
  ]);

  readonly selectionMode: WritableSignal<SelectionMode> = signal(
    SelectionModeEnum.Full,
  );
  readonly paneDragging: WritableSignal<boolean> = signal(false);
  readonly preventScrolling: WritableSignal<boolean> = signal(true);
  readonly zoomOnScroll: WritableSignal<boolean> = signal(true);
  readonly zoomOnPinch: WritableSignal<boolean> = signal(true);
  readonly zoomOnDoubleClick: WritableSignal<boolean> = signal(true);
  readonly panOnScroll: WritableSignal<boolean> = signal(false);
  readonly panOnScrollSpeed: WritableSignal<number> = signal(0.5);
  readonly panOnScrollMode: WritableSignal<PanOnScrollMode> = signal(
    PanOnScrollModeEnum.Free,
  );
  readonly paneClickDistance: WritableSignal<number> = signal(0);
  readonly panOnDrag: WritableSignal<boolean | number[]> = signal(true);
  readonly edgeUpdaterRadius: WritableSignal<number> = signal(10);
  readonly onlyRenderVisibleElements: WritableSignal<boolean> = signal(false);
  readonly defaultViewport: WritableSignal<Partial<ViewportTransform>> = signal(
    { x: 0, y: 0, zoom: 1 },
  );

  readonly nodesSelectionActive: WritableSignal<boolean> = signal(false);
  readonly userSelectionActive: WritableSignal<boolean> = signal(false);
  readonly userSelectionRect: WritableSignal<SelectionRect | null> =
    signal(null);

  readonly defaultMarkerColor: WritableSignal<string> = signal('#b1b1b7');
  readonly connectionLineStyle: WritableSignal<Record<string, any> | null> =
    signal({});
  readonly connectionLineType: WritableSignal<ConnectionLineType | null> =
    signal(null);
  readonly connectionLineOptions: WritableSignal<ConnectionLineOptions> =
    signal({
      type: ConnectionLineTypeEnum.Bezier,
      style: {},
    });
  readonly connectionMode: WritableSignal<ConnectionMode> = signal(
    ConnectionModeEnum.Loose,
  );
  readonly connectionStartHandle: WritableSignal<ConnectingHandle | null> =
    signal(null);
  readonly connectionEndHandle: WritableSignal<ConnectingHandle | null> =
    signal(null);
  readonly connectionClickStartHandle: WritableSignal<ConnectingHandle | null> =
    signal(null);
  readonly connectionPosition: WritableSignal<XYPosition> = signal({
    x: Number.NaN,
    y: Number.NaN,
  });
  readonly connectionRadius: WritableSignal<number> = signal(20);
  readonly connectOnClick: WritableSignal<boolean> = signal(true);
  readonly connectionStatus: WritableSignal<ConnectionStatus | null> =
    signal(null);
  readonly isValidConnection: WritableSignal<ValidConnectionFunc | null> =
    signal(null);

  readonly snapGrid: WritableSignal<SnapGrid> = signal([15, 15]);
  readonly snapToGrid: WritableSignal<boolean> = signal(false);

  readonly edgesUpdatable: WritableSignal<EdgeUpdatable> = signal(false);
  readonly edgesFocusable: WritableSignal<boolean> = signal(true);
  readonly nodesFocusable: WritableSignal<boolean> = signal(true);
  readonly nodesConnectable: WritableSignal<boolean> = signal(true);
  readonly nodesDraggable: WritableSignal<boolean> = signal(true);
  readonly nodeDragThreshold: WritableSignal<number> = signal(1);
  readonly elementsSelectable: WritableSignal<boolean> = signal(true);
  readonly selectNodesOnDrag: WritableSignal<boolean> = signal(true);
  readonly multiSelectionActive: WritableSignal<boolean> = signal(false);
  readonly selectionKeyCode: WritableSignal<string | boolean | null> =
    signal('Shift');
  readonly multiSelectionKeyCode: WritableSignal<string | null> = signal(
    isMacOs() ? 'Meta' : 'Control',
  );
  readonly zoomActivationKeyCode: WritableSignal<string | null> = signal(
    isMacOs() ? 'Meta' : 'Control',
  );
  readonly deleteKeyCode: WritableSignal<string | null> = signal('Backspace');
  readonly panActivationKeyCode: WritableSignal<string | null> =
    signal('Space');

  readonly applyDefault: WritableSignal<boolean> = signal(true);
  readonly autoConnect: WritableSignal<boolean | Connector> = signal(false);

  readonly fitViewOnInit: WritableSignal<boolean> = signal(false);
  readonly fitViewOnInitDone: WritableSignal<boolean> = signal(false);

  readonly noDragClassName: WritableSignal<string> = signal('nodrag');
  readonly noWheelClassName: WritableSignal<string> = signal('nowheel');
  readonly noPanClassName: WritableSignal<string> = signal('nopan');
  readonly defaultEdgeOptions: WritableSignal<DefaultEdgeOptions | undefined> =
    signal(undefined);
  readonly elevateEdgesOnSelect: WritableSignal<boolean> = signal(false);
  readonly elevateNodesOnSelect: WritableSignal<boolean> = signal(true);

  readonly autoPanOnNodeDrag: WritableSignal<boolean> = signal(true);
  readonly autoPanOnConnect: WritableSignal<boolean> = signal(true);
  readonly autoPanSpeed: WritableSignal<number> = signal(15);

  readonly disableKeyboardA11y: WritableSignal<boolean> = signal(false);
  readonly ariaLiveMessage: WritableSignal<string> = signal('');

  readonly nodeTypes: WritableSignal<Record<string, ComponentType>> = signal({});
  readonly edgeTypes: WritableSignal<Record<string, ComponentType>> = signal({});

  // DOM refs
  flowRef: HTMLDivElement | null = null;
  viewportRef: HTMLDivElement | null = null;

  // ---- events (RxJS subjects for Angular pattern) ----
  readonly nodesChange$ = new Subject<import('../types').NodeChange[]>();
  readonly edgesChange$ = new Subject<import('../types').EdgeChange[]>();
  readonly connect$ = new Subject<Connection>();
  readonly connectStart$ = new Subject<
    { event?: MouseEvent | TouchEvent } & OnConnectStartParams
  >();
  readonly connectEnd$ = new Subject<MouseEvent | TouchEvent | undefined>();
  readonly clickConnectStart$ = new Subject<
    { event?: MouseEvent | TouchEvent } & OnConnectStartParams
  >();
  readonly clickConnectEnd$ = new Subject<
    MouseEvent | TouchEvent | undefined
  >();
  readonly nodeClick$ = new Subject<import('../types').NodeMouseEvent>();
  readonly nodeDoubleClick$ = new Subject<import('../types').NodeMouseEvent>();
  readonly nodeMouseEnter$ = new Subject<import('../types').NodeMouseEvent>();
  readonly nodeMouseMove$ = new Subject<import('../types').NodeMouseEvent>();
  readonly nodeMouseLeave$ = new Subject<import('../types').NodeMouseEvent>();
  readonly nodeContextMenu$ = new Subject<import('../types').NodeMouseEvent>();
  readonly nodeDragStart$ = new Subject<import('../types').NodeDragEvent>();
  readonly nodeDrag$ = new Subject<import('../types').NodeDragEvent>();
  readonly nodeDragStop$ = new Subject<import('../types').NodeDragEvent>();
  readonly nodesInitialized$ = new Subject<GraphNode[]>();
  readonly edgeClick$ = new Subject<import('../types').EdgeMouseEvent>();
  readonly edgeDoubleClick$ = new Subject<import('../types').EdgeMouseEvent>();
  readonly edgeMouseEnter$ = new Subject<import('../types').EdgeMouseEvent>();
  readonly edgeMouseMove$ = new Subject<import('../types').EdgeMouseEvent>();
  readonly edgeMouseLeave$ = new Subject<import('../types').EdgeMouseEvent>();
  readonly edgeContextMenu$ = new Subject<import('../types').EdgeMouseEvent>();
  readonly edgeUpdateStart$ = new Subject<import('../types').EdgeMouseEvent>();
  readonly edgeUpdate$ = new Subject<import('../types').EdgeUpdateEvent>();
  readonly edgeUpdateEnd$ = new Subject<import('../types').EdgeMouseEvent>();
  readonly paneClick$ = new Subject<MouseEvent>();
  readonly paneContextMenu$ = new Subject<MouseEvent>();
  readonly paneMouseEnter$ = new Subject<PointerEvent>();
  readonly paneMouseMove$ = new Subject<PointerEvent>();
  readonly paneMouseLeave$ = new Subject<PointerEvent>();
  readonly paneScroll$ = new Subject<WheelEvent | undefined>();
  readonly selectionDragStart$ = new Subject<
    import('../types').NodeDragEvent
  >();
  readonly selectionDrag$ = new Subject<import('../types').NodeDragEvent>();
  readonly selectionDragStop$ = new Subject<import('../types').NodeDragEvent>();
  readonly selectionContextMenu$ = new Subject<{
    event: MouseEvent;
    nodes: GraphNode[];
  }>();
  readonly selectionStart$ = new Subject<MouseEvent>();
  readonly selectionEnd$ = new Subject<MouseEvent>();
  readonly moveStart$ = new Subject<{
    event: any;
    flowTransform: ViewportTransform;
  }>();
  readonly move$ = new Subject<{
    event: any;
    flowTransform: ViewportTransform;
  }>();
  readonly moveEnd$ = new Subject<{
    event: any;
    flowTransform: ViewportTransform;
  }>();
  readonly viewportChangeStart$ = new Subject<ViewportTransform>();
  readonly viewportChange$ = new Subject<ViewportTransform>();
  readonly viewportChangeEnd$ = new Subject<ViewportTransform>();
  readonly init$ = new Subject<FlowService>();
  readonly error$ = new Subject<Error>();

  // ---- computed ----
  readonly getNodes: Signal<GraphNode[]> = computed(() =>
    this.nodes().filter((n) => !n.hidden),
  );

  readonly getEdges: Signal<GraphEdge[]> = computed(() =>
    this.edges().filter((e) => !e.hidden),
  );

  // ---- actions ----

  setNodes(nodes: Node[] | GraphNode[]): void {
    const existing = this.nodeLookup();
    const parsed = nodes.map((n) => parseNode(n as Node, existing.get(n.id)));
    this._resolveParentPositions(parsed);
    this.nodes.set(parsed);
  }

  setEdges(edges: Edge[] | GraphEdge[]): void {
    const nodeLookup = this.nodeLookup();
    const defaultOpts = this.defaultEdgeOptions();
    const existing = this.edgeLookup();
    const parsed = (edges as Edge[]).map((e) => {
      const graphEdge = parseEdge(e, existing.get(e.id), defaultOpts);
      graphEdge.sourceNode = nodeLookup.get(e.source)!;
      graphEdge.targetNode = nodeLookup.get(e.target)!;
      return graphEdge;
    });
    this.edges.set(parsed);
    const lookup = new Map<string, GraphEdge>();
    parsed.forEach((e) => lookup.set(e.id, e));
    this.edgeLookup.set(lookup);
  }

  addNodes(nodes: Node[]): void {
    const existing = this.nodeLookup();
    const newNodes = nodes.map((n) => parseNode(n, existing.get(n.id)));
    this.nodes.update((prev) => {
      const filtered = prev.filter(
        (n) => !newNodes.some((nn) => nn.id === n.id),
      );
      const all = [...filtered, ...newNodes];
      this._resolveParentPositions(all);
      return all;
    });
  }

  addEdges(edges: Edge[]): void {
    const nodeLookup = this.nodeLookup();
    const defaultOpts = this.defaultEdgeOptions();
    const existing = this.edgeLookup();
    const newEdges = edges.map((e) => {
      const graphEdge = parseEdge(e, existing.get(e.id), defaultOpts);
      graphEdge.sourceNode = nodeLookup.get(e.source)!;
      graphEdge.targetNode = nodeLookup.get(e.target)!;
      return graphEdge;
    });
    this.edges.update((prev) => {
      const filtered = prev.filter(
        (e) => !newEdges.some((ne) => ne.id === e.id),
      );
      return [...filtered, ...newEdges];
    });
    this.edgeLookup.update((prev) => {
      const next = new Map(prev);
      newEdges.forEach((e) => next.set(e.id, e));
      return next;
    });
  }

  removeNodes(nodeIds: string[]): void {
    const idsSet = new Set(nodeIds);
    this.nodes.update((prev) => prev.filter((n) => !idsSet.has(n.id)));
    // also remove connected edges
    this.edges.update((prev) =>
      prev.filter((e) => !idsSet.has(e.source) && !idsSet.has(e.target)),
    );
  }

  removeEdges(edgeIds: string[]): void {
    const idsSet = new Set(edgeIds);
    this.edges.update((prev) => prev.filter((e) => !idsSet.has(e.id)));
    this.edgeLookup.update((prev) => {
      const next = new Map(prev);
      idsSet.forEach((id) => next.delete(id));
      return next;
    });
  }

  updateNode(id: string, update: Partial<GraphNode>): void {
    this.nodes.update((prev) =>
      prev.map((n) => {
        if (n.id !== id) return n;
        const merged = { ...n, ...update };
        if (update.position) {
          merged.computedPosition = {
            ...merged.computedPosition,
            x: update.position.x,
            y: update.position.y,
          };
        }
        return merged;
      }),
    );
  }

  updateEdge(id: string, update: Partial<GraphEdge>): void {
    this.edges.update((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...update } : e)),
    );
    this.edgeLookup.update((prev) => {
      const edge = prev.get(id);
      if (edge) {
        const updated = { ...edge, ...update };
        return new Map(prev).set(id, updated);
      }
      return prev;
    });
  }

  updateNodeDimensions(updates: UpdateNodeDimensionsParams[]): void {
    const zoom = this.viewport().zoom || 1;

    this.nodes.update((prev) => {
      let changed = false;
      const next = prev.map((node) => {
        const update = updates.find((u) => u.id === node.id);
        if (!update) return node;

        const el = update.nodeElement;
        const dims = getDimensions(el);

        if (!dims.width || !dims.height) return node;

        const dimsChanged =
          update.forceUpdate ||
          node.dimensions.width !== dims.width ||
          node.dimensions.height !== dims.height;

        if (!dimsChanged) return node;

        changed = true;

        const nodeBounds = el.getBoundingClientRect();
        const hb = this._getHandleBoundsFromDOM(el, nodeBounds, zoom, node.id);

        return { ...node, dimensions: dims, handleBounds: hb };
      });
      return changed ? next : prev;
    });
  }

  /** Compute absolute computedPosition for child nodes based on parent's computedPosition.
   *  Mutates the array in place. Iterates until convergence to support arbitrary nesting depth. */
  private _resolveParentPositions(nodes: GraphNode[]): void {
    const lookup = new Map<string, GraphNode>();
    for (const node of nodes) lookup.set(node.id, node);

    for (let pass = 0; pass < nodes.length; pass++) {
      let changed = false;
      for (const node of nodes) {
        const parentId = node.parentNode;
        if (!parentId) continue;
        const parent = lookup.get(parentId);
        if (!parent) continue;
        const newX = parent.computedPosition.x + node.position.x;
        const newY = parent.computedPosition.y + node.position.y;
        const newZ = parent.computedPosition.z ?? 0;
        if (
          node.computedPosition.x !== newX ||
          node.computedPosition.y !== newY ||
          node.computedPosition.z !== newZ
        ) {
          node.computedPosition = { x: newX, y: newY, z: newZ };
          changed = true;
        }
      }
      if (!changed) break;
    }
  }

  private _getHandleBoundsFromDOM(
    nodeEl: HTMLElement,
    nodeBounds: DOMRect,
    zoom: number,
    nodeId: string,
  ): import('../types').NodeHandleBounds {
    const getHandles = (
      type: 'source' | 'target',
    ): import('../types').HandleElement[] | null => {
      const handles = nodeEl.querySelectorAll(`.ng-flow__handle.${type}`);
      if (!handles?.length) return null;
      return Array.from(handles).map((handle) => {
        const hRect = handle.getBoundingClientRect();
        return {
          id: handle.getAttribute('data-handleid') ?? null,
          type,
          nodeId,
          position:
            (handle.getAttribute(
              'data-handlepos',
            ) as import('../types').Position) ?? 'bottom',
          x: (hRect.left + hRect.width / 2 - nodeBounds.left) / zoom,
          y: (hRect.top + hRect.height / 2 - nodeBounds.top) / zoom,
          width: hRect.width / zoom,
          height: hRect.height / zoom,
        };
      });
    };

    return {
      source: getHandles('source'),
      target: getHandles('target'),
    };
  }

  applyNodeChanges(changes: import('../types').NodeChange[]): void {
    const nodes = this.nodes();
    const updated = applyNodeChanges(changes, [...nodes]);

    // Sync computedPosition for any position changes
    for (const change of changes) {
      if (change.type === 'position' && change.position) {
        const node = updated.find((n) => n.id === change.id);
        if (node) {
          node.computedPosition = {
            ...node.computedPosition,
            x: change.position.x,
            y: change.position.y,
          };
        }
      }
    }

    // Re-resolve parent positions so child nodes follow their parent
    this._resolveParentPositions(updated);
    this.nodes.set(updated);

    this.nodesChange$.next(changes);
  }

  applyEdgeChanges(changes: import('../types').EdgeChange[]): void {
    const edges = this.edges();
    const updated = applyEdgeChanges(changes, [...edges]);
    this.edges.set(updated);
    this.edgesChange$.next(changes);
  }

  setViewport(
    viewport: ViewportTransform,
    options?: import('../types').TransitionOptions,
  ): Promise<boolean> {
    const zoom = this.d3Zoom();
    const sel = this.d3Selection();
    if (!zoom || !sel) {
      this.viewport.set(viewport);
      return Promise.resolve(false);
    }
    const transform = zoomIdentity.translate(viewport.x, viewport.y).scale(viewport.zoom);
    const dur = options?.duration ?? 0;
    zoom.transform(_withDuration(sel, dur), transform);
    return Promise.resolve(true);
  }

  setMinZoom(zoom: number): void {
    this.minZoom.set(zoom);
    const d3Zoom = this.d3Zoom();
    if (d3Zoom) {
      d3Zoom.scaleExtent([zoom, this.maxZoom()]);
    }
  }

  setMaxZoom(zoom: number): void {
    this.maxZoom.set(zoom);
    const d3Zoom = this.d3Zoom();
    if (d3Zoom) {
      d3Zoom.scaleExtent([this.minZoom(), zoom]);
    }
  }

  setTranslateExtent(extent: CoordinateExtent): void {
    this.translateExtent.set(extent);
    const d3Zoom = this.d3Zoom();
    if (d3Zoom) {
      d3Zoom.translateExtent(extent);
    }
  }

  fitView(
    params: import('../types').FitViewParams = {},
    nodes?: GraphNode[],
  ): Promise<boolean> {
    const { d3Zoom, d3Selection, dimensions, viewport, minZoom, maxZoom } =
      this;
    const zoom = d3Zoom();
    const sel = d3Selection();

    if (!zoom || !sel) return Promise.resolve(false);

    const nodesToFit = (nodes ?? this.getNodes()).filter(
      (n) => !n.hidden || params.includeHiddenNodes,
    );

    if (nodesToFit.length === 0) return Promise.resolve(false);

    const bounds = getRectOfNodes(nodesToFit);
    const {
      x,
      y,
      zoom: z,
    } = getTransformForBounds(
      bounds,
      dimensions().width,
      dimensions().height,
      params.minZoom ?? minZoom(),
      params.maxZoom ?? maxZoom(),
      params.padding,
    );

    const newTransform = zoomIdentity.translate(x, y).scale(z);
    const dur = params.duration ?? 0;
    zoom.transform(_withDuration(sel, dur), newTransform);
    return Promise.resolve(true);
  }

  project(position: XYPosition): XYPosition {
    return pointToRendererPoint(
      position,
      this.viewport(),
      this.snapToGrid(),
      this.snapGrid(),
    );
  }

  getViewport(): ViewportTransform {
    return this.viewport();
  }

  zoomIn(options?: import('../types').TransitionOptions): Promise<boolean> {
    return this._zoomBy(1.2, options);
  }

  zoomOut(options?: import('../types').TransitionOptions): Promise<boolean> {
    return this._zoomBy(1 / 1.2, options);
  }

  zoomTo(
    zoomLevel: number,
    options?: import('../types').TransitionOptions,
  ): Promise<boolean> {
    const zoom = this.d3Zoom();
    const sel = this.d3Selection();
    if (!zoom || !sel) return Promise.resolve(false);
    const dur = options?.duration ?? 0;
    zoom.scaleTo(_withDuration(sel, dur), zoomLevel);
    return Promise.resolve(true);
  }

  setCenter(
    x: number,
    y: number,
    options?: import('../types').SetCenterOptions,
  ): Promise<boolean> {
    const zoom = this.d3Zoom();
    const sel = this.d3Selection();
    if (!zoom || !sel) return Promise.resolve(false);

    const { width, height } = this.dimensions();
    const z = options?.zoom ?? this.viewport().zoom;
    const dur = options?.duration ?? 0;
    zoom.transform(
      _withDuration(sel, dur),
      zoomIdentity.translate(width / 2 - x * z, height / 2 - y * z).scale(z),
    );
    return Promise.resolve(true);
  }

  fitBounds(
    bounds: Rect,
    options?: import('../types').FitBoundsOptions,
  ): Promise<boolean> {
    const zoom = this.d3Zoom();
    const sel = this.d3Selection();
    if (!zoom || !sel) return Promise.resolve(false);

    const {
      x,
      y,
      zoom: z,
    } = getTransformForBounds(
      bounds,
      this.dimensions().width,
      this.dimensions().height,
      this.minZoom(),
      this.maxZoom(),
      options?.padding,
    );
    const dur = options?.duration ?? 0;
    zoom.transform(_withDuration(sel, dur), zoomIdentity.translate(x, y).scale(z));
    return Promise.resolve(true);
  }

  panBy(delta: XYPosition, options?: import('../types').TransitionOptions): Promise<boolean> {
    const zoom = this.d3Zoom();
    const sel = this.d3Selection();
    if (!zoom || !sel) return Promise.resolve(false);
    const { x, y, zoom: z } = this.viewport();
    const nextTransform = zoomIdentity.translate(x + delta.x, y + delta.y).scale(z);
    const dim = this.dimensions();
    const extent: CoordinateExtent = [[0, 0], [dim.width, dim.height]];
    const constrained = zoom.constrain()(nextTransform, extent, this.translateExtent());
    const dur = options?.duration ?? 0;
    zoom.transform(_withDuration(sel, dur), constrained);
    return Promise.resolve(true);
  }

  toObject(): FlowExportObject {
    const vp = this.viewport();
    return {
      nodes: this.nodes().map((n) => ({ ...n })),
      edges: this.edges().map((e) => ({ ...e })),
      position: [vp.x, vp.y],
      zoom: vp.zoom,
      viewport: vp,
    };
  }

  fromObject(obj: FlowImportObject): void {
    if (obj.nodes) this.setNodes(obj.nodes);
    if (obj.edges) this.setEdges(obj.edges);
    if (obj.viewport) this.viewport.set(obj.viewport);
  }

  getNode(id: string): GraphNode | undefined {
    return this.nodeLookup().get(id);
  }

  getEdge(id: string): GraphEdge | undefined {
    return this.edgeLookup().get(id);
  }

  getSelectedNodes(): GraphNode[] {
    return this.nodes().filter((n) => n.selected);
  }

  getSelectedEdges(): GraphEdge[] {
    return this.edges().filter((e) => e.selected);
  }

  applyProps(props: FlowProps): void {
    if (props.nodes !== undefined) this.setNodes(props.nodes);
    if (props.edges !== undefined) this.setEdges(props.edges);
    if (props.minZoom !== undefined) this.minZoom.set(props.minZoom);
    if (props.maxZoom !== undefined) this.maxZoom.set(props.maxZoom);
    if (props.snapToGrid !== undefined) this.snapToGrid.set(props.snapToGrid);
    if (props.snapGrid !== undefined) this.snapGrid.set(props.snapGrid);
    if (props.nodesDraggable !== undefined)
      this.nodesDraggable.set(props.nodesDraggable);
    if (props.nodesConnectable !== undefined)
      this.nodesConnectable.set(props.nodesConnectable);
    if (props.elementsSelectable !== undefined)
      this.elementsSelectable.set(props.elementsSelectable);
    if (props.selectNodesOnDrag !== undefined)
      this.selectNodesOnDrag.set(props.selectNodesOnDrag);
    if (props.panOnDrag !== undefined)
      this.panOnDrag.set(props.panOnDrag as boolean);
    if (props.zoomOnScroll !== undefined)
      this.zoomOnScroll.set(props.zoomOnScroll);
    if (props.zoomOnPinch !== undefined)
      this.zoomOnPinch.set(props.zoomOnPinch);
    if (props.zoomOnDoubleClick !== undefined)
      this.zoomOnDoubleClick.set(props.zoomOnDoubleClick);
    if (props.panOnScroll !== undefined)
      this.panOnScroll.set(props.panOnScroll);
    if (props.panOnScrollSpeed !== undefined)
      this.panOnScrollSpeed.set(props.panOnScrollSpeed);
    if (props.panOnScrollMode !== undefined)
      this.panOnScrollMode.set(props.panOnScrollMode!);
    if (props.preventScrolling !== undefined)
      this.preventScrolling.set(props.preventScrolling);
    if (props.connectionMode !== undefined)
      this.connectionMode.set(props.connectionMode);
    if (props.connectionRadius !== undefined)
      this.connectionRadius.set(props.connectionRadius);
    if (props.connectionLineOptions !== undefined)
      this.connectionLineOptions.set(props.connectionLineOptions);
    if (props.isValidConnection !== undefined)
      this.isValidConnection.set(props.isValidConnection);
    if (props.fitViewOnInit !== undefined)
      this.fitViewOnInit.set(props.fitViewOnInit);
    if (props.defaultViewport !== undefined)
      this.defaultViewport.set(props.defaultViewport);
    if (props.translateExtent !== undefined)
      this.translateExtent.set(props.translateExtent);
    if (props.nodeExtent !== undefined) this.nodeExtent.set(props.nodeExtent);
    if (props.selectionMode !== undefined)
      this.selectionMode.set(props.selectionMode);
    if (props.selectionKeyCode !== undefined)
      this.selectionKeyCode.set(props.selectionKeyCode);
    if (props.multiSelectionKeyCode !== undefined)
      this.multiSelectionKeyCode.set(props.multiSelectionKeyCode);
    if (props.deleteKeyCode !== undefined)
      this.deleteKeyCode.set(props.deleteKeyCode);
    if (props.noDragClassName !== undefined)
      this.noDragClassName.set(props.noDragClassName);
    if (props.noPanClassName !== undefined)
      this.noPanClassName.set(props.noPanClassName);
    if (props.noWheelClassName !== undefined)
      this.noWheelClassName.set(props.noWheelClassName);
    if (props.defaultEdgeOptions !== undefined)
      this.defaultEdgeOptions.set(props.defaultEdgeOptions);
    if (props.elevateEdgesOnSelect !== undefined)
      this.elevateEdgesOnSelect.set(props.elevateEdgesOnSelect);
    if (props.elevateNodesOnSelect !== undefined)
      this.elevateNodesOnSelect.set(props.elevateNodesOnSelect);
    if (props.edgesUpdatable !== undefined)
      this.edgesUpdatable.set(props.edgesUpdatable);
    if (props.edgesFocusable !== undefined)
      this.edgesFocusable.set(props.edgesFocusable);
    if (props.nodesFocusable !== undefined)
      this.nodesFocusable.set(props.nodesFocusable);
    if (props.connectOnClick !== undefined)
      this.connectOnClick.set(props.connectOnClick);
    if (props.defaultMarkerColor !== undefined)
      this.defaultMarkerColor.set(props.defaultMarkerColor);
    if (props.autoPanOnConnect !== undefined)
      this.autoPanOnConnect.set(props.autoPanOnConnect);
    if (props.autoPanOnNodeDrag !== undefined)
      this.autoPanOnNodeDrag.set(props.autoPanOnNodeDrag);
    if (props.autoPanSpeed !== undefined)
      this.autoPanSpeed.set(props.autoPanSpeed);
    if (props.disableKeyboardA11y !== undefined)
      this.disableKeyboardA11y.set(props.disableKeyboardA11y);
    if (props.onlyRenderVisibleElements !== undefined)
      this.onlyRenderVisibleElements.set(props.onlyRenderVisibleElements);
    if (props.applyDefault !== undefined)
      this.applyDefault.set(props.applyDefault);
    if (props.nodeTypes !== undefined)
      this.nodeTypes.set(props.nodeTypes);
    if (props.edgeTypes !== undefined)
      this.edgeTypes.set(props.edgeTypes);
  }

  setInteractive(interactive: boolean): void {
    this.nodesDraggable.set(interactive);
    this.nodesConnectable.set(interactive);
    this.elementsSelectable.set(interactive);
  }

  updateNodeData<T = import('../types').ElementData>(id: string, data: Partial<T> | ((current: T) => T)): void {
    this.nodes.update((prev) =>
      prev.map((n) => {
        if (n.id !== id) return n;
        const newData = typeof data === 'function'
          ? (data as (c: T) => T)(n.data as T)
          : { ...n.data, ...data };
        return { ...n, data: newData };
      }),
    );
  }

  updateEdgeData<T = import('../types').ElementData>(id: string, data: Partial<T> | ((current: T) => T)): void {
    this.edges.update((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        const newData = typeof data === 'function'
          ? (data as (c: T) => T)(e.data as T)
          : { ...e.data, ...data };
        return { ...e, data: newData };
      }),
    );
  }

  updateNodeInternals(nodeIds?: string[]): void {
    const zoom = this.viewport().zoom || 1;
    const ids = nodeIds ? new Set(nodeIds) : null;
    this.nodes.update((prev) => {
      let changed = false;
      const next = prev.map((node) => {
        if (ids && !ids.has(node.id)) return node;
        const nodeEl = this.flowRef?.querySelector(
          `[data-id="${node.id}"]`,
        ) as HTMLElement | null;
        if (!nodeEl) return node;
        const nodeBounds = nodeEl.getBoundingClientRect();
        const hb = this._getHandleBoundsFromDOM(nodeEl, nodeBounds, zoom, node.id);
        changed = true;
        return { ...node, handleBounds: hb };
      });
      return changed ? next : prev;
    });
  }

  getIntersectingNodes(
    nodeOrRect: GraphNode | import('../types').Rect,
    partially = true,
    nodes?: GraphNode[],
  ): GraphNode[] {
    const rect = 'dimensions' in nodeOrRect
      ? nodeToRect(nodeOrRect as GraphNode)
      : (nodeOrRect as import('../types').Rect);
    const sourceId = 'id' in nodeOrRect ? (nodeOrRect as GraphNode).id : null;
    return (nodes ?? this.getNodes()).filter((n) => {
      if (sourceId && n.id === sourceId) return false;
      const nRect = nodeToRect(n);
      if (partially) return getOverlappingArea(rect, nRect) > 0;
      return (
        nRect.x >= rect.x &&
        nRect.y >= rect.y &&
        nRect.x + nRect.width <= rect.x + rect.width &&
        nRect.y + nRect.height <= rect.y + rect.height
      );
    });
  }

  isNodeIntersecting(
    nodeOrRect: GraphNode | import('../types').Rect,
    area: import('../types').Rect,
    partially = true,
  ): boolean {
    const rect = 'dimensions' in nodeOrRect
      ? nodeToRect(nodeOrRect as GraphNode)
      : (nodeOrRect as import('../types').Rect);
    if (partially) return getOverlappingArea(rect, area) > 0;
    return (
      rect.x >= area.x &&
      rect.y >= area.y &&
      rect.x + rect.width <= area.x + area.width &&
      rect.y + rect.height <= area.y + area.height
    );
  }

  addSelectedNodes(nodes: GraphNode[]): void {
    const ids = new Set(nodes.map((n) => n.id));
    const changes = this.nodes()
      .filter((n) => ids.has(n.id) && !n.selected)
      .map((n) => ({ id: n.id, type: 'select' as const, selected: true }));
    if (changes.length) this.applyNodeChanges(changes);
    this.nodesSelectionActive.set(true);
  }

  removeSelectedNodes(nodes?: GraphNode[]): void {
    const ids = nodes ? new Set(nodes.map((n) => n.id)) : null;
    const changes = this.nodes()
      .filter((n) => n.selected && (!ids || ids.has(n.id)))
      .map((n) => ({ id: n.id, type: 'select' as const, selected: false }));
    if (changes.length) this.applyNodeChanges(changes);
    if (!this.nodes().some((n) => n.selected)) this.nodesSelectionActive.set(false);
  }

  addSelectedEdges(edges: GraphEdge[]): void {
    const ids = new Set(edges.map((e) => e.id));
    const changes = this.edges()
      .filter((e) => ids.has(e.id) && !e.selected)
      .map((e) => ({ id: e.id, type: 'select' as const, selected: true }));
    if (changes.length) this.applyEdgeChanges(changes);
  }

  removeSelectedEdges(edges?: GraphEdge[]): void {
    const ids = edges ? new Set(edges.map((e) => e.id)) : null;
    const changes = this.edges()
      .filter((e) => e.selected && (!ids || ids.has(e.id)))
      .map((e) => ({ id: e.id, type: 'select' as const, selected: false }));
    if (changes.length) this.applyEdgeChanges(changes);
  }

  $reset(): void {
    this.nodes.set([]);
    this.edges.set([]);
    this.edgeLookup.set(new Map());
    this.connectionLookup.set(new Map());
    this.viewport.set({ x: 0, y: 0, zoom: 1 });
    this.nodesSelectionActive.set(false);
    this.userSelectionActive.set(false);
    this.userSelectionRect.set(null);
    this.multiSelectionActive.set(false);
    this.connectionStartHandle.set(null);
    this.connectionEndHandle.set(null);
    this.connectionClickStartHandle.set(null);
    this.connectionStatus.set(null);
    this.fitViewOnInitDone.set(false);
    this.initialized.set(false);
  }

  /** Begin a connection/reconnect from a handle. Position is in client/pane coords. */
  startConnection(handle: import('../types').HandleElement, position?: import('../types').XYPosition, isClick = false): void {
    const connectingHandle: import('../types').ConnectingHandle = {
      nodeId: handle.nodeId,
      id: handle.id ?? null,
      type: handle.type,
      position: handle.position,
      x: handle.x,
      y: handle.y,
    };
    if (isClick) {
      this.connectionClickStartHandle.set(connectingHandle);
    } else {
      this.connectionStartHandle.set(connectingHandle);
    }
    if (position) this.connectionPosition.set(position);
    this.connectionStatus.set(null);
    this.connectionEndHandle.set(null);
  }

  /** Update the in-progress connection endpoint position (pane coords). */
  updateConnection(position: import('../types').XYPosition, endHandle?: import('../types').ConnectingHandle | null, status?: import('../types').ConnectionStatus | null): void {
    this.connectionPosition.set(position);
    if (endHandle !== undefined) this.connectionEndHandle.set(endHandle);
    if (status !== undefined) this.connectionStatus.set(status);
  }

  /** End the current connection/reconnect operation. */
  endConnection(_event?: MouseEvent | TouchEvent, isClick = false): void {
    if (isClick) {
      this.connectionClickStartHandle.set(null);
    } else {
      this.connectionStartHandle.set(null);
    }
    this.connectionEndHandle.set(null);
    this.connectionStatus.set(null);
  }

  private _zoomBy(
    factor: number,
    options?: import('../types').TransitionOptions,
  ): Promise<boolean> {
    const zoom = this.d3Zoom();
    const sel = this.d3Selection();
    if (!zoom || !sel) return Promise.resolve(false);
    zoom.scaleBy(_withDuration(sel, options?.duration), factor);
    return Promise.resolve(true);
  }
}

/** Returns a D3 selection with an optional transition duration applied.
 *  The cast to `any` is required because D3Selection is typed without
 *  `.transition()` — at runtime d3-zoom accepts both Selection and Transition. */
function _withDuration(sel: import('../types').D3Selection, duration?: number): any {
  return duration ? (sel as any).transition().duration(duration) : sel;
}
