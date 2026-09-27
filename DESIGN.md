# Design Brief

## Direction

Harvest Ledger — a high-contrast, field-ready agricultural ledger for Sinhala-speaking farmers and field officers, built mobile-first for Android and iPhone.

## Tone

Grounded and trustworthy, not decorative: deep leaf green + harvest gold on clean white, with the clarity of a well-printed ledger. Bold, legible, sunlight-readable.

## Differentiation

Every surface is tuned for outdoor phone use — oversized Sinhala type, 44px+ tap targets, and a warm green-tinted paper background that keeps white cards crisp under glare.

## Color Palette

| Token      | OKLCH        | Role                                            |
| ---------- | ------------ | ----------------------------------------------- |
| background | 0.985 0.008 150 | Warm off-white page surface                  |
| foreground | 0.22 0.03 155   | Primary text, near-black green               |
| card       | 1 0 0           | Pure white cards, tables, forms              |
| primary    | 0.47 0.14 150   | Deep leaf green — headers, CTAs, active nav  |
| accent     | 0.78 0.15 85    | Harvest gold — highlights, badges, active    |
| secondary  | 0.94 0.025 150  | Soft green wash for secondary buttons/sections |
| muted      | 0.955 0.014 150 | Section alternation, disabled, table stripes |
| success    | 0.5 0.13 152    | Saved / confirmed states                     |
| warning    | 0.72 0.16 78    | Validation warnings, low stock               |
| destructive| 0.52 0.2 27     | Delete, blocked routes, errors               |

## Typography

- Display: Space Grotesk (Latin headings/numerals) → Sinhala falls back to Noto Sans Sinhala / Iskoola Pota / Nirmala UI.
- Body: Figtree (Latin UI + numerals) → Sinhala falls back to the same platform Sinhala stack.
- Scale: hero `text-3xl md:text-5xl font-bold tracking-tight`, h2 `text-2xl md:text-3xl font-bold`, label `text-sm font-semibold`, body `text-base md:text-lg`.
- Sinhala rules: base `17px`, `line-height: 1.65`, no uppercase transforms on Sinhala text, never letter-space Sinhala, allow text to wrap rather than truncate labels.

## Elevation & Depth

White cards float on the tinted background via green-tinted shadows (`shadow-subtle` / `shadow-elevated` / `shadow-floating`); borders stay thin and muted, never heavy.

## Structural Zones

| Zone         | Background        | Border        | Notes                                              |
| ------------ | ----------------- | ------------- | -------------------------------------------------- |
| App header   | `bg-primary`      | none          | White Sinhala title, gold role chip, sticky top     |
| Page content | `bg-background`   | —             | Alternating `bg-muted/40` sections for rhythm       |
| Cards/lists  | `bg-card`         | `border-border` | White, radius `lg`, `shadow-elevated`             |
| Bottom nav   | `bg-card`         | `border-t`    | 4 tabs, active tab `text-primary` + gold underline  |
| Footer/meta  | `bg-muted/40`     | `border-t`    | Print/report metadata, low emphasis                 |

## Spacing & Rhythm

Mobile-first: page padding `px-4`, section gaps `space-y-5`, card padding `p-4 md:p-6`, micro-spacing `gap-2`/`gap-3`; controls never below 44px tall.

## Component Patterns

- Buttons: radius `lg`, filled leaf-green primary with white text, min-height 48px, `transition-smooth`, gold outline for secondary actions.
- Cards: white, radius `lg`, thin muted border, `shadow-elevated`, tappable rows with chevron affordance.
- Badges: pill-shaped, `bg-accent/20` gold with dark gold text for product/category; `success`/`warning`/`destructive` for status.
- Inputs: 48px min height, visible label above field, `ring-ring` focus, Sinhala placeholder text.

## Motion

- Entrance: `animate-fade-up` (0.35s) on page sections and list items, staggered by index.
- Hover/press: `transition-smooth` (0.25s) color + shadow; `active:scale-[0.98]` on primary buttons.
- Decorative: `animate-pulse-soft` reserved for live KPI indicators; no gratuitous motion.

## Constraints

- Entire UI in Sinhala; no English user-facing strings.
- Mobile-first: design at 390px, scale up with `sm:` / `md:` / `lg:`.
- AA+ contrast in light and dark; light theme is the default.
- No raw hex/rgb or arbitrary color classes in components — semantic tokens only.
- No visual zones reserved for out-of-scope features (payments/settlements, offline sync).

## Signature Detail

The "ledger rule" — a 3px harvest-gold left edge on active list rows and section headers, echoing a paper ledger tab and making the current record unmistakable at arm's length.
