---
name: National Digital Platform Architecture
colors:
  surface: '#f8f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f8f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#43474d'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#74777e'
  outline-variant: '#c3c6ce'
  surface-tint: '#49607c'
  primary: '#001428'
  on-primary: '#ffffff'
  primary-container: '#0f2942'
  on-primary-container: '#7991af'
  inverse-primary: '#b0c9e8'
  secondary: '#555f71'
  on-secondary: '#ffffff'
  secondary-container: '#d6e0f6'
  on-secondary-container: '#596376'
  tertiary: '#220e00'
  on-tertiary: '#ffffff'
  tertiary-container: '#401f00'
  on-tertiary-container: '#d77503'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d1e4ff'
  primary-fixed-dim: '#b0c9e8'
  on-primary-fixed: '#011d35'
  on-primary-fixed-variant: '#314863'
  secondary-fixed: '#d9e3f9'
  secondary-fixed-dim: '#bdc7dc'
  on-secondary-fixed: '#121c2c'
  on-secondary-fixed-variant: '#3d4759'
  tertiary-fixed: '#ffdcc3'
  tertiary-fixed-dim: '#ffb77d'
  on-tertiary-fixed: '#2f1500'
  on-tertiary-fixed-variant: '#6e3900'
  background: '#f8f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  headline-xl:
    fontFamily: Public Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Public Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.005em
  headline-md:
    fontFamily: Public Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Public Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Public Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Public Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Public Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Public Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Public Sans
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.02em
  headline-lg-mobile:
    fontFamily: Public Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  grid-columns: '12'
  gutter-desktop: 24px
  gutter-tablet: 16px
  gutter-mobile: 12px
  margin-desktop: 48px
  margin-tablet: 24px
  margin-mobile: 16px
  space-1: 4px
  space-2: 8px
  space-3: 12px
  space-4: 16px
  space-6: 24px
  space-8: 32px
  space-12: 48px
---

## Brand & Style

This design system establishes a formal, authoritative, and deeply accessible visual language tailored for high-stakes public-sector and enterprise digital infrastructure. The brand personality is institutional, grounded, and unwavering, designed to engender absolute trust and operational clarity. 

The aesthetic draws from a refined **Corporate / Modern** framework, prioritizing extreme legibility, information density, and systematic predictability. Visual flourishes are stripped away in favor of high-contrast data hierarchies, crisp institutional framing, and unambiguous state communication. The UI evokes reliability, civic duty, and computational precision.

## Colors

The color architecture is anchored by a deep institutional navy (`#0F2942`) that conveys administrative gravity and security. Charcoal (`#2D3748`) provides high-contrast legibility for all primary text and structural data. 

Subtle civic accents—warm saffron (`#D97706`) and governance green (`#059669`)—are deployed strictly for focal actions and authorized status indicators. 

### Status System
- **Completed:** `#059669` (Green)
- **Attention / Pending:** `#D97706` (Amber)
- **High Risk:** `#DC2626` (Red)
- **In Progress:** `#2563EB` (Blue)

The neutral foundation relies on crisp light greys (`#F4F6F8`) to delineate structured administrative regions without introducing visual noise.

## Typography

**Public Sans** serves as the singular, uncompromising typographic family across all surfaces. Engineered for civic legibility and institutional accessibility, its clean humanist-leaning geometry ensures absolute clarity at small scales and dense data presentations. 

Tracking is strictly maintained at default or marginally tight tracking for data tables (`label-*`). Never use decorative web fonts or variable weight extremes outside of the specified scale.

## Layout & Spacing

The layout model relies on a **Fixed Grid** system (max-width 1280px) ensuring predictable alignment for complex administrative workflows, data-heavy dashboards, and multi-column document reviews. 

### Responsive Behavior
- **Desktop (1024px+):** 12-column grid, 24px gutters, 48px outer margins. Sidebar navigation is persistent.
- **Tablet (768px - 1023px):** 12-column fluid adaptation, 16px gutters, 24px margins. Navigation collapses to a top utility bar with drawer access.
- **Mobile (< 768px):** Single-column stacked layout, 12px gutters, 16px margins. Tables must transform into stacked key-value metadata cards.

Spacing adheres strictly to a 4px base multiplier rhythm (`space-1` through `space-12`), prioritizing compact density over excessive whitespace.

## Elevation & Depth

Visual hierarchy is communicated primarily through **Low-contrast outlines** and structured surface layering rather than dramatic shadows. 

- **Surfaces:** Use flat, solid white (`#FFFFFF`) containers against the light grey (`#F4F6F8`) canvas.
- **Borders:** Crisp, 1px structural outlines (`#E2E8F0`) define cards, table cells, and input boundaries.
- **Shadows:** Ambient shadows are strictly reserved for elevated interactive overlays (modals, dropdown menus, and sticky action bars) using extremely low-opacity, diffuse properties (`0 4px 6px -1px rgba(15, 41, 66, 0.08)`).

## Shapes

The design system employs a **Soft** shape language (`0.25rem` base roundedness, translating to `4px` border-radius). 

This subtle corner softening prevents the UI from feeling overly harsh or purely terminal-based, while strictly avoiding consumer-grade pill or blob aesthetics. Inputs, buttons, and standard cards utilize `4px` corners. Structural containers and large data panels may use `6px` (`rounded-lg`), ensuring a sharp, utilitarian, and predictable geometric rhythm.

## Components

### Buttons
- **Primary:** Deep institutional navy background (`#0F2942`), white text, 4px border-radius, no shadow. Hover state shifts to `#1E3A5F`.
- **Secondary:** Transparent background with 1px solid navy border (`#0F2942`), navy text.
- **Accent / Action:** Saffron (`#D97706`) background used sparingly for critical registration or submission actions.

### Chips & Badges
- Compact height (20px–24px), utilizing the defined status color system. Backgrounds must be set to a 10% opacity tint of the respective status color, with text matching the full-strength status hex.

### Lists & Data Tables
- High information density. Alternating row colors are forbidden; instead, rely on crisp 1px horizontal dividers (`#E2E8F0`). Table headers feature a distinct light grey background (`#E4E7EB`) with `label-md` uppercase text.

### Checkboxes & Radio Buttons
- Crisp 16x16px squares and circles with 1.5px borders. Checked states display the primary navy fill with a clean white checkmark or indicator dot.

### Input Fields
- Fixed height (36px for dense, 40px for standard). 1px border (`#CBD5E1`), 4px radius, white background. Labels must sit *outside* and above the input field (`label-md`, charcoal text). Helper text and validation errors appear below in `body-sm`.

### Cards
- Solid white containers with 1px solid borders (`#CBD5E1`) and internal padding of `16px` or `24px`. Used to encapsulate form sections, metadata groups, and metric summaries.

### Specialized Components
- **Metadata Key-Value Pairs:** Optimized for structured public data display, using tight vertical spacing (4px gap between label and value) with labels in 11px uppercase grey and values in 14px charcoal.
- **Alert Banners:** Full-width structural strips with left-border accent color (4px solid) corresponding to status, housing official notices, system downtimes, or urgent compliance alerts.