import { Injectable, computed, signal } from '@angular/core';
import {
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type NodeSelectionChange,
  type Connection,
  type ViewportTransform,
  type GraphNode,
  type GraphEdge,
  type FlowService,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  MarkerType,
} from '@org/ng-flow';
import {
  INITIAL_RAW_NODES,
  INITIAL_EDGES,
  type RawNode,
} from '../data/workflow.data';
import { type NodeCatalogItem } from '../data/node-catalog';
import { CanvasNodeComponent } from '../components/canvas-node/canvas-node.component';
import { StickyNoteNodeComponent } from '../components/sticky-note-node/sticky-note-node.component';
import { AiNodeComponent } from '../components/ai-node/ai-node.component';

function rawNodeToNode(raw: RawNode): Node {
  const template =
    raw.nodeType === 'ai'
      ? AiNodeComponent
      : raw.nodeType === 'sticky'
        ? StickyNoteNodeComponent
        : CanvasNodeComponent;

  return {
    id: raw.id,
    position: raw.position,
    label: raw.label,
    template,
    data: raw.data,
  };
}

@Injectable({ providedIn: 'root' })
export class WorkflowService {
  // ── State ───────────────────────────────────────────────────────
  readonly nodes = signal<Node[]>(INITIAL_RAW_NODES.map(rawNodeToNode));
  readonly edges = signal<Edge[]>(INITIAL_EDGES);
  readonly selectedNodeIds = signal<string[]>([]);
  readonly viewport = signal<ViewportTransform>({ x: 0, y: 0, zoom: 1 });
  readonly paletteOpen = signal(false);

  // ── Derived ─────────────────────────────────────────────────────
  readonly nodeCount = computed(() => this.nodes().length);
  readonly edgeCount = computed(() => this.edges().length);
  readonly zoomLevel = computed(() => Math.round(this.viewport().zoom * 100));
  readonly selectedNodes = computed(() =>
    this.nodes().filter((n) => this.selectedNodeIds().includes(n.id)),
  );

  // ── FlowService ref ─────────────────────────────────────────────
  private flowServiceRef: FlowService | null = null;

  setFlowService(fs: FlowService): void {
    this.flowServiceRef = fs;
  }

  fitView(): void {
    this.flowServiceRef?.fitView({ padding: 0.12 });
  }

  zoomIn(): void {
    this.flowServiceRef?.zoomIn();
  }

  zoomOut(): void {
    this.flowServiceRef?.zoomOut();
  }

  // ── ng-flow event handlers ──────────────────────────────────────
  onNodesChange(changes: NodeChange[]): void {
    this.nodes.update(
      (ns) => applyNodeChanges(changes, ns as unknown as GraphNode[]) as Node[],
    );

    // Track selection from 'select' changes
    const selectChanges = changes.filter(
      (c): c is NodeSelectionChange => c.type === 'select',
    );
    const selected = selectChanges.filter((c) => c.selected).map((c) => c.id);
    const deselected = selectChanges
      .filter((c) => !c.selected)
      .map((c) => c.id);

    if (selected.length || deselected.length) {
      this.selectedNodeIds.update((ids) => [
        ...ids.filter((id) => !deselected.includes(id)),
        ...selected,
      ]);
    }
  }

  onEdgesChange(changes: EdgeChange[]): void {
    this.edges.update(
      (es) => applyEdgeChanges(changes, es as unknown as GraphEdge[]) as Edge[],
    );
  }

  onConnect(connection: Connection): void {
    const edge: Edge = {
      id: `e-${connection.source}-${connection.target}-${Date.now()}`,
      source: connection.source,
      target: connection.target,
      sourceHandle: connection.sourceHandle ?? undefined,
      targetHandle: connection.targetHandle ?? undefined,
      type: 'smoothstep',
      markerEnd: MarkerType.ArrowClosed,
    };
    this.edges.update(
      (es) => addEdge(edge, es as unknown as GraphEdge[]) as Edge[],
    );
  }

  onViewportChange(vp: ViewportTransform): void {
    this.viewport.set(vp);
  }

  // ── Node operations ─────────────────────────────────────────────
  addNodeFromCatalog(item: NodeCatalogItem): void {
    const vp = this.viewport();
    const cx = (window.innerWidth / 2 - vp.x) / vp.zoom;
    const cy = (window.innerHeight / 2 - vp.y) / vp.zoom;

    const template =
      item.nodeType === 'ai'
        ? AiNodeComponent
        : item.nodeType === 'sticky'
          ? StickyNoteNodeComponent
          : CanvasNodeComponent;

    const node: Node = {
      id: `${item.id}-${Date.now()}`,
      position: { x: cx - 50, y: cy - 50 },
      label: item.label,
      template,
      data:
        item.nodeType === 'sticky'
          ? { text: '', color: 'yellow' }
          : {
              icon: item.icon,
              color: item.color,
              type: item.type,
              outputs: item.outputs,
            },
    };

    this.nodes.update((ns) => [...ns, node]);
    this.paletteOpen.set(false);
  }

  updateNodeData(nodeId: string, data: unknown): void {
    this.nodes.update((ns) =>
      ns.map((n) => (n.id === nodeId ? { ...n, data } : n)),
    );
  }
}
