# Design

Status: **approved direction (2026-10-21): A · Arcade Log** for the public website.
The admin (`/admin`, `/login`) keeps its own Review Desk styles and is out of scope.
Values below are the starting tokens; adjust them with the owner and update this file when agreed decisions change.

## Direction

Alex's pixel-art portrait sets the world: a calm night-blue screen, sand-coloured text, one coin-yellow accent.
The site should feel like a personal, slightly playful log of what Alex tried, while staying easy to read.

**Owner's note (2026-10-21):** the owner is not a fan of pixel art; Arcade Log was chosen because it fits the profile
picture. So the pixel look stays **restrained**:
- Pixel elements are the portrait, the pixel font on small labels and numbers, and the hard offset shadow on the
  primary button and the portrait. Nothing else.
- Headlines and everything people read use normal, highly readable fonts. Never set paragraphs, review text or
  buttons' long labels in the pixel font.
- No pixel borders, sprites, scanlines, glitch effects or 8-bit icons.

Principles:
1. **Reading first.** Reviews are the product. Review text is large, high-contrast and comfortably measured.
2. **Honest numbers.** Money spent, access type and review type are shown plainly, with words, not colour alone.
3. **One primary action per view.** "Send me your project" is the main call to action across the site.
4. **Real content only.** No fake testimonials, stats or examples.

## Tokens

Defined once in `src/app/(site)/site.css` on `.site`. Single dark theme (the site does not switch to light).

| Token | Value | Use |
| --- | --- | --- |
| `--night` | `#0e1626` | Page background |
| `--panel` | `#16223a` | Cards, rows, panels |
| `--panel-2` | `#1c2b49` | Hover and raised panels |
| `--grid` | `#22314f` | Hairlines, hero grid, meter track |
| `--line` | `#33466b` | Borders that must be visible (3:1 on panels) |
| `--sand` | `#f4e6c8` | Primary text (about 14:1 on night) |
| `--dim` | `#a9b6cc` | Secondary text (about 8:1 on night) |
| `--coin` | `#ffcf3f` | The accent: primary button, money, highlighted word, active nav |
| `--tomato` | `#ff6a4d` | Primary button shadow, Paid tag edge, errors |
| `--sea` | `#59b8f0` | Deep review, links in text, portrait shadow |
| `--mint` | `#7be0b0` | Quick take, success messages |

Meaning colours are always paired with a word: Deep review (sea), Quick take (mint), Paid (coin), anything else
(outlined, dim). Only Paid access and its amount are public (they feed the budget); Free and Trial stay private.

## Typography

- Display: **Bricolage Grotesque** 700/800, tight tracking (about -0.035em), `text-wrap: balance`.
- Body: **Atkinson Hyperlegible** 400/700, 17px on desktop, 16px on phones, line height 1.6. Review text 18px / 1.7.
- Labels and numbers: **Silkscreen** 400/700, 11 to 14px, uppercase as written. Only labels, tags, meters,
  prices and dates. Use `tabular-nums` where numbers line up. Large figures (the budget totals) use the display
  font: Silkscreen above about 16px looks blocky (owner, 2026-10-21).
- Fonts load through `next/font` (self-hosted, `display: swap`).

## Shape, spacing, motion

- 4px base grid; section spacing 64 to 96px desktop, 48 to 64px phones. Content max width 1180px; reading column 680px.
- Square corners (radius 0 to 4px). Panels have a 2px `--grid` border. Hard offset shadows (4px, no blur) only on
  the primary button and the portrait.
- Motion: 150ms transform and colour transitions on hover (rows lift 2px, button shadow grows). Nothing animates on
  load. Everything is off under `prefers-reduced-motion`.

## Layout and navigation

- **Header:** the face tile and "0xAlex Check" in the pixel font on the left; Checks, Reviews, Budget and a coin
  "Contact" button on the right. On phones the text links shrink to Reviews and Budget, and Contact stays.
  The current page is marked by colour and an underline.
- **Footer:** the face tile, one line about the site, link groups (Site, Elsewhere, Legal), and the copyright.
- **Home:** hero (headline, one paragraph, Send me your project + Read reviews, portrait), the budget meter,
  weekly checks with week tabs, the latest reviews, how it works (three real steps), and a closing contact panel.
- **Project rows:** the whole row opens the review; the project name links to the project's site; tags sit next to
  the name; a "Read review" control on the right.
- **Review page:** back link, project header (logo, name, description, Visit project, builder's X), a fact box
  (review type, access, cost, week, published date), then the review posts as one readable article with media.
- **Budget:** spent and left as large numbers, the coin meter, and a receipt that lists every purchase.
- **Contact:** a short form (name, email, what it is about, link, message) with visible labels, inline errors and a
  clear success state. Spam is blocked by a hidden field and rate limits; no captcha.

## Accessibility

WCAG 2.2 AA: 4.5:1 text, 3:1 controls, visible focus (2px coin outline with offset), skip link, keyboard access,
labels on every field, errors announced with `role="alert"`, no colour-only meaning. Verify at 390 and 1440px.

## Avoid

Pixel font in paragraphs, emoji as icons, gradients, glass effects, soft drop shadows, rounded pill buttons,
fake numbers, and claims about reviews or reach that are not true.
