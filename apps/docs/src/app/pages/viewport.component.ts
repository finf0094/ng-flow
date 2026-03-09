import { Component, ViewChild } from '@angular/core';
import { NgFlowComponent, PanelComponent, BackgroundComponent } from '@org/ng-flow';
import type { Node, Edge } from '@org/ng-flow';

@Component({
  selector: 'app-docs-viewport',
  standalone: true,
  imports: [NgFlowComponent, PanelComponent, BackgroundComponent],
  template: `
    <div class="page">
      <h1>Viewport</h1>
      <p class="tagline">Pan, zoom, and programmatically control the canvas viewport.</p>

      <h2>Viewport Controls</h2>
      <p>
        ng-flow uses D3 zoom under the hood. Pan by dragging the canvas background and zoom with
        the mouse wheel. You can also control the viewport programmatically via
        <code>&#64;ViewChild(NgFlowComponent)</code>.
      </p>

      <table>
        <thead>
          <tr><th>Input</th><th>Default</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><code>minZoom</code></td>
            <td><code>0.5</code></td>
            <td>Minimum zoom level the user can reach.</td>
          </tr>
          <tr>
            <td><code>maxZoom</code></td>
            <td><code>2</code></td>
            <td>Maximum zoom level the user can reach.</td>
          </tr>
          <tr>
            <td><code>defaultViewport</code></td>
            <td><code>&#123;x:0,y:0,zoom:1&#125;</code></td>
            <td>Initial viewport transform applied on first render.</td>
          </tr>
          <tr>
            <td><code>fitViewOnInit</code></td>
            <td><code>false</code></td>
            <td>Automatically fit all nodes into view on first render.</td>
          </tr>
          <tr>
            <td><code>zoomOnScroll</code></td>
            <td><code>true</code></td>
            <td>Allow zooming with the mouse wheel.</td>
          </tr>
          <tr>
            <td><code>panOnDrag</code></td>
            <td><code>true</code></td>
            <td>Allow panning by dragging the canvas background.</td>
          </tr>
          <tr>
            <td><code>zoomOnDoubleClick</code></td>
            <td><code>true</code></td>
            <td>Zoom in when the canvas is double-clicked.</td>
          </tr>
        </tbody>
      </table>

      <h2>Interactive viewport</h2>
      <p class="live-label">Live Example</p>
      <div class="flow-wrap">
        <lib-ng-flow
          #flow
          [nodes]="nodes"
          [edges]="edges"
          [fitViewOnInit]="true"
          style="height: 400px"
        >
          <lib-background variant="dots" [gap]="20" color="#334155" bgColor="#0d1117" />
          <lib-panel [position]="'top-right'">
            <div class="ctrl-bar">
              <button class="ctrl-btn" (click)="zoomIn()">＋ Zoom In</button>
              <button class="ctrl-btn" (click)="zoomOut()">− Zoom Out</button>
              <button class="ctrl-btn" (click)="fitView()">⊞ Fit View</button>
              <button class="ctrl-btn" (click)="reset()">↺ Reset</button>
            </div>
          </lib-panel>
        </lib-ng-flow>
      </div>

      <h2>Programmatic Control</h2>
      <p>Access viewport methods via <code>&#64;ViewChild</code>:</p>
      <pre class="code-block">{{ programmaticCode }}</pre>

      <h2>Viewport Limits</h2>
      <p>Constrain how far the user can zoom or pan:</p>
      <pre class="code-block">{{ limitsCode }}</pre>
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
    .ctrl-bar { display: flex; flex-direction: column; gap: 6px; padding: 8px; }
    .ctrl-btn {
      padding: 6px 14px; background: #1e2333; border: 1px solid #334155;
      border-radius: 6px; color: #e2e8f0; font-size: 12px; cursor: pointer;
      white-space: nowrap;
    }
    .ctrl-btn:hover { background: #273045; }
  `],
})
export class ViewportComponent {
  @ViewChild('flow') flow!: NgFlowComponent;

  readonly nodes: Node[] = [
    { id: 'v1', type: 'default', position: { x: 80,  y: 80  }, label: 'Node A' },
    { id: 'v2', type: 'default', position: { x: 360, y: 80  }, label: 'Node B' },
    { id: 'v3', type: 'default', position: { x: 80,  y: 260 }, label: 'Node C' },
    { id: 'v4', type: 'default', position: { x: 360, y: 260 }, label: 'Node D' },
  ];

  readonly edges: Edge[] = [
    { id: 'ev1-2', source: 'v1', target: 'v2' },
    { id: 'ev1-3', source: 'v1', target: 'v3' },
    { id: 'ev2-4', source: 'v2', target: 'v4' },
    { id: 'ev3-4', source: 'v3', target: 'v4' },
  ];

  zoomIn()  { this.flow.zoomIn(); }
  zoomOut() { this.flow.zoomOut(); }
  fitView() { this.flow.fitView({ padding: 0.2 }); }
  reset()   { this.flow.setViewport({ x: 0, y: 0, zoom: 1 }); }

  readonly programmaticCode = `@ViewChild(NgFlowComponent) flow!: NgFlowComponent;

zoomIn()  { this.flow.zoomIn(); }
zoomOut() { this.flow.zoomOut(); }
fitView() { this.flow.fitView({ padding: 0.2 }); }
setZoom(level: number) { this.flow.zoomTo(level); }
getViewport() { return this.flow.getViewport(); }`;

  readonly limitsCode = `<lib-ng-flow
  [minZoom]="0.1"
  [maxZoom]="4"
  [translateExtent]="[[-1000,-1000],[2000,2000]]"
/>`;
}

export { ViewportComponent as ViewportPageComponent };
