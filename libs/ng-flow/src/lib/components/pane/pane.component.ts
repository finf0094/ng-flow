import {
  Component,
  ElementRef,
  HostListener,
  inject,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlowService } from '../../services/flow.service';
import { SelectionRectComponent } from './selection-rect.component';
import { SelectionMode } from '../../types';
import type { EdgeChange } from '../../types';
import { createSelectionChange } from '../../utils/changes';
import { getNodesInside } from '../../utils';

@Component({
  selector: 'lib-pane',
  standalone: true,
  imports: [CommonModule, SelectionRectComponent],
  template: `
    @if (flow.userSelectionActive() && flow.userSelectionRect()) {
      <lib-selection-rect [rect]="flow.userSelectionRect()!" />
    }
    <ng-content />
  `,
  host: {
    class: 'vue-flow__pane vue-flow__container',
    '[class.draggable]': '!flow.userSelectionActive() && _isPannable()',
    '[class.selection]': 'flow.userSelectionActive()',
    '[class.dragging]': 'flow.paneDragging()',
  },
})
export class PaneComponent {
  readonly flow = inject(FlowService);
  private readonly el = inject(ElementRef<HTMLElement>);

  private _mouseDownPos = { x: 0, y: 0 };

  _isPannable = computed(() => {
    const panOnDrag = this.flow.panOnDrag();
    return panOnDrag === true || (Array.isArray(panOnDrag) && panOnDrag.length > 0);
  });

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    // Only handle clicks directly on the pane element (not on child nodes/edges)
    // This matches vue-flow's wrapHandler pattern
    if (event.target !== this.el.nativeElement) return;

    const dx = Math.abs(event.clientX - this._mouseDownPos.x);
    const dy = Math.abs(event.clientY - this._mouseDownPos.y);
    if (dx <= this.flow.paneClickDistance() && dy <= this.flow.paneClickDistance()) {
      const deselect = this.flow.nodes()
        .filter((n) => n.selected)
        .map((n) => createSelectionChange(n.id, false));
      if (deselect.length) this.flow.applyNodeChanges(deselect);

      const deselectEdges = this.flow.edges()
        .filter((e) => e.selected)
        .map((e) => createSelectionChange(e.id, false) as EdgeChange);
      if (deselectEdges.length) this.flow.applyEdgeChanges(deselectEdges);

      this.flow.nodesSelectionActive.set(false);

      this.flow.paneClick$.next(event);
    }
  }

  @HostListener('contextmenu', ['$event'])
  onContextMenu(event: MouseEvent): void {
    this.flow.paneContextMenu$.next(event);
  }

  @HostListener('pointerenter', ['$event'])
  onMouseEnter(event: PointerEvent): void {
    this.flow.paneMouseEnter$.next(event);
  }

  @HostListener('pointermove', ['$event'])
  onMouseMove(event: PointerEvent): void {
    this.flow.paneMouseMove$.next(event);

    if (this.flow.userSelectionActive() && event.buttons === 1) {
      this._updateSelectionRect(event);
    }
  }

  @HostListener('pointerleave', ['$event'])
  onMouseLeave(event: PointerEvent): void {
    this.flow.paneMouseLeave$.next(event);
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    this._mouseDownPos = { x: event.clientX, y: event.clientY };

    const selectionKeyCode = this.flow.selectionKeyCode();
    const isSelectionActive = selectionKeyCode === true;

    if (isSelectionActive || this._isSelectionKey(event)) {
      this._startSelection(event);
    }
  }

  @HostListener('mouseup', ['$event'])
  onMouseUp(event: MouseEvent): void {
    if (this.flow.userSelectionActive()) {
      this._finishSelection(event);
    }
  }

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent): void {
    this.flow.paneScroll$.next(event);
  }

  private _isSelectionKey(event: MouseEvent): boolean {
    const code = this.flow.selectionKeyCode();
    if (!code || typeof code === 'boolean') return false;
    return event.shiftKey && code === 'Shift' ||
      event.ctrlKey && code === 'Control' ||
      event.metaKey && code === 'Meta' ||
      event.altKey && code === 'Alt';
  }

  private _startSelection(event: MouseEvent): void {
    const el = this.el.nativeElement;
    const rect = el.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    this.flow.userSelectionActive.set(true);
    this.flow.userSelectionRect.set({
      x, y, width: 0, height: 0, startX: x, startY: y,
    });
    this.flow.selectionStart$.next(event);
  }

  private _updateSelectionRect(event: MouseEvent): void {
    const rect = this.el.nativeElement.getBoundingClientRect();
    const selectionRect = this.flow.userSelectionRect();
    if (!selectionRect) return;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    this.flow.userSelectionRect.set({
      ...selectionRect,
      x: Math.min(x, selectionRect.startX),
      y: Math.min(y, selectionRect.startY),
      width: Math.abs(x - selectionRect.startX),
      height: Math.abs(y - selectionRect.startY),
    });
  }

  private _finishSelection(event: MouseEvent): void {
    const selectionRect = this.flow.userSelectionRect();
    if (!selectionRect) return;

    const vp = this.flow.viewport();
    const selMode = this.flow.selectionMode();
    const nodes = getNodesInside(
      this.flow.nodes(),
      selectionRect,
      vp,
      selMode === SelectionMode.Partial,
      true,
    );

    const selChanges = nodes.map((n) => createSelectionChange(n.id, true));
    if (selChanges.length) this.flow.applyNodeChanges(selChanges);
    this.flow.nodesSelectionActive.set(nodes.length > 0);
    this.flow.userSelectionActive.set(false);
    this.flow.userSelectionRect.set(null);
    this.flow.selectionEnd$.next(event);
  }
}
