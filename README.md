# Reflex

![status](https://img.shields.io/badge/status-in%20development-yellow)
![backend](https://img.shields.io/badge/backend-NestJS-e0234e)
![frontend](https://img.shields.io/badge/frontend-Next.js-black)
![database](https://img.shields.io/badge/database-PostgreSQL-336791)
![auth](https://img.shields.io/badge/auth-JWT%20%2B%20RBAC-blueviolet)

> **Project Motto:** *One source of truth, from doorstep to doorstep.*

**Context:** Built for Power Learn Project's "Reflex, The Readiness
Sprint" — the final assessment sprint, graded not on whether the
code works, but on whether the design can be explained and defended
live to a panel under real questioning. No stack was mandated, no
architecture was handed over — every decision below was made and
owned by the team, and is documented in full in `docs/`.

A delivery coordination platform for small Kenyan retailers — no
more tracking deliveries over WhatsApp threads and phone calls.

## The Problem

A small pharmacy or hardware shop today coordinates deliveries like
this: customer calls, staff writes it on a notepad, staff calls a
rider, staff calls the rider again later to ask "*umefika?*" No one
can answer "where is delivery #104 right now?" without picking up
the phone and asking someone.

## The Solution

Reflex gives three people a shared, always-current view of every
delivery:

    Retailer creates a delivery request
              |
    Dispatcher assigns it to an available rider
              |
    Rider updates its status as they go
              |
    PENDING -> ASSIGNED -> PICKED_UP -> DELIVERED

Every transition is enforced by a real state machine — not a
convention anyone could accidentally break. A delivery can't jump
from PENDING straight to DELIVERED, and once DELIVERED, it's final.
Every action is logged to an audit trail: who did what, and when.

## Architecture

    Next.js (frontend)
          |
          | REST + JWT
          v
    NestJS (backend) - modular monolith
          |
      ┌───┼───┬────────┐
      v   v   v        v
    Auth Users Deliveries Riders
          |
          v
    PostgreSQL (via Prisma)

A **modular monolith**, not microservices — clean separation between
auth, users, deliveries, and riders as distinct modules, without the
deployment/network complexity of running them as separate services.
Full reasoning: [`docs/decisions.md`](./docs/decisions.md).

## What's Actually Live

- ✅ Full delivery lifecycle — create, assign, pick up, deliver —
  backed by a pure, independently-testable state machine
- ✅ Complete audit trail — every status change timestamped and
  attributed to who triggered it
- ✅ Real authentication — JWT-based login/register, bcrypt-hashed
  passwords
- ✅ Real authorization — role-based guards enforced server-side:
  only a Retailer can create, only a Dispatcher can assign, only a
  Rider can pick up or deliver. Verified live: valid access, 403 on
  wrong role, 401 on no token.
- ✅ Role-based dashboards — Retailer, Dispatcher, and Rider each get
  their own view, wired to the real backend

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Backend | NestJS, TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT (`@nestjs/jwt`, Passport), bcrypt |

## Project Structure

    apps/
      api/    - NestJS backend
        src/
          auth/         - login, register, JWT strategy, guards
          users/        - user lookup, password hashing
          deliveries/   - lifecycle, state machine, audit trail
          riders/       - rider listing and assignment data
          prisma/       - database connection
      web/    - Next.js frontend
        app/
          login/
          retailer/dashboard/
          dispatcher/
          rider/
    docs/
      architecture.md   - full system design, data model, endpoints
      decisions.md      - key engineering decisions, State→Context→Evidence
      tradeoffs.md      - honest, documented weak points and why

## Running It Locally

**Backend:**

    cd apps/api
    npm install
    # create .env with DATABASE_URL, JWT_SECRET
    npx prisma migrate deploy
    npm run start

**Frontend:**

    cd apps/web
    npm install
    npm run dev

## Team — PLP Group 90

This is an individual assignment submission, built with real
collaborative support from the wider team on specific pieces:

| Contribution | Person |
|---|---|
| Backend architecture, state machine, full auth system, integration & deployment | Bernard Abuto |
| Seed data & test coverage | Wakaro |
| Dispatcher & Rider frontend | Josephleme |
| Retailer frontend & login | Koketso Matobako |
| Architecture & trade-off documentation | Faith Ogaro |

## Known, Documented Trade-offs

Full detail in [`docs/tradeoffs.md`](./docs/tradeoffs.md). In short:
plain-text addresses instead of GPS/geocoding, manual dispatch
instead of algorithmic rider-matching, REST instead of WebSockets for
real-time updates — each a deliberate scope decision under a sprint
timeline, not an oversight.

## Context

Built for PLP's Reflex Sprint: a working simulation where the panel
can — and will — ask "why this choice over the obvious alternative?"
for any decision in this document. Every answer here is backed by
real code and real test evidence, not hypotheticals.
