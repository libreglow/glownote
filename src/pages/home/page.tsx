import { CalendarDays, Clock, Plus, RotateCcwClock } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { GooeyInput } from '../../components/ui/gooey-input';
import { Modal } from '../../components/ui/dialog';
import { useEffect, useRef, useState } from 'react';
import { Input } from '../../components/ui/input';
import { invoke } from '@tauri-apps/api/core';
import { db } from '../../lib/database';

type Project = {
  id: string;
  title: string;
  created_at: number;
  updated_at: number;
};

const PAGE_SIZE = 4;

const events = [
  {
    id: 1,
    title: 'Project planning',
    date: 'Today',
    time: '14:00',
    image:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 2,
    title: 'Read documentation',
    date: 'Tomorrow',
    time: '09:30',
    image:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 3,
    title: 'Review my notes',
    date: 'Friday, August 15',
    time: '18:00',
    image:
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=900&q=80',
  },
];

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  async function loadProjects(pageNumber: number) {
    if (isLoading || !hasMore) return;

    setIsLoading(true);

    try {
      const offset = pageNumber * PAGE_SIZE;

      const result = await db.select<Project[]>(
        `
      SELECT
        id,
        title,
        created_at,
        updated_at
      FROM projects
      ORDER BY updated_at DESC
      LIMIT ? OFFSET ?
      `,
        [PAGE_SIZE, offset],
      );

      setProjects((prev) => {
        if (pageNumber === 0) {
          return result;
        }

        return [...prev, ...result];
      });

      if (result.length < PAGE_SIZE) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setIsLoading(false);
    }
  }
  useEffect(() => {
    loadProjects(0);
  }, [isLoadingProjects, title, isModalOpen]);

  useEffect(() => {
    const element = loadMoreRef.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          setPage((prev) => {
            const nextPage = prev + 1;
            loadProjects(nextPage);
            return nextPage;
          });
        }
      },
      {
        rootMargin: '200px',
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [hasMore, isLoading]);

  async function createProject() {
    if (!title.trim()) return;

    setIsCreating(true);

    try {
      const projectId = crypto.randomUUID();
      const pageId = crypto.randomUUID();
      const now = Date.now();

      await invoke('newProject', {
        projectId,
        pageId,
        content: `# ${title}\n`,
      });

      await db.execute(
        `
      INSERT INTO projects (
        id,
        title,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?)
      `,
        [projectId, title.trim(), now, now],
      );

      await db.execute(
        `
      INSERT INTO pages (
        id,
        project_id,
        title,
        emoji,
        document_path,
        parent_id,
        position,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          pageId,
          projectId,
          title.trim(),
          null,
          `projects/${projectId}/pages/${pageId}.md`,
          null,
          0,
          now,
          now,
        ],
      );

      setTitle('');
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="mt-10 min-h-screen w-full px-6 py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Thursday, August 13
            </p>

            <h1 className="mt-2 text-4xl font-extrabold tracking-tight">
              Good afternoon, User
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              What would you like to work on today?
            </p>
          </div>

          <div className="flex gap-2">
            <GooeyInput placeholder="Search..." />
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
              <p>title</p>
              <Input
                className="w-full"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <Button
                className="w-full mt-4"
                onClick={createProject}
                disabled={isCreating}
              >
                <Plus />
              </Button>
            </Modal>
            <Button
              onClick={() => {
                setIsModalOpen(true);
              }}
              className={
                'flex h-10  relative cursor-pointer items-center justify-center gap-2 rounded-full px-4 text-sm font-medium outline-none transition-[color,box-shadow] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50'
              }
            >
              <Plus />
            </Button>
          </div>
        </div>

        <div className="mt-12">
          <div className="flex items-center gap-2">
            <RotateCcwClock className="h-4 w-4 text-muted-foreground" />

            <p className="text-sm font-semibold text-muted-foreground">
              Recent Visits
            </p>
          </div>

          <div className="max-h-[320px] overflow-y-auto divide-y rounded-xl border border-border bg-background">
            {projects.map((project) => (
              <button
                key={project.id}
                type="button"
                className="flex w-full items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-muted/50"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {project.title}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(project.updated_at).toLocaleString()}
                  </p>
                </div>
              </button>
            ))}

            {hasMore && (
              <div
                ref={loadMoreRef}
                className="flex h-10 items-center justify-center text-xs text-muted-foreground"
              >
                {isLoading && 'Loading...'}
              </div>
            )}
          </div>
        </div>

        <div className="mt-10">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />

            <p className="text-sm font-semibold text-muted-foreground">
              Upcoming Events
            </p>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Card
                key={event.id}
                className="overflow-hidden p-0 transition-shadow hover:shadow-md"
              >
                <CardHeader
                  style={{
                    backgroundImage: `url(${event.image})`,
                  }}
                  className="h-44 p-0 bg-cover bg-center"
                />

                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold">
                        {event.title}
                      </p>

                      <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarDays className="h-4 w-4" />
                        <span>{event.date}</span>
                      </div>

                      <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{event.time}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
