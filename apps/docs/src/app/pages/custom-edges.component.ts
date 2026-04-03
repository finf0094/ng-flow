import { Component, input } from '@angular/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  NgFlowComponent,
  BackgroundComponent,
  BaseEdgeComponent,
  getBezierPath,
  getSmoothStepPath,
} from '@org/ng-flow';
import type { Node, Edge } from '@org/ng-flow';

/* ── Example 1: gradient edge ─────────────────────────────────── */
@Component({
  selector: 'doc-gradient-edge',
  standalone: true,
  imports: [],
  schemas: [NO_ERRORS_SCHEMA],
  template: `
    <svg style="position:absolute;top:0;left:0;width:100%;height:100%;overflow:visible;pointer-events:none">
      <defs>
        <linearGradient [attr.id]="'grad-' + id()" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#6366f1" />
          <stop offset="100%" stop-color="#ec4899" />
        </linearGradient>
      </defs>
      <path
        [attr.d]="_path()"
        class="ng-flow__edge-path"
        fill="none"
        [attr.stroke]="'url(#grad-' + id() + ')'"
        stroke-width="3"
        [attr.marker-end]="markerEnd() || null"
      />
      <path [attr.d]="_path()" fill="none" stroke-opacity="0" stroke-width="20" class="ng-flow__edge-interaction" />
    </svg>
  `,
})
class GradientEdgeComponent {
  readonly id = input.required<string>();
  readonly sourceX = input<number>(0);
  readonly sourceY = input<number>(0);
  readonly targetX = input<number>(0);
  readonly targetY = input<number>(0);
  readonly sourcePosition = input<any>(undefined);
  readonly targetPosition = input<any>(undefined);
  readonly markerEnd = input<string | undefined>(undefined);
  readonly label = input<string | undefined>(undefined);

  _path(): string {
    const [path] = getBezierPath({
      sourceX: this.sourceX(), sourceY: this.sourceY(),
      targetX: this.targetX(), targetY: this.targetY(),
      sourcePosition: this.sourcePosition(), targetPosition: this.targetPosition(),
    });
    return path;
  }
}

/* ── Example 2: animated dashed edge ──────────────────────────── */
@Component({
  selector: 'doc-dashed-edge',
  standalone: true,
  imports: [BaseEdgeComponent],
  template: `
    <lib-base-edge
      [path]="_path()"
      [style]="{ stroke: '#f59e0b', strokeWidth: 2, strokeDasharray: '6 3' }"
      [label]="label()"
    />
  `,
})
class DashedEdgeComponent {
  readonly id = input.required<string>();
  readonly sourceX = input<number>(0);
  readonly sourceY = input<number>(0);
  readonly targetX = input<number>(0);
  readonly targetY = input<number>(0);
  readonly sourcePosition = input<any>(undefined);
  readonly targetPosition = input<any>(undefined);
  readonly label = input<string | undefined>(undefined);

  _path(): string {
    const [path] = getSmoothStepPath({
      sourceX: this.sourceX(), sourceY: this.sourceY(),
      targetX: this.targetX(), targetY: this.targetY(),
      sourcePosition: this.sourcePosition(), targetPosition: this.targetPosition(),
    });
    return path;
  }
}

