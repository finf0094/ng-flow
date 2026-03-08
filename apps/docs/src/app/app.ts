import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IntroComponent } from './pages/intro.component';
import { NodesComponent } from './pages/nodes.component';
import { EdgesComponent } from './pages/edges.component';
import { HandlesComponent } from './pages/handles.component';
import { ViewportPageComponent } from './pages/viewport.component';
import { ApiReferenceComponent } from './pages/api-reference.component';
import { DemoComponent } from './pages/demo.component';

type PageId = 'intro' | 'nodes' | 'edges' | 'handles' | 'viewport' | 'api' | 'demo';

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
    ViewportPageComponent,
    ApiReferenceComponent,
    DemoComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly activePage = signal<PageId>('intro');

  readonly nav: NavItem[] = [
    { id: 'intro',    label: 'Getting Started', icon: '🚀' },
    { id: 'nodes',    label: 'Nodes',           icon: '⬡' },
    { id: 'edges',    label: 'Edges',           icon: '⟿' },
    { id: 'handles',  label: 'Handles',         icon: '◉' },
    { id: 'viewport', label: 'Viewport',        icon: '⊞' },
    { id: 'api',      label: 'API Reference',   icon: '📖' },
    { id: 'demo',     label: 'Live Demo',       icon: '✦' },
  ];

  navigate(id: PageId): void {
    this.activePage.set(id);
  }
}
