import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type PanelPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

@Component({
  selector: 'lib-panel',
  standalone: true,
  imports: [CommonModule],
  template: `<ng-content />`,
  host: {
    class: 'vue-flow__panel',
    '[class.top]': '_isTop()',
    '[class.bottom]': '_isBottom()',
    '[class.left]': '_isLeft()',
    '[class.right]': '_isRight()',
    '[class.center]': '_isCenter()',
  },
  styles: [`
    :host {
      position: absolute;
      z-index: 5;
    }
    :host.top { top: 10px; }
    :host.bottom { bottom: 10px; }
    :host.left { left: 10px; }
    :host.right { right: 10px; }
    :host.center { left: 50%; transform: translateX(-50%); }
    :host.top.center { top: 10px; }
    :host.bottom.center { bottom: 10px; }
  `],
})
export class PanelComponent {
  readonly position = input<PanelPosition>('top-left');

  _isTop() { return this.position().startsWith('top'); }
  _isBottom() { return this.position().startsWith('bottom'); }
  _isLeft() { return this.position().endsWith('left'); }
  _isRight() { return this.position().endsWith('right'); }
  _isCenter() { return this.position().endsWith('center'); }
}
