import { Component, computed, inject, NO_ERRORS_SCHEMA } from '@angular/core';
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
  strokeWidth?: number;
}

@Component({
  selector: 'lib-marker-defs',
  standalone: true,
  imports: [CommonModule],
  schemas: [NO_ERRORS_SCHEMA],
  template: `
    <svg class="vue-flow__marker vue-flow__container" aria-hidden="true">
      <defs>
        @for (marker of _markers(); track marker.id) {
          <marker
            [attr.id]="marker.id"
            class="vue-flow__arrowhead"
            viewBox="-10 -10 20 20"
            refX="5"
            refY="0"
            [attr.markerWidth]="marker.width"
            [attr.markerHeight]="marker.height"
            [attr.markerUnits]="marker.markerUnits"
            [attr.orient]="marker.orient"
          >
            @if (marker.type === 'arrowclosed') {
              <polyline
                points="-5,-4 0,0 -5,4 -5,-4"
                [ngStyle]="{ stroke: marker.color, fill: marker.color, 'stroke-width': marker.strokeWidth ?? 1 }"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            }
            @if (marker.type === 'arrow') {
              <polyline
                points="-5,-4 0,0 -5,4"
                [ngStyle]="{ stroke: marker.color, 'stroke-width': marker.strokeWidth ?? 1 }"
                fill="none"
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

  _markers = computed<ResolvedMarker[]>(() => {
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
      let strokeWidth: number | undefined;

      if (typeof markerProp === 'string') {
        type = markerProp;
      } else if (typeof markerProp === 'object') {
        type = (markerProp as any).type ?? MarkerType.Arrow;
        color = (markerProp as any).color ?? defaultColor;
        width = (markerProp as any).width ?? 12.5;
        height = (markerProp as any).height ?? 12.5;
        markerUnits = (markerProp as any).markerUnits ?? 'strokeWidth';
        orient = (markerProp as any).orient ?? 'auto-start-reverse';
        strokeWidth = (markerProp as any).strokeWidth;
      } else {
        type = markerProp;
      }

      const id = getMarkerId(markerProp, flowId);
      if (seen.has(id)) return;
      seen.add(id);

      markers.push({ id, type, color, width, height, markerUnits, orient, strokeWidth });
    };

    // Connection line markers first (same order as vue-flow MarkerDefinitions)
    addMarker(connOpts.markerEnd);
    addMarker(connOpts.markerStart);

    // Edge markers
    for (const edge of edges) {
      addMarker(edge.markerStart);
      addMarker(edge.markerEnd);
    }

    return markers;
  });
}
