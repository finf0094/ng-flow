import { Component, input } from '@angular/core';
import { HandleComponent, Position } from '@org/ng-flow';

export interface WorkflowNodeData {
  icon: string;
  subtitle: string;
  color: string;
}

@Component({
  selector: 'app-workflow-node',
  standalone: true,
  imports: [HandleComponent],
  template: `
    <lib-handle [type]="'target'" [position]="Position.Left" />

    <div class="wf-node" [style.--accent]="data().color">
      <div class="wf-header">
        <span class="wf-icon">{{ data().icon }}</span>
        <span class="wf-title">{{ label() }}</span>
      </div>
      @if (data().subtitle) {
        <div class="wf-subtitle">{{ data().subtitle }}</div>
      }
    </div>

    <lib-handle [type]="'source'" [position]="Position.Right" />
  `,
  styles: [`
    :host {
      display: block;
      position: relative;
    }
    .wf-node {
      width: 220px;
      background: #fff;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      border-left: 4px solid var(--accent, #6366f1);
      box-shadow: 0 2px 8px rgba(0,0,0,.10);
      padding: 10px 14px;
      cursor: grab;
      user-select: none;
      transition: box-shadow .15s;
    }
    :host-context(.selected) .wf-node,
    :host-context(.vue-flow__node.selected) .wf-node {
      box-shadow: 0 0 0 2px var(--accent, #6366f1), 0 4px 12px rgba(0,0,0,.15);
    }
    .wf-header {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .wf-icon {
      font-size: 18px;
      line-height: 1;
    }
    .wf-title {
      font-size: 13px;
      font-weight: 600;
      color: #1e293b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .wf-subtitle {
      font-size: 11px;
      color: #94a3b8;
      margin-top: 4px;
      padding-left: 26px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `],
})
export class WorkflowNodeComponent {
  readonly Position = Position;

  readonly id = input.required<string>();
  readonly label = input<string>('');
  readonly data = input<WorkflowNodeData>({ icon: '⚙️', subtitle: '', color: '#6366f1' });
  readonly selected = input<boolean>(false);
}
