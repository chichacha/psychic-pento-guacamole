# 🏓 Gomasu Pickleball Club — Story series

A story-first, Japanese-language series in which the Gomasu villagers discover fairness, combinations, and game rules by trying to play pickleball together.

## Editorial premise

**The villagers want to play. The scheduling problem follows.**

The narrative is the main attraction. Mathematics and interactive explanations are optional discoveries, not prerequisites for enjoying a story.

### Fairness priorities

1. **Equal playing opportunity** — Everyone should play and rest equally often over a complete rotation, where feasible.
2. **Partner variety** — Among schedules satisfying the first goal, try to rotate doubles partners.
3. **Opponent variety** — A secondary consideration, subject to the first two priorities.

Don't silently trade away equal participation for a prettier partnership schedule.

## Planned episodes

| Episode | Working title | Question |
| --- | --- | --- |
| 01 | 5人なのに、コートは1面。 | How can five players share one doubles court fairly? |
| 02 | もう一人、来ちゃった。 | What changes when six people want to play? |
| 03 | ゴマス村ダブルス交流会。 | How can up to twelve villagers rotate across two courts? |
| 04 | 負けても、もう一試合。 | How can a friendly singles tournament guarantee more play? |

Only Episode 01 is drafted. The others are ideas, not published pages.

## Mathematical notes

- Five players on one doubles court: one rest per round; five rounds give everyone exactly one rest.
- There are **10** distinct unordered partner pairs among five players, and five doubles matches use **10** partner slots in total. A schedule covering each pair exactly once is possible, but should be verified when implemented.
- Six players on one court: two rest per round; there are **15** possible unordered resting pairs (6 choose 2). Three rounds suffice for equal rest counts, with each person resting once.
- Twelve players on two doubles courts: four rest per round; three rounds suffice for equal rest counts, with each person resting once.
- Equal rest counts alone do **not** guarantee varied partners, opponents, or wait times.

## Interactive storytelling ideas

- A tap-to-choose **who rests next** activity, embedded in an episode.
- A simple doubles **partner rotation** display.
- Rule-learning scenes: **two-bounce rule**, **non-volley zone (kitchen)**, **serve**, and **doubles scoring**.
- A separate experimental scheduling prototype, only if the story calls for it.

Use authoritative current pickleball rules before publishing rule judgments; make clear when examples assume a particular ruleset or scoring format.

## Project boundaries

- `stories/pickleball/`: published narrative and lightweight story interactions.
- `research/`: mathematical investigations and validated claims.
- `experimental/`: substantial schedulers, game-rule prototypes, and Unity app design experiments.

Keep the series **Japanese-first** and this internal README **English-first**. Don't reorganize `stories/index.qmd` until there is enough published material to justify a new gallery structure.
