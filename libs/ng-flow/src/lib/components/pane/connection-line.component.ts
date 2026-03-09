import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlowService } from '../../services/flow.service';
import { ConnectionLineType, Position } from '../../types';
import { getBezierPath } from '../../utils/edges/bezier';
import { getStraightPath } from '../../utils/edges/straight';
import { getSmoothStepPath, getStepPath } from '../../utils/edges/smooth-step';
import { getSimpleBezierPath } from '../../utils/edges/simple-bezier';

@Component({
  selector: 'lib-connection-line',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (_isConnecting()) {
      <svg class="vue-flow__connection-line-container" style="position:absolute;top:0;left:0;width:100%;height:100%;overflow:visible;pointer-events:none">
        <g [attr.transform]="_transform()">
          <path
            class="vue-flow__connection-path"
            [attr.d]="_path()"
            [ngStyle]="flow.connectionLineOptions().style"
            fill="none"
          />
        </g>
      </svg>
    }
  `,
})
export class ConnectionLineComponent {
  readonly flow = inject(FlowService);

  _transform = computed(() => {
    const { x, y, zoom } = this.flow.viewport();
    return `translate(${x},${y}) scale(${zoom})`;
  });

  _isConnecting = computed(() => {
    const start = this.flow.connectionStartHandle();
    const pos = this.flow.connectionPosition();
    return !!start && !isNaN(pos.x) && !isNaN(pos.y);
  });

  _path = computed(() => {
    const start = this.flow.connectionStartHandle();
    if (!start) return '';

    const pos = this.flow.connectionPosition();
    const sourceX = start.x;
    const sourceY = start.y;
    const targetX = pos.x;
    const targetY = pos.y;

    const opts = this.flow.connectionLineOptions();
    const type = opts.type ?? ConnectionLineType.Bezier;
    const sourcePosition = start.position ?? Position.Bottom;
    const targetPosition = Position.Top;

    switch (type) {
      case ConnectionLineType.Straight:
        return getStraightPath({ sourceX, sourceY, targetX, targetY })[0];
      case ConnectionLineType.Step:
        return getStepPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition })[0];
      case ConnectionLineType.SmoothStep:
        return getSmoothStepPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition })[0];
      case ConnectionLineType.SimpleBezier:
        return getSimpleBezierPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition })[0];
      case ConnectionLineType.Bezier:
      default:
        return getBezierPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition })[0];
    }
  });
}
