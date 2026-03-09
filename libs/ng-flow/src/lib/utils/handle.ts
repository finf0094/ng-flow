/**
 * Handle utilities – mirrors vue-flow utils/handle.ts
 *
 * getClosestHandle   – find the nearest handle within connectionRadius
 * isValidHandle      – check if a connection to a handle is valid
 * getConnectionStatus – derive 'valid' | 'invalid' | null
 * resetRecentHandle  – remove CSS highlight classes from a handle element
 */

import type {
  Connection,
  ConnectionStatus,
  GraphEdge,
  HandleElement,
  HandleType,
  NodeLookup,
  ValidConnectionFunc,
  XYPosition,
} from '../types';
import { ConnectionMode, Position } from '../types';

// ─── helpers ────────────────────────────────────────────────────────

const oppositePosition: Record<Position, Position> = {
  [Position.Left]: Position.Right,
  [Position.Right]: Position.Left,
  [Position.Top]: Position.Bottom,
  [Position.Bottom]: Position.Top,
};

export { oppositePosition };

/**
 * Remove visual feedback classes from a handle DOM node.
 */
export function resetRecentHandle(el: Element | null): void {
  el?.classList.remove(
    'connecting',
    'vue-flow__handle-connecting',
    'valid',
    'vue-flow__handle-valid',
  );
}

// ─── getClosestHandle ───────────────────────────────────────────────

/**
 * Iterate all handles in the node lookup and return the one closest to
 * `position` that is within `connectionRadius`, skipping the handle we
 * are dragging from.
 *
 * When several handles share the same minimal distance the opposite
 * handle type is preferred (source↔target).
 */
export function getClosestHandle(
  position: XYPosition,
  connectionRadius: number,
  nodeLookup: NodeLookup,
  fromHandle: { nodeId: string; type: HandleType; id?: string | null },
): HandleElement | null {
  let closestHandles: HandleElement[] = [];
  let minDistance = Number.POSITIVE_INFINITY;

  for (const node of nodeLookup.values()) {
    const allHandles = [
      ...(node.handleBounds?.source ?? []),
      ...(node.handleBounds?.target ?? []),
    ];

    for (const handle of allHandles) {
      // skip the handle we are dragging from
      if (
        handle.nodeId === fromHandle.nodeId &&
        handle.type === fromHandle.type &&
        handle.id === fromHandle.id
      ) {
        continue;
      }

      // absolute position – our handle.x/y are already centre offsets
      const hx = node.computedPosition.x + handle.x;
      const hy = node.computedPosition.y + handle.y;
      const distance = Math.sqrt(
        (hx - position.x) ** 2 + (hy - position.y) ** 2,
      );

      if (distance > connectionRadius) continue;

      if (distance < minDistance) {
        closestHandles = [{ ...handle, x: hx, y: hy }];
        minDistance = distance;
      } else if (distance === minDistance) {
        closestHandles.push({ ...handle, x: hx, y: hy });
      }
    }
  }

  if (!closestHandles.length) return null;

  // prefer opposite handle type
  if (closestHandles.length > 1) {
    const opposite = fromHandle.type === 'source' ? 'target' : 'source';
    return (
      closestHandles.find((h) => h.type === opposite) ?? closestHandles[0]
    );
  }

  return closestHandles[0];
}

// ─── isValidHandle ──────────────────────────────────────────────────

export interface ValidateHandleParams {
  handle: HandleElement | null;
  connectionMode: ConnectionMode;
  fromNodeId: string;
  fromHandleId: string | null;
  fromType: HandleType;
  isValidConnection: ValidConnectionFunc | null;
  nodeLookup: NodeLookup;
  edges: GraphEdge[];
}

export interface ValidateHandleResult {
  isValid: boolean;
  connection: Connection | null;
  toHandle: HandleElement | null;
}

export function isValidHandle(
  params: ValidateHandleParams,
): ValidateHandleResult {
  const {
    handle,
    connectionMode,
    fromNodeId,
    fromHandleId,
    fromType,
    isValidConnection,
    nodeLookup,
    edges,
  } = params;

  const result: ValidateHandleResult = {
    isValid: false,
    connection: null,
    toHandle: null,
  };

  if (!handle) return result;

  const isTarget = fromType === 'target';
  const handleNodeId = handle.nodeId;
  const handleId = handle.id ?? null;
  const handleType = handle.type;

  const connection: Connection = {
    source: isTarget ? handleNodeId : fromNodeId,
    sourceHandle: isTarget ? handleId : fromHandleId,
    target: isTarget ? fromNodeId : handleNodeId,
    targetHandle: isTarget ? fromHandleId : handleId,
  };

  result.connection = connection;

  // In strict mode don't allow same-type connections
  const isConnectable =
    connectionMode === ConnectionMode.Strict
      ? (isTarget && handleType === 'source') ||
        (!isTarget && handleType === 'target')
      : handleNodeId !== fromNodeId || handleId !== fromHandleId;

  if (!isConnectable) return result;

  // Resolve the toHandle with absolute position
  result.toHandle = handle;

  // Check user-provided isValidConnection
  if (isValidConnection) {
    const sourceNode = nodeLookup.get(connection.source);
    const targetNode = nodeLookup.get(connection.target);
    if (sourceNode && targetNode) {
      result.isValid = isValidConnection(connection, {
        edges,
        nodes: Array.from(nodeLookup.values()),
        sourceNode,
        targetNode,
      });
      return result;
    }
  }

  result.isValid = true;
  return result;
}

// ─── getConnectionStatus ────────────────────────────────────────────

export function getConnectionStatus(
  isInsideConnectionRadius: boolean,
  isHandleValid: boolean | null,
): ConnectionStatus | null {
  if (isHandleValid) return 'valid';
  if (isInsideConnectionRadius && !isHandleValid) return 'invalid';
  return null;
}
