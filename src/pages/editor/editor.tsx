import { MacOSSidebar } from '../../components/ui/sidebar';
import { useNavigation } from '../../store/navigation-store';
import { db } from "../../lib/database";
import { useEffect, useState } from "react";
import { Page } from '@/types';
import MarkdownEditor from '../../components/modules/markdown-editor';

export default function Editor() {
  const current = useNavigation((state) => state.current);

  const [pages, setPages] = useState<Page[]>([]);
  const [_, setIsLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);

  

  useEffect(() => {
    if (current.name !== "editor" || !current.params) {
      return;
    }

    async function loadPages() {
      try {
        setIsLoading(true);

        const result = await db.select<Page[]>(
          `
          SELECT
            id,
            project_id,
            title,
            emoji,
            document_path,
            parent_id,
            position,
            created_at,
            updated_at
          FROM pages
          WHERE project_id = ?
          ORDER BY position ASC, created_at ASC
          `,
          [current.params]
        );

        setPages(result);
      } catch (error) {
        console.error("Failed to load pages:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadPages();
  }, [current]);

  if (current.name !== "editor" || !current.params) {
    return (
      <div>
        Page not found
      </div>
    );
  }

  const items = pages.map((page) => {
    if (page.emoji) {
      return `${page.emoji} ${page.title}`;
    }

    return page.title;
  });

  return (
    <div className=" h-[90%] w-full mt-10">
      <MacOSSidebar
        id={current.params}
        items={items}
        className="h-[90%] w-full"
        onSelect={(index) => setSelectedPage(pages[index] ?? null)}
      >
        {selectedPage ? (
          <MarkdownEditor documentPath={selectedPage.document_path} />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Select a page to start editing
          </div>
        )}
      </MacOSSidebar>
    </div>
  );
}
