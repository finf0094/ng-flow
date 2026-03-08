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

  for (const change of addRemoveChanges) {
    if (change.type === 'add') {
      const index = elements.findIndex((el) => el.id === (change as NodeAddChange).item.id);
      if (index === -1) {
        elements.push((change as NodeAddChange).item as unknown as T);
      }
    } else if (change.type === 'remove') {
      const index = elements.findIndex((el) => el.id === (change as NodeRemoveChange).id);
      if (index !== -1) {
        elements.splice(index, 1);
      }
    }
  }

  const elementIds = elements.map((el) => el.id);

  for (const element of elements) {
    for (const currentChange of changes) {
      if ((currentChange as any).id !== element.id) {
        continue;
      }

      switch (currentChange.type) {
        case 'select':
          element.selected = (currentChange as NodeSelectionChange).selected;
          break;
        case 'position':
          if (isGraphNode(element as any)) {
            const posChange = currentChange as import('../types').NodePositionChange;
            if (typeof posChange.position !== 'undefined') {
              (element as unknown as GraphNode).position = posChange.position;
            }
            if (typeof posChange.dragging !== 'undefined') {
              (element as unknown as GraphNode).dragging = posChange.dragging!;
            }
          }
          break;
        case 'dimensions':
          if (isGraphNode(element as any)) {
            const dimChange = currentChange as import('../types').NodeDimensionChange;
            if (typeof dimChange.dimensions !== 'undefined') {
              (element as unknown as GraphNode).dimensions = dimChange.dimensions!;
            }
            if (typeof dimChange.updateStyle !== 'undefined' && dimChange.updateStyle) {
              (element as unknown as GraphNode).style = {
                ...((element as unknown as GraphNode).style || {}),
                width: `${dimChange.dimensions?.width}px`,
                height: `${dimChange.dimensions?.height}px`,
              };
            }
            if (typeof dimChange.resizing !== 'undefined') {
              (element as unknown as GraphNode).resizing = dimChange.resizing!;
            }
          }
          break;
      }
    }
  }

  return elements;
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
