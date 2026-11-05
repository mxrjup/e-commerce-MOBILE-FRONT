# Design

## Source of truth
- Status: Active. Last refreshed: 2026-11-03.
- Surface: Expo customer mobile app and responsive web preview.
- Evidence: `AGENT.md`, `mobile/AGENTS.md`, `mobile/design/DESIGN-log.md`, theme and themed components.
- The detailed specification exists at `mobile/design/DESIGN-log.md`; the `design_system.md` reference in AGENT.md is stale.

## Brand
- Warm, restrained, material focused. LOG is inferred from the design-system name.
- Wood-ring geometry is a provisional wordmark; no approved logo is bundled.
- Avoid gradients, decorative shadows, extra brand colors, and unsupported trust claims.

## Product goals
- Clear customer email/password login; success means readable controls and actionable validation.
- Non-goals: inventing authentication endpoints or simulating a successful login.

## Personas and jobs
- Returning customers accessing orders and saved products, primarily on phones.

## Information architecture
- `/`: login, preceding application tabs. Starter routes remain available for future work.
- Keep page components outside routing in `components/pages/login/`.

## Design principles
- Amber identifies actions; explicit text identifies errors.
- Whitespace and contrasting surfaces create hierarchy.
- Preserve form values on recoverable errors.

## Visual language
- Palette, type, spacing, and shapes follow `mobile/design/DESIGN-log.md`.
- Bundle Manrope locally with its OFL license; no runtime font CDN.
- Controls: 6px radius, 44px minimum; primary action: 52px.
- No animation; native wood-ring geometry for the provisional brand.

## Components
- Reuse ThemedText, ThemedView, useTheme, and useColorScheme.
- Page, brand, and form are page-only components in `components/pages/login/`.
- Extend the existing theme.ts tokens; no additional theme file or dependencies.

## Accessibility
- Target WCAG AA: persistent labels, autofill, named controls, explicit errors and focus borders.
- Next focuses password; Go submits; first invalid field receives focus.
- Support text scaling, safe areas, scrolling, keyboard avoidance, and reduced motion.

## Responsive behavior
- Single-column mobile form; complementary dark brand panel from 1024px.
- Form max width 400px. Footer wraps; short screens scroll.

## Interaction states
- Default, focused, invalid, password visible/hidden, and unavailable service.
- Empty submissions validate both fields. No backend contract exists: no artificial loading or success state.
- Login and recovery show explicit unavailable feedback until integrated; credentials are never persisted or transmitted.

## Content voice
- Concise French customer copy. Uppercase persistent field labels, no technical implementation details.

## Implementation constraints
- Expo 58, React Native 0.88, Expo Router, npm.
- Full dark mode is unspecified in the source; use an explicitly provisional mapping of its existing dark-surface colors, with matching theme keys.
- Run typecheck and lint; check web rendering and form interactions. Native keyboard behavior needs a device/emulator.

## Open questions
- [ ] Confirm brand name and approved logo.
- [ ] Supply authentication and account-recovery contracts.
- [ ] Approve full dark-theme mapping.
