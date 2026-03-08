import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";

export const projectStatusEnum = pgEnum("project_status", [
  "in_queue",
  "in_review",
  "checked",
  "archived",
  "watching",
]);

export const projects = pgTable("projects", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  logoUrl: text("logo_url").notNull(),
  xProfilePic: text("x_profile_pic"),
  founderName: text("founder_name"),
  url: text("url").notNull(),
  githubUrl: text("github_url"),
  description: text("description").notNull().default(""),
  xHandle: text("x_handle").notNull(),
  xThreadUrl: text("x_thread_url"),
  tags: text("tags").array().notNull().default([]),
  status: projectStatusEnum("status").notNull().default("in_queue"),
  upvotes: integer("upvotes").notNull().default(0),
  queueOrder: integer("queue_order").notNull().default(0),
  featured: boolean("featured").notNull().default(false),
  toolsIUse: boolean("tools_i_use").notNull().default(false),
  bestLastWeek: boolean("best_last_week").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
});

export const reviews = pgTable("reviews", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  reviewNumber: integer("review_number").notNull(),
  text: text("text").notNull(),
  loomUrl: text("loom_url"),
  screenshots: text("screenshots").array().notNull().default([]),
  published: boolean("published").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
