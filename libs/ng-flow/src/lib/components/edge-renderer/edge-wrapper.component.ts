import {
  Component,
  ComponentRef,
  computed,
  effect,
  inject,
  Injector,
  input,
  NO_ERRORS_SCHEMA,
  OnDestroy,
  OnInit,
  reflectComponentType,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlowService } from '../../services/flow.service';
import { BezierEdgeComponent } from '../edges/bezier-edge.component';
import { StraightEdgeComponent } from '../edges/straight-edge.component';
import { StepEdgeComponent } from '../edges/step-edge.component';
import { SmoothStepEdgeComponent } from '../edges/smooth-step-edge.component';
import { SimpleBezierEdgeComponent } from '../edges/simple-bezier-edge.component';
import { EDGE_ID_TOKEN } from '../edges/edge-id.token';
import { createSelectionChange } from '../../utils/changes';
import { getMarkerId } from '../../utils';
import type { ComponentType, EdgeChange, GraphEdge } from '../../types';

interface ResolvedEdgePositions {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: import('../../types').Position;
  targetPosition: import('../../types').Position;
  markerStart: string | undefined;
  markerEnd: string | undefined;
}

@Component({
  selector: 'lib-edge-wrapper',
  standalone: true,
  imports: [CommonModule],
  schemas: [NO_ERRORS_SCHEMA],
  template: `<ng-container #container />`,
  host: {
    '[attr.data-id]': 'id()',
    '[class.ng-flow__edge]': 'true',
    '[class.selected]': '_edge()?.selected',
    '[class.animated]': '_edge()?.animated',
    '[style.position]': '"absolute"',
    '[style.top]': '"0"',
    '[style.left]': '"0"',
    '[style.width]': '"100%"',
    '[style.height]': '"100%"',
    '[style.pointer-events]': '"none"',
    '[style.z-index]': '_zIndex()',
    '(click)': '_onEdgeClick($event)',
    '(dblclick)': '_onEdgeDblClick($event)',
    '(contextmenu)': '_onEdgeContextMenu($event)',
    '(mouseenter)': '_onEdgeMouseEnter($event)',
    '(mouseleave)': '_onEdgeMouseLeave($event)',
  },
})
export class EdgeWrapperComponent implements OnInit, OnDestroy {
  readonly id = input.required<string>();

  private readonly flow = inject(FlowService);

  @ViewChild('container', { read: ViewContainerRef, static: true })
  containerRef!: ViewContainerRef;

  readonly _edge = computed(() => this.flow.edgeLookup().get(this.id()));

  readonly _zIndex = computed(() => {
    const e = this._edge();
    if (!e) return 0;
    const z = e.zIndex ?? 0;
    return e.selected && this.flow.elevateEdgesOnSelect() ? z + 1000 : z;
  });

