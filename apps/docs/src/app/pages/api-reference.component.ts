import { Component } from '@angular/core';

@Component({
  selector: 'app-docs-api',
  standalone: true,
  imports: [],
  template: `
    <div class="page">
      <h1>API Reference</h1>
      <p class="tagline">Complete reference for all inputs, outputs, methods, and types.</p>

      <!-- ── NgFlowComponent Inputs ─────────────────────────────────── -->
      <h2>NgFlowComponent Inputs</h2>
      <table>
        <thead>
          <tr><th>Input</th><th>Type</th><th>Default</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>nodes</code></td><td><code>Node[]</code></td><td><code>[]</code></td><td>Array of nodes to render.</td></tr>
          <tr><td><code>edges</code></td><td><code>Edge[]</code></td><td><code>[]</code></td><td>Array of edges to render.</td></tr>
          <tr><td><code>minZoom</code></td><td><code>number</code></td><td><code>0.5</code></td><td>Minimum zoom level.</td></tr>
          <tr><td><code>maxZoom</code></td><td><code>number</code></td><td><code>2</code></td><td>Maximum zoom level.</td></tr>
          <tr><td><code>defaultViewport</code></td><td><code>Partial&lt;ViewportTransform&gt;</code></td><td><code>&#123;x:0,y:0,zoom:1&#125;</code></td><td>Initial viewport transform.</td></tr>
          <tr><td><code>snapToGrid</code></td><td><code>boolean</code></td><td><code>false</code></td><td>Snap nodes to grid while dragging.</td></tr>
          <tr><td><code>snapGrid</code></td><td><code>[number,number]</code></td><td><code>[15,15]</code></td><td>Grid cell size when snapping is enabled.</td></tr>
          <tr><td><code>nodesDraggable</code></td><td><code>boolean</code></td><td><code>true</code></td><td>Allow dragging all nodes.</td></tr>
          <tr><td><code>nodesConnectable</code></td><td><code>boolean</code></td><td><code>true</code></td><td>Allow creating new connections.</td></tr>
          <tr><td><code>elementsSelectable</code></td><td><code>boolean</code></td><td><code>true</code></td><td>Allow selecting nodes and edges.</td></tr>
          <tr><td><code>fitViewOnInit</code></td><td><code>boolean</code></td><td><code>false</code></td><td>Auto fit all nodes into view on first render.</td></tr>
          <tr><td><code>panOnDrag</code></td><td><code>boolean</code></td><td><code>true</code></td><td>Pan the canvas by dragging the background.</td></tr>
          <tr><td><code>zoomOnScroll</code></td><td><code>boolean</code></td><td><code>true</code></td><td>Zoom with the mouse wheel.</td></tr>
          <tr><td><code>zoomOnDoubleClick</code></td><td><code>boolean</code></td><td><code>true</code></td><td>Zoom in on canvas double-click.</td></tr>
          <tr><td><code>connectionMode</code></td><td><code>ConnectionMode</code></td><td><code>Loose</code></td><td>Validation strategy for new connections.</td></tr>
          <tr><td><code>connectionRadius</code></td><td><code>number</code></td><td><code>20</code></td><td>Pixel radius for snapping to a nearby handle.</td></tr>
          <tr><td><code>deleteKeyCode</code></td><td><code>string | null</code></td><td><code>'Backspace'</code></td><td>Key that deletes selected elements.</td></tr>
          <tr><td><code>applyDefault</code></td><td><code>boolean</code></td><td><code>true</code></td><td>Auto-apply connections when <code>(connect)</code> fires.</td></tr>
          <tr><td><code>defaultMarkerColor</code></td><td><code>string</code></td><td><code>'#b1b1b7'</code></td><td>Default edge arrow colour.</td></tr>
          <tr><td><code>elevateEdgesOnSelect</code></td><td><code>boolean</code></td><td><code>false</code></td><td>Raise z-index of selected edges above others.</td></tr>
          <tr><td><code>autoPanOnNodeDrag</code></td><td><code>boolean</code></td><td><code>true</code></td><td>Auto-pan when dragging a node near the canvas edge.</td></tr>
        </tbody>
      </table>

      <!-- ── NgFlowComponent Outputs ────────────────────────────────── -->
      <h2>NgFlowComponent Outputs</h2>
      <table>
        <thead>
          <tr><th>Output</th><th>Payload type</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>(connect)</code></td><td><code>Connection</code></td><td>Fired when a new connection is created.</td></tr>
          <tr><td><code>(nodesChange)</code></td><td><code>NodeChange[]</code></td><td>Node position, selection, or removal changes.</td></tr>
          <tr><td><code>(edgesChange)</code></td><td><code>EdgeChange[]</code></td><td>Edge add, remove, or selection changes.</td></tr>
          <tr><td><code>(nodeClick)</code></td><td><code>NodeMouseEvent</code></td><td>A node was clicked.</td></tr>
          <tr><td><code>(nodeDoubleClick)</code></td><td><code>NodeMouseEvent</code></td><td>A node was double-clicked.</td></tr>
          <tr><td><code>(nodeDragStart)</code></td><td><code>NodeDragEvent</code></td><td>A node drag started.</td></tr>
          <tr><td><code>(nodeDrag)</code></td><td><code>NodeDragEvent</code></td><td>A node is being dragged.</td></tr>
          <tr><td><code>(nodeDragStop)</code></td><td><code>NodeDragEvent</code></td><td>A node drag ended.</td></tr>
          <tr><td><code>(paneClick)</code></td><td><code>MouseEvent</code></td><td>The canvas background was clicked.</td></tr>
          <tr><td><code>(viewportChange)</code></td><td><code>ViewportTransform</code></td><td>The viewport was panned or zoomed.</td></tr>
          <tr><td><code>(init)</code></td><td><code>FlowService</code></td><td>Fires after the flow is initialised; provides the FlowService instance.</td></tr>
        </tbody>
      </table>

      <!-- ── NgFlowComponent Methods ────────────────────────────────── -->
      <h2>NgFlowComponent Methods</h2>
      <p>Accessed via <code>&#64;ViewChild(NgFlowComponent)</code>.</p>
      <table>
        <thead>
          <tr><th>Method</th><th>Returns</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>getNodes()</code></td><td><code>GraphNode[]</code></td><td>All nodes in the current state.</td></tr>
          <tr><td><code>getEdges()</code></td><td><code>GraphEdge[]</code></td><td>All edges in the current state.</td></tr>
          <tr><td><code>getNode(id)</code></td><td><code>GraphNode | undefined</code></td><td>Look up a single node by ID.</td></tr>
          <tr><td><code>addNodes(nodes)</code></td><td><code>void</code></td><td>Append one or more nodes.</td></tr>
          <tr><td><code>addEdges(edges)</code></td><td><code>void</code></td><td>Append one or more edges.</td></tr>
          <tr><td><code>removeNodes(ids)</code></td><td><code>void</code></td><td>Remove nodes by ID array.</td></tr>
          <tr><td><code>removeEdges(ids)</code></td><td><code>void</code></td><td>Remove edges by ID array.</td></tr>
          <tr><td><code>fitView(params?)</code></td><td><code>Promise&lt;boolean&gt;</code></td><td>Fit all (or selected) nodes into view.</td></tr>
          <tr><td><code>zoomIn()</code></td><td><code>Promise&lt;boolean&gt;</code></td><td>Zoom in by one step.</td></tr>
          <tr><td><code>zoomOut()</code></td><td><code>Promise&lt;boolean&gt;</code></td><td>Zoom out by one step.</td></tr>
          <tr><td><code>zoomTo(level)</code></td><td><code>Promise&lt;boolean&gt;</code></td><td>Set an absolute zoom level.</td></tr>
          <tr><td><code>setViewport(vp)</code></td><td><code>void</code></td><td>Set viewport <code>&#123; x, y, zoom &#125;</code> directly.</td></tr>
          <tr><td><code>getViewport()</code></td><td><code>ViewportTransform</code></td><td>Read the current viewport transform.</td></tr>
          <tr><td><code>project(position)</code></td><td><code>XYPosition</code></td><td>Convert screen coordinates to flow coordinates.</td></tr>
          <tr><td><code>toObject()</code></td><td><code>FlowExportObject</code></td><td>Export the current nodes, edges, and viewport.</td></tr>
        </tbody>
      </table>

      <!-- ── HandleComponent Inputs ─────────────────────────────────── -->
      <h2>HandleComponent Inputs</h2>
      <table>
        <thead>
          <tr><th>Input</th><th>Type</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>type</code></td><td><code>'source' | 'target'</code></td><td>Whether this handle emits or receives connections.</td></tr>
          <tr><td><code>position</code></td><td><code>Position</code></td><td>Which side of the node the handle appears on.</td></tr>
          <tr><td><code>id</code></td><td><code>string | null</code></td><td>Unique identifier — required for nodes with multiple same-type handles.</td></tr>
          <tr><td><code>connectable</code></td><td><code>boolean | number | 'single'</code></td><td>Maximum allowed connections (<code>true</code> = unlimited).</td></tr>
          <tr><td><code>connectableStart</code></td><td><code>boolean</code></td><td>Whether a drag can originate from this handle.</td></tr>
          <tr><td><code>connectableEnd</code></td><td><code>boolean</code></td><td>Whether a drag can be completed on this handle.</td></tr>
        </tbody>
      </table>

      <!-- ── Node Interface ─────────────────────────────────────────── -->
      <h2>Node Interface</h2>
      <pre class="code-block">{{ nodeInterface }}</pre>

      <!-- ── Edge Interface ─────────────────────────────────────────── -->
      <h2>Edge Interface</h2>
      <pre class="code-block">{{ edgeInterface }}</pre>
    </div>
  `,
  styles: [`
    .page { padding: 32px 40px; max-width: 860px; }
    h1 { font-size: 26px; font-weight: 700; color: #f1f5f9; margin: 0 0 8px; }
    .tagline { color: #64748b; margin: 0 0 32px; font-size: 15px; }
    h2 { font-size: 18px; font-weight: 600; color: #e2e8f0; margin: 32px 0 12px; padding-top: 24px; border-top: 1px solid #1e2333; }
    h2:first-of-type { border-top: none; padding-top: 0; margin-top: 0; }
    p { color: #94a3b8; line-height: 1.7; margin: 0 0 16px; }
    code { background: #1e2333; color: #a5d6ff; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0 24px; }
    th { text-align: left; padding: 8px 12px; background: #0a0c12; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #1e2333; }
    td { padding: 10px 12px; color: #94a3b8; border-bottom: 1px solid #1a1f2e; font-size: 13px; }
    td code { background: #1e2333; color: #a5d6ff; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 12px; }
    tr:last-child td { border-bottom: none; }
  `],
})
export class ApiReferenceComponent {
  readonly nodeInterface = `interface Node {
  id: string;
  position: { x: number; y: number };
  type?: 'default' | 'input' | 'output' | string;
  label?: string | VNode;
  template?: ComponentType;  // Custom Angular component
  data?: Record<string, any>;
  style?: CSSStyleDeclaration;
  class?: string;
  hidden?: boolean;
  draggable?: boolean;
  selectable?: boolean;
  connectable?: boolean;
  sourcePosition?: Position;  // Default handle position (top/bottom/left/right)
  targetPosition?: Position;
  parentNode?: string;        // For sub-flows/nested nodes
  zIndex?: number;
}`;

  readonly edgeInterface = `interface Edge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  type?: 'default' | 'straight' | 'step' | 'smoothstep' | 'simple-bezier' | string;
  label?: string;
  animated?: boolean;
  hidden?: boolean;
  style?: CSSStyleDeclaration;
  labelStyle?: CSSStyleDeclaration;
  markerStart?: EdgeMarkerType;
  markerEnd?: EdgeMarkerType;
  zIndex?: number;
}`;
}
