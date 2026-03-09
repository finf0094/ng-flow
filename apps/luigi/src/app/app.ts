import { Component, inject } from '@angular/core';
import {
  NgFlowComponent,
  BackgroundComponent,
  ConnectionMode,
  MarkerType,
  type NodeChange,
  type EdgeChange,
  type Connection,
  type ViewportTransform,
  type FlowService,
} from '@org/ng-flow';
import { WorkflowService } from './services/workflow.service';
import { NodePaletteComponent } from './components/node-palette/node-palette.component';
import { LucideAngularModule } from './icons';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    NgFlowComponent,
    BackgroundComponent,
    NodePaletteComponent,
    LucideAngularModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly workflow = inject(WorkflowService);
  readonly ConnectionMode = ConnectionMode;
  readonly connLineOptions = {
    markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1', width: 20, height: 20 },
  };

  onInit(fs: FlowService): void {
    this.workflow.setFlowService(fs);
  }

  onNodesChange(changes: NodeChange[]): void {
    this.workflow.onNodesChange(changes);
  }

  onEdgesChange(changes: EdgeChange[]): void {
    this.workflow.onEdgesChange(changes);
  }

  onConnect(connection: Connection): void {
    this.workflow.onConnect(connection);
  }

  onViewportChange(vp: ViewportTransform): void {
    this.workflow.onViewportChange(vp);
  }
}
