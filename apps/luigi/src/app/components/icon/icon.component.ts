import { Component, input, computed } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { inject } from '@angular/core';
import { ICON_PATHS } from '../../icon-data';

@Component({
  selector: 'app-icon',
  standalone: true,
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      [attr.stroke-width]="strokeWidth()"
      stroke-linecap="round"
      stroke-linejoin="round"
      [innerHTML]="svgContent()"
    ></svg>
  `,
  styles: [`
    :host { display: inline-flex; align-items: center; justify-content: center; }
    svg { display: block; }
  `],
})
export class IconComponent {
  private sanitizer = inject(DomSanitizer);

  readonly name = input.required<string>();
  readonly size = input<number>(24);
  readonly strokeWidth = input<number>(2);

  readonly svgContent = computed((): SafeHtml => {
    const paths = ICON_PATHS[this.name()];
    if (!paths) return this.sanitizer.bypassSecurityTrustHtml('');
    return this.sanitizer.bypassSecurityTrustHtml(paths);
  });
}
