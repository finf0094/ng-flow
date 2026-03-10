import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  inject,
  input,
  output,
  ViewChild,
  effect,
} from '@angular/core';
import { zoom, zoomIdentity } from 'd3-zoom';
import type { D3ZoomEvent } from 'd3-zoom';
import { pointer, select } from 'd3-selection';
import { FlowService } from '../../services/flow.service';
import { getBoundsofRects, getConnectedEdges, getRectOfNodes, isMacOs, wheelDelta } from '../../utils/graph';
import type { CoordinateExtent, GraphEdge, GraphNode, XYPosition } from '../../types';
import { MiniMapNodeComponent } from './minimap-node.component';
import type { ShapeRendering } from './minimap-node.component';
import { PanelComponent } from '../panel/panel.component';
import type { PanelPosition } from '../panel/panel.component';

export type MiniMapNodeFunc = (node: GraphNode) => string;

export interface MiniMapNodeClickEvent {
  event: MouseEvent;
  node: GraphNode;
  connectedEdges: GraphEdge[];
}

export interface MiniMapClickEvent {
  event: MouseEvent;
  position: XYPosition;
}

function noop(): void {
  // intentional no-op
}

@Component({
  selector: 'lib-minimap',
  standalone: true,
  imports: [MiniMapNodeComponent, PanelComponent],
  template: `
    <lib-panel [position]="position()" class="vue-flow__minimap" [class.pannable]="pannable()" [class.zoomable]="zoomable()">
      <svg
        #svgEl
        [attr.width]="_elementWidth()"
        [attr.height]="_elementHeight()"
        [attr.viewBox]="_viewBoxAttr()"
        role="img"
        [attr.aria-labelledby]="'vue-flow__minimap-' + _flowId()"
        (click)="onSvgClick($event)"
        (keydown.enter)="onSvgClick($any($event))"
      >
        @if (ariaLabel()) {
          <title [id]="'vue-flow__minimap-' + _flowId()">{{ ariaLabel() }}</title>
        }

        @for (node of _nodesInitialized(); track node.id) {
          <lib-minimap-node
            [node]="node"
            [color]="_nodeColorFn()(node)"
            [strokeColor]="_nodeStrokeColorFn()(node)"
            [strokeWidth]="nodeStrokeWidth()"
            [borderRadius]="nodeBorderRadius()"
            [shapeRendering]="_shapeRendering"
            (nodeClick)="onNodeClick($event, node)"
            (nodeDblclick)="onNodeDblClick($event, node)"
            (nodeMouseenter)="onNodeMouseEnter($event, node)"
            (nodeMousemove)="onNodeMouseMove($event, node)"
            (nodeMouseleave)="onNodeMouseLeave($event, node)"
          />
        }

        <path
          class="vue-flow__minimap-mask"
          [attr.d]="_maskPath()"
          [attr.fill]="maskColor()"
          [attr.stroke]="maskStrokeColor()"
          [attr.stroke-width]="maskStrokeWidth()"
          fill-rule="evenodd"
        />
      </svg>
    </lib-panel>
  `,
  styles: [`
    :host { display: contents; }
    :host ::ng-deep .vue-flow__minimap { background: #fff; }
    :host ::ng-deep .vue-flow__minimap.pannable { cursor: grab; }
    :host ::ng-deep .vue-flow__minimap.dragging { cursor: grabbing; }
    :host ::ng-deep .vue-flow__minimap-mask.pannable { cursor: grab; }
  `],
})
export class MiniMapComponent implements AfterViewInit, OnDestroy {
  // ---- inputs ----
  readonly width = input<number | undefined>(undefined);
  readonly height = input<number | undefined>(undefined);
  readonly nodeStrokeColor = input<string | MiniMapNodeFunc>('transparent');
  readonly nodeColor = input<string | MiniMapNodeFunc>('#e2e2e2');
  readonly nodeBorderRadius = input<number>(5);
  readonly nodeStrokeWidth = input<number>(2);
  readonly maskColor = input<string>('rgb(240, 240, 240, 0.6)');
  readonly maskStrokeColor = input<string>('none');
  readonly maskStrokeWidth = input<number>(1);
  readonly maskBorderRadius = input<number>(0);
  readonly position = input<PanelPosition>('bottom-right');
  readonly pannable = input<boolean>(false);
  readonly zoomable = input<boolean>(false);
  readonly ariaLabel = input<string>('Vue Flow mini map');
  readonly inversePan = input<boolean>(false);
  readonly zoomStep = input<number>(1);
  readonly offsetScale = input<number>(5);

  // ---- outputs ----
  readonly svgClick = output<MiniMapClickEvent>();
  readonly nodeClick = output<MiniMapNodeClickEvent>();
  readonly nodeDblclick = output<MiniMapNodeClickEvent>();
  readonly nodeMouseenter = output<MiniMapNodeClickEvent>();
  readonly nodeMousemove = output<MiniMapNodeClickEvent>();
  readonly nodeMouseleave = output<MiniMapNodeClickEvent>();

  @ViewChild('svgEl') svgElRef?: ElementRef<SVGSVGElement>;

  private readonly flow = inject(FlowService);

  readonly _shapeRendering: ShapeRendering =
    typeof window === 'undefined' || !!(window as Window & { chrome?: unknown })['chrome'] ? 'crispEdges' : 'geometricPrecision';

  private readonly _defaultWidth = 200;
  private readonly _defaultHeight = 150;

  readonly _flowId = computed(() => this.flow.id());

  readonly _elementWidth = computed(() => this.width() ?? this._defaultWidth);
  readonly _elementHeight = computed(() => this.height() ?? this._defaultHeight);

  readonly _nodeColorFn = computed<MiniMapNodeFunc>(() => {
    const c = this.nodeColor();
    return typeof c === 'string' ? () => c : c;
  });

  readonly _nodeStrokeColorFn = computed<MiniMapNodeFunc>(() => {
    const c = this.nodeStrokeColor();
    return typeof c === 'string' ? () => c : c;
  });

  readonly _nodesInitialized = computed(() =>
    this.flow.getNodes().filter((n: GraphNode) => !n.hidden && n.dimensions.width > 0 && n.dimensions.height > 0)
  );

  private readonly _bb = computed(() => getRectOfNodes(this._nodesInitialized()));

  private readonly _viewBB = computed(() => {
    const vp = this.flow.viewport();
    const dim = this.flow.dimensions();
    return {
      x: -vp.x / vp.zoom,
      y: -vp.y / vp.zoom,
      width: dim.width / vp.zoom,
      height: dim.height / vp.zoom,
    };
  });

  private readonly _boundingRect = computed(() => {
    const initialized = this._nodesInitialized();
    return initialized.length ? getBoundsofRects(this._bb(), this._viewBB()) : this._viewBB();
  });

  private readonly _viewScale = computed(() => {
    const br = this._boundingRect();
    const scaledWidth = br.width / this._elementWidth();
    const scaledHeight = br.height / this._elementHeight();
    return Math.max(scaledWidth, scaledHeight);
  });

  private readonly _viewBox = computed(() => {
    const viewScale = this._viewScale();
    const br = this._boundingRect();
    const elemW = this._elementWidth();
    const elemH = this._elementHeight();
    const offset = this.offsetScale() * viewScale;
    const viewWidth = viewScale * elemW;
    const viewHeight = viewScale * elemH;
    return {
      offset,
      x: br.x - (viewWidth - br.width) / 2 - offset,
      y: br.y - (viewHeight - br.height) / 2 - offset,
      width: viewWidth + offset * 2,
      height: viewHeight + offset * 2,
    };
  });

  readonly _viewBoxAttr = computed(() => {
    const vb = this._viewBox();
    return [vb.x, vb.y, vb.width, vb.height].join(' ');
  });

  readonly _maskPath = computed(() => {
    const vb = this._viewBox();
    const viewBB = this._viewBB();
    const r = this.maskBorderRadius();

    if (!vb.x && !vb.y) {
      return '';
    }

    return [
      `M${vb.x - vb.offset},${vb.y - vb.offset}`,
      `h${vb.width + vb.offset * 2}`,
      `v${vb.height + vb.offset * 2}`,
      `h${-(vb.width + vb.offset * 2)}z`,
      `M${viewBB.x + r},${viewBB.y}`,
      `h${viewBB.width - 2 * r}`,
      `a${r},${r} 0 0 1 ${r},${r}`,
      `v${viewBB.height - 2 * r}`,
      `a${r},${r} 0 0 1 -${r},${r}`,
      `h${-(viewBB.width - 2 * r)}`,
      `a${r},${r} 0 0 1 -${r},-${r}`,
      `v${-(viewBB.height - 2 * r)}`,
      `a${r},${r} 0 0 1 ${r},-${r}z`,
    ].join(' ');
  });

  private _cleanupZoom?: () => void;

