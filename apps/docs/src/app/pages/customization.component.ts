import { Component } from '@angular/core';

@Component({
  selector: 'app-docs-customization',
  standalone: true,
  template: `
    <div class="page">
      <h1>Customization</h1>
      <p class="tagline">
        Customize edges, handles, and connection lines to match your application's design.
      </p>

      <!-- ── Custom Edge Appearance ─────────────────────────────── -->
      <h2>Custom Edge Appearance</h2>
      <p>
        Style edges using the <code>style</code>, <code>class</code>, <code>label</code>,
        <code>labelStyle</code>, <code>animated</code>, and <code>markerEnd</code> /
        <code>markerStart</code> properties on an edge object.
      </p>
      <pre><code>{{ edgeExample }}</code></pre>
      <p>
        Use <code>MarkerType.ArrowClosed</code> or <code>MarkerType.Arrow</code> for built-in
        arrow markers. For full control, pass an <code>EdgeMarker</code> object with
        <code>type</code>, <code>color</code>, <code>width</code>, <code>height</code>, and
        <code>strokeWidth</code>.
      </p>

      <!-- ── Custom Handle Styling ──────────────────────────────── -->
      <h2>Custom Handle Styling</h2>
      <p>
        Handles use the class <code>.vue-flow__handle</code> and can be styled via CSS.
        Each handle also gets the class <code>source</code> or <code>target</code> and a
        position class like <code>left</code>, <code>right</code>, <code>top</code>, or
        <code>bottom</code>.
      </p>
      <pre><code>{{ handleCss }}</code></pre>
      <p>
        To add multiple handles on a node, give each a unique <code>id</code> and reference
        it via <code>sourceHandle</code> / <code>targetHandle</code> on the edge.
      </p>
      <pre><code>{{ handleTemplate }}</code></pre>

      <!-- ── ConnectionLine Options ─────────────────────────────── -->
      <h2>ConnectionLine Options</h2>
      <p>
        The temporary line drawn while dragging from a handle can be customized via the
        <code>[connectionLineOptions]</code> input on <code>&lt;lib-ng-flow&gt;</code>.
      </p>
      <pre><code>{{ connLineExample }}</code></pre>
      <p>
        Supported options: <code>type</code> (Bezier, Straight, SmoothStep, Step, SimpleBezier),
        <code>style</code> (stroke, strokeDasharray, etc.), <code>markerEnd</code>, and
        <code>markerStart</code>.
      </p>

      <!-- ── Note on Custom Templates ──────────────────────────── -->
      <h2>Custom Node Templates</h2>
      <p>
        Custom node templates are fully supported via the <code>template</code> property on
        a <code>Node</code> object. Set it to any Angular component type:
      </p>
      <pre><code>{{ nodeTemplateExample }}</code></pre>
      <p>
        <strong>Note:</strong> Unlike vue-flow's component registry for edges, ng-flow does
        not currently support custom edge templates. Edge customization is done via the
        properties listed above (<code>style</code>, <code>class</code>, <code>label</code>,
        <code>animated</code>, markers).
      </p>
    </div>
  `,
  styles: [`
    .page { max-width: 800px; margin: 0 auto; padding: 40px 24px; }
    h1 { font-size: 28px; font-weight: 700; color: #f1f5f9; margin-bottom: 8px; }
    h2 { font-size: 20px; font-weight: 600; color: #e2e8f0; margin-top: 32px; margin-bottom: 12px; }
    .tagline { color: #94a3b8; font-size: 15px; margin-bottom: 24px; }
    p { color: #cbd5e1; font-size: 14px; line-height: 1.7; margin-bottom: 12px; }
    code { background: rgba(99,102,241,.1); color: #a5b4fc; padding: 1px 6px; border-radius: 4px; font-size: 13px; }
    pre { background: #0f1219; border: 1px solid #1e2333; border-radius: 8px; padding: 16px; margin-bottom: 16px; overflow-x: auto; }
    pre code { background: none; padding: 0; color: #94a3b8; font-size: 13px; line-height: 1.6; }
  `],
})
export class CustomizationComponent {
  readonly edgeExample = `const edge: Edge = {
  id: 'e1',
  source: 'node-1',
  target: 'node-2',
  type: 'default',
  label: 'sends data',
  labelStyle: { fill: '#e2e8f0', fontSize: '12px' },
  animated: true,
  style: { stroke: '#6366f1', strokeWidth: 2 },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: '#6366f1',
    width: 20,
    height: 20,
  },
};`;

  readonly handleCss = `.vue-flow__handle {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #141720;
  border: 1.5px solid #4b5563;
}

.vue-flow__handle.source:hover {
  transform: translate(0, -50%) scale(1.5);
  border-color: #818cf8;
}`;

  readonly handleTemplate = `<!-- Multiple handles with unique ids -->
<lib-handle type="source" [position]="Position.Right" id="output-a" style="top: 30%" />
<lib-handle type="source" [position]="Position.Right" id="output-b" style="top: 70%" />

<!-- Reference in edge -->
{ source: 'node-1', sourceHandle: 'output-a', target: 'node-2' }`;

  readonly connLineExample = `// In your component:
readonly connLineOptions = {
  type: ConnectionLineType.Bezier,
  style: { stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '5,5' },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: '#6366f1',
    width: 20,
    height: 20,
  },
};

// In template:
<lib-ng-flow [connectionLineOptions]="connLineOptions" ...>`;

  readonly nodeTemplateExample = `import { MyCustomNodeComponent } from './my-custom-node.component';

const node: Node = {
  id: 'custom-1',
  position: { x: 100, y: 200 },
  template: MyCustomNodeComponent,
  data: { label: 'Custom Node', color: '#6366f1' },
};`;
}
