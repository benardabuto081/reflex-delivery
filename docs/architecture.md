# Reflex — Architecture

## Tech Stack and Modular Monolith

Reflex is built as a modular monolith. This means the backend runs as
a single program, internally organized into separate, well-defined
modules — each with its own responsibility (for example, PrismaModule
for database access, DeliveriesModule for delivery logic). We chose
this over a microservices architecture because microservices would
require deploying and managing multiple separately-running services,
service discovery, and handling network failures between them —
overhead a five-person beginner team couldn't justify in a one-week
sprint. A modular monolith gives the benefit of clean separation
between concerns without that infrastructure cost.

Stack: Next.js (frontend), NestJS (backend), Prisma (ORM), PostgreSQL
(database).

## Data Model — 5 Entities

1. **User** — has a `role` field (`RETAILER`, `DISPATCHER`, or `RIDER`)
   that controls what actions a person is allowed to take in the
   system.

2. **Store** — represents a retailer's shop. Two models connect to it:
   `User` (a retailer's account is optionally tied to the store they
   work for, via `storeId`) and `Delivery` (every delivery belongs to
   exactly one store — `storeId` is required here).

3. **Rider** — a separate model from `User`, because riders need extra
   fields (`phone`, `availabilityStatus`) that don't apply to
   Retailers or Dispatchers. Rider links back to User with a
   one-to-one relationship (`userId`), so only actual riders carry
   that extra data.

4. **Delivery** — the core object. `riderId` is optional (`String?`)
   because a PENDING delivery, by definition, has no rider assigned
   yet — the schema mirrors the real-world lifecycle rather than
   fighting it.

5. **AuditEvent** — creates a permanent trail of every action taken on
   a delivery: who did it, what changed, and when. Without it, the
   Delivery table only shows the current status; AuditEvent is what
   lets the team reconstruct full history if a dispute or question
   comes up later.

## Delivery Lifecycle and the State Machine

A delivery moves through four statuses, in strict order:
PENDING -> ASSIGNED -> PICKED_UP -> DELIVERED.

This is enforced in `delivery-state-machine.ts`, not left as a
convention. ALLOWED_TRANSITIONS is a lookup table defining which
status can follow each current status — PENDING can only move to
ASSIGNED, ASSIGNED only to PICKED_UP, PICKED_UP only to DELIVERED, and
DELIVERED cannot move anywhere (it is the final state).

canTransition() checks a specific request against this table. For
example, canTransition('ASSIGNED', 'DELIVERED') looks up ASSIGNED's
allowed list (['PICKED_UP']), checks whether DELIVERED is in it, and
returns false because it isn't.

assertValidTransition() calls canTransition() and, if it returns
false, throws an InvalidTransitionError — stopping the invalid change
before it ever reaches the database. The state machine is a pure
function (no side effects), kept separate from deliveries.service.ts,
which handles the real-world side effects: saving to the database,
setting timestamps, and writing the audit trail.

## API Endpoints

A Retailer creates a new delivery when an order comes in
(POST /deliveries), which starts it at PENDING. Deliveries can be
listed, viewed individually, and their full audit history retrieved
(GET /deliveries, GET /deliveries/:id, GET /deliveries/:id/events).
A Dispatcher assigns a rider (POST /deliveries/:id/assign), moving it
to ASSIGNED. The Rider marks it picked up
(POST /deliveries/:id/pickup) and later delivered
(POST /deliveries/:id/deliver). These three transitions must happen
in that exact order; attempting to skip a step triggers an
InvalidTransitionError, which the controller catches and returns as a
400 Bad Request with a clear message, rather than a generic server
error.

## Authentication

Status: IN PROGRESS — not yet present in the repository as of
30 August 2026. No auth folder exists under apps/api/src on main or
any branch (confirmed via git fetch). This section will be completed
once auth is merged. Followed up with Bernard directly.
