import { Component, input } from '@angular/core';
import { NgFlowComponent, HandleComponent, BackgroundComponent } from '@org/ng-flow';
import { Position } from '@org/ng-flow';
import type { Node, Edge } from '@org/ng-flow';

@Component({
  selector: 'doc-custom-node',
  standalone: true,
  imports: [HandleComponent],
  template: `
    <lib-handle [type]="'target'" [position]="Position.Left" />
    <div class="custom-n">
      <div class="cn-icon">⚙️</div>
      <div class="cn-label">{{ label() }}</div>
    </div>
    <lib-handle [type]="'source'" [position]="Position.Right" />
  `,
  styles: [`
    :host { display: block; position: relative; }
    .custom-n { display: flex; align-items: center; gap: 10px; padding: 10px 16px;
      background: #1e293b; border: 1px solid #334155; border-radius: 8px; border-left: 3px solid #6366f1; }
    .cn-icon { font-size: 18px; }
    .cn-label { color: #e2e8f0; font-size: 13px; font-weight: 600; }
  `],
})
class DocCustomNodeComponent {
  readonly Position = Position;
  readonly id = input.required<string>();
  readonly label = input<string>('');
  readonly data = input<any>(null);
  readonly selected = input<boolean>(false);
}

@Component({
  selector: 'app-docs-nodes',
  standalone: true,
  imports: [NgFlowComponent, BackgroundComponent],
  template: `
    <div class="page">
      <h1>Nodes</h1>
      <p class="tagline">Nodes are the building blocks of your flow diagram.</p>

      <h2>Built-in Node Types</h2>
      <p>
        ng-flow ships with three built-in node types. You select them via the <code>type</code>
        property on a node object.
      </p>
      <table>
        <thead>
          <tr><th>Type</th><th>Handles</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><code>default</code></td>
            <td>Source + Target</td>
            <td>Bidirectional node — has both a source and a target handle.</td>
          </tr>
          <tr>
            <td><code>input</code></td>
            <td>Source only</td>
            <td>Starting node — can only emit connections, cannot receive them.</td>
          </tr>
          <tr>
            <td><code>output</code></td>
            <td>Target only</td>
            <td>Terminal node — can only receive connections, cannot emit them.</td>
          </tr>
        </tbody>
      </table>

      <p class="live-label">Built-in types</p>
      <div class="flow-wrap">
        <lib-ng-flow
          [nodes]="builtinNodes"
          [edges]="builtinEdges"
          [fitViewOnInit]="true"
          style="height: 300px"
        >
          <lib-background variant="dots" [gap]="20" color="#334155" bgColor="#0d1117" />
        </lib-ng-flow>
      </div>

      <h2>Custom Nodes</h2>
      <p>
        Pass any Angular component class as the <code>template</code> property on a node to render
        it instead of the built-in node. The component must declare these signal inputs:
        <code>id</code>, <code>label</code>, <code>data</code>, and <code>selected</code>.
      </p>
      <pre class="code-block">{{ customNodeCode }}</pre>

      <p class="live-label">Custom node</p>
      <div class="flow-wrap">
        <lib-ng-flow
          [nodes]="customNodes"
          [edges]="[]"
          [fitViewOnInit]="true"
          style="height: 280px"
        >
          <lib-background variant="dots" [gap]="20" color="#334155" bgColor="#0d1117" />
        </lib-ng-flow>
      </div>
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
  `],
})
export class NodesComponent {
  readonly builtinNodes: Node[] = [
    { id: 'n1', type: 'input', position: { x: 80, y: 100 }, label: 'Input Node' },
    { id: 'n2', type: 'default', position: { x: 340, y: 100 }, label: 'Default Node' },
    { id: 'n3', type: 'output', position: { x: 600, y: 100 }, label: 'Output Node' },
  ];

  readonly builtinEdges: Edge[] = [
    { id: 'e1-2', source: 'n1', target: 'n2' },
    { id: 'e2-3', source: 'n2', target: 'n3' },
  ];

  readonly customNodes: Node[] = [
    { id: 'c1', position: { x: 200, y: 100 }, label: 'My Custom Node', template: DocCustomNodeComponent },
  ];

  readonly customNodeCode = `import { Component, input } from '@angular/core';
import { HandleComponent, Position } from '@org/ng-flow';

@Component({
  selector: 'app-my-node',
  standalone: true,
  imports: [HandleComponent],
  template: \`
    <lib-handle type="target" [position]="Position.Left" />
    <div class="my-node">{{ label() }}</div>
    <lib-handle type="source" [position]="Position.Right" />
  \`,
  styles: [\`.my-node { padding: 10px 20px; background: #1e293b; border-radius: 6px; }\`],
})
export class MyNodeComponent {
  readonly Position = Position;
  readonly id = input.required<string>();
  readonly label = input<string>('');
  readonly data = input<any>(null);
  readonly selected = input<boolean>(false);
}`;
}
