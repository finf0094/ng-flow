import {
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { FlowService } from '../../services/flow.service';
import { PanelComponent } from '../panel/panel.component';
import type { PanelPosition } from '../panel/panel.component';
import type { FitViewParams } from '../../types';

@Component({
  selector: 'lib-controls',
  standalone: true,
  imports: [PanelComponent],
  template: `
    <lib-panel [position]="position()" class="ng-flow__controls">
      @if (showZoom()) {
        <button
          type="button"
          class="ng-flow__controls-button ng-flow__controls-zoomin"
          title="zoom in"
          aria-label="zoom in"
          (click)="onZoomIn()"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <path d="M32 18.133H18.133V32h-4.266V18.133H0v-4.266h13.867V0h4.266v13.867H32z"/>
          </svg>
        </button>
        <button
          type="button"
          class="ng-flow__controls-button ng-flow__controls-zoomout"
          title="zoom out"
          aria-label="zoom out"
          (click)="onZoomOut()"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 5">
            <path d="M0 0h32v4.2H0z"/>
          </svg>
        </button>
      }
      @if (showFitView()) {
        <button
          type="button"
          class="ng-flow__controls-button ng-flow__controls-fitview"
          title="fit view"
          aria-label="fit view"
          (click)="onFitView()"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 30">
            <path d="M3.692 4.63c0-.53.4-.938.939-.938h5.215V0H4.631A4.631 4.631 0 000 4.631v5.216h3.692V4.631zM27.354 0h-5.2v3.692h5.17c.53 0 .984.4.984.939v5.215H32V4.631A4.631 4.631 0 0027.369 0h-.015zM0 25.385v-5.2h3.692v5.17c0 .53.4.984.939.984h5.215V32H4.631A4.631 4.631 0 010 27.369v-.015zm32 0v-5.2h-3.692v5.17c0 .53-.4.984-.939.984h-5.215V32h5.215A4.631 4.631 0 0032 27.369v-.015z"/>
          </svg>
        </button>
      }
      @if (showInteractive()) {
        <button
          type="button"
          class="ng-flow__controls-button ng-flow__controls-interactive"
          [class.active]="_isInteractive()"
          [title]="_isInteractive() ? 'disable interactivity' : 'enable interactivity'"
          [attr.aria-label]="_isInteractive() ? 'disable interactivity' : 'enable interactivity'"
          (click)="onToggleInteractive()"
        >
          @if (_isInteractive()) {
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 32">
              <path d="M21.333 10.667H19.2V7.467C19.2 3.347 15.853 0 11.733 0 7.613 0 4.267 3.347 4.267 7.467v3.2H2.133C.96 10.667 0 11.627 0 12.8v16.533C0 30.507.96 31.467 2.133 31.467h19.2c1.174 0 2.134-.96 2.134-2.134V12.8c0-1.173-.96-2.133-2.134-2.133zm-9.6 9.6c1.174 0 2.134.96 2.134 2.133s-.96 2.133-2.134 2.133-2.133-.96-2.133-2.133.96-2.133 2.133-2.133zm-4.266-9.6V7.467c0-2.347 1.92-4.267 4.266-4.267 2.347 0 4.267 1.92 4.267 4.267v3.2H7.467z"/>
            </svg>
          } @else {
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 32">
              <path d="M21.333 10.667H19.2V7.467C19.2 3.347 15.853 0 11.733 0 7.613 0 4.267 3.347 4.267 7.467H7.46c0-2.347 1.92-4.267 4.267-4.267 2.347 0 4.267 1.92 4.267 4.267v3.2H2.133C.96 10.667 0 11.627 0 12.8v16.533C0 30.507.96 31.467 2.133 31.467h19.2c1.174 0 2.134-.96 2.134-2.134V12.8c0-1.173-.96-2.133-2.134-2.133zm-9.6 9.6c1.174 0 2.134.96 2.134 2.133s-.96 2.133-2.134 2.133-2.133-.96-2.133-2.133.96-2.133 2.133-2.133z"/>
            </svg>
          }
        </button>
      }
      <ng-content />
    </lib-panel>
  `,
  styles: [`
    :host { display: contents; }
  `],
})
export class ControlsComponent {
  readonly showZoom = input<boolean>(true);
  readonly showFitView = input<boolean>(true);
  readonly showInteractive = input<boolean>(true);
  readonly position = input<PanelPosition>('bottom-left');
  readonly fitViewParams = input<FitViewParams>({});
  readonly ariaLabel = input<string>('ng-flow controls');

  readonly zoomIn = output<void>();
  readonly zoomOut = output<void>();
  readonly fitView = output<void>();
  readonly interactionChange = output<boolean>();

  readonly flow = inject(FlowService);

  readonly _isInteractive = computed(
    () => this.flow.nodesDraggable() && this.flow.nodesConnectable() && this.flow.elementsSelectable(),
  );

  onZoomIn(): void {
    this.flow.zoomIn();
    this.zoomIn.emit();
  }

  onZoomOut(): void {
    this.flow.zoomOut();
    this.zoomOut.emit();
  }

  onFitView(): void {
    this.flow.fitView(this.fitViewParams());
    this.fitView.emit();
  }

  onToggleInteractive(): void {
    const next = !this._isInteractive();
    this.flow.setInteractive(next);
    this.interactionChange.emit(next);
  }
}
