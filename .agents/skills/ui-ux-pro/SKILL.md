---
name: ui-ux-pro
description: Enforces professional UI/UX design systems, typography, curated color palettes, responsive layouts, micro-animations, component accessibility, and visual excellence across web applications.
---

# UI/UX Pro Skill — Design System & Visual Excellence Framework

This skill establishes strict UI/UX standards to ensure all web interfaces look state-of-the-art, polished, accessible, responsive, and delightful.

---

## 1. Visual Hierarchy & Color Systems

- **Curated Color Tokens**:
  - Primary Brand Accent: Emerald/Blue (`#059669`, `#2563eb`).
  - Neutral Backgrounds: Crisp `#ffffff` light surfaces with subtle `#f9fafb` section fills, bordered by `#e5e7eb`.
  - Dark Surfaces: `#030712` base background, `#111827` card containers, `#1f2937` borders.
  - Semantic Status Colors:
    - Success/Verified: `#10b981` green, bg `#d1fae5`, border `#a7f3d0`.
    - Pending/Warning: `#f59e0b` amber, bg `#fef3c7`, border `#fde68a`.
    - Error/Danger: `#ef4444` red, bg `#fee2e2`, border `#fca5a5`.
- **Typography & Scale**:
  - Primary Font: Inter / System UI sans-serif stack.
  - Page Titles: `24px` (`1.5rem`), `font-weight: 800`.
  - Section Headings: `18px` (`1.125rem`), `font-weight: 700`.
  - Card Titles: `15px` - `16px`, `font-weight: 700`.
  - Body Text: `13px` - `14px`, `font-weight: 400`/`500`, `color: #374151` (light) / `#d1d5db` (dark).
  - Metadata / Micro labels: `11px` - `12px`, `font-weight: 600`, `text-transform: uppercase`, `letter-spacing: 0.05em`.

---

## 2. Component Design & Anatomy

- **Cards & Containers**:
  - Border radius: `12px` - `16px`.
  - Border: `1px solid #e5e7eb` (light) / `1px solid #1f2937` (dark).
  - Subtle Shadows: `box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.04)`.
- **Interactive Buttons**:
  - Primary: `#2563eb` or `#059669` fill, `#ffffff` text, `font-weight: 600`, hover transition `0.15s ease`.
  - Secondary / Outline: `#ffffff` fill, `#374151` text, `border: 1px solid #d1d5db`, shadow-sm.
  - Danger: `#ffffff` fill, `#ef4444` text, `border: 1px solid #fca5a5`.
- **Badges & Pills**:
  - `padding: 2px 8px`, `border-radius: 9999px`, `font-size: 11px`, `font-weight: bold`.

---

## 3. Information Architecture & Layout Math

- **2-Column Layout Grid**:
  - Main Column: `minmax(0, 1fr)` (approx. 70% width).
  - Sidebar Column: `320px` fixed width (approx. 30% width).
  - Gap: `24px`.
- **Responsive Touch & Viewport Bounds**:
  - Flex wrap enabled on headers and metadata action bars.
  - Min touch target height: `36px` - `40px`.

---

## 4. Micro-Interactions & States

- **Loading States**: Animated pulse skeletons with identical geometry to content cards.
- **Empty States**: Centered illustration/icon, clear explanation text, and direct action button.
- **Toast Notifications**: Floating glassmorphism alerts with auto-dismiss timer.
- **Modals / Drawers**: Backdrop blur `backdrop-filter: blur(6px)`, smooth fade-in, fixed overlay depth (`z-index: 9999`).
