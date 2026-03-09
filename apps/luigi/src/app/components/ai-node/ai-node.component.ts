import { Component, input } from '@angular/core';
import { HandleComponent, Position } from '@org/ng-flow';
import { LucideAngularModule } from '../../icons';
import { NodeToolbarComponent } from '../node-toolbar/node-toolbar.component';

export interface AiNodeData {
  icon: string;
  color?: string;
  subtitle?: string;
  model?: string;
  status?: 'idle' | 'running' | 'success' | 'error';
}

@Component({
  selector: 'app-ai-node',
  standalone: true,
  imports: [HandleComponent, LucideAngularModule, NodeToolbarComponent],
  template: `
    <app-node-toolbar [nodeId]="id()" nodeType="ai" class="nodrag nopan toolbar" />

    <lib-handle type="target" [position]="Position.Left" />

    <div
      class="node"
      [class.is-selected]="selected()"
      [class.running]="data().status === 'running'"
      [class.success]="data().status === 'success'"
      [class.error]="data().status === 'error'"
    >
      <!-- AI badge -->
      <div class="ai-badge">AI</div>

      <div class="icon-wrap">
        <app-icon [name]="data().icon" [size]="26" class="icon" />
      </div>
    </div>

    <div class="meta">
      <div class="name">{{ label() }}</div>
      @if (data().subtitle || data().model) {
        <div class="subtitle">{{ data().subtitle ?? data().model }}</div>
      }
    </div>

    <lib-handle type="source" [position]="Position.Right" />
  `,
  styles: [
    `
      :host {
        display: block;
        position: relative;
      }

      .toolbar { display: none; }
      :host:hover .toolbar { display: flex; }

      .node {
        width: 100px;
        height: 100px;
        background: #1a1428;
        border-radius: 12px;
        border: 1.5px solid rgba(139, 92, 246, 0.45);
        display: flex;
        align-items: center;
        justify-content: center;
        transition:
          box-shadow 0.2s ease,
          border-color 0.2s ease;
        box-shadow:
          0 0 0 1px rgba(139, 92, 246, 0.25),
          0 0 18px rgba(139, 92, 246, 0.15),
          0 4px 16px rgba(0, 0, 0, 0.4);
        position: relative;
      }

      /* Selected glow */
      .node.is-selected {
        box-shadow:
          0 0 0 3px rgba(139, 92, 246, 0.5),
          0 0 20px rgba(139, 92, 246, 0.3),
          0 4px 16px rgba(0, 0, 0, 0.4);
        border-color: rgba(139, 92, 246, 0.8);
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

      .node.running {
        animation: pulse-ai 1.5s ease-in-out infinite;
      }

      @keyframes pulse-ai {
        0%,
        100% {
          box-shadow:
            0 0 0 0 rgba(139, 92, 246, 0),
            0 0 18px rgba(139, 92, 246, 0.15),
            0 4px 16px rgba(0, 0, 0, 0.4);
        }
        50% {
          box-shadow:
            0 0 0 12px rgba(139, 92, 246, 0),
            0 0 30px rgba(139, 92, 246, 0.4),
            0 4px 16px rgba(0, 0, 0, 0.4);
        }
      }

      /* AI badge */
      .ai-badge {
        position: absolute;
        top: -7px;
        right: -7px;
        background: linear-gradient(135deg, #8b5cf6, #6d28d9);
        color: #fff;
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 0.05em;
        border-radius: 4px;
        padding: 2px 5px;
        line-height: 1;
        box-shadow: 0 2px 6px rgba(109, 40, 217, 0.5);
      }

      /* Icon wrapper */
      .icon-wrap {
        width: 54px;
        height: 54px;
        border-radius: 12px;
        background: color-mix(in srgb, #8b5cf6 22%, #1a1428);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      :host ::ng-deep .icon {
        color: #a78bfa;
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
        color: #7c3aed;
        margin-top: 3px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    `,
  ],
})
export class AiNodeComponent {
  readonly Position = Position;

  readonly id = input.required<string>();
  readonly label = input<string>('');
  readonly selected = input<boolean>(false);
  readonly dragging = input<boolean>(false);
  readonly data = input<AiNodeData>({ icon: 'bot', color: '#8b5cf6' });
}
