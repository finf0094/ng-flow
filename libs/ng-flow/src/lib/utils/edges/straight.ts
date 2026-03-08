import type { EdgePathParams } from './general';
import { getSimpleEdgeCenter } from './general';

export interface GetStraightPathParams {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
}

export function getStraightPath(straightEdgeParams: GetStraightPathParams): EdgePathParams {
  const { sourceX, sourceY, targetX, targetY } = straightEdgeParams;
  const [centerX, centerY, offsetX, offsetY] = getSimpleEdgeCenter({ sourceX, sourceY, targetX, targetY });
  return [`M ${sourceX},${sourceY}L ${targetX},${targetY}`, centerX, centerY, offsetX, offsetY];
}
