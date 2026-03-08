CREATE TYPE "public"."project_status" AS ENUM('in_queue', 'in_review', 'checked', 'archived', 'watching');--> statement-breakpoint
CREATE TABLE "projects" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"logo_url" text NOT NULL,
	"x_profile_pic" text,
	"founder_name" text,
	"url" text NOT NULL,
	"github_url" text,
	"description" text DEFAULT '' NOT NULL,
	"x_handle" text NOT NULL,
	"x_thread_url" text,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"status" "project_status" DEFAULT 'in_queue' NOT NULL,
	"upvotes" integer DEFAULT 0 NOT NULL,
	"queue_order" integer DEFAULT 0 NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"tools_i_use" boolean DEFAULT false NOT NULL,
	"best_last_week" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"reviewed_at" timestamp,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"review_number" integer NOT NULL,
	"text" text NOT NULL,
	"loom_url" text,
	"screenshots" text[] DEFAULT '{}' NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;