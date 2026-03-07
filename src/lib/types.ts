export type ProjectStatus = "in_queue" | "in_review" | "checked" | "archived" | "watching";

export interface Project {
  id: string;
  slug: string;
  name: string;
  logo_url: string;
  url: string;
  github_url?: string;
  description: string;
  x_handle: string;
  x_thread_url?: string;
  tags: string[];
  status: ProjectStatus;
  upvotes: number;
  featured: boolean;
  tools_i_use: boolean;
  best_last_week: boolean;
  created_at: string;
  reviewed_at?: string;
}

export interface Review {
  id: string;
  project_id: string;
  review_number: number;
  text: string;
  loom_url?: string;
  screenshots: string[];
  published: boolean;
  created_at: string;
  updated_at: string;
}
