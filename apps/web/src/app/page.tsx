import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { CalendarDays, MapPin, Plus } from "lucide-react";
import { Button } from "@workspace/ui/components/button";

const featuredEvents = [
  {
    title: "Rooftop Jazz Night",
    venue: "Central Sofia",
    date: "Fri, 20:30",
    category: "Music",
  },
  {
    title: "Design District Walk",
    venue: "KvARTal",
    date: "Sat, 11:00",
    category: "Culture",
  },
  {
    title: "Late Market Session",
    venue: "Women’s Market",
    date: "Sun, 18:00",
    category: "Food",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-sm text-muted-foreground">Sofia Buzz</p>
            <h1 className="text-2xl font-semibold tracking-normal">
              Event discovery workspace
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Show when="signed-out">
              <SignInButton>
                <Button variant="outline">Sign in</Button>
              </SignInButton>
              <SignUpButton>
                <Button>Sign up</Button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Button>
                <Plus aria-hidden="true" />
                Create event
              </Button>
              <UserButton />
            </Show>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">Featured events</h2>
            <Button variant="secondary">View all</Button>
          </div>

          <div className="grid gap-3">
            {featuredEvents.map((event) => (
              <article
                className="rounded-lg border bg-card p-4 shadow-sm"
                key={event.title}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-primary">
                      {event.category}
                    </p>
                    <h3 className="mt-1 text-xl font-semibold">
                      {event.title}
                    </h3>
                  </div>
                  <Button variant="outline">Manage</Button>
                </div>
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays aria-hidden="true" className="size-4" />
                    {event.date}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <MapPin aria-hidden="true" className="size-4" />
                    {event.venue}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-3">
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <h2 className="text-base font-semibold">Foundation status</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Next app router</li>
              <li>Tailwind v4 tokens</li>
              <li>ShadCN-compatible components</li>
              <li>Shared Zod validators</li>
              <li>React Compiler enabled</li>
            </ul>
          </div>
        </aside>
      </section>
    </main>
  );
}
