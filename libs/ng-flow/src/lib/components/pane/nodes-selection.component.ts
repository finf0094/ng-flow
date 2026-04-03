import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlowService } from '../../services/flow.service';
import { getRectOfNodes } from '../../utils';

@Component({
  selector: 'lib-nodes-selection',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (!flow.userSelectionActive() && _bbox().width && _bbox().height) {
      <div
        class="ng-flow__nodesselection ng-flow__container"
        [class]="flow.noPanClassName()"
        [style.transform]="_transform()"
      >
        <div
          class="ng-flow__nodesselection-rect"
          [style.width.px]="_bbox().width"
          [style.height.px]="_bbox().height"
          [style.top.px]="_bbox().y"
          [style.left.px]="_bbox().x"
          [class.dragging]="_isDragging"
          (mousedown)="_onMouseDown($event)"
          (contextmenu)="_onContextMenu($event)"
        ></div>
      </div>
    }
  `,
})
export class NodesSelectionComponent {
  readonly flow = inject(FlowService);

  readonly _bbox = computed(() => getRectOfNodes(this.flow.getSelectedNodes()));

  readonly _transform = computed(() => {
    const { x, y, zoom } = this.flow.viewport();
    return `translate(${x}px,${y}px) scale(${zoom})`;
  });

  _isDragging = false;
  private _dragStartPos = { x: 0, y: 0 };
  private _nodesStartPos = new Map<string, { x: number; y: number }>();

  _onMouseDown(event: MouseEvent): void {
    this._isDragging = false;
    this._dragStartPos = { x: event.clientX, y: event.clientY };
    this._nodesStartPos.clear();
    const selectedNodes = this.flow.getSelectedNodes();
    selectedNodes.forEach((n) => {
      this._nodesStartPos.set(n.id, { x: n.position.x, y: n.position.y });
    });
    this.flow.selectionDragStart$.next({ event, node: selectedNodes[0], nodes: selectedNodes });

    const onMove = (e: MouseEvent) => {
      const zoom = this.flow.viewport().zoom;
      const dx = (e.clientX - this._dragStartPos.x) / zoom;
      const dy = (e.clientY - this._dragStartPos.y) / zoom;
      if (!this._isDragging && (Math.abs(dx) > 1 || Math.abs(dy) > 1)) {
        this._isDragging = true;
      }
      if (!this._isDragging) return;

      this.flow.getSelectedNodes().forEach((n) => {
        const start = this._nodesStartPos.get(n.id);
        if (!start) return;
        const pos = { x: start.x + dx, y: start.y + dy };
        this.flow.updateNode(n.id, {
          position: pos,
          computedPosition: { ...n.computedPosition, x: pos.x, y: pos.y },
        });
      });
      const currentNodes = this.flow.getSelectedNodes();
      this.flow.selectionDrag$.next({ event: e, node: currentNodes[0], nodes: currentNodes });
    };

    const onUp = (e: MouseEvent) => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      if (this._isDragging) {
        this._isDragging = false;
        const currentNodes = this.flow.getSelectedNodes();
        this.flow.selectionDragStop$.next({ event: e, node: currentNodes[0], nodes: currentNodes });
      }
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  _onContextMenu(event: MouseEvent): void {
    this.flow.selectionContextMenu$.next({ event, nodes: this.flow.getSelectedNodes() });
  }
}
