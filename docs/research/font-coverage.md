# Font coverage for Kazakh, Russian and Latin

Verified 2026-09-06 by reading the `cmap` table of every woff2 Google Fonts
serves for each family. This is glyph-level evidence, not a reading of subset
labels — a family can advertise a `cyrillic` subset and still contain none of
the Kazakh letters.

Reproduce with `node scripts/check-font-coverage.mjs "Family+Name:wght@400"`.

## Why this matters

Kazakh Cyrillic needs nine letter pairs that Russian Cyrillic does not have:

    Ә ә   Ғ ғ   Қ қ   Ң ң   Ө ө   Ұ ұ   Ү ү   Һ һ   І і

A font missing them renders our own members' names as empty boxes. Every face
the site ships must pass.

## Result

### Full coverage — safe to use

| Family | Role | Codepoints |
|---|---|---|
| **Geist** | sans | 604 |
| **Geist Mono** | mono | 762 |
| **IBM Plex Sans** | sans | 778 |
| **IBM Plex Mono** | mono | 676 |
| **Onest** | sans | 768 |
| **Golos Text** | sans | 516 |
| **Commissioner** | sans | 921 |
| **Rubik** | sans | 826 |
| **Oswald** | condensed display | 803 |
| **Spectral** | serif | 741 |
| **Literata** | serif | 1072 |
| **Source Serif 4** | serif | 807 |
| **Bitter** | slab serif | 871 |
| **Noto Serif Display** | display serif | 2222 |
| **Alegreya** | serif | 1149 |
| **PT Serif** | serif | 567 |
| **Fira Code** | mono | 1184 |
| **Roboto Mono** | mono | 832 |

### Fails — must not be used for any text that can appear in Kazakh

| Family | Missing |
|---|---|
| **Space Grotesk** | all 18 Kazakh glyphs, and all Russian Cyrillic |
| **Space Mono** | all 18 Kazakh glyphs, and all Russian Cyrillic |
| **Syne** | all 18, and all Russian Cyrillic |
| **Archivo** | all 18, and all Russian Cyrillic |
| **Anton** | all 18, and all Russian Cyrillic |
| **Bebas Neue** | all 18, and all Russian Cyrillic |
| **Unbounded** | 16 of 18 (has І і only) |
| **Wix Madefor Display** | 16 of 18 |
| **Martian Mono** | 16 of 18 |
| **Playfair Display** | 14 of 18 |
| **JetBrains Mono** | 12 of 18 (missing Ә Ғ Қ Ң Ұ Һ) |
| **Manrope** | 10 of 18 |

## Consequence for this project

The original build package proposed **Space Grotesk** as the display face and
asserted it "covers Cyrillic". It does not — it has no Cyrillic whatsoever. That
recommendation is rejected on this evidence.

The partial failures are the more dangerous category: **JetBrains Mono** and
**Manrope** render most Cyrillic correctly and then drop exactly the Kazakh
letters, so the problem only surfaces on a Kazakh page that nobody tested.

Geist and Geist Mono both pass in full, so the body and mono voices from the
original proposal stand. Only the display face needed replacing.
