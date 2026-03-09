import {
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { zoom, zoomIdentity, ZoomTransform } from 'd3-zoom';
import { pointer, select } from 'd3-selection';
import { FlowService } from '../../services/flow.service';
import { PaneComponent } from '../pane/pane.component';
import { PanOnScrollMode } from '../../types';
import { clamp, wheelDelta } from '../../utils';

@Component({
  selector: 'lib-viewport',
  standalone: true,
  imports: [CommonModule, PaneComponent],
  template: `
    <div #viewportEl class="vue-flow__viewport vue-flow__container">
      <lib-pane>
        <div
          class="vue-flow__transformationpane vue-flow__container"
          [style.transform]="_transformStyle()"
        >
          <ng-content />
        </div>
      </lib-pane>
    </div>
  `,
})
export class ViewportComponent implements AfterViewInit, OnDestroy {
  private readonly flow = inject(FlowService);

  @ViewChild('viewportEl') viewportElRef!: ElementRef<HTMLDivElement>;

  private _resizeObserver: ResizeObserver | null = null;

  _transformStyle = computed(() => {
    const { x, y, zoom } = this.flow.viewport();
    return `translate(${x}px, ${y}px) scale(${zoom})`;
  });

  ngAfterViewInit(): void {
    const viewportEl = this.viewportElRef.nativeElement;
    this.flow.viewportRef = viewportEl;

    // Setup resize observer for viewport dimensions
    this._resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      this.flow.dimensions.set({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });
    this._resizeObserver.observe(viewportEl);

    this._initD3Zoom(viewportEl);
  }

  ngOnDestroy(): void {
    this._resizeObserver?.disconnect();
  }

  private _initD3Zoom(el: HTMLDivElement): void {
    const flow = this.flow;

    const d3Selection = select<HTMLDivElement, unknown>(el);

    const zoomBehavior = zoom<HTMLDivElement, unknown>()
      .scaleExtent([flow.minZoom(), flow.maxZoom()])
      .translateExtent(flow.translateExtent())
      .on('start', (event) => {
        const vp = { x: event.transform.x, y: event.transform.y, zoom: event.transform.k };
        flow.moveStart$.next({ event, flowTransform: vp });
        flow.viewportChangeStart$.next(vp);
        flow.paneDragging.set(true);
      })
      .on('zoom', (event) => {
        const { x, y, k } = event.transform;
        const vp: import('../../types').ViewportTransform = { x, y, zoom: k };
        flow.viewport.set(vp);
        flow.move$.next({ event, flowTransform: vp });
        flow.viewportChange$.next(vp);
      })
      .on('end', (event) => {
        const vp = { x: event.transform.x, y: event.transform.y, zoom: event.transform.k };
        flow.moveEnd$.next({ event, flowTransform: vp });
        flow.viewportChangeEnd$.next(vp);
        flow.paneDragging.set(false);
      });

    // Disable double-click zoom (we handle it ourselves)
    zoomBehavior.filter((event) => {
      if (!flow.zoomOnDoubleClick() && event.type === 'dblclick') return false;
      if (event.type === 'wheel') {
        const noWheelEl = (event.target as HTMLElement).closest(`.${flow.noWheelClassName()}`);
        if (noWheelEl) return false;
      }
      return !event.ctrlKey && !event.button;
    });

    // Override wheel delta
    (zoomBehavior as any).wheelDelta = (event: WheelEvent) => {
      if (flow.panOnScroll() && !flow.zoomActivationKeyCode()) return 0;
      if (!flow.zoomOnScroll()) return 0;
      return -wheelDelta(event);
    };

    d3Selection.call(zoomBehavior);

    // Apply default viewport
    const defaultVp = flow.defaultViewport();
    if (defaultVp) {
      const t = zoomIdentity
        .translate(defaultVp.x ?? 0, defaultVp.y ?? 0)
        .scale(defaultVp.zoom ?? 1);
      d3Selection.call(zoomBehavior.transform, t);
    }

    flow.d3Zoom.set(zoomBehavior as any);
    flow.d3Selection.set(d3Selection as any);

    // Handle pan on scroll
    el.addEventListener('wheel', (event: WheelEvent) => {
      if (!flow.panOnScroll()) return;

      const noWheelEl = (event.target as HTMLElement).closest(`.${flow.noWheelClassName()}`);
      if (noWheelEl) return;

      if (flow.preventScrolling()) {
        event.preventDefault();
      }

      const scrollMode = flow.panOnScrollMode();
      const speed = flow.panOnScrollSpeed();
      const currentVp = flow.viewport();

      let dx = 0;
      let dy = 0;

      if (scrollMode === PanOnScrollMode.Free) {
        dx = -event.deltaX * speed;
        dy = -event.deltaY * speed;
      } else if (scrollMode === PanOnScrollMode.Vertical) {
        dy = -event.deltaY * speed;
      } else if (scrollMode === PanOnScrollMode.Horizontal) {
        dx = -event.deltaX * speed;
      }

      const t = zoomIdentity
        .translate(currentVp.x + dx, currentVp.y + dy)
        .scale(currentVp.zoom);

      d3Selection.call(zoomBehavior.transform, t);
    }, { passive: !flow.preventScrolling() });

    // Fit view on init if requested
    if (flow.fitViewOnInit()) {
      setTimeout(() => {
        flow.fitView().then(() => {
          flow.fitViewOnInitDone.set(true);
          flow.init$.next(flow);
        });
      }, 0);
    } else {
      setTimeout(() => flow.init$.next(flow), 0);
    }
  }
}
