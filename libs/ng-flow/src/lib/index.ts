// Main component
export { NgFlowComponent } from './components/ng-flow/ng-flow.component';

// Background
export { BackgroundComponent } from './components/background/background.component';
export type { BackgroundVariant } from './components/background/background.component';

// Node Resizer
export { NodeResizerComponent } from './components/node-resizer/node-resizer.component';
export { ResizeControlComponent } from './components/node-resizer/resize-control.component';
export type { ResizeControlVariant, ResizeControlPosition, ResizeParams, ResizeParamsWithDirection } from './components/node-resizer/resize-control.component';

// Sub-components
export { HandleComponent } from './components/handle/handle.component';
export { PanelComponent } from './components/panel/panel.component';
export type { PanelPosition } from './components/panel/panel.component';

// MiniMap
export { MiniMapComponent } from './components/minimap/minimap.component';
export { MiniMapNodeComponent } from './components/minimap/minimap-node.component';
export type { MiniMapNodeFunc, MiniMapNodeClickEvent, MiniMapClickEvent } from './components/minimap/minimap.component';
export type { ShapeRendering } from './components/minimap/minimap-node.component';

// Edge components
export { BaseEdgeComponent } from './components/edges/base-edge.component';
export { BezierEdgeComponent } from './components/edges/bezier-edge.component';
export { StraightEdgeComponent } from './components/edges/straight-edge.component';
export { StepEdgeComponent } from './components/edges/step-edge.component';
export { SmoothStepEdgeComponent } from './components/edges/smooth-step-edge.component';
export { SimpleBezierEdgeComponent } from './components/edges/simple-bezier-edge.component';

// Node components
export { DefaultNodeComponent } from './components/nodes/default-node.component';
export { InputNodeComponent } from './components/nodes/input-node.component';
export { OutputNodeComponent } from './components/nodes/output-node.component';

// Services
export { FlowService } from './services/flow.service';

// Types
export * from './types';

// Utils
export {
  // Graph utils
  addEdge,
  updateEdge,
  connectionExists,
  getOutgoers,
  getIncomers,
  getConnectedEdges,
  getRectOfNodes,
  getNodesInside,
  getTransformForBounds,
  getBoundsofRects,
  pointToRendererPoint,
  rendererPointToPoint,
  parseNode,
  parseEdge,
  isNode,
  isEdge,
  isGraphNode,
  isGraphEdge,
  clamp,
  wheelDelta,
  isMacOs,
  getMarkerId,
  snapPosition,
} from './utils/graph';

export {
  applyChanges,
  applyNodeChanges,
  applyEdgeChanges,
  createSelectionChange,
  createAdditionChange,
  createNodeRemoveChange,
  createEdgeRemoveChange,
  getSelectionChanges,
} from './utils/changes';

// Edge path utilities
export { getBezierPath } from './utils/edges/bezier';
export { getSimpleBezierPath } from './utils/edges/simple-bezier';
export { getStraightPath } from './utils/edges/straight';
export { getSmoothStepPath, getStepPath } from './utils/edges/smooth-step';
export { getSimpleEdgeCenter, getBezierEdgeCenter } from './utils/edges/general';
