export type Role = "pending" | "writer" | "editor" | "admin";
export type PostStatus = "draft" | "review" | "published" | "archived";
export type TemplateKey = "editorial" | "magazine" | "minimal";

export type Department = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  color: string;
  sort_order: number;
};

export type Author = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
};

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: Role;
  created_at: string;
};

// ---- Blocks -----------------------------------------------------------

export type ListStyle = "bullet" | "number" | "check" | "dash" | "icon" | "cards";

export type ListItem = { id: string; text: string; title?: string; icon?: string };

export type Block =
  | { id: string; type: "heading"; text: string; level: 2 | 3 }
  | { id: string; type: "paragraph"; text: string }
  | { id: string; type: "image"; url: string; alt: string; caption: string; width: "normal" | "wide" | "full" }
  | { id: string; type: "list"; style: ListStyle; icon: string; columns: 1 | 2; items: ListItem[] }
  | { id: string; type: "quote"; text: string; cite: string }
  | { id: string; type: "callout"; tone: "info" | "warning" | "success" | "highlight"; icon: string; title: string; text: string }
  | { id: string; type: "video"; url: string; caption: string }
  | { id: string; type: "stats"; items: { id: string; value: string; label: string }[] }
  | { id: string; type: "button"; label: string; url: string; align: "left" | "center" }
  | { id: string; type: "divider"; style: "line" | "dots" | "space" };

export type BlockType = Block["type"];

export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image: string | null;
  department_id: string | null;
  template: TemplateKey;
  blocks: Block[];
  tags: string[];
  status: PostStatus;
  featured: boolean;
  reading_minutes: number;
  author_id: string | null;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

// Post with its department and author attached (public pages)
export type PostCardData = Pick<
  Post,
  "id" | "slug" | "title" | "excerpt" | "cover_image" | "reading_minutes" | "published_at" | "featured" | "tags"
> & {
  department: Pick<Department, "slug" | "name" | "color"> | null;
  author: Pick<Author, "full_name"> | null;
};
