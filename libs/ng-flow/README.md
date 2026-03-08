# ng-flow

An Angular adaptation of [vue-flow](https://github.com/bcakmakoglu/vue-flow) — a highly customizable diagramming engine for building flowcharts, graphs, and interactive diagrams.

## Features

- **Drag & Drop nodes** — fully interactive node dragging
- **Pan & Zoom viewport** — D3-powered zoom/pan with full control
- **Custom node types** — bring your own Angular components as nodes
- **Custom edge types** — build your own edge renderers
- **Connection handling** — click or drag handles to create connections
- **Selection** — shift-click or marquee select nodes
- **Built-in edge types** — Bezier, SmoothStep, Step, Straight, SimpleBezier
- **Markers** — Arrow and ArrowClosed edge markers
- **Panel** — floating UI overlays, not affected by zoom/pan
- **Angular Signals** — reactive state management via Angular signals
- **Full TypeScript** — 1:1 type coverage with vue-flow types

## Installation

```bash
npm install ng-flow d3-zoom d3-selection d3-transition
```

Import the CSS in your `styles.css`:

```css
@import 'ng-flow/styles';
```

## Basic Usage

```html
<!-- app.component.html -->
<lib-ng-flow
  [nodes]="nodes"
  [edges]="edges"
  (connect)="onConnect($event)"
  (nodeClick)="onNodeClick($event)"
  style="width: 100%; height: 500px"
/>
```

```typescript
// app.component.ts
import { Component } from '@angular/core';
import { NgFlowComponent } from 'ng-flow';
import type { Node, Edge, Connection } from 'ng-flow';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgFlowComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  nodes: Node[] = [
    { id: '1', position: { x: 100, y: 100 }, label: 'Node 1', type: 'input' },
    { id: '2', position: { x: 300, y: 200 }, label: 'Node 2' },
    { id: '3', position: { x: 100, y: 300 }, label: 'Node 3', type: 'output' },
  ];

  edges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2' },
  ];

  onConnect(connection: Connection): void {
    // Handle new connection
  }

  onNodeClick({ node }: { node: any }): void {
    console.log('clicked node', node);
  }
}
```

## Custom Nodes

Create an Angular component and pass it as `template` on a node:

```typescript
// my-custom-node.component.ts
@Component({
  selector: 'app-my-node',
  standalone: true,
  imports: [HandleComponent],
  template: `
    <lib-handle type="target" [position]="Position.Top" />
    <div class="my-custom-content">{{ label() }}</div>
    <lib-handle type="source" [position]="Position.Bottom" />
  `,
})
export class MyCustomNodeComponent {
  readonly id = input.required<string>();
  readonly label = input<string>();
  readonly data = input<any>();
  readonly Position = Position;
}
```

```typescript
nodes: Node[] = [
  {
    id: '1',
    position: { x: 100, y: 100 },
    label: 'Custom Node',
    template: MyCustomNodeComponent,
  },
];
```

## Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `nodes` | `Node[]` | `[]` | Array of nodes |
| `edges` | `Edge[]` | `[]` | Array of edges |
| `minZoom` | `number` | `0.5` | Minimum zoom level |
| `maxZoom` | `number` | `2` | Maximum zoom level |
| `snapToGrid` | `boolean` | `false` | Enable grid snapping |
| `snapGrid` | `[number, number]` | `[15, 15]` | Grid size |
| `nodesDraggable` | `boolean` | `true` | Enable node dragging |
| `nodesConnectable` | `boolean` | `true` | Enable connections |
| `elementsSelectable` | `boolean` | `true` | Enable selection |
| `panOnDrag` | `boolean` | `true` | Pan by dragging |
| `zoomOnScroll` | `boolean` | `true` | Zoom on scroll |
| `fitViewOnInit` | `boolean` | `false` | Fit view on init |
| `defaultViewport` | `ViewportTransform` | `{x:0,y:0,zoom:1}` | Initial viewport |
| `connectionMode` | `ConnectionMode` | `Loose` | Connection mode |
| `selectionMode` | `SelectionMode` | `Full` | Selection mode |
| `deleteKeyCode` | `string\|null` | `'Backspace'` | Delete key |
| `selectionKeyCode` | `string\|boolean\|null` | `'Shift'` | Selection key |

## Outputs

| Output | Payload | Description |
|--------|---------|-------------|
| `connect` | `Connection` | New connection created |
| `connectStart` | `OnConnectStartParams` | Connection drag started |
| `connectEnd` | `MouseEvent` | Connection drag ended |
| `nodeClick` | `NodeMouseEvent` | Node clicked |
| `nodeDoubleClick` | `NodeMouseEvent` | Node double-clicked |
| `nodeDragStart` | `NodeDragEvent` | Node drag started |
| `nodeDrag` | `NodeDragEvent` | Node dragging |
| `nodeDragStop` | `NodeDragEvent` | Node drag stopped |
| `nodesInitialized` | `GraphNode[]` | Nodes measured |
| `edgeClick` | `EdgeMouseEvent` | Edge clicked |
| `paneClick` | `MouseEvent` | Pane clicked |
| `nodesChange` | `NodeChange[]` | Node changes |
| `edgesChange` | `EdgeChange[]` | Edge changes |
| `moveStart` | `{event, flowTransform}` | Pan/zoom started |
| `move` | `{event, flowTransform}` | Pan/zoom ongoing |
| `moveEnd` | `{event, flowTransform}` | Pan/zoom ended |
| `viewportChange` | `ViewportTransform` | Viewport changed |
| `init` | `FlowService` | Flow initialized |

## Public API

Access via `@ViewChild(NgFlowComponent)`:

```typescript
@ViewChild(NgFlowComponent) flow!: NgFlowComponent;

// Viewport
this.flow.fitView({ padding: 20 });
this.flow.zoomIn();
this.flow.zoomOut();
this.flow.setViewport({ x: 0, y: 0, zoom: 1 });
this.flow.setCenter(400, 300, { zoom: 1.5 });

// Nodes & Edges
this.flow.addNodes([...]);
this.flow.addEdges([...]);
this.flow.removeNodes(['id1']);
this.flow.removeEdges(['id1']);
this.flow.updateNode('id1', { label: 'Updated' });
const node = this.flow.getNode('id1');

// Export/Import
const obj = this.flow.toObject();
this.flow.fromObject(obj);
```

## Utility Functions

```typescript
import {
  addEdge,
  updateEdge,
  getOutgoers,
  getIncomers,
  getConnectedEdges,
  applyNodeChanges,
  applyEdgeChanges,
  getBezierPath,
  getStraightPath,
  getSmoothStepPath,
  getStepPath,
  getSimpleBezierPath,
} from 'ng-flow';
```

## Components

| Component | Selector | Description |
|-----------|----------|-------------|
| `NgFlowComponent` | `lib-ng-flow` | Main flow canvas |
| `HandleComponent` | `lib-handle` | Connection handle for custom nodes |
| `PanelComponent` | `lib-panel` | Floating panel (not affected by zoom) |
| `BaseEdgeComponent` | `lib-base-edge` | Base edge for custom edges |
| `BezierEdgeComponent` | `lib-bezier-edge` | Bezier curve edge |
| `StraightEdgeComponent` | `lib-straight-edge` | Straight line edge |
| `StepEdgeComponent` | `lib-step-edge` | Step/orthogonal edge |
| `SmoothStepEdgeComponent` | `lib-smooth-step-edge` | Smooth step edge |
| `SimpleBezierEdgeComponent` | `lib-simple-bezier-edge` | Simple bezier edge |
