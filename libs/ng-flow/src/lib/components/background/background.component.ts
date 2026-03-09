import { Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlowService } from '../../services/flow.service';

export type BackgroundVariant = 'dots' | 'lines';

@Component({
  selector: 'lib-background',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg class="vue-flow__background vue-flow__container" style="z-index:0">
      <defs>
        <pattern
          [id]="_patternId()"
          [attr.x]="_bg().x"
          [attr.y]="_bg().y"
          [attr.width]="_bg().scaledGap"
          [attr.height]="_bg().scaledGap"
          patternUnits="userSpaceOnUse"
          [attr.patternTransform]="'translate(-' + _bg().offset + ',-' + _bg().offset + ')'"
        >
          @if (variant() === 'lines') {
            <path
              [attr.d]="'M ' + _bg().scaledGap + ' 0 L 0 0 0 ' + _bg().scaledGap"
              fill="none"
              [attr.stroke]="_color()"
              [attr.stroke-width]="lineWidth()"
            />
          } @else {
            <circle
              [attr.cx]="_bg().scaledGap / 2"
              [attr.cy]="_bg().scaledGap / 2"
              [attr.r]="_bg().scaledSize / 2"
              [attr.fill]="_color()"
            />
          }
        </pattern>
      </defs>
      @if (bgColor()) {
        <rect width="100%" height="100%" [attr.fill]="bgColor()" />
      }
      <rect width="100%" height="100%" [attr.fill]="'url(#' + _patternId() + ')'" />
    </svg>
  `,
  styles: [`:host { display: contents; }`],
})
export class BackgroundComponent {
  readonly variant = input<BackgroundVariant>('dots');
  readonly gap = input<number>(20);
  readonly size = input<number>(2);
  readonly color = input<string>('');
  readonly bgColor = input<string>('');
  readonly lineWidth = input<number>(1);
  readonly patternId = input<string>('');

  private readonly flow = inject(FlowService);

  _patternId = computed(() => {
    const custom = this.patternId();
    return custom || `bg-pattern-${this.flow.id()}`;
  });

  _color = computed(() => {
    const c = this.color();
    if (c) return c;
    return this.variant() === 'lines' ? '#e0e0e0' : '#91919a';
  });

  _bg = computed(() => {
    const vp = this.flow.viewport();
    const gap = this.gap();
    const scaledGap = gap * vp.zoom || 1;
    const scaledSize = this.size() * vp.zoom;
    const offset = scaledGap / 2;
    const x = vp.x % scaledGap;
    const y = vp.y % scaledGap;
    return { scaledGap, scaledSize, offset, x, y };
  });
}
