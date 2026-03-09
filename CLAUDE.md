# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
nx serve docs                          # Dev server at localhost:4200
nx build docs                          # Build docs app
nx serve-static docs                   # Serve static build output

# Validation
nx lint ng-flow                        # Lint the library
nx lint docs                           # Lint docs app
npx tsc --noEmit --project libs/ng-flow/tsconfig.lib.json  # TypeScript check

# Formatting
nx format:check                        # Check formatting
nx format:write                        # Apply formatting
```

There are no test targets configured in this project.

## Architecture

**ng-flow** is an Angular 21 flow/diagram editor library modeled after [Vue Flow](https://vueflow.dev/). It's an Nx monorepo with:
- `libs/ng-flow/` — the library (imported as `@org/ng-flow`)
- `apps/docs/` — documentation/demo Angular app
- `apps/org/` — secondary demo app
- `examples/` — untracked reference implementations (n8n, vue-flow source); causes Nx graph failures if included

### State management

All state lives in `FlowService` (`libs/ng-flow/src/lib/services/flow.service.ts`), an Angular service **provided at the NgFlowComponent level** (not root), giving each flow instance its own isolated state. State is Angular `WritableSignal<T>`; events use RxJS `Subject`.

### Component hierarchy

```
NgFlowComponent                 # Main entry, provides FlowService
└── ViewportComponent           # D3 zoom/pan, resize observer
    └── PaneComponent           # Interaction layer, connection line, selection rect
        ├── NodeRendererComponent
        │   └── NodeWrapperComponent  # Dynamic component creation via ViewContainerRef.createComponent()
        └── EdgeRendererComponent     # Inline SVG paths (not dynamic components)
            └── MarkerDefs
```

### Key design decisions

- **Dynamic nodes**: `NodeWrapperComponent` uses `ViewContainerRef.createComponent()` to render user-defined node components. Node components receive `NodeProps` via `@Input()`.
- **Edge rendering**: Edges render as inline SVG inside `EdgeRendererComponent`, not as dynamic components.
- **CSS classes**: Mirrors vue-flow class names (`vue-flow__node`, `vue-flow__edge`, etc.) for CSS compatibility.
- **Per-instance service**: `FlowService` is in `NgFlowComponent.providers`, so multiple flows on a page are fully isolated.

### Path utilities

Edge path calculations are in `libs/ng-flow/src/lib/utils/edges/`:
- `bezier.ts` → `getBezierPath`
- `smooth-step.ts` → `getSmoothStepPath`, `getStepPath`
- `straight.ts` → `getStraightPath`
- `simple-bezier.ts` → `getSimpleBezierPath`

### TypeScript gotchas

- `noPropertyAccessFromIndexSignature: true` — use bracket notation `obj['key']` or cast to `any` when accessing index signatures
- `strict: true` + `noImplicitOverride: true` — explicit `override` keywords required on subclass methods
- When `signal<Edge[]>` is used, `addEdge` requires: `addEdge(edge, prev as unknown as GraphEdge[]) as Edge[]`
- Library tsconfig targets ES2022 with `"module": "preserve"` (Angular 15+ pattern)

### Docs app

`apps/docs/src/app/` uses signal-based navigation (no Angular Router) — a single `currentPage` signal drives which page component renders. Pages are standalone components in `apps/docs/src/app/pages/`.

### Vue Flow reference

The original Vue Flow source is at `examples/vue-flow/packages/core/src/` and serves as the reference implementation for porting logic and types.