  readonly _resolved = computed<ResolvedEdgePositions | null>(() => {
    const edge = this._edge();
    if (!edge) return null;

    const nodeLookup = this.flow.nodeLookup();
    const flowId = this.flow.id();
    const sourceNode = nodeLookup.get(edge.source);
    const targetNode = nodeLookup.get(edge.target);
    if (!sourceNode || !targetNode) return null;

    // Don't resolve until both nodes have been measured by the resize observer.
    // Without measured dimensions, fallback offsets land at (0,0) which places
    // the edge path through the node bodies instead of at the handles.
    if (!sourceNode.dimensions.width || !sourceNode.dimensions.height) return null;
    if (!targetNode.dimensions.width || !targetNode.dimensions.height) return null;

    const srcHandle = sourceNode.handleBounds?.source?.find(
      (h) => h.id === (edge.sourceHandle ?? null),
    ) ?? sourceNode.handleBounds?.source?.[0];

    const tgtHandle = targetNode.handleBounds?.target?.find(
      (h) => h.id === (edge.targetHandle ?? null),
    ) ?? targetNode.handleBounds?.target?.[0];

    const sw = sourceNode.dimensions.width;
    const sh = sourceNode.dimensions.height;
    const tw = targetNode.dimensions.width;
    const th = targetNode.dimensions.height;

    const sourcePosition: import('../../types').Position =
      srcHandle?.position ?? sourceNode.sourcePosition ?? ('bottom' as any);
    const targetPosition: import('../../types').Position =
      tgtHandle?.position ?? targetNode.targetPosition ?? ('top' as any);

    const srcOffset = srcHandle
      ? _handleOuterEdgeOffset(srcHandle, sourcePosition)
      : _fallbackHandleOffset(sourcePosition, sw, sh);
    const tgtOffset = tgtHandle
      ? _handleOuterEdgeOffset(tgtHandle, targetPosition)
      : _fallbackHandleOffset(targetPosition, tw, th);

    const sourceX = sourceNode.computedPosition.x + srcOffset.x;
    const sourceY = sourceNode.computedPosition.y + srcOffset.y;
    const targetX = targetNode.computedPosition.x + tgtOffset.x;
    const targetY = targetNode.computedPosition.y + tgtOffset.y;

    const markerStart = edge.markerStart
      ? `url('#${getMarkerId(edge.markerStart, flowId)}')`
      : undefined;
    const markerEnd = edge.markerEnd
      ? `url('#${getMarkerId(edge.markerEnd, flowId)}')`
      : undefined;

    return { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, markerStart, markerEnd };
  });

  private _componentRef: ComponentRef<unknown> | null = null;
  private _declaredInputs = new Set<string>();

  private readonly _syncInputsEffect = effect(() => {
    const r = this._resolved();
    const e = this._edge();
    if (!r || !e) return;
    if (!this._componentRef) {
      // Positions are now available — render the component for the first time.
      this._renderEdgeComponent(e, r);
      return;
    }
    this._syncInputs(e, r);
    this._componentRef.changeDetectorRef.detectChanges();
  });

  ngOnInit(): void {
    const e = this._edge();
    if (!e) return;
    const r = this._resolved();
    // Only render immediately if positions are already available (rare on first
    // pass, but happens when node dimensions are known before edges mount).
    if (r) {
      this._renderEdgeComponent(e, r);
    }
    // Otherwise _syncInputsEffect will render as soon as _resolved() becomes
    // non-null (i.e. after the ResizeObserver has measured the nodes).
  }

  ngOnDestroy(): void {
    this._componentRef?.destroy();
  }

  private _getComponentForType(type: string): ComponentType {
    const customTypes = this.flow.edgeTypes();
    if (customTypes[type]) return customTypes[type];
    switch (type) {
      case 'straight': return StraightEdgeComponent;
      case 'step': return StepEdgeComponent;
      case 'smoothstep': return SmoothStepEdgeComponent;
      case 'simple-bezier': return SimpleBezierEdgeComponent;
      case 'default':
      default: return BezierEdgeComponent;
    }
  }

  private _renderEdgeComponent(edge: GraphEdge, r: ResolvedEdgePositions): void {
    const componentType = (edge as any).template ?? this._getComponentForType(edge.type ?? 'default');
    this.containerRef.clear();

    const edgeInjector = Injector.create({
      providers: [{ provide: EDGE_ID_TOKEN, useValue: edge.id }],
      parent: this.containerRef.injector,
    });

    this._componentRef = this.containerRef.createComponent(componentType as any, {
      injector: edgeInjector,
    });

    const mirror = reflectComponentType(componentType);
    this._declaredInputs = new Set(mirror?.inputs.map((i) => i.templateName) ?? []);

    this._syncInputs(edge, r);
    this._componentRef.changeDetectorRef.detectChanges();
  }

