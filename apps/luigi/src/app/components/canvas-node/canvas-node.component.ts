import { Component, input } from '@angular/core';
import { HandleComponent, Position } from '@org/ng-flow';
import { LucideAngularModule } from '../../icons';
import { NodeToolbarComponent } from '../node-toolbar/node-toolbar.component';

export interface CanvasNodeData {
  icon: string;
  color: string;
  subtitle?: string;
  type?: 'default' | 'trigger';
  status?: 'idle' | 'running' | 'success' | 'error' | 'disabled';
  outputs?: 2;
}

@Component({
  selector: 'app-canvas-node',
  standalone: true,
  imports: [HandleComponent, LucideAngularModule, NodeToolbarComponent],
  template: `
    <app-node-toolbar [nodeId]="id()" nodeType="canvas" class="nodrag nopan toolbar" />

    @if (data().type !== 'trigger') {
      <lib-handle type="target" [position]="Position.Left" />
    }

    <div
      class="node"
      [class.trigger]="data().type === 'trigger'"
      [class.is-selected]="selected()"
      [class.running]="data().status === 'running'"
      [class.success]="data().status === 'success'"
      [class.error]="data().status === 'error'"
      [class.disabled]="data().status === 'disabled'"
      [style.--accent]="data().color"
    >
      <div class="icon-wrap">
        <app-icon [name]="data().icon" [size]="26" class="icon" />
      </div>
    </div>

    <div class="meta">
      <div class="name">{{ label() }}</div>
      @if (data().subtitle) {
        <div class="subtitle">{{ data().subtitle }}</div>
      }
    </div>

    @if (data().outputs === 2) {
      <span class="branch-label" style="top: 35%">true</span>
      <lib-handle
        type="source"
        [position]="Position.Right"
        id="true"
        style="top: 35%"
      />
      <span class="branch-label" style="top: 65%">false</span>
      <lib-handle
        type="source"
        [position]="Position.Right"
        id="false"
        style="top: 65%"
      />
    } @else {
      <lib-handle type="source" [position]="Position.Right" />
    }
  `,
  styles: [
    `
      :host {
        display: block;
        position: relative;
      }

      .node {
        width: 100px;
        height: 100px;
        background: #1e2535;
        border-radius: 12px;
        border: 1.5px solid rgba(255, 255, 255, 0.08);
        display: flex;
        align-items: center;
        justify-content: center;
        transition:
          box-shadow 0.2s ease,
          border-color 0.2s ease;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
        position: relative;
      }

      /* Trigger: pill shape on the left side */
      .node.trigger {
        border-top-left-radius: 36px;
        border-bottom-left-radius: 36px;
      }

      /* Selected glow */
      .node.is-selected {
        box-shadow:
          0 0 0 3px rgba(99, 102, 241, 0.5),
          0 4px 16px rgba(0, 0, 0, 0.4);
        border-color: rgba(99, 102, 241, 0.6);
      }

      /* Status variants */
      .node.success {
        border-color: #22c55e;
        border-width: 2px;
      }

      .node.error {
        border-color: #ef4444;
        border-width: 2px;
      }

      .node.disabled {
        opacity: 0.45;
        border-style: dashed;
        border-color: #4b5563;
      }

      .node.running {
        animation: pulse-running 1.5s ease-in-out infinite;
      }

      @keyframes pulse-running {
        0%,
        100% {
          box-shadow:
            0 0 0 0 color-mix(in srgb, var(--accent, #6366f1) 40%, transparent),
            0 4px 16px rgba(0, 0, 0, 0.4);
        }
        50% {
          box-shadow:
            0 0 0 10px color-mix(in srgb, var(--accent, #6366f1) 0%, transparent),
            0 4px 16px rgba(0, 0, 0, 0.4);
        }
      }

      /* Icon wrapper */
      .icon-wrap {
        width: 54px;
        height: 54px;
        border-radius: 12px;
        background: color-mix(in srgb, var(--accent, #6366f1) 18%, #111827);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      :host ::ng-deep .icon {
        color: var(--accent, #6366f1);
        display: block;
      }

      /* Label below card */
      .meta {
        position: absolute;
        top: calc(100% + 10px);
        left: 50%;
        transform: translateX(-50%);
        width: 200px;
        text-align: center;
        pointer-events: none;
      }

      .name {
        font-size: 13px;
        font-weight: 600;
        color: #e2e8f0;
        line-height: 1.3;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
      }

      .subtitle {
        font-size: 11px;
        color: #6b7280;
        margin-top: 3px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .toolbar { display: none; }
      :host:hover .toolbar { display: flex; }

      .branch-label {
        position: absolute;
        left: calc(100% + 8px);
        transform: translateY(-50%);
        font-size: 8px;
        font-weight: 600;
        color: #6b7280;
        letter-spacing: 0.4px;
        text-transform: uppercase;
        pointer-events: none;
        white-space: nowrap;
      }
    `,
  ],
})
export class CanvasNodeComponent {
  readonly Position = Position;

  readonly id = input.required<string>();
  readonly label = input<string>('');
  readonly selected = input<boolean>(false);
  readonly dragging = input<boolean>(false);
  readonly data = input<CanvasNodeData>({ icon: 'cpu', color: '#6366f1' });
}
