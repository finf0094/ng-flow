import { Component, input } from '@angular/core';
import { NgFlowComponent, HandleComponent, Position, BackgroundComponent } from '@org/ng-flow';
import type { Node } from '@org/ng-flow';

@Component({
  selector: 'doc-four-handle',
  standalone: true,
  imports: [HandleComponent],
  template: `
    <lib-handle [type]="'target'" [position]="Position.Top" />
    <lib-handle [type]="'source'" [position]="Position.Bottom" />
    <lib-handle [type]="'target'" [position]="Position.Left" />
    <lib-handle [type]="'source'" [position]="Position.Right" />
    <div class="fh-box">{{ label() }}</div>
  `,
  styles: [`
    :host { display: block; position: relative; }
    .fh-box { padding: 14px 28px; background: #1e293b; border: 1px solid #334155;
      border-radius: 8px; color: #e2e8f0; font-size: 13px; font-weight: 600; text-align: center; }
  `],
})
class FourHandleNodeComponent {
  readonly Position = Position;
  readonly id = input.required<string>();
  readonly label = input<string>('');
  readonly data = input<any>(null);
  readonly selected = input<boolean>(false);
}

@Component({
  selector: 'app-docs-handles',
  standalone: true,
  imports: [NgFlowComponent, BackgroundComponent],
  template: `
    <div class="page">
      <h1>Handles</h1>
      <p class="tagline">Handles are the connection points on custom node components.</p>

      <h2>HandleComponent</h2>
      <p>
        Place <code>&lt;lib-handle&gt;</code> inside any custom node component to create a
        connection point. ng-flow registers each handle's position automatically and uses them
        to drive the drag-to-connect interaction.
      </p>
      <p>
        Handles can be <strong>source</strong> handles (you drag from them to start a connection)
        or <strong>target</strong> handles (you drop onto them to finish a connection).
        A node can have any number of handles with unique <code>id</code> values.
      </p>

      <table>
        <thead>
          <tr><th>Input</th><th>Type</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><code>type</code></td>
            <td><code>'source' | 'target'</code></td>
            <td>Whether this handle emits or receives connections.</td>
          </tr>
          <tr>
            <td><code>position</code></td>
            <td><code>Position</code></td>
            <td>Which side of the node the handle is placed on.</td>
          </tr>
          <tr>
            <td><code>id</code></td>
            <td><code>string | null</code></td>
            <td>Optional identifier — required when a node has multiple handles of the same type.</td>
          </tr>
          <tr>
            <td><code>connectable</code></td>
            <td><code>boolean | number | 'single'</code></td>
            <td>Max connections allowed (<code>true</code> = unlimited, <code>'single'</code> = one).</td>
          </tr>
          <tr>
            <td><code>connectableStart</code></td>
            <td><code>boolean</code></td>
            <td>Whether a new connection can be started by dragging from this handle.</td>
          </tr>
          <tr>
            <td><code>connectableEnd</code></td>
            <td><code>boolean</code></td>
            <td>Whether a connection can be completed by dropping onto this handle.</td>
          </tr>
        </tbody>
      </table>

      <h2>Position enum</h2>
      <pre class="code-block">{{ positionCode }}</pre>

      <h2>Node with 4 handles</h2>
      <p class="live-label">Live Example</p>
      <div class="flow-wrap">
        <lib-ng-flow
          [nodes]="nodes"
          [edges]="[]"
          [fitViewOnInit]="true"
          style="height: 320px"
        >
          <lib-background variant="dots" [gap]="20" color="#334155" bgColor="#0d1117" />
        </lib-ng-flow>
      </div>

      <h2>Multiple Handles</h2>
      <p>
        When a node needs several handles of the same type, assign a unique <code>id</code> to
        each. Reference those IDs in edge definitions via <code>sourceHandle</code> /
        <code>targetHandle</code>.
      </p>
      <pre class="code-block">{{ multiHandleCode }}</pre>
    </div>
  `,
  styles: [`
    .page { padding: 32px 40px; max-width: 860px; }
    h1 { font-size: 26px; font-weight: 700; color: #f1f5f9; margin: 0 0 8px; }
    .tagline { color: #64748b; margin: 0 0 32px; font-size: 15px; }
    h2 { font-size: 18px; font-weight: 600; color: #e2e8f0; margin: 32px 0 12px; padding-top: 24px; border-top: 1px solid #1e2333; }
    h2:first-of-type { border-top: none; padding-top: 0; margin-top: 0; }
    p { color: #94a3b8; line-height: 1.7; margin: 0 0 16px; }
    strong { color: #cbd5e1; }
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
export class HandlesComponent {
  readonly nodes: Node[] = [
    { id: 'h1', position: { x: 280, y: 120 }, label: '4 Handles', template: FourHandleNodeComponent },
  ];

  readonly positionCode = `import { Position } from '@org/ng-flow';

Position.Top    // handle at top center
Position.Bottom // handle at bottom center
Position.Left   // handle at left center
Position.Right  // handle at right center`;

  readonly multiHandleCode = `// Component with multiple handles
@Component({
  template: \`
    <lib-handle type="target" [position]="Position.Left" />
    <lib-handle type="source" [position]="Position.Right" id="top-out" />
    <lib-handle type="source" [position]="Position.Right" id="bottom-out"
                [style.top]="'60%'" />
    <div class="node-body">{{ label() }}</div>
  \`,
})`;
}
