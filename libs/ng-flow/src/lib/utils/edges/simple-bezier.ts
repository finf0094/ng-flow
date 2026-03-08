import { Position } from '../../types';
import type { EdgePathParams } from './general';
import { getBezierEdgeCenter } from './general';

export interface GetSimpleBezierPathParams {
  sourceX: number;
  sourceY: number;
  sourcePosition?: Position;
  targetX: number;
  targetY: number;
  targetPosition?: Position;
}

function getControl({
  pos,
  x1,
  y1,
  x2,
  y2,
}: {
  pos: Position;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}): [number, number] {
  let ctX: number, ctY: number;
  switch (pos) {
    case Position.Left:
    case Position.Right:
      ctX = 0.5 * (x1 + x2);
      ctY = y1;
      break;
    case Position.Top:
    case Position.Bottom:
    default:
      ctX = x1;
      ctY = 0.5 * (y1 + y2);
      break;
  }
  return [ctX!, ctY!];
}

export function getSimpleBezierPath(simpleBezierPathParams: GetSimpleBezierPathParams): EdgePathParams {
  const {
    sourceX,
    sourceY,
    sourcePosition = Position.Bottom,
    targetX,
    targetY,
    targetPosition = Position.Top,
  } = simpleBezierPathParams;

  const [sourceControlX, sourceControlY] = getControl({
    pos: sourcePosition,
    x1: sourceX,
    y1: sourceY,
    x2: targetX,
    y2: targetY,
  });
  const [targetControlX, targetControlY] = getControl({
    pos: targetPosition,
    x1: targetX,
    y1: targetY,
    x2: sourceX,
    y2: sourceY,
  });

  const [centerX, centerY, offsetX, offsetY] = getBezierEdgeCenter({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourceControlX,
    sourceControlY,
    targetControlX,
    targetControlY,
  });

  return [
    `M${sourceX},${sourceY} C${sourceControlX},${sourceControlY} ${targetControlX},${targetControlY} ${targetX},${targetY}`,
    centerX,
    centerY,
    offsetX,
    offsetY,
  ];
}
