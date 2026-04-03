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
        <app-icon [name]="data().icon" [size]="24" class="icon" />
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
      <lib-handle type="source" [position]="Position.Right" id="true" style="top: 35%" />
      <span class="branch-label" style="top: 65%">false</span>
      <lib-handle type="source" [position]="Position.Right" id="false" style="top: 65%" />
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

      /* ── Node card ── */
      .node {
        width: 96px;
        height: 96px;
        background: #fff;
        border-radius: 8px;
        border: 1.5px solid #e0e0e0;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: box-shadow 0.2s ease, border-color 0.2s ease;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
        position: relative;
      }

      /* Trigger: pill-shaped left side (n8n style) */
      .node.trigger {
        border-radius: 36px 8px 8px 36px;
      }

      /* Selected */
      .node.is-selected {
        box-shadow: 0 0 0 6px rgba(99, 102, 241, 0.18);
        border-color: #6366f1;
      }

      /* Status: success */
      .node.success {
        border: 2px solid #27a35a;
      }

      /* Status: error */
      .node.error {
        border: 1.5px solid #e53935;
      }

      /* Status: disabled */
      .node.disabled {
        opacity: 0.45;
        border: 1.5px dashed #d1d5db;
      }

      /* Status: running — animated conic-gradient border (n8n style) */
      .node.running {
        animation: running-border 1.5s linear infinite;
        border-color: transparent;
      }

      @property --running-angle {
        syntax: '<angle>';
        initial-value: 0deg;
        inherits: false;
      }

      @keyframes running-border {
        to { --running-angle: 360deg; }
      }

      .node.running::before {
        content: '';
        position: absolute;
        inset: -1.5px;
        border-radius: inherit;
        background: conic-gradient(
          from var(--running-angle),
          rgba(255, 109, 90, 1) 0deg,
          rgba(255, 109, 90, 0.3) 60deg,
          transparent 120deg,
          transparent 240deg,
          rgba(255, 109, 90, 0.3) 300deg,
          rgba(255, 109, 90, 1) 360deg
        );
        z-index: -1;
        animation: running-border 1.5s linear infinite;
      }

      .node.running::after {
        content: '';
        position: absolute;
        inset: 1.5px;
        border-radius: calc(8px - 1.5px);
        background: #fff;
        z-index: -1;
      }

      .node.trigger.running::after {
        border-radius: calc(36px - 1.5px) calc(8px - 1.5px) calc(8px - 1.5px) calc(36px - 1.5px);
      }

      /* ── Icon ── */
      .icon-wrap {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        background: color-mix(in srgb, var(--accent, #6366f1) 12%, #f9fafb);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      :host ::ng-deep .icon {
        color: var(--accent, #6366f1);
        display: block;
      }

      /* ── Label ── */
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
        color: #6b7280;
        margin-top: 2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      /* ── Toolbar ── */
      .toolbar { display: none; }
      :host:hover .toolbar { display: flex; }

      /* ── Branch labels ── */
      .branch-label {
        position: absolute;
        left: calc(100% + 8px);
        transform: translateY(-50%);
        font-size: 9px;
        font-weight: 600;
        color: #9ca3af;
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
