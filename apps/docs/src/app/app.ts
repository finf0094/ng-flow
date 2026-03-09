import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IntroComponent } from './pages/intro.component';
import { NodesComponent } from './pages/nodes.component';
import { EdgesComponent } from './pages/edges.component';
import { HandlesComponent } from './pages/handles.component';
import { InteractivityComponent } from './pages/interactivity.component';
import { BackgroundPageComponent } from './pages/background.component';
import { NodeResizerPageComponent } from './pages/node-resizer.component';
import { ViewportPageComponent } from './pages/viewport.component';
import { ApiReferenceComponent } from './pages/api-reference.component';
import { DemoComponent } from './pages/demo.component';
import { CustomizationComponent } from './pages/customization.component';

type PageId =
  | 'intro'
  | 'nodes'
  | 'edges'
  | 'handles'
  | 'interactivity'
  | 'background'
  | 'node-resizer'
  | 'viewport'
  | 'api'
  | 'customization'
  | 'demo';

interface NavItem {
  id: PageId;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    IntroComponent,
    NodesComponent,
    EdgesComponent,
    HandlesComponent,
    InteractivityComponent,
    BackgroundPageComponent,
    NodeResizerPageComponent,
    ViewportPageComponent,
    ApiReferenceComponent,
    CustomizationComponent,
    DemoComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly activePage = signal<PageId>('intro');

  readonly nav: NavItem[] = [
    { id: 'intro',         label: 'Getting Started', icon: '🚀' },
    { id: 'nodes',         label: 'Nodes',           icon: '⬡' },
    { id: 'edges',         label: 'Edges',           icon: '⟿' },
    { id: 'handles',       label: 'Handles',         icon: '◉' },
    { id: 'interactivity', label: 'Interactivity',   icon: '🔗' },
    { id: 'background',    label: 'Background',      icon: '⊟' },
    { id: 'node-resizer',  label: 'Node Resizer',    icon: '⤡' },
    { id: 'viewport',      label: 'Viewport',        icon: '⊞' },
    { id: 'api',           label: 'API Reference',   icon: '📖' },
    { id: 'customization', label: 'Customization',   icon: '🎨' },
    { id: 'demo',          label: 'Live Demo',       icon: '✦' },
  ];

  navigate(id: PageId): void {
    this.activePage.set(id);
  }
}