/* ── Page component ────────────────────────────────────────────── */
@Component({
  selector: 'app-docs-custom-edges',
  standalone: true,
  imports: [NgFlowComponent, BackgroundComponent],
  template: `
    <div class="page">
      <h1>Custom Edges</h1>
      <p class="tagline">
        Replace any edge with your own Angular component using <code>edgeTypes</code> or per-edge
        <code>template</code>.
      </p>

      <h2>How it works</h2>
      <p>
        ng-flow renders each edge through <code>EdgeWrapperComponent</code>, which works like
        <code>NodeWrapperComponent</code> — it dynamically creates your component and passes all
        edge props as signal inputs. Your custom edge component receives:
      </p>
      <table>
        <thead><tr><th>Input</th><th>Type</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>id</code></td><td><code>string</code></td><td>Edge id</td></tr>
          <tr><td><code>sourceX / sourceY</code></td><td><code>number</code></td><td>Source handle pixel position</td></tr>
          <tr><td><code>targetX / targetY</code></td><td><code>number</code></td><td>Target handle pixel position</td></tr>
          <tr><td><code>sourcePosition</code></td><td><code>Position</code></td><td>Handle side (Left/Right/Top/Bottom)</td></tr>
          <tr><td><code>targetPosition</code></td><td><code>Position</code></td><td>Handle side</td></tr>
          <tr><td><code>markerStart / markerEnd</code></td><td><code>string</code></td><td>SVG marker URL reference</td></tr>
          <tr><td><code>label</code></td><td><code>string</code></td><td>Optional edge label</td></tr>
          <tr><td><code>data</code></td><td><code>any</code></td><td>Custom data payload</td></tr>
          <tr><td><code>selected / animated</code></td><td><code>boolean</code></td><td>State flags</td></tr>
        </tbody>
      </table>

      <h2>Method 1 — edgeTypes registry</h2>
      <p>
        Pass a <code>Record&lt;string, ComponentType&gt;</code> to <code>[edgeTypes]</code>.
        Edges with a matching <code>type</code> use your component globally.
      </p>
      <pre class="code-block">{{ edgeTypesCode }}</pre>

      <p class="live-label">Gradient edge + dashed edge via edgeTypes</p>
      <div class="flow-wrap">
        <lib-ng-flow
          [nodes]="demo1Nodes"
          [edges]="demo1Edges"
          [edgeTypes]="edgeTypesMap"
          [fitViewOnInit]="true"
          [nodesDraggable]="false"
          style="height: 300px"
        >
          <lib-background variant="dots" [gap]="20" color="#334155" bgColor="#0d1117" />
        </lib-ng-flow>
      </div>

      <h2>Method 2 — per-edge template</h2>
      <p>
        Set the <code>template</code> property directly on an edge object. This overrides
        <code>edgeTypes</code> for that specific edge.
      </p>
      <pre class="code-block">{{ perEdgeCode }}</pre>

      <p class="live-label">Per-edge template</p>
      <div class="flow-wrap">
        <lib-ng-flow
          [nodes]="demo2Nodes"
          [edges]="demo2Edges"
          [fitViewOnInit]="true"
          [nodesDraggable]="false"
          style="height: 280px"
        >
          <lib-background variant="dots" [gap]="20" color="#334155" bgColor="#0d1117" />
        </lib-ng-flow>
      </div>

      <h2>BaseEdgeComponent</h2>
      <p>
        Use <code>BaseEdgeComponent</code> inside your custom edge to render the SVG
        <code>&lt;path&gt;</code> and optional label — the same way built-in edges work.
        Import it from <code>@org/ng-flow</code> and use it directly in your template.
        <code>BaseEdgeComponent</code> manages its own SVG viewport internally.
      </p>
      <pre class="code-block">{{ baseEdgeCode }}</pre>

      <h2>EDGE_ID_TOKEN</h2>
      <p>
        If your custom edge needs to know its own id deep in a component tree, inject
        <code>EDGE_ID_TOKEN</code>:
      </p>
      <pre class="code-block">{{ edgeIdCode }}</pre>
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
    .live-label { font-size: 12px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.8px; margin: 0 0 8px; }
    .flow-wrap { border-radius: 10px; overflow: hidden; border: 1px solid #1e2333; margin-bottom: 28px; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0 24px; }
    th { text-align: left; padding: 8px 12px; background: #0a0c12; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #1e2333; }
    td { padding: 10px 12px; color: #94a3b8; border-bottom: 1px solid #1a1f2e; font-size: 13px; }
    td code { background: #1e2333; color: #a5d6ff; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 12px; }
    tr:last-child td { border-bottom: none; }
    pre.code-block { background: #0d1117; border: 1px solid #1e2333; border-radius: 8px; padding: 16px 20px; font-size: 12px; line-height: 1.6; color: #94a3b8; overflow-x: auto; white-space: pre; margin: 0 0 24px; font-family: monospace; }
  `],
})
export class CustomEdgesComponent {
  readonly edgeTypesMap = {
    gradient: GradientEdgeComponent,
    dashed: DashedEdgeComponent,
  };

