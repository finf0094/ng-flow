import {
  Component,
  ElementRef,
  input,
  signal,
  computed,
  viewChild,
  output,
} from '@angular/core';
import { NodeResizerComponent } from '@org/ng-flow';

export interface StickyNoteData {
  text: string;
  color?: 'yellow' | 'pink' | 'blue' | 'green';
}

const STICKY_COLORS: Record<NonNullable<StickyNoteData['color']>, string> = {
  yellow: '#fef08a',
  pink: '#fecdd3',
  blue: '#bfdbfe',
  green: '#bbf7d0',
};

const COLOR_KEYS = ['yellow', 'pink', 'blue', 'green'] as const;

@Component({
  selector: 'app-sticky-note-node',
  standalone: true,
  imports: [NodeResizerComponent],
  template: `
    <lib-node-resizer
      color="#6366f1"
      [isVisible]="selected() || resizing()"
      [minWidth]="150"
      [minHeight]="80"
    />

    <div
      class="sticky"
      [class.is-selected]="selected()"
      [style.background]="bgColor()"
      (dblclick)="startEdit()"
    >
      @if (editMode()) {
        <textarea
          #textArea
          class="textarea"
          [value]="data().text"
          (blur)="commitEdit($event)"
          (keydown.escape)="cancelEdit()"
          (click)="$event.stopPropagation()"
        ></textarea>
      } @else {
        <div class="content">
          {{ data().text || 'Double-click to edit...' }}
        </div>
      }

      @if (selected() && !editMode()) {
        <div class="color-bar">
          @for (key of colorKeys; track key) {
            <button
              class="color-chip"
              [style.background]="getColor(key)"
              [class.active]="data().color === key || (!data().color && key === 'yellow')"
              (click)="setColor(key); $event.stopPropagation()"
            ></button>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        position: relative;
        width: 100%;
        height: 100%;
        min-width: 150px;
        min-height: 80px;
      }

      .sticky {
        width: 100%;
        height: 100%;
        min-width: 150px;
        min-height: 80px;
        border-radius: 6px;
        padding: 12px;
        position: relative;
        box-shadow: 2px 4px 12px rgba(0, 0, 0, 0.3);
        display: flex;
        flex-direction: column;
        transition: box-shadow 0.2s ease;
        overflow: hidden;
      }

      .sticky.is-selected {
        box-shadow:
          0 0 0 3px rgba(99, 102, 241, 0.5),
          2px 4px 12px rgba(0, 0, 0, 0.3);
      }

      .content {
        font-size: 13px;
        line-height: 1.5;
        color: #1c1917;
        white-space: pre-wrap;
        word-break: break-word;
        flex: 1;
        font-family: inherit;
      }

      .textarea {
        width: 100%;
        flex: 1;
        background: transparent;
        border: none;
        outline: none;
        resize: none;
        font-size: 13px;
        line-height: 1.5;
        color: #1c1917;
        font-family: inherit;
        padding: 0;
      }

      .color-bar {
        display: flex;
        gap: 6px;
        margin-top: 8px;
        justify-content: center;
      }

      .color-chip {
        width: 14px;
        height: 14px;
        border-radius: 50%;
        border: 2px solid rgba(0, 0, 0, 0.15);
        cursor: pointer;
        transition: transform 0.15s, border-color 0.15s;
        padding: 0;
      }

      .color-chip:hover,
      .color-chip.active {
        transform: scale(1.3);
        border-color: rgba(0, 0, 0, 0.4);
      }
    `,
  ],
})
export class StickyNoteNodeComponent {
  readonly id = input.required<string>();
  readonly selected = input<boolean>(false);
  readonly resizing = input<boolean>(false);
  readonly data = input<StickyNoteData>({ text: '', color: 'yellow' });

  readonly dataChange = output<StickyNoteData>();

  readonly editMode = signal(false);
  readonly colorKeys = COLOR_KEYS;

  readonly textArea = viewChild<ElementRef<HTMLTextAreaElement>>('textArea');

  readonly bgColor = computed(
    () => STICKY_COLORS[this.data().color ?? 'yellow'],
  );

  getColor(key: (typeof COLOR_KEYS)[number]): string {
    return STICKY_COLORS[key];
  }

  startEdit(): void {
    this.editMode.set(true);
    // Focus textarea after render
    setTimeout(() => {
      const el = this.textArea()?.nativeElement;
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
    }, 0);
  }

  commitEdit(event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.dataChange.emit({ ...this.data(), text: value });
    this.editMode.set(false);
  }

  cancelEdit(): void {
    this.editMode.set(false);
  }

  setColor(color: (typeof COLOR_KEYS)[number]): void {
    this.dataChange.emit({ ...this.data(), color });
  }
}
