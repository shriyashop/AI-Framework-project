---
name: 'UI/UX standards'
description: 'House visual and interaction standards, and the rule that UI work does not start without inputs and brand assets.'
applyTo: '**/*.jsx,**/*.tsx,**/*.css,**/*.scss,**/*.html,**/components/**,**/pages/**,frontend/**,backlog-frontend/**,practicehub-frontend/**'
---

# UI/UX standards

## The rule that comes first

**No interface is built without a completed UI/UX input document and available brand assets.**

- Inputs: `docs/templates/UIUX-INPUT-TEMPLATE.md`, filled in, all ★ sections complete
- Brand assets: §1 below

If either is missing, say so and stop. Do not produce a "rough version to get started" — a rough version becomes the real version, and the visual decisions invented in it are never revisited. Producing one is not being helpful; it is pre-empting a decision that belongs to someone else.

---

## 1. Brand assets

> ### ⚠ TO BE COMPLETED BY THE ORGANISATION
>
> **This section is a placeholder. Until it is filled in, all UI work is blocked by the rule above.**
>
> The owner of this file must supply the following. The agent must not invent any of it, and must not substitute values found elsewhere in the codebase without saying that is what it is doing.

### 1.1 Colour

| Token | Value | Used for |
|---|---|---|
| `--bg` | | Page background |
| `--surface` | | Cards, panels |
| `--surface-2` | | Inputs, nested elements |
| `--text` | | Body text |
| `--text-muted` | | Secondary text |
| `--border` | | Dividers, outlines |
| `--accent` | | Primary action |
| `--accent-2` | | Secondary |
| `--success` | | |
| `--warning` | | |
| `--danger` | | Destructive actions |

**Semantic pairs** — every foreground token must name the background it is approved against, with its measured contrast ratio. A palette without tested pairs produces unreadable states nobody notices until a user complains.

| Foreground | On background | Ratio | Passes |
|---|---|---|---|

### 1.2 Typography

| | |
|---|---|
| Heading typeface | |
| Body typeface | |
| Monospace typeface | |
| Source (self-hosted / Google Fonts / licensed) | |
| Licence constraints | |
| Type scale | |
| Base size and line height | |

### 1.3 Logo

| | |
|---|---|
| File locations | |
| Variants (light, dark, mark-only) | |
| Minimum size | |
| Clear space | |
| **Forbidden uses** | *recolouring, stretching, effects, placement on busy backgrounds* |

### 1.4 Spacing, radius, elevation

| | |
|---|---|
| Spacing scale | |
| Border radius | |
| Shadow / elevation | |
| Grid and breakpoints | |

### 1.5 Components

| | |
|---|---|
| Component library, if any | |
| Where components live | |
| Approved patterns | |
| **Never use** | |

### 1.6 Hard rules

*Things that are non-negotiable regardless of what a requirement asks for. Example shapes: no UI framework may be introduced; no colour may be hard-coded that exists as a token; the logo is never recoloured.*

1.
2.
3.

---

## 2. Standards that apply regardless of brand

These hold even before §1 is filled in.

### Tokens, never literals
Never hard-code a colour, spacing value or font size that exists as a token. A hard-coded value is invisible to a future theme change and will be missed.

### Never introduce a UI framework
Unless §1.5 names one. Adding Bootstrap, Material or Tailwind to a codebase with its own design system is a fork of the visual language that then has to be maintained forever.

### Every state is designed
Empty, loading, partial, error, permission-denied, success, too-much-data. An undesigned empty state is the first thing a new user sees and makes a working system look broken.

### Accessibility is a floor, not a feature
- Keyboard operable throughout, with a visible focus indicator
- Semantic HTML before ARIA; ARIA only where semantics cannot express it
- Colour never the only carrier of meaning
- Every form control has a real label — a placeholder is not a label
- Contrast per the tested pairs in §1.1
- Text resizable to 200% without loss of function

### Errors say what happened and what to do
"An error occurred" is not an error message. Name what failed, and give the user their next action.

### Confirmations state the consequence
"Are you sure?" tells the user nothing. "Delete 47 claims? This cannot be undone." does.

### Reuse before build
Search for the existing component before writing a new one. A second table style or a third button variant is duplication with a visual signature — obvious to users, and the thing that makes an internal estate look unmaintained.

### Respect user settings
`prefers-reduced-motion`, `prefers-color-scheme`, browser font size. These are accessibility requirements wearing the clothes of preferences.

---

## 3. When a requirement conflicts with these standards

Do not quietly comply with the requirement. Say which standard it conflicts with, what the consequence is, and offer the nearest compliant alternative.

If the requester insists, that is a **deviation**: record it in the BRD's §8.3 with their reason in their words. Recorded deviations are acceptable; silent ones are how a design system dies one exception at a time.
