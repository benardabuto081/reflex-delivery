# Reflex — Trade-offs

This document lists honest, real trade-offs made during the build,
not hypothetical ones. Each one follows: what it is, why it was
accepted, and what would be done differently with more time.

## 1. Plain-text address, no GPS/geocoding

Delivery addresses are stored as plain text (deliveryAddress String
in the schema), not structured location data with coordinates. This
was accepted because the team's priority this sprint was getting the
delivery lifecycle and state machine working correctly — that is
what is actually being tested this week, not route optimization.
With more time, the address field would be replaced or supplemented
with real coordinates via a geocoding API (like Google Maps),
enabling actual route display and distance estimates instead of a
raw string a dispatcher has to read and interpret manually.

## 2. Manual dispatch, no algorithmic rider-matching

The system uses manual dispatch instead of algorithmic rider-matching
— assign() in deliveries.service.ts takes a riderId directly as a
parameter, chosen by whoever calls the endpoint (the Dispatcher),
rather than the system selecting one automatically. This was accepted
because automatic matching would require rider location tracking,
which does not exist in the schema at all right now (Rider only has
availabilityStatus — AVAILABLE, BUSY, OFFLINE — not location).
Building real-time location tracking and a matching algorithm would
have taken time away from what is actually graded this week: the
delivery lifecycle and state machine. With more time, the team would
add location data to the Rider model and build a simple matching
algorithm — e.g. auto-suggesting the nearest available rider — rather
than requiring the Dispatcher to choose manually.

## 3. REST-only, no real-time push (WebSockets)

The system uses REST-only endpoints (GET/POST) instead of WebSockets,
meaning there is no real-time push — a Dispatcher has to manually
refresh to see a new PENDING delivery appear. This was accepted
because WebSockets require a persistent connection between server and
browser, plus extra server-side complexity to track which clients are
connected and push updates to the right ones — meaningfully more work
than REST's simple request-and-response pattern, and not worth the
time given a one-week sprint. With more time, the team would add
WebSocket support so new deliveries and status changes push to
connected dashboards automatically, instead of requiring a manual
refresh.
