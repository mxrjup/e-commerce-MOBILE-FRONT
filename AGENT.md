# Mobile development guide

This guide defines how to develop the mobile app in `mobile/`. Keep it focused on
the app's design, screen structure, components, and native behavior. It is maintained
independently of `CLAUDE.md`; do not replace it with a copy of the Git workflow guide.
Also follow the Expo-specific instructions in `mobile/AGENTS.md`.

## Design system

- Always follow `mobile/design/design_system.md`, relative to the repository root, for
  colors, typography, spacing, borders, icons, and component states.
- That file is not present in the current workspace. When a task depends on its
  specifications, request the document or its location instead of inventing a design.
- Keep design tokens in `mobile/src/constants/theme.ts`. Extend the existing
  `Colors`, `Fonts`, and `Spacing` exports instead of creating another theme file.
- Use semantic tokens such as `background`, `text`, and `textSecondary` instead of
  repeating raw colors in screens. Add reusable radius and size tokens when needed
  by the design system; keep one-off layout values local to their component.
- Use the existing `useTheme` and `useColorScheme` hooks and themed components.
  Keep light and dark theme keys consistent, and check both supported appearances.
- `src/global.css` and CSS modules support the web version. They are not the source
  of native screen styling; use React Native styles and the shared theme for native UI.

## Folder architecture

Use the following structure under `mobile/`. The shared/page split is the target
convention for new components; existing starter components have not yet been moved.

```text
mobile/
  assets/                       Images, fonts, and other bundled assets
  src/
    app/                        Expo Router routes and navigation layouts only
      _layout.tsx               Root layout and navigation composition
      <route>.tsx               Page route
    constants/
      theme.ts                  Design system tokens
    components/
      shared/                   Components reused across screens
      pages/
        <page-name>/            Components used only by the page with this name
    hooks/                      Hooks reused across screens
    services/                   API requests and response/error mapping, when needed
    types/                      Shared domain and API types, when needed
    global.css                  Web-specific global styles
```

- Keep reusable code outside `src/app/`: files in that directory participate in routing.
- `components/shared/` is ONLY for reusable UI, such as buttons, inputs, product
  cards used across screens, and navigation components. Do not put page-only UI there.
- Store every component used only by one page in `components/pages/<page-name>/`,
  using that page's name for the folder. Apply this convention to every page.
  Move a component into `shared/` when it is reused across pages.
- Keep component-specific styles and types with the component. Keep page-only hooks
  alongside their page components; use `src/hooks/` for genuinely shared behavior.
- Create folders when they have a purpose; do not generate empty scaffolding.
- Reuse existing components before introducing replacements. Move starter components
  only when the task requires it, updating all imports and platform variants together.
- Use kebab-case filenames, PascalCase component names, and `use`-prefixed hook names,
  consistent with the current project. Use `@/` imports for files under `src/`.

## Screens and navigation

- Use the installed Expo, React Native, TypeScript, and Expo Router stack. Use npm,
  as this project has `package-lock.json`; do not introduce a second package manager.
- Keep route files small: compose page components and connect screen behavior there.
  Extract substantial UI sections instead of putting an entire complex screen in one file.
- Keep navigation configuration in layouts and navigation components. Extend the
  existing `AppTabs` pattern when adding a tab; avoid duplicating navigation per screen.
- Preserve `.web.tsx` and native variants where platform behavior differs. Shared
  business logic should not be duplicated between those variants.
- Use typed props and route parameters. Keep API requests out of presentation-only
  components, and do not introduce a state library or dependency without a concrete need
  and an explicit request to add it.

## Native UI behavior

- Use React Native primitives for native screens. Confine DOM elements, browser APIs,
  and browser storage to web-specific implementations.
- Respect safe areas, the tab bar, the on-screen keyboard, and Android back navigation.
  Check that forms and primary actions remain usable on small phone screens.
- Give interactive controls accessible labels and roles, support text scaling, and
  provide comfortable touch targets. Do not convey errors or selection by color alone.
- Handle loading, empty, error, retry, and offline states where relevant. Preserve form
  input on recoverable errors and prevent duplicate submissions.
- Use virtualized lists for long catalogs and order histories, stable keys, and
  appropriately sized images. Clean up subscriptions and stale asynchronous work.

## API and application data

- Put shared request logic in `src/services/` when API integration is introduced.
  Follow the backend contract rather than inventing endpoints or response fields.
- Keep local interaction state near the screen or component that owns it. Share state
  only when several screens need it; do not store derived values unnecessarily.
- Treat prices, stock, order totals, payment status, and authorization as backend-owned
  data. Do not blindly retry order or payment submissions.
- Never embed secrets in the app or client environment variables. Use approved secure
  storage for session credentials, and clear user-specific state on logout.
- Keep mock data explicit and separate from real API behavior.

## Development and verification

Run commands from `mobile/`:

```bash
npm ci
npm start
npm run android
npm run ios
npm run web
npx tsc --noEmit
npm run lint
```

- Use the start command appropriate to the target; these are alternatives, not a
  sequence of servers to run together. Native checks require a device or suitable emulator.
- Docker is optional for running Metro. The mobile app runs on a phone or emulator;
  the web preview does not prove that native behavior works.
- Check the installed Expo version and its matching documentation before changing
  Expo APIs or configuration, as required by `mobile/AGENTS.md`.
- For application changes, run typechecking and lint, plus relevant existing tests.
  If lint requires first-time setup or a check fails, report it explicitly instead of
  silently installing dependencies or claiming success. There is currently no test script.
- For screen changes, compare with the design system and check navigation, keyboard,
  scrolling, supported themes, and relevant data states on the target platforms.
- Report which device, emulator, or browser was actually tested and any validation gaps.
  For documentation-only changes, review the content and diff; app tests are unnecessary.
- Keep changes scoped to the requested feature. Do not publish native builds or updates
  as a side effect of local development work.
