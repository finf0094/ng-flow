import { Component, inject, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from '../../icons';
import { WorkflowService } from '../../services/workflow.service';
import {
  NODE_CATALOG,
  NODE_CATEGORIES,
  type NodeCatalogItem,
} from '../../data/node-catalog';

@Component({
  selector: 'app-node-palette',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  template: `
    <!-- Panel (right-side, n8n NodeCreator style) -->
    <aside class="panel">
      <div class="panel-header">
        <span class="panel-title">Add nodes</span>
        <button class="close-btn" (click)="workflow.paletteOpen.set(false)">
          <app-icon name="x" [size]="16" />
        </button>
      </div>

      <div class="search-wrap">
        <div class="search-icon"><app-icon name="search" [size]="14" /></div>
        <input
          class="search-input"
          placeholder="Search nodes..."
          [(ngModel)]="query"
          (ngModelChange)="onQuery($event)"
          autofocus
        />
        @if (query()) {
          <button class="clear-btn" (click)="query.set(''); filteredNodes.set(null)">
            <app-icon name="x" [size]="12" />
          </button>
        }
      </div>

      <div class="panel-body">
        @if (filteredNodes()) {
          <div class="category-section">
            <div class="category-label">Results</div>
            @for (node of filteredNodes()!; track node.id) {
              <button class="node-item" (click)="add(node)">
                <div class="node-icon" [style.background]="node.color + '18'" [style.color]="node.color">
                  <app-icon [name]="node.icon" [size]="16" />
                </div>
                <div class="node-info">
                  <span class="node-name">{{ node.label }}</span>
                  @if (node.description) {
                    <span class="node-desc">{{ node.description }}</span>
                  }
                </div>
                @if (node.nodeType === 'ai') {
                  <span class="badge-ai">AI</span>
                }
              </button>
            }
            @if (filteredNodes()!.length === 0) {
              <div class="no-results">No nodes found for "{{ query() }}"</div>
            }
          </div>
        } @else {
          @for (category of categories; track category) {
            @if (byCategory()[category]?.length) {
              <div class="category-section">
                <div class="category-label">{{ category }}</div>
                @for (node of byCategory()[category]; track node.id) {
                  <button class="node-item" (click)="add(node)">
                    <div class="node-icon" [style.background]="node.color + '18'" [style.color]="node.color">
                      <app-icon [name]="node.icon" [size]="16" />
                    </div>
                    <div class="node-info">
                      <span class="node-name">{{ node.label }}</span>
                      @if (node.description) {
                        <span class="node-desc">{{ node.description }}</span>
                      }
                    </div>
                    @if (node.nodeType === 'ai') {
                      <span class="badge-ai">AI</span>
                    }
                  </button>
                }
              </div>
            }
          }
        }
      </div>
    </aside>
  `,
  styles: [
    `
      :host {
        position: absolute;
        top: 0;
        right: 0;
        height: 100%;
        z-index: 50;
        display: flex;
      }

      .panel {
        width: 385px;
        height: 100%;
        background: #fff;
        border-left: 1px solid #e5e7eb;
        display: flex;
        flex-direction: column;
        box-shadow: -4px 0 16px rgba(0, 0, 0, 0.06);
      }

      .panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 16px 12px;
        border-bottom: 1px solid #f3f4f6;
        flex-shrink: 0;
      }

      .panel-title {
        font-size: 16px;
        font-weight: 600;
        color: #111827;
      }

      .close-btn {
        width: 28px;
        height: 28px;
        border: none;
        background: transparent;
        color: #9ca3af;
        cursor: pointer;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.15s, color 0.15s;
      }

      .close-btn:hover {
        background: #f3f4f6;
        color: #374151;
      }

      .search-wrap {
        position: relative;
        display: flex;
        align-items: center;
        padding: 12px 16px;
        border-bottom: 1px solid #f3f4f6;
        flex-shrink: 0;
      }

      .search-icon {
        position: absolute;
        left: 28px;
        color: #9ca3af;
        display: flex;
        align-items: center;
        pointer-events: none;
      }

      .search-input {
        width: 100%;
        padding: 8px 32px;
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        color: #111827;
        font-size: 13px;
        outline: none;
        transition: border-color 0.15s, background 0.15s;
      }

      .search-input:focus {
        border-color: #ff6d5a;
        background: #fff;
      }

      .search-input::placeholder {
        color: #9ca3af;
      }

      .clear-btn {
        position: absolute;
        right: 24px;
        background: none;
        border: none;
        color: #9ca3af;
        cursor: pointer;
        padding: 2px;
        display: flex;
        align-items: center;
        border-radius: 4px;
      }

      .clear-btn:hover {
        color: #374151;
        background: #f3f4f6;
      }

      .panel-body {
        flex: 1;
        overflow-y: auto;
        padding: 4px 0 12px;
      }

      .panel-body::-webkit-scrollbar {
        width: 4px;
      }

      .panel-body::-webkit-scrollbar-track {
        background: transparent;
      }

      .panel-body::-webkit-scrollbar-thumb {
        background: #e5e7eb;
        border-radius: 2px;
      }

      .category-section {
        padding: 4px 0;
      }

      .category-label {
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: #9ca3af;
        padding: 10px 16px 4px;
      }

      .node-item {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        padding: 8px 16px;
        background: none;
        border: none;
        color: #111827;
        cursor: pointer;
        text-align: left;
        transition: background 0.1s;
      }

      .node-item:hover {
        background: #f9fafb;
      }

      .node-icon {
        width: 34px;
        height: 34px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .node-info {
        flex: 1;
        min-width: 0;
      }

      .node-name {
        display: block;
        font-size: 13px;
        font-weight: 500;
        color: #111827;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .node-desc {
        display: block;
        font-size: 11px;
        color: #6b7280;
        margin-top: 1px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .badge-ai {
        font-size: 9px;
        font-weight: 700;
        background: linear-gradient(135deg, #8b5cf6, #6d28d9);
        color: #fff;
        border-radius: 4px;
        padding: 2px 5px;
        flex-shrink: 0;
      }

      .no-results {
        padding: 24px 16px;
        color: #9ca3af;
        font-size: 13px;
        text-align: center;
      }
    `,
  ],
})
export class NodePaletteComponent {
  readonly workflow = inject(WorkflowService);

  readonly query = signal('');
  readonly filteredNodes = signal<NodeCatalogItem[] | null>(null);
  readonly categories = NODE_CATEGORIES;

  readonly byCategory = computed(() => {
    const map: Record<string, NodeCatalogItem[]> = {};
    for (const item of NODE_CATALOG) {
      if (!map[item.category]) map[item.category] = [];
      map[item.category].push(item);
    }
    return map;
  });

  onQuery(q: string): void {
    if (!q.trim()) {
      this.filteredNodes.set(null);
      return;
    }
    const lower = q.toLowerCase();
    this.filteredNodes.set(
      NODE_CATALOG.filter(
        (n) =>
          n.label.toLowerCase().includes(lower) ||
          n.description?.toLowerCase().includes(lower),
      ),
    );
  }

  add(item: NodeCatalogItem): void {
    this.workflow.addNodeFromCatalog(item);
  }
}
