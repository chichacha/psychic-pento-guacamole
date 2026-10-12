# 五マスの人たち。— Character Development 🎭

**Five squares. Twelve personalities. An unreasonable number of opinions.**

ここは、五マス村の住民たちの性格や関係性、名言、そしてまだ誰にも理解されていない思いつきを育てる場所です。

まだ決まっていないことも、矛盾していることも、大歓迎。

だって、本人たちだって自分のことをよくわかっていないかもしれません。

---

## 🧩 What belongs here?

Each character gets their own Markdown file when there is something worth exploring.

For example:

```text
characters/
├── index.qmd                 # Published character gallery
└── development/
    ├── README.md             # This guide
    ├── P.md                  # ぎゅっとくん
    └── X.md                  # まんなかおじさん (when ready!)
```

Character notes may include:

- **Personality:** Habits, quirks, strengths, weaknesses, contradictions.
- **Quotes:** Things they might say, including terrible advice.
- **Relationships:** Friendships, rivalries, misunderstandings, compatibility.
- **Story seeds:** Situations that might become stories or interactions.
- **Geometry-inspired traits:** Personality ideas rooted in actual pentomino properties.
- **Open questions:** Things we haven't decided yet.

There is no requirement to fill every section or create files for all twelve characters.

**Empty character files are not a milestone.**

## 🌱 Ideas vs. Canon

Not every idea becomes an official character trait.

We distinguish between two states:

### 💭 妄想中 — Ideas

Speculative, experimental, possibly ridiculous.

These ideas can contradict each other. That's fine.

Example:

> Pくんはプロジェクトマネージャーかもしれない。

### ⭐ 採用済み — Canon

Established traits already reflected in the published Gomasu universe.

Example:

> Pくんの名前は「ぎゅっとくん」。

Ideas become canon when we deliberately adopt them in character profiles, stories, or interactive experiences.

**A funny conversation is not automatically a constitutional amendment in 五マス村.**

## 🧪 How we develop characters

Our working philosophy:

**Prototype First. Propose Later. Document With Purpose.**

**PF — Prototype First**

Explore ideas through dialogue, sketches, small interactions, and stories. Don't wait for a perfect character specification.

**PL — Propose Later**

Try something. Share it. See whether the joke works or the character feels believable.

**DWP — Document With Purpose**

Capture ideas worth remembering. Don't create documentation simply because another idea appeared.

そして、忘れてはいけない大切なルール：

**面白さは自由。数学は正確に。**

*The stories can be absurd. The geometry cannot.*

## 📚 Where does information belong?

| Location | Responsibility |
|---|---|
| `data/characters.json` | Structured attributes used by the website |
| `characters/development/*.md` | Character ideas, personality development, relationships, possible stories |
| `characters/index.qmd` | Published character experience |
| `stories/` | Stories that have become actual content |
| GitHub Issues | Specific changes or experiments we intend to work on |

The Markdown notes are a creative workspace, **not another source of truth for the application**.

When an idea becomes an established, structured character attribute, update `characters.json` as appropriate.

## ✍️ Suggested character note template

Use whichever sections are useful.

```markdown
# P — ぎゅっとくん

> 「大事なものだけ、ぎゅっと。」

## ⭐ 採用済み · Canon

- Name: ぎゅっとくん
- Shape: P

## 💭 妄想中 · Personality ideas

- ...

## 💬 名言 · Quotes

- ...

## 🤝 関係性 · Relationships

- ...

## 📖 ネタ帳 · Story seeds

- ...

## ❓ 未解決 · Open questions

- ...
```

## 🌈 Creative principles

1. **Let geometry inspire personality.** A shape's limitations can become its quirks.
2. **Embrace contradictions.** Characters are more interesting when they surprise us.
3. **Leave room for relationships.** Twelve personalities become much more interesting together.
4. **Keep experiments lightweight.** One memorable quote can be enough to start a file.
5. **Don't over-engineer the imagination.** Not every joke needs a schema, issue, or pull request.

---

## 🐣 A note from the residents

「設定って、誰が決めてるの？」

「さあ。ぼくたちも知らない。」

「じゃあ、まだ変われるんだね。」

**五マスの人たち。まだまだ、成長中。**