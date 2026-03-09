<h1 align="center">🔍 WeekendCheck</h1>

<p align="center"><b>Hi, I'm 0xNull.</b> Every weekend I pick a project from the pile and tell you if it's actually good.</p>

<p align="center">
  <b>You submit. The crowd upvotes. I review. No sugar coating.</b>
</p>

---

## 🤔 Why does this exist?

Everyone's shipping side projects. Nobody's checking if they're any good.

Product Hunt is a popularity contest. Reddit comments are chaos. Your friends will tell you "looks great bro" no matter what.

So I built a place where I actually use your product, record the experience, and tell you — and everyone else — what I really think. Every weekend.

## 🎯 What is WeekendCheck?

A curated review platform for indie projects and micro-SaaS. Submit your project, get it upvoted by the community, and when it reaches the top of the pile — I review it live.

Think Product Hunt meets Gordon Ramsay's Kitchen Nightmares, but for software.

## 🎬 How it works

1. 📬 **You submit** — Drop your project link and X handle
2. 📊 **The crowd votes** — Community upvotes what they want reviewed next
3. 🔬 **I review it** — One project per weekend, no holds barred
4. 📢 **Everyone sees** — The full review goes live with screenshots, notes, and a verdict

> No paid placements. No "sponsored reviews." Just honest takes. 🎯

## ✨ Features

- 📋 **The Pile** — A community-ranked queue of submitted projects waiting for review
- ⬆️ **Upvote system** — Vote to push projects higher in the queue
- 🔍 **Detailed reviews** — Written reviews with screenshots and Loom recordings
- 🏷️ **Curated sections** — Featured picks, tools I actually use, best of the week
- 🛡️ **Admin dashboard** — Drag-and-drop queue management, one-click review flow
- 🔗 **X integration** — Every project links back to the founder's profile

## 🛠️ Tech stack

- **Next.js 16** (App Router) + React 19 + TypeScript
- **Tailwind CSS v4** — hand-crafted dark theme
- **PostgreSQL 16** + Drizzle ORM — type-safe all the way down
- **@dnd-kit** — drag-and-drop queue reordering in admin
- **jose** — JWT auth for the admin panel

## 🚀 Running locally

```bash
# Start the database
docker compose up -d

# Install dependencies
npm install

# Set up the database
npx drizzle-kit push

# Seed the projects
DATABASE_URL="postgres://weekendcheck:weekendcheck_dev@localhost:5433/weekendcheck" npx tsx src/lib/db/seed.ts

# Start the dev server
npm run dev
```

Set `DATABASE_URL` and `ADMIN_JWT_SECRET` in your environment.

## 👥 The team

- 🧑‍💻 **0xNull** (@0x_null_dev) — Reviews the projects, builds the platform, has opinions
- 🤖 **Claude** — Wrote most of the code. Doesn't get weekends off either.

---

<p align="center"><i>shipping every weekend @ <a href="https://x.com/0x_null_dev">@0x_null_dev</a></i></p>
