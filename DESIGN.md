# Design

## Source of truth
- Status: Active. Last refreshed: 2026-11-05.
- Surface: Expo customer mobile app and responsive web preview.
- Evidence: `AGENT.md`, `mobile/AGENTS.md`, `mobile/design/DESIGN-log.md`, theme and themed components.
- The detailed specification exists at `mobile/design/DESIGN-log.md`; the `design_system.md` reference in AGENT.md is stale.

## Brand
- Warm, restrained technology store: PCs, smartphones, components and peripherals. Preserve the existing LOG identity and amber theme.
- Wood-ring geometry is a provisional wordmark; no approved logo is bundled.
- Avoid gradients, decorative shadows, extra brand colors, and unsupported trust claims.

## Product goals
- Browse categories, search products and technical specifications, combine facets, compare prices and inspect product details.
- Preserve the existing Keycloak sign-in. No checkout or cart changes in this delivery.
- Catalog service is absent: use explicitly labelled demonstration data, isolated in `src/services/catalog.ts`; never imply that demo stock or prices are live.

## Personas and jobs
- Customers choosing computing equipment, primarily on phones, with responsive web support.

## Information architecture
- `/`: existing login; `/home`: storefront with horizontal product rows grouped by type; `/product/[id]`: product detail and related items.
- The sidebar owns the Catégories entry. Clicking it expands a form with product type, brand and minimum/maximum price. Submitting closes the sidebar and filters the homepage rows.
- Page components live outside routing. Reuse product cards, image fallbacks and selection controls in `components/shared/`.

## Design principles
- Amber identifies actions; explicit text identifies errors.
- Whitespace and contrasting surfaces create hierarchy.
- Preserve form values on recoverable errors.

## Visual language
- Palette, type, spacing, and shapes follow `mobile/design/DESIGN-log.md`.
- Bundle Manrope locally with its OFL license; no runtime font CDN.
- Controls: 6px radius, 44px minimum; primary action: 52px.
- No animation; preserve the existing logo. Catalog photos are remote illustrations with a text fallback on failure.

## Components
- Reuse ThemedText, ThemedView, useTheme, and useColorScheme.
- Page, brand, and form are page-only components in `components/pages/login/`.
- Extend the existing theme.ts tokens; no additional theme file or dependencies.

## Accessibility
- Target WCAG AA: persistent labels, autofill, named controls, explicit errors and focus borders.
- Next focuses password; Go submits; first invalid field receives focus.
- Support text scaling, safe areas, scrolling, keyboard avoidance, and reduced motion.

## Responsive behavior
- Preserve login layout and the homepage hero. Homepage scrolls vertically through product types; each type has a horizontal product carousel within 1200px.
- Product cards are at most 280px wide. The category form stays in the scrollable sidebar. Product details use two columns from 800px.

## Interaction states
- Category form: draft selection, matching product count, explicit apply, reset and invalid price-range feedback. Changing type clears the draft brand to avoid incompatible selections.
- Catalog: applied criteria summary, clear criteria, empty results, live search across the grouped rows. Closing the sidebar without applying leaves the homepage unchanged.
- Facets combine OR within a group and AND between groups. Counts omit their own group's selection. Search ignores accents and case.
- Detail: available, unavailable and unknown product; return navigation preserves the existing screen when available.
- Data is local; no simulated network loading or success feedback. Remote image errors show product names.

## Content voice
- Concise French customer copy. Uppercase persistent field labels, no technical implementation details.

## Implementation constraints
- Expo 58, React Native 0.88, Expo Router, npm.
- Full dark mode is unspecified in the source; use an explicitly provisional mapping of its existing dark-surface colors, with matching theme keys.
- Run typecheck and lint; check web rendering and form interactions. Native keyboard behavior needs a device/emulator.

## Open questions
- [ ] Confirm brand name and approved logo.
- [ ] Supply the catalog API contract and approved product photography for production data.
- [ ] Approve full dark-theme mapping.
