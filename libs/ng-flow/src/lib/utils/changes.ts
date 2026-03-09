import type {
  EdgeAddChange,
  EdgeChange,
  EdgeRemoveChange,
  EdgeSelectionChange,
  ElementChange,
  FlowElement,
  GraphEdge,
  GraphNode,
  NodeAddChange,
  NodeChange,
  NodeRemoveChange,
  NodeSelectionChange,
} from '../types';
import { isGraphNode } from './graph';

export function applyChanges<
  T extends FlowElement = FlowElement,
  C extends ElementChange = T extends GraphNode ? NodeChange : EdgeChange,
>(changes: C[], elements: T[]): T[] {
  const addRemoveChanges = changes.filter((c) => c.type === 'add' || c.type === 'remove') as (
    | NodeAddChange
    | EdgeAddChange
    | NodeRemoveChange
    | EdgeRemoveChange
  )[];

  let result = [...elements];

  for (const change of addRemoveChanges) {
    if (change.type === 'add') {
      const index = result.findIndex((el) => el.id === (change as NodeAddChange).item.id);
      if (index === -1) {
        result.push((change as NodeAddChange).item as unknown as T);
      }
    } else if (change.type === 'remove') {
      result = result.filter((el) => el.id !== (change as NodeRemoveChange).id);
    }
  }

  return result.map((element) => {
    let changed = false;
    const updated = { ...element } as any;

    for (const currentChange of changes) {
      if ((currentChange as any).id !== element.id) {
        continue;
      }

      switch (currentChange.type) {
        case 'select':
          updated.selected = (currentChange as NodeSelectionChange).selected;
          changed = true;
          break;
        case 'position':
          if (isGraphNode(element)) {
            const posChange = currentChange as import('../types').NodePositionChange;
            if (typeof posChange.position !== 'undefined') {
              updated.position = posChange.position;
              changed = true;
            }
            if (typeof posChange.dragging !== 'undefined') {
              updated.dragging = posChange.dragging;
              changed = true;
            }
          }
          break;
        case 'dimensions':
          if (isGraphNode(element)) {
            const dimChange = currentChange as import('../types').NodeDimensionChange;
            if (typeof dimChange.dimensions !== 'undefined') {
              updated.dimensions = dimChange.dimensions;
              changed = true;
            }
            if (typeof dimChange.updateStyle !== 'undefined' && dimChange.updateStyle) {
              updated.style = {
                ...(updated.style || {}),
                width: `${dimChange.dimensions?.width}px`,
                height: `${dimChange.dimensions?.height}px`,
              };
              changed = true;
            }
            if (typeof dimChange.resizing !== 'undefined') {
              updated.resizing = dimChange.resizing;
              changed = true;
            }
          }
          break;
      }
    }

    return changed ? (updated as T) : element;
  });
}

export function applyEdgeChanges(changes: EdgeChange[], edges: GraphEdge[]): GraphEdge[] {
  return applyChanges(changes, edges);
}

export function applyNodeChanges(changes: NodeChange[], nodes: GraphNode[]): GraphNode[] {
  return applyChanges(changes, nodes);
}

export function createSelectionChange(id: string, selected: boolean): NodeSelectionChange {
  return { id, type: 'select', selected };
}

export function createAdditionChange<T extends GraphNode | GraphEdge>(item: T) {
  return { item, type: 'add' as const };
}

export function createNodeRemoveChange(id: string): NodeRemoveChange {
  return { id, type: 'remove' };
}

export function createEdgeRemoveChange(
  id: string,
  source: string,
  target: string,
  sourceHandle?: string | null,
  targetHandle?: string | null,
): EdgeRemoveChange {
  return {
    id,
    source,
    target,
    sourceHandle: sourceHandle || null,
    targetHandle: targetHandle || null,
    type: 'remove',
  };
}

export function getSelectionChanges(
  items: Map<string, any>,
  selectedIds: Set<string> = new Set(),
  mutateItem = false,
): NodeSelectionChange[] {
  const changes: NodeSelectionChange[] = [];
  for (const [id, item] of items) {
    const willBeSelected = selectedIds.has(id);
    if (!(item.selected === undefined && !willBeSelected) && item.selected !== willBeSelected) {
      if (mutateItem) {
        item.selected = willBeSelected;
      }
      changes.push(createSelectionChange(item.id, willBeSelected));
    }
  }
  return changes;
}