  constructor() {
    // Re-attach D3 zoom/pan whenever pannable or zoomable inputs change
    effect(() => {
      // Track reactive dependencies
      const _p = this.pannable();
      const _z = this.zoomable();
      const _zs = this.zoomStep();
      void _p; void _z; void _zs;
      Promise.resolve().then(() => this._setupZoom());
    });
  }

  ngAfterViewInit(): void {
    this._setupZoom();
  }

  ngOnDestroy(): void {
    this._cleanupZoom?.();
  }

  private _setupZoom(): void {
    this._cleanupZoom?.();
    this._cleanupZoom = undefined;

    const svgEl = this.svgElRef?.nativeElement;
    if (!svgEl) return;

    const selection = select<SVGSVGElement, unknown>(svgEl);

    const zoomHandler = (event: D3ZoomEvent<SVGSVGElement, unknown>) => {
      if (event.sourceEvent?.type !== 'wheel') return;
      const d3Zoom = this.flow.d3Zoom();
      const d3Selection = this.flow.d3Selection();
      if (!d3Selection || !d3Zoom) return;

      const factor = event.sourceEvent.ctrlKey && isMacOs() ? 10 : 1;
      const pinchDelta =
        -event.sourceEvent.deltaY *
        (event.sourceEvent.deltaMode === 1 ? 0.05 : event.sourceEvent.deltaMode ? 1 : 0.002) *
        this.zoomStep();
      const nextZoom = this.flow.viewport().zoom * Math.pow(2, pinchDelta * factor);

      d3Zoom.scaleTo(d3Selection, nextZoom);
    };

    const panHandler = (event: D3ZoomEvent<SVGSVGElement, unknown>) => {
      if (event.sourceEvent?.type !== 'mousemove') return;
      const d3Zoom = this.flow.d3Zoom();
      const d3Selection = this.flow.d3Selection();
      if (!d3Selection || !d3Zoom) return;

      const vp = this.flow.viewport();
      const moveScale = this._viewScale() * Math.max(1, vp.zoom) * (this.inversePan() ? -1 : 1);
      const dim = this.flow.dimensions();

      const newX = vp.x - event.sourceEvent.movementX * moveScale;
      const newY = vp.y - event.sourceEvent.movementY * moveScale;

      const extent: CoordinateExtent = [[0, 0], [dim.width, dim.height]];
      const nextTransform = zoomIdentity.translate(newX, newY).scale(vp.zoom);
      const constrainedTransform = d3Zoom.constrain()(nextTransform, extent, this.flow.translateExtent());

      d3Zoom.transform(d3Selection, constrainedTransform);
    };

    const zoomAndPanHandler = zoom<SVGSVGElement, unknown>()
      .wheelDelta((event: WheelEvent) => wheelDelta(event) * (this.zoomStep() / 10))
      .on('zoom', this.pannable() ? panHandler : noop)
      .on('zoom.wheel', this.zoomable() ? zoomHandler : noop);

    selection.call(zoomAndPanHandler);

    this._cleanupZoom = () => {
      selection.on('zoom', null);
      selection.on('zoom.wheel', null);
    };
  }

  onSvgClick(event: MouseEvent): void {
    const svgEl = this.svgElRef?.nativeElement;
    if (!svgEl) return;
    const [x, y] = pointer(event, svgEl);
    this.svgClick.emit({ event, position: { x, y } });
  }

  onNodeClick(event: MouseEvent, node: GraphNode): void {
    this.nodeClick.emit({
      event,
      node,
      connectedEdges: getConnectedEdges([node], this.flow.edges()),
    });
  }

  onNodeDblClick(event: MouseEvent, node: GraphNode): void {
    this.nodeDblclick.emit({
      event,
      node,
      connectedEdges: getConnectedEdges([node], this.flow.edges()),
    });
  }

  onNodeMouseEnter(event: MouseEvent, node: GraphNode): void {
    this.nodeMouseenter.emit({
      event,
      node,
      connectedEdges: getConnectedEdges([node], this.flow.edges()),
    });
  }

  onNodeMouseMove(event: MouseEvent, node: GraphNode): void {
    this.nodeMousemove.emit({
      event,
      node,
      connectedEdges: getConnectedEdges([node], this.flow.edges()),
    });
  }

  onNodeMouseLeave(event: MouseEvent, node: GraphNode): void {
    this.nodeMouseleave.emit({
      event,
      node,
      connectedEdges: getConnectedEdges([node], this.flow.edges()),
    });
  }
}
