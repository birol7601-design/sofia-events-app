# Phase 1 Entities

```mermaid
erDiagram
    User ||--o{ SavedEvent : saves
    User ||--o{ Attending : attends
    User ||--o| Organizer : "registers as"
    User ||--o| TasteProfile : has
    User ||--o{ Friendship : "befriends"
    User ||--o{ Message : sends
    Organizer ||--o{ Event : creates
    Event }o--|| Venue : "held at"
    Event }o--o{ Artist : features
    Event ||--o| PromotedSlot : "promoted by"
    Event ||--o{ SavedEvent : "saved in"
    Event ||--o{ Attending : "attended in"
```

- **User** — a person who browses, saves, and attends events.
- **Organizer** — a verified user who creates events.
- **Event** — a Sofia event listing.
- **Venue** — the physical location where an event is held.
- **Artist** — a performer featured at an event.
- **PromotedSlot** — a manually assigned promotion (slot 1 King of the Hive, slots 2–8 Buzz Spots).
- **SavedEvent** — a user's bookmark of an event.
- **Attending** — a user's intent to attend an event.
- **Friendship** — a connection between two users.
- **Message** — a message sent by a user.
- **TasteProfile** — a user's preferences used for recommendations.
