import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlowService } from '../../services/flow.service';
import { MarkerType } from '../../types';
import { getMarkerId } from '../../utils';

interface ResolvedMarker {
  id: string;
  type: string;
  color: string;
  width: number;
  height: number;
  markerUnits: string;
  orient: string;
  strokeWidth: number;
}

@Component({
  selector: 'lib-marker-defs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg class="ng-flow__marker ng-flow__container" aria-hidden="true">
      <defs>
        @for (marker of _markers(); track marker.id) {
          <marker
            [attr.id]="marker.id"
            class="ng-flow__arrowhead"
            viewBox="-10 -10 20 20"
            refX="0"
            refY="0"
            [attr.markerWidth]="marker.width"
            [attr.markerHeight]="marker.height"
            [attr.markerUnits]="marker.markerUnits"
            [attr.orient]="marker.orient"
          >
            @if (marker.type === 'arrowclosed') {
              <polyline
                points="-5,-4 0,0 -5,4 -5,-4"
                [ngStyle]="{ stroke: marker.color, fill: marker.color, 'stroke-width': marker.strokeWidth }"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            }
            @if (marker.type === 'arrow') {
              <polyline
                points="-5,-4 0,0 -5,4"
                fill="none"
                [ngStyle]="{ stroke: marker.color, 'stroke-width': marker.strokeWidth }"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            }
          </marker>
        }
      </defs>
    </svg>
  `,
  styles: [`
    :host { display: contents; }
    svg {
      position: absolute;
      top: 0;
      left: 0;
      width: 0;
      height: 0;
      overflow: visible;
      pointer-events: none;
    }
  `],
})
export class MarkerDefsComponent {
  private readonly flow = inject(FlowService);

  readonly _markers = computed<ResolvedMarker[]>(() => {
    const edges = this.flow.edges();
    const defaultColor = this.flow.defaultMarkerColor();
    const flowId = this.flow.id();
    const connOpts = this.flow.connectionLineOptions();
    const seen = new Set<string>();
    const markers: ResolvedMarker[] = [];

    const addMarker = (markerProp: any) => {
      if (!markerProp) return;

      let type: string;
      let color = defaultColor;
      let width = 12.5;
      let height = 12.5;
      let markerUnits = 'strokeWidth';
      let orient = 'auto-start-reverse';
      let strokeWidth = 1;

      if (typeof markerProp === 'string') {
        type = markerProp;
      } else {
        type = markerProp.type ?? MarkerType.Arrow;
        color = markerProp.color ?? defaultColor;
        width = markerProp.width ?? 12.5;
        height = markerProp.height ?? 12.5;
        markerUnits = markerProp.markerUnits ?? 'strokeWidth';
        orient = markerProp.orient ?? 'auto-start-reverse';
        strokeWidth = markerProp.strokeWidth ?? 1;
      }

      const id = getMarkerId(markerProp, flowId);
      if (seen.has(id)) return;
      seen.add(id);

      markers.push({ id, type, color, width, height, markerUnits, orient, strokeWidth });
    };

    addMarker(connOpts.markerEnd);
    addMarker(connOpts.markerStart);

    for (const edge of edges) {
      addMarker(edge.markerStart);
      addMarker(edge.markerEnd);
    }

    return markers;
  });
}