  private _syncInputs(edge: GraphEdge, r: ResolvedEdgePositions): void {
    if (!this._componentRef) return;
    const trySet = (name: string, val: unknown) => {
      if (this._declaredInputs.has(name)) this._componentRef!.setInput(name, val);
    };

    trySet('id', edge.id);
    trySet('source', edge.source);
    trySet('target', edge.target);
    trySet('sourceNode', edge.sourceNode);
    trySet('targetNode', edge.targetNode);
    trySet('type', edge.type ?? 'default');
    trySet('selected', edge.selected);
    trySet('animated', edge.animated);
    trySet('updatable', (edge as any).updatable);
    trySet('data', edge.data);
    trySet('style', edge.style);
    trySet('label', edge.label);
    trySet('labelStyle', edge.labelStyle);
    trySet('labelShowBg', edge.labelShowBg);
    trySet('labelBgStyle', edge.labelBgStyle);
    trySet('labelBgPadding', edge.labelBgPadding);
    trySet('labelBgBorderRadius', edge.labelBgBorderRadius);
    trySet('interactionWidth', edge.interactionWidth);
    trySet('sourceHandleId', edge.sourceHandle);
    trySet('targetHandleId', edge.targetHandle);
    trySet('sourceX', r.sourceX);
    trySet('sourceY', r.sourceY);
    trySet('targetX', r.targetX);
    trySet('targetY', r.targetY);
    trySet('sourcePosition', r.sourcePosition);
    trySet('targetPosition', r.targetPosition);
    trySet('markerStart', r.markerStart);
    trySet('markerEnd', r.markerEnd);

    const po = (edge as any).pathOptions ?? {};
    trySet('curvature', po['curvature']);
    trySet('borderRadius', po['borderRadius']);
    trySet('offset', po['offset']);
  }

  _onEdgeClick(event: MouseEvent): void {
    if (this.flow.elementsSelectable()) {
      const multi = event.ctrlKey || event.metaKey || event.shiftKey;
      const changes: EdgeChange[] = [];
      if (!multi) {
        this.flow.edges().forEach((e) => {
          if (e.id !== this.id() && e.selected) {
            changes.push(createSelectionChange(e.id, false));
          }
        });
      }
      const e = this._edge();
      if (e) changes.push(createSelectionChange(e.id, !e.selected));
      this.flow.applyEdgeChanges(changes);
    }
    const e = this._edge();
    if (e) this.flow.edgeClick$.next({ event, edge: e });
  }

  _onEdgeDblClick(event: MouseEvent): void {
    const e = this._edge();
    if (e) this.flow.edgeDoubleClick$.next({ event, edge: e });
  }

  _onEdgeContextMenu(event: MouseEvent): void {
    const e = this._edge();
    if (e) this.flow.edgeContextMenu$.next({ event, edge: e });
  }

  _onEdgeMouseEnter(event: MouseEvent): void {
    const e = this._edge();
    if (e) this.flow.edgeMouseEnter$.next({ event, edge: e });
  }

  _onEdgeMouseLeave(event: MouseEvent): void {
    const e = this._edge();
    if (e) this.flow.edgeMouseLeave$.next({ event, edge: e });
  }
}

/** Return the outer-edge center of a handle in node-local canvas coordinates.
 *  handle.x/y is the handle CENTER (set by HandleComponent via getBoundingClientRect).
 *  Shifting to the outer edge ensures arrowheads land outside the handle element
 *  rather than being hidden underneath it (nodes render on top of SVG edges in DOM). */
function _handleOuterEdgeOffset(
  handle: import('../../types').HandleElement,
  position: import('../../types').Position,
): { x: number; y: number } {
  const hw = handle.width / 2;
  const hh = handle.height / 2;
  switch (position as string) {
    case 'bottom': return { x: handle.x, y: handle.y + hh };
    case 'top':    return { x: handle.x, y: handle.y - hh };
    case 'right':  return { x: handle.x + hw, y: handle.y };
    case 'left':   return { x: handle.x - hw, y: handle.y };
    default:       return { x: handle.x, y: handle.y };
  }
}

function _fallbackHandleOffset(
  pos: import('../../types').Position,
  w: number,
  h: number,
): { x: number; y: number } {
  switch (pos as string) {
    case 'left':   return { x: 0,     y: h / 2 };
    case 'right':  return { x: w,     y: h / 2 };
    case 'top':    return { x: w / 2, y: 0     };
    case 'bottom': return { x: w / 2, y: h     };
    default:       return { x: w / 2, y: h / 2 };
  }
}
