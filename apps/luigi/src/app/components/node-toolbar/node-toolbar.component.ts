import { Component, inject, input, output } from '@angular/core';
import { LucideAngularModule } from '../../icons';
import { WorkflowService } from '../../services/workflow.service';

@Component({
  selector: 'app-node-toolbar',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <button class="tb-btn" title="Delete node" (click)="onDelete($event)">
      <app-icon name="trash-2" [size]="14" />
    </button>

    @if (nodeType() === 'canvas' || nodeType() === 'ai') {
      <button class="tb-btn" title="Add node" (click)="onAdd($event)">
        <app-icon name="plus" [size]="14" />
      </button>
    }

    @if (nodeType() === 'sticky') {
      <div class="color-swatches">
        @for (c of colors; track c.key) {
          <button
            class="swatch"
            [style.background]="c.bg"
            [class.active]="color() === c.key"
            (click)="onColor(c.key, $event)"
            [title]="c.key"
          ></button>
        }
      </div>
    }
  `,
  styles: [`
    :host {
      position: absolute;
      top: -44px;
      right: 0;
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 4px;
      background: #1e2030;
      border: 1px solid #374151;
      border-radius: 8px;
      padding: 4px;
      z-index: 100;
      white-space: nowrap;
    }

    /* Invisible bridge between toolbar and node so hover doesn't break */
    :host::after {
      content: '';
      position: absolute;
      left: 0;
      top: 100%;
      width: 100%;
      height: 12px;
    }

    .tb-btn {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      border-radius: 6px;
      color: #9ca3af;
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
    }
    .tb-btn:hover {
      background: #374151;
      color: #e2e8f0;
    }

    .color-swatches {
      display: flex;
      gap: 4px;
      margin-left: 4px;
      padding-left: 4px;
      border-left: 1px solid #374151;
    }

    .swatch {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid rgba(255,255,255,0.1);
      cursor: pointer;
      padding: 0;
      transition: transform 0.15s, border-color 0.15s;
    }
    .swatch:hover, .swatch.active {
      transform: scale(1.25);
      border-color: rgba(255,255,255,0.4);
    }
  `],
})
export class NodeToolbarComponent {
  private readonly workflow = inject(WorkflowService);

  readonly nodeId = input.required<string>();
  readonly nodeType = input<'canvas' | 'sticky' | 'ai'>('canvas');
  readonly color = input<string>('');
  readonly colorChange = output<string>();

  readonly colors = [
    { key: 'yellow', bg: '#fef08a' },
    { key: 'pink', bg: '#fecdd3' },
    { key: 'blue', bg: '#bfdbfe' },
    { key: 'green', bg: '#bbf7d0' },
  ];

  onDelete(event: MouseEvent): void {
    event.stopPropagation();
    this.workflow.removeNode(this.nodeId());
  }

  onAdd(event: MouseEvent): void {
    event.stopPropagation();
    this.workflow.openPalette();
  }

  onColor(color: string, event: MouseEvent): void {
    event.stopPropagation();
    this.colorChange.emit(color);
  }
}
