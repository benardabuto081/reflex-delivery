# Reflex - Engineering Decisions

A short log of specific engineering decisions and the reasoning
behind them, in State -> Context -> Evidence format.

## 1. Modular Monolith, Not Microservices

State: Use a modular monolith architecture instead of microservices.

Context: The backend runs as one program, internally organized into
separate modules with distinct responsibilities. Microservices would
require deploying and managing multiple separately-running services,
plus handling service discovery and network failures between them -
overhead a five-person beginner team couldn't justify given the
one-week timeline.

Evidence: app.module.ts shows PrismaModule and DeliveriesModule as
separate, self-contained modules, both imported into a single
AppModule (imports: [PrismaModule, DeliveriesModule]) - proving the
separation exists in code organization, while the app still runs as
one deployed program.

## 2. PostgreSQL, Not MongoDB

State: Use PostgreSQL (relational) instead of MongoDB (document-based).

Context: Reflex's data has fixed, well-defined relationships between
entities - a Delivery belongs to a Store, is created by a User, and
is optionally assigned to a Rider. PostgreSQL with Prisma enforces
these relationships as foreign keys: the database itself refuses to
save a Delivery with a riderId pointing to a rider that doesn't
exist. MongoDB has no such enforcement - inconsistent data could be
saved silently, and the application code would have to manually
check referential integrity everywhere it writes data.

Evidence: schema.prisma defines riderId String? on Delivery with
rider Rider? @relation(fields: [riderId], references: [id]) - an
enforced foreign key relationship, not just a loosely typed field.

## 3. State Machine as a Pure Function, Separate from the Service Layer

State: Keep the state machine (canTransition, assertValidTransition)
as a pure function, separate from deliveries.service.ts.

Context: The state machine is kept as a pure function (no database
calls, no side effects) so it can be tested in isolation - calling
canTransition('PENDING', 'ASSIGNED') directly and checking the
result, with no database setup required. If it needed the database,
every test would require a real database connection and test data
just to check a simple rule. Separating it from deliveries.service.ts
(which handles the real side effects - saving to the database,
timestamps, audit logging) keeps the core business rule simple, fast
to test, and impossible to accidentally corrupt with unrelated
database logic.

Evidence: The code comment directly above canTransition() in
delivery-state-machine.ts states: "Pure function - no side effects,
easy to unit test in isolation." This logic lives in its own file,
entirely separate from deliveries.service.ts, which is where the
real side effects happen - assign(), pickup(), and deliver() each
call assertValidTransition() first, then handle the database update,
timestamp, and audit event afterward.