  readonly demo1Nodes: Node[] = [
    { id: 'n1', type: 'input', position: { x: 60, y: 60 }, label: 'Source A' },
    { id: 'n2', type: 'output', position: { x: 420, y: 60 }, label: 'Target A' },
    { id: 'n3', type: 'input', position: { x: 60, y: 180 }, label: 'Source B' },
    { id: 'n4', type: 'output', position: { x: 420, y: 180 }, label: 'Target B' },
  ];

  readonly demo1Edges: Edge[] = [
    { id: 'e1', source: 'n1', target: 'n2', type: 'gradient', label: 'gradient' },
    { id: 'e2', source: 'n3', target: 'n4', type: 'dashed', label: 'dashed' },
  ];

  readonly demo2Nodes: Node[] = [
    { id: 'm1', type: 'input', position: { x: 60, y: 100 }, label: 'Source' },
    { id: 'm2', type: 'output', position: { x: 420, y: 100 }, label: 'Target' },
  ];

  readonly demo2Edges: Edge[] = [
    { id: 'me1', source: 'm1', target: 'm2', template: GradientEdgeComponent, label: 'per-edge template' },
  ];

  readonly edgeTypesCode = `import { GradientEdgeComponent } from './gradient-edge.component';

// Register globally
const edgeTypes = { gradient: GradientEdgeComponent };

// Use in template
// <lib-ng-flow [edgeTypes]="edgeTypes" ... />

// Use type on any edge
const edges = [{ id: 'e1', source: 'a', target: 'b', type: 'gradient' }];`;

  readonly perEdgeCode = `import { GradientEdgeComponent } from './gradient-edge.component';

const edges = [
  {
    id: 'e1',
    source: 'a',
    target: 'b',
    template: GradientEdgeComponent,  // overrides edgeTypes for this edge
  },
];`;

  readonly baseEdgeCode = `import { Component, input } from '@angular/core';
import { BaseEdgeComponent, getBezierPath } from '@org/ng-flow';

@Component({
  selector: 'app-my-edge',
  standalone: true,
  imports: [BaseEdgeComponent],
  template: \`
    <!-- BaseEdgeComponent handles the SVG viewport internally -->
    <lib-base-edge
      [path]="_path()"
      [style]="{ stroke: '#6366f1', strokeWidth: 2 }"
      [markerEnd]="markerEnd()"
      [label]="label()"
    />
  \`,
})
export class MyEdgeComponent {
  readonly id = input.required<string>();
  readonly sourceX = input<number>(0);
  readonly sourceY = input<number>(0);
  readonly targetX = input<number>(0);
  readonly targetY = input<number>(0);
  readonly sourcePosition = input<any>(undefined);
  readonly targetPosition = input<any>(undefined);
  readonly markerEnd = input<string | undefined>(undefined);
  readonly label = input<string | undefined>(undefined);

  _path(): string {
    const [path] = getBezierPath({
      sourceX: this.sourceX(), sourceY: this.sourceY(),
      targetX: this.targetX(), targetY: this.targetY(),
      sourcePosition: this.sourcePosition(),
      targetPosition: this.targetPosition(),
    });
    return path;
  }
}`;

  readonly edgeIdCode = `import { inject } from '@angular/core';
import { EDGE_ID_TOKEN } from '@org/ng-flow';

@Component({ ... })
export class MyEdgeComponent {
  readonly edgeId = inject(EDGE_ID_TOKEN);  // the current edge's id
}`;
}
