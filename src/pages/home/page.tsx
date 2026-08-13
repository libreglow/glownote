import {
  CalendarDays,
  Clock,
  Plus,
  RotateCcwClock,
  Search,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "../../components/ui/card";

const recentNotes = [
  {
    id: 1,
    title: "Welcome to GlowNote",
    updated: "Just now",
  },
  {
    id: 2,
    title: "Ideas",
    updated: "Yesterday",
  },
  {
    id: 3,
    title: "My projects",
    updated: "2 days ago",
  },
];

const events = [
  {
    id: 1,
    title: "Project planning",
    date: "Today",
    time: "14:00",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 2,
    title: "Read documentation",
    date: "Tomorrow",
    time: "09:30",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 3,
    title: "Review my notes",
    date: "Friday, August 15",
    time: "18:00",
    image:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=900&q=80",
  },
];

export default function Home() {
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
            <Button variant="outline" className="gap-2">
              <Search className="h-4 w-4" />
           
            </Button>

            <Button className="gap-2">
              <Plus className="h-4 w-4" />
             
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

          <div className="mt-4 divide-y rounded-xl border border-border bg-background">
            {recentNotes.map((note) => (
              <button
                key={note.id}
                type="button"
                className="flex w-full items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-muted/50"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {note.title}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {note.updated}
                  </p>
                </div>
              </button>
            ))}
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
                <CardHeader   style={{
    backgroundImage: `url(${event.image})`,
  }}   className="h-44 p-0 bg-cover bg-center"
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