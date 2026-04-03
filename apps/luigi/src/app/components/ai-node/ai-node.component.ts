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
      <div class="ai-badge">AI</div>
      <div class="icon-wrap">
        <app-icon [name]="data().icon" [size]="24" class="icon" />
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
        width: 96px;
        height: 96px;
        background: #fff;
        border-radius: 8px;
        border: 1.5px solid #ddd6fe;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: box-shadow 0.2s ease, border-color 0.2s ease;
        box-shadow: 0 1px 4px rgba(139, 92, 246, 0.08);
        position: relative;
      }

      .node.is-selected {
        box-shadow: 0 0 0 6px rgba(139, 92, 246, 0.15);
        border-color: #8b5cf6;
      }

      .node.success {
        border: 2px solid #27a35a;
      }

      .node.error {
        border: 1.5px solid #e53935;
      }

      .node.running {
        border-color: transparent;
        animation: ai-running 1.5s linear infinite;
      }

      @property --ai-angle {
        syntax: '<angle>';
        initial-value: 0deg;
        inherits: false;
      }

      @keyframes ai-running {
        to { --ai-angle: 360deg; }
      }

      .node.running::before {
        content: '';
        position: absolute;
        inset: -1.5px;
        border-radius: inherit;
        background: conic-gradient(
          from var(--ai-angle),
          rgba(139, 92, 246, 1) 0deg,
          rgba(139, 92, 246, 0.3) 60deg,
          transparent 120deg,
          transparent 240deg,
          rgba(139, 92, 246, 0.3) 300deg,
          rgba(139, 92, 246, 1) 360deg
        );
        z-index: -1;
        animation: ai-running 1.5s linear infinite;
      }

      .node.running::after {
        content: '';
        position: absolute;
        inset: 1.5px;
        border-radius: calc(8px - 1.5px);
        background: #fff;
        z-index: -1;
      }

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
        box-shadow: 0 1px 4px rgba(109, 40, 217, 0.3);
      }

      .icon-wrap {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        background: color-mix(in srgb, #8b5cf6 10%, #f9fafb);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      :host ::ng-deep .icon {
        color: #8b5cf6;
        display: block;
      }

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
        font-weight: 500;
        color: #111827;
        line-height: 1.3;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
      }

      .subtitle {
        font-size: 11px;
        color: #8b5cf6;
        margin-top: 2px;
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
