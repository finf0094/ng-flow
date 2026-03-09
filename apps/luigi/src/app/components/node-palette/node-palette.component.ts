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
    <!-- Backdrop -->
    <div class="backdrop" (click)="workflow.paletteOpen.set(false)"></div>

    <!-- Panel -->
    <aside class="panel">
      <div class="panel-header">
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
      </div>

      <div class="panel-body">
        @if (filteredNodes()) {
          <!-- Search results -->
          <div class="category-section">
            <div class="category-label">Results</div>
            @for (node of filteredNodes()!; track node.id) {
              <button class="node-item" (click)="add(node)">
                <div
                  class="node-icon"
                  [style.background]="node.color + '22'"
                  [style.color]="node.color"
                >
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
              <div class="no-results">No nodes found</div>
            }
          </div>
        } @else {
          <!-- Categorized list -->
          @for (category of categories; track category) {
            @if (byCategory()[category]?.length) {
              <div class="category-section">
                <div class="category-label">{{ category }}</div>
                @for (node of byCategory()[category]; track node.id) {
                  <button class="node-item" (click)="add(node)">
                    <div
                      class="node-icon"
                      [style.background]="node.color + '22'"
                      [style.color]="node.color"
                    >
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
        position: fixed;
        inset: 0;
        z-index: 100;
        display: flex;
      }

      .backdrop {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
      }

      .panel {
        position: relative;
        width: 280px;
        height: 100%;
        background: #1a1f2e;
        border-right: 1px solid #2a2f3a;
        display: flex;
        flex-direction: column;
        z-index: 1;
        box-shadow: 4px 0 24px rgba(0, 0, 0, 0.5);
      }

      .panel-header {
        padding: 12px;
        border-bottom: 1px solid #2a2f3a;
      }

      .search-wrap {
        position: relative;
        display: flex;
        align-items: center;
      }

      .search-icon {
        position: absolute;
        left: 10px;
        color: #6b7280;
        display: flex;
        align-items: center;
        pointer-events: none;
      }

      .search-input {
        width: 100%;
        padding: 8px 32px;
        background: #111827;
        border: 1px solid #374151;
        border-radius: 8px;
        color: #e2e8f0;
        font-size: 13px;
        outline: none;
        transition: border-color 0.15s;
      }

      .search-input:focus {
        border-color: #6366f1;
      }

      .search-input::placeholder {
        color: #4b5563;
      }

      .clear-btn {
        position: absolute;
        right: 8px;
        background: none;
        border: none;
        color: #6b7280;
        cursor: pointer;
        padding: 2px;
        display: flex;
        align-items: center;
      }

      .clear-btn:hover {
        color: #e2e8f0;
      }

      .panel-body {
        flex: 1;
        overflow-y: auto;
        padding: 8px 0;
      }

      .panel-body::-webkit-scrollbar {
        width: 4px;
      }

      .panel-body::-webkit-scrollbar-track {
        background: transparent;
      }

      .panel-body::-webkit-scrollbar-thumb {
        background: #374151;
        border-radius: 2px;
      }

      .category-section {
        padding: 4px 0;
      }

      .category-label {
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #4b5563;
        padding: 8px 16px 4px;
      }

      .node-item {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        padding: 8px 16px;
        background: none;
        border: none;
        color: #e2e8f0;
        cursor: pointer;
        text-align: left;
        transition: background 0.1s;
        border-radius: 0;
      }

      .node-item:hover {
        background: rgba(255, 255, 255, 0.05);
      }

      .node-icon {
        width: 32px;
        height: 32px;
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
        color: #e2e8f0;
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
        padding: 20px 16px;
        color: #4b5563;
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
