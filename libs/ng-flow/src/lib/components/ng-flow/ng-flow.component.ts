import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  input,
  OnChanges,
  OnDestroy,
  OnInit,
  output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { FlowService } from '../../services/flow.service';
import { ViewportComponent } from '../viewport/viewport.component';
import { NodeRendererComponent } from '../node-renderer/node-renderer.component';
import { EdgeRendererComponent } from '../edge-renderer/edge-renderer.component';
import { ConnectionLineComponent } from '../pane/connection-line.component';
import { PanOnScrollMode, ConnectionMode, SelectionMode } from '../../types';
import type {
  Connection,
  ConnectionLineOptions,
  CoordinateExtent,
  CoordinateExtentRange,
  DefaultEdgeOptions,
  Edge,
  EdgeChange,
  EdgeMouseEvent,
  EdgeUpdatable,
  EdgeUpdateEvent,
  FitBoundsOptions,
  FitViewParams,
  FlowExportObject,
  FlowImportObject,
  GraphEdge,
  GraphNode,
  Node,
  NodeChange,
  NodeDragEvent,
  NodeMouseEvent,
  OnConnectStartParams,
  Rect,
  SetCenterOptions,
  TransitionOptions,
  ValidConnectionFunc,
  ViewportTransform,
  XYPosition,
} from '../../types';

