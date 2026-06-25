"use client";

import { api } from "@convex/api";
import { useQuery } from "convex/react";
import { CalendarDays, MapPin } from "lucide-react";

function formatStartsAt(startsAt: string) {
  const date = new Date(startsAt);

  if (Number.isNaN(date.getTime())) {
    return startsAt;
  }

  return date.toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function FeaturedEvents() {
  const events = useQuery(api.events.list);

  if (events === undefined) {
    return (
      <div aria-busy="true" className="grid gap-3">
        {["a", "b", "c"].map((key) => (
          <div
            className="h-28 animate-pulse rounded-lg border bg-card"
            key={key}
          />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-sm font-medium">No events yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Be the first to put one on the Sofia buzz.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {events.map((event) => (
        <article
          className="rounded-lg border bg-card p-4 shadow-sm"
          key={event._id}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-primary">
                {event.category}
              </p>
              <h3 className="mt-1 text-xl font-semibold">{event.title}</h3>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <CalendarDays aria-hidden="true" className="size-4" />
              {formatStartsAt(event.startsAt)}
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin aria-hidden="true" className="size-4" />
              {event.venueName}, {event.city}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}
