import {
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  Injector,
  input,
  OnDestroy,
  OnInit,
  reflectComponentType,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlowService } from '../../services/flow.service';
import { DefaultNodeComponent } from '../nodes/default-node.component';
import { InputNodeComponent } from '../nodes/input-node.component';
import { OutputNodeComponent } from '../nodes/output-node.component';
import { NODE_ID_TOKEN } from '../nodes/node-id.token';
import type { ComponentType, GraphNode } from '../../types';

@Component({
  selector: 'lib-node-wrapper',
  standalone: true,
  imports: [CommonModule],
  providers: [],
  template: `<ng-container #container />`,
  host: {
    class: 'vue-flow__node',
    '[class.vue-flow__node-default]': 'node()?.type === "default"',
    '[class.vue-flow__node-input]': 'node()?.type === "input"',
    '[class.vue-flow__node-output]': 'node()?.type === "output"',
    '[class.selected]': 'node()?.selected',
    '[class.dragging]': 'node()?.dragging',
    '[class.draggable]': '_isDraggable()',
    '[class.selectable]': '_isSelectable()',
    '[class.connectable]': '_isConnectable()',
    '[attr.data-id]': 'id()',
    '[style.transform]': '_transform()',
    '[style.z-index]': '_zIndex()',
    '[style.width]': '_nodeStyleWidth()',
    '[style.height]': '_nodeStyleHeight()',
    '[style.visibility]': 'node()?.hidden ? "hidden" : "visible"',
    '[style.pointer-events]': '"all"',
    '[style.position]': '"absolute"',
    '[style.top]': '"0"',
    '[style.left]': '"0"',
  },
})
export class NodeWrapperComponent implements OnInit, OnDestroy {
  readonly id = input.required<string>();
  readonly resizeObserver = input<ResizeObserver | null>(null);

  private readonly flow = inject(FlowService);
  private readonly elRef = inject(ElementRef<HTMLElement>);

  @ViewChild('container', { read: ViewContainerRef, static: true })
  containerRef!: ViewContainerRef;

  readonly node = computed(() => this.flow.nodeLookup().get(this.id()));

  _nodeStyleWidth = computed(() => {
    const n = this.node();
    if (!n) return null;
    const styleWidth = (n.style as Record<string, string> | undefined)?.['width'];
    if (styleWidth) return styleWidth;
    if (n.width != null) return typeof n.width === 'number' ? `${n.width}px` : n.width;
    return null;
  });

  _nodeStyleHeight = computed(() => {
    const n = this.node();
    if (!n) return null;
    const styleHeight = (n.style as Record<string, string> | undefined)?.['height'];
    if (styleHeight) return styleHeight;
    if (n.height != null) return typeof n.height === 'number' ? `${n.height}px` : n.height;
    return null;
  });

  _isDraggable = computed(() => {
    const n = this.node();
    return n?.draggable ?? this.flow.nodesDraggable();
  });

  _isSelectable = computed(() => {
    const n = this.node();
    return n?.selectable ?? this.flow.elementsSelectable();
  });

  _isConnectable = computed(() => {
    const n = this.node();
    return n?.connectable ?? this.flow.nodesConnectable();
  });

  _transform = computed(() => {
    const n = this.node();
    if (!n) return '';
    const { x, y } = n.computedPosition;
    return `translate(${x}px, ${y}px)`;
  });

  _zIndex = computed(() => {
    const n = this.node();
    if (!n) return 0;
    return n.selected && this.flow.elevateNodesOnSelect()
      ? (n.zIndex ?? 0) + 1000
      : (n.zIndex ?? 0);
  });

  private _isDragging = false;
  private _dragStartPos = { x: 0, y: 0 };
  private _nodeStartPos = { x: 0, y: 0 };

  ngOnInit(): void {
    const n = this.node();
    if (!n) return;

    this._renderNodeComponent(n);

    const ro = this.resizeObserver();
    if (ro) {
      const el = this.elRef.nativeElement as HTMLElement;
      el.setAttribute('data-id', this.id());
      ro.observe(el);
    }
  }

  ngOnDestroy(): void {
    const ro = this.resizeObserver();
    if (ro) {
      ro.unobserve(this.elRef.nativeElement);
    }
  }

  private _getComponentForType(type: string): ComponentType {
    // Check custom node types first
    switch (type) {
      case 'input':
        return InputNodeComponent;
      case 'output':
        return OutputNodeComponent;
      case 'default':
      default:
        return DefaultNodeComponent;
    }
  }