@Component({
  selector: 'lib-ng-flow',
  standalone: true,
  imports: [
    CommonModule,
    ViewportComponent,
    NodeRendererComponent,
    EdgeRendererComponent,
    ConnectionLineComponent,
  ],
  providers: [FlowService],
  templateUrl: './ng-flow.component.html',
  styleUrl: './ng-flow.component.css',
})
export class NgFlowComponent
  implements OnInit, AfterViewInit, OnChanges, OnDestroy
{
  // ---- inputs (mirrors FlowProps) ----
  readonly id = input<string | undefined>(undefined);
  readonly nodes = input<Node[]>([]);
  readonly edges = input<Edge[]>([]);
  readonly minZoom = input<number>(0.5);
  readonly maxZoom = input<number>(2);
  readonly defaultViewport = input<Partial<ViewportTransform>>({
    x: 0,
    y: 0,
    zoom: 1,
  });
  readonly snapToGrid = input<boolean>(false);
  readonly snapGrid = input<[number, number]>([15, 15]);
  readonly nodesDraggable = input<boolean>(true);
  readonly nodesConnectable = input<boolean>(true);
  readonly elementsSelectable = input<boolean>(true);
  readonly selectNodesOnDrag = input<boolean>(true);
  readonly panOnDrag = input<boolean | number[]>(true);
  readonly zoomOnScroll = input<boolean>(true);
  readonly zoomOnPinch = input<boolean>(true);
  readonly zoomOnDoubleClick = input<boolean>(true);
  readonly panOnScroll = input<boolean>(false);
  readonly panOnScrollSpeed = input<number>(0.5);
  readonly panOnScrollMode = input<PanOnScrollMode>(PanOnScrollMode.Free);
  readonly preventScrolling = input<boolean>(true);
  readonly fitViewOnInit = input<boolean>(false);
  readonly connectionMode = input<ConnectionMode>(ConnectionMode.Loose);
  readonly connectionRadius = input<number>(20);
  readonly connectionLineOptions = input<ConnectionLineOptions>({});
  readonly isValidConnection = input<ValidConnectionFunc | null>(null);
  readonly deleteKeyCode = input<string | null>('Backspace');
  readonly selectionKeyCode = input<string | boolean | null>('Shift');
  readonly multiSelectionKeyCode = input<string | null>(null);
  readonly translateExtent = input<CoordinateExtent>([
    [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY],
    [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY],
  ]);
  readonly nodeExtent = input<CoordinateExtent | CoordinateExtentRange>([
    [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY],
    [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY],
  ]);
  readonly selectionMode = input<SelectionMode>(SelectionMode.Full);
  readonly noDragClassName = input<string>('nodrag');
  readonly noPanClassName = input<string>('nopan');
  readonly noWheelClassName = input<string>('nowheel');
  readonly defaultEdgeOptions = input<DefaultEdgeOptions | undefined>(
    undefined,
  );
  readonly elevateEdgesOnSelect = input<boolean>(false);
  readonly elevateNodesOnSelect = input<boolean>(true);
  readonly edgesUpdatable = input<EdgeUpdatable>(false);
  readonly edgesFocusable = input<boolean>(true);
  readonly nodesFocusable = input<boolean>(true);
  readonly connectOnClick = input<boolean>(true);
  readonly defaultMarkerColor = input<string>('#b1b1b7');
  readonly autoPanOnConnect = input<boolean>(true);
  readonly autoPanOnNodeDrag = input<boolean>(true);
  readonly autoPanSpeed = input<number>(15);
  readonly disableKeyboardA11y = input<boolean>(false);
  readonly onlyRenderVisibleElements = input<boolean>(false);
  readonly applyDefault = input<boolean>(true);

  // ---- outputs (mirrors FlowEmits) ----
  readonly nodesChange = output<NodeChange[]>();
  readonly edgesChange = output<EdgeChange[]>();
  readonly connect = output<Connection>();
  readonly connectStart = output<
    { event?: MouseEvent | TouchEvent } & OnConnectStartParams
  >();
  readonly connectEnd = output<MouseEvent | TouchEvent | undefined>();
  readonly nodeClick = output<NodeMouseEvent>();
  readonly nodeDoubleClick = output<NodeMouseEvent>();
  readonly nodeMouseEnter = output<NodeMouseEvent>();
  readonly nodeMouseMove = output<NodeMouseEvent>();
  readonly nodeMouseLeave = output<NodeMouseEvent>();
  readonly nodeContextMenu = output<NodeMouseEvent>();
  readonly nodeDragStart = output<NodeDragEvent>();
  readonly nodeDrag = output<NodeDragEvent>();
  readonly nodeDragStop = output<NodeDragEvent>();
  readonly nodesInitialized = output<GraphNode[]>();
  readonly edgeClick = output<EdgeMouseEvent>();
  readonly edgeDoubleClick = output<EdgeMouseEvent>();
  readonly edgeMouseEnter = output<EdgeMouseEvent>();
  readonly edgeMouseMove = output<EdgeMouseEvent>();
  readonly edgeMouseLeave = output<EdgeMouseEvent>();
  readonly edgeContextMenu = output<EdgeMouseEvent>();
  readonly edgeUpdate = output<EdgeUpdateEvent>();
  readonly paneClick = output<MouseEvent>();
  readonly paneContextMenu = output<MouseEvent>();
  readonly paneMouseEnter = output<PointerEvent>();
  readonly paneMouseMove = output<PointerEvent>();
  readonly paneMouseLeave = output<PointerEvent>();
  readonly paneScroll = output<WheelEvent | undefined>();
  readonly moveStart = output<{
    event: any;
    flowTransform: ViewportTransform;
  }>();
  readonly move = output<{ event: any; flowTransform: ViewportTransform }>();
  readonly moveEnd = output<{ event: any; flowTransform: ViewportTransform }>();
  readonly viewportChangeStart = output<ViewportTransform>();
  readonly viewportChange = output<ViewportTransform>();
  readonly viewportChangeEnd = output<ViewportTransform>();
  readonly init = output<FlowService>();

  readonly flow = inject(FlowService);

  @ViewChild('flowContainer') flowContainerRef?: ElementRef<HTMLDivElement>;

  private _subs: Subscription[] = [];

  ngOnInit(): void {
    this._applyAllProps();
    this._subscribeToEvents();
  }

  ngAfterViewInit(): void {
    if (this.flowContainerRef) {
      this.flow.flowRef = this.flowContainerRef.nativeElement;
    }
  }

  ngOnChanges(_changes: SimpleChanges): void {
    this._applyAllProps();
  }

  ngOnDestroy(): void {
    this._subs.forEach((s) => s.unsubscribe());
  }

  private _applyAllProps(): void {
    const id = this.id();
    if (id) this.flow.id.set(id);

    this.flow.applyProps({
      nodes: this.nodes(),
      edges: this.edges(),
      minZoom: this.minZoom(),
      maxZoom: this.maxZoom(),
      defaultViewport: this.defaultViewport(),
      snapToGrid: this.snapToGrid(),
      snapGrid: this.snapGrid(),
      nodesDraggable: this.nodesDraggable(),
      nodesConnectable: this.nodesConnectable(),
      elementsSelectable: this.elementsSelectable(),
      selectNodesOnDrag: this.selectNodesOnDrag(),
      panOnDrag: this.panOnDrag() as boolean,
      zoomOnScroll: this.zoomOnScroll(),
      zoomOnPinch: this.zoomOnPinch(),
      zoomOnDoubleClick: this.zoomOnDoubleClick(),
      panOnScroll: this.panOnScroll(),
      panOnScrollSpeed: this.panOnScrollSpeed(),
      preventScrolling: this.preventScrolling(),
      fitViewOnInit: this.fitViewOnInit(),
      connectionMode: this.connectionMode(),
      connectionRadius: this.connectionRadius(),
      connectionLineOptions: this.connectionLineOptions(),
      isValidConnection: this.isValidConnection(),
      deleteKeyCode: this.deleteKeyCode(),
      selectionKeyCode: this.selectionKeyCode(),
      multiSelectionKeyCode: this.multiSelectionKeyCode(),
      translateExtent: this.translateExtent(),
      nodeExtent: this.nodeExtent(),
      selectionMode: this.selectionMode(),
      noDragClassName: this.noDragClassName(),
      noPanClassName: this.noPanClassName(),
      noWheelClassName: this.noWheelClassName(),
      defaultEdgeOptions: this.defaultEdgeOptions(),
      elevateEdgesOnSelect: this.elevateEdgesOnSelect(),
      elevateNodesOnSelect: this.elevateNodesOnSelect(),
      edgesUpdatable: this.edgesUpdatable(),
      edgesFocusable: this.edgesFocusable(),
      nodesFocusable: this.nodesFocusable(),
      connectOnClick: this.connectOnClick(),
      defaultMarkerColor: this.defaultMarkerColor(),
      autoPanOnConnect: this.autoPanOnConnect(),
      autoPanOnNodeDrag: this.autoPanOnNodeDrag(),
      autoPanSpeed: this.autoPanSpeed(),
      disableKeyboardA11y: this.disableKeyboardA11y(),
      onlyRenderVisibleElements: this.onlyRenderVisibleElements(),
      applyDefault: this.applyDefault(),
    });
  }

  private _subscribeToEvents(): void {
    const f = this.flow;
    this._subs = [
      f.nodesChange$.subscribe((c) => this.nodesChange.emit(c)),
      f.edgesChange$.subscribe((c) => this.edgesChange.emit(c)),
      f.connect$.subscribe((c) => this.connect.emit(c)),
      f.connectStart$.subscribe((c) => this.connectStart.emit(c)),
      f.connectEnd$.subscribe((c) => this.connectEnd.emit(c)),
      f.nodeClick$.subscribe((e) => this.nodeClick.emit(e)),
      f.nodeDoubleClick$.subscribe((e) => this.nodeDoubleClick.emit(e)),
      f.nodeMouseEnter$.subscribe((e) => this.nodeMouseEnter.emit(e)),
      f.nodeMouseMove$.subscribe((e) => this.nodeMouseMove.emit(e)),
      f.nodeMouseLeave$.subscribe((e) => this.nodeMouseLeave.emit(e)),
      f.nodeContextMenu$.subscribe((e) => this.nodeContextMenu.emit(e)),
      f.nodeDragStart$.subscribe((e) => this.nodeDragStart.emit(e)),
      f.nodeDrag$.subscribe((e) => this.nodeDrag.emit(e)),
      f.nodeDragStop$.subscribe((e) => this.nodeDragStop.emit(e)),
      f.nodesInitialized$.subscribe((n) => this.nodesInitialized.emit(n)),
      f.edgeClick$.subscribe((e) => this.edgeClick.emit(e)),
      f.edgeDoubleClick$.subscribe((e) => this.edgeDoubleClick.emit(e)),
      f.edgeMouseEnter$.subscribe((e) => this.edgeMouseEnter.emit(e)),
      f.edgeMouseMove$.subscribe((e) => this.edgeMouseMove.emit(e)),
      f.edgeMouseLeave$.subscribe((e) => this.edgeMouseLeave.emit(e)),
      f.edgeContextMenu$.subscribe((e) => this.edgeContextMenu.emit(e)),
      f.edgeUpdate$.subscribe((e) => this.edgeUpdate.emit(e)),
      f.paneClick$.subscribe((e) => this.paneClick.emit(e)),
      f.paneContextMenu$.subscribe((e) => this.paneContextMenu.emit(e)),
      f.paneMouseEnter$.subscribe((e) => this.paneMouseEnter.emit(e)),
      f.paneMouseMove$.subscribe((e) => this.paneMouseMove.emit(e)),
      f.paneMouseLeave$.subscribe((e) => this.paneMouseLeave.emit(e)),
      f.paneScroll$.subscribe((e) => this.paneScroll.emit(e)),
      f.moveStart$.subscribe((e) => this.moveStart.emit(e)),
      f.move$.subscribe((e) => this.move.emit(e)),
      f.moveEnd$.subscribe((e) => this.moveEnd.emit(e)),
      f.viewportChangeStart$.subscribe((v) => this.viewportChangeStart.emit(v)),
      f.viewportChange$.subscribe((v) => this.viewportChange.emit(v)),
      f.viewportChangeEnd$.subscribe((v) => this.viewportChangeEnd.emit(v)),
      f.init$.subscribe((s) => this.init.emit(s)),

      // Auto-apply connect if applyDefault
      f.connect$.subscribe((connection) => {
        if (this.applyDefault()) {
          f.addEdges([
            {
              id: `${connection.source}-${connection.target}`,
              source: connection.source,
              target: connection.target,
              sourceHandle: connection.sourceHandle,
              targetHandle: connection.targetHandle,
            },
          ]);
        }
      }),
    ];
  }

  // ---- public API methods (mirrors VueFlowStore exposed methods) ----
  getNodes(): GraphNode[] {
    return this.flow.getNodes();
  }
  getEdges(): GraphEdge[] {
    return this.flow.getEdges();
  }
  getNode(id: string): GraphNode | undefined {
    return this.flow.getNode(id);
  }
  getEdge(id: string): GraphEdge | undefined {
    return this.flow.getEdge(id);
  }
  addNodes(nodes: Node[]): void {
    this.flow.addNodes(nodes);
  }
  addEdges(edges: Edge[]): void {
    this.flow.addEdges(edges);
  }
  removeNodes(nodeIds: string[]): void {
    this.flow.removeNodes(nodeIds);
  }
  removeEdges(edgeIds: string[]): void {
    this.flow.removeEdges(edgeIds);
  }
  updateNode(id: string, update: Partial<GraphNode>): void {
    this.flow.updateNode(id, update);
  }
  updateEdge(id: string, update: Partial<GraphEdge>): void {
    this.flow.updateEdge(id, update);
  }
  fitView(params?: FitViewParams): Promise<boolean> {
    return this.flow.fitView(params);
  }
  zoomIn(): Promise<boolean> {
    return this.flow.zoomIn();
  }
  zoomOut(): Promise<boolean> {
    return this.flow.zoomOut();
  }
  zoomTo(level: number): Promise<boolean> {
    return this.flow.zoomTo(level);
  }
  setViewport(vp: ViewportTransform): void {
    this.flow.setViewport(vp);
  }
  getViewport(): ViewportTransform {
    return this.flow.getViewport();
  }
  setCenter(
    x: number,
    y: number,
    options?: SetCenterOptions,
  ): Promise<boolean> {
    return this.flow.setCenter(x, y, options);
  }
  fitBounds(bounds: Rect, options?: FitBoundsOptions): Promise<boolean> {
    return this.flow.fitBounds(bounds, options);
  }
  project(position: XYPosition): XYPosition {
    return this.flow.project(position);
  }
  toObject(): FlowExportObject {
    return this.flow.toObject();
  }
  fromObject(obj: FlowImportObject): void {
    this.flow.fromObject(obj);
  }
}
