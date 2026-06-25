import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Plus } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { FeaturedEvents } from "@/components/featured-events";

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

          <FeaturedEvents />
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