  private _renderNodeComponent(node: GraphNode): void {
    const componentType =
      node.template ?? this._getComponentForType(node.type ?? 'default');

    this.containerRef.clear();

    // Provide NODE_ID_TOKEN so that HandleComponent (and any other child that
    // needs it) can resolve the id of the node it belongs to.
    const nodeInjector = Injector.create({
      providers: [{ provide: NODE_ID_TOKEN, useValue: node.id }],
      parent: this.containerRef.injector,
    });

    const ref = this.containerRef.createComponent(componentType, {
      injector: nodeInjector,
    });

    // Pass inputs via Angular's official setInput API (works with input() signals)
    // Use reflectComponentType to check declared inputs first — avoids NG0303 console errors
    // in debug builds where Angular logs the error before throwing.
    const mirror = reflectComponentType(componentType);
    const declaredInputs = new Set(mirror?.inputs.map((i) => i.templateName) ?? []);
    const trySetInput = (name: string, value: unknown) => {
      if (declaredInputs.has(name)) {
        ref.setInput(name, value);
      }
    };
    trySetInput('id', node.id);
    trySetInput('type', node.type ?? 'default');
    trySetInput('label', node.label);
    trySetInput('data', node.data);
    trySetInput('selected', node.selected);
    trySetInput('connectable', node.connectable ?? true);
    trySetInput('sourcePosition', node.sourcePosition);
    trySetInput('targetPosition', node.targetPosition);
    trySetInput('dragging', node.dragging);
    trySetInput('resizing', node.resizing);
    trySetInput('zIndex', node.zIndex ?? 0);

    ref.changeDetectorRef.detectChanges();
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    const node = this.node();
    if (!node) return;
    if (!this._isDraggable()) return;

    const noDragClass = this.flow.noDragClassName();
    if ((event.target as HTMLElement).closest(`.${noDragClass}`)) return;

    event.stopPropagation();

    this._isDragging = false;
    this._dragStartPos = { x: event.clientX, y: event.clientY };
    this._nodeStartPos = { x: node.position.x, y: node.position.y };

    if (this._isSelectable() && !node.selected) {
      const multi = event.ctrlKey || event.metaKey || event.shiftKey;
      if (!multi) {
        // deselect others
        this.flow.nodes().forEach((n) => {
          if (n.id !== node.id && n.selected) {
            this.flow.updateNode(n.id, { selected: false });
          }
        });
      }
      this.flow.updateNode(node.id, { selected: true });
    }

    this.flow.nodeDragStart$.next({
      event,
      node,
      nodes: this.flow.getSelectedNodes(),
    });

    const onMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - this._dragStartPos.x;
      const dy = e.clientY - this._dragStartPos.y;
      const threshold = this.flow.nodeDragThreshold();

      if (
        !this._isDragging &&
        (Math.abs(dx) > threshold || Math.abs(dy) > threshold)
      ) {
        this._isDragging = true;
        this.flow.updateNode(node.id, { dragging: true });
      }

      if (!this._isDragging) return;

      const vp = this.flow.viewport();
      const newX = this._nodeStartPos.x + dx / vp.zoom;
      const newY = this._nodeStartPos.y + dy / vp.zoom;

      const snapToGrid = this.flow.snapToGrid();
      const snapGrid = this.flow.snapGrid();

      let pos = { x: newX, y: newY };
      if (snapToGrid) {
        pos = {
          x: snapGrid[0] * Math.round(pos.x / snapGrid[0]),
          y: snapGrid[1] * Math.round(pos.y / snapGrid[1]),
        };
      }

      const updatedNode = this.flow.getNode(node.id);
      if (!updatedNode) return;

      this.flow.updateNode(node.id, {
        position: pos,
        computedPosition: {
          ...updatedNode.computedPosition,
          x: pos.x,
          y: pos.y,
        },
      });

      this.flow.nodeDrag$.next({
        event: e,
        node: updatedNode,
        nodes: this.flow.getSelectedNodes(),
      });
    };

    const onMouseUp = (e: MouseEvent) => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);

      const updatedNode = this.flow.getNode(node.id);
      if (updatedNode && this._isDragging) {
        this.flow.updateNode(node.id, { dragging: false });
        this.flow.nodeDragStop$.next({
          event: e,
          node: updatedNode,
          nodes: this.flow.getSelectedNodes(),
        });
      }
      this._isDragging = false;
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    const node = this.node();
    if (!node) return;
    this.flow.nodeClick$.next({ event, node });
  }

  @HostListener('dblclick', ['$event'])
  onDblClick(event: MouseEvent): void {
    const node = this.node();
    if (!node) return;
    this.flow.nodeDoubleClick$.next({ event, node });
  }

  @HostListener('contextmenu', ['$event'])
  onContextMenu(event: MouseEvent): void {
    const node = this.node();
    if (!node) return;
    this.flow.nodeContextMenu$.next({ event, node });
  }

  @HostListener('mouseenter', ['$event'])
  onMouseEnter(event: MouseEvent): void {
    const node = this.node();
    if (!node) return;
    this.flow.nodeMouseEnter$.next({ event, node });
  }

  @HostListener('mouseleave', ['$event'])
  onMouseLeave(event: MouseEvent): void {
    const node = this.node();
    if (!node) return;
    this.flow.nodeMouseLeave$.next({ event, node });
  }
}
