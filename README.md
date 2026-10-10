# 五マスの人たち。
### Five Squares. Twelve Personalities.

**みんな同じ、5つの四角でできています。**

それ以外は、あまり似ていません。

本人たちは、いたって普通のつもりです。

---

🧩 **[ウェブサイトを見る · Visit the website](https://chichacha.github.io/psychic-pento-guacamole/)**

*12のペントミノと、ちょっと不思議な数学の世界。*

## 12人の仲間たち

ペントミノは、5つの正方形を辺でつないでできる形。

全部で12種類あります。

| 形 | 名前 |
|---|---|
| F | くねくねちゃん |
| I | まっすぐおじさん |
| L | のびのびちゃん |
| N | ずらしくん |
| P | ぎゅっとくん |
| T | しきりやおばさん |
| U | ぎゅーおばさん |
| V | かどっこおばさん |
| W | こつこつおばさん |
| X | まんなかおじさん |
| Y | はみだしくん |
| Z | つなぎおばさん |

みんな5マス。

でも、回ったり、ひっくり返ったりすると、それぞれ違う表情を見せてくれます。

ちなみに、Xおじさんは回っても同じ顔です。

本人はちゃんと回ったと言っています。

## 5 × 12 = 60

12種類のペントミノを全部合わせると、60マス。

この60マスを使って、6 × 10、5 × 12、4 × 15などの長方形を作ることができます。

ただし、どこに誰が入るかが問題です。

このサイトでは、実際のパズルの解答データを使って、12人の並び方を紹介しています。

並び方は、ときどき変わります。

本人たちには、まだ知らせていません。

## このサイトについて · About this project

This is a playful companion website for a Pentomino puzzle app created by my father.

Rather than recreating the puzzle game, the website explores the twelve pieces as characters—with personalities, geometry, symmetry, rotations, reflections, and the occasional unnecessary animation.

It's part mathematical playground, part interactive story, and part family creative project.

The underlying shapes and puzzle arrangements come from the original app's data.

The characters and their personalities are a separate, slightly less scientific interpretation.

## Built with

- **Quarto** — website authoring and publishing
- **JavaScript + SVG** — interactive pentomino characters and arrangements
- **CSS** — layout, typography, and visual identity
- **R** — data preparation and exploration
- **GitHub Pages** — hosting

The website is intentionally lightweight. The character gallery uses plain JavaScript and SVG, without requiring a visualization framework.

## Project structure

```text
.
├── _quarto.yml             # Website configuration
├── index.qmd               # Homepage
├── about.qmd               # About the project
├── characters/
│   └── index.qmd           # Meet the twelve characters
├── assets/
│   ├── css/                # Styles
│   ├── js/                 # Interactions
│   └── images/             # Images
├── data/                   # Character, posture, and puzzle data
└── docs/                   # Generated site for GitHub Pages
```

## Run locally

Install [Quarto](https://quarto.org/), clone the repository, and run:

```bash
quarto preview
```

To generate the published website:

```bash
quarto render
```

The output is written to `docs/`, which is configured for GitHub Pages.

## What's next?

This little universe is still growing.

Some things I'd like to explore:

- More character interactions and animations
- Rotational and reflection symmetry
- How the twelve pieces fit together
- Which characters tend to become neighbours
- Interactive visual explanations of pentomino mathematics
- More surprising things hiding inside five little squares

No promises about the order. The characters have opinions.

---

**Five squares. Twelve personalities. Quite a lot of possibilities.**

*Made with curiosity, code, and a little family inspiration.* 🧩