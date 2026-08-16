export type Page = {
  id: string;
  project_id: string;
  title: string;
  emoji: string | null;
  document_path: string;
  parent_id: string | null;
  position: number;
  created_at: number;
  updated_at: number;
};

