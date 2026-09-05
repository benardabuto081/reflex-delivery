import type { Session, User, Delivery, Rider } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function login(email: string, password: string): Promise<Session> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Invalid email or password");
  const session: Session = await res.json();
  localStorage.setItem("reflex_session", JSON.stringify(session));
  return session;
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("reflex_session");
  return raw ? JSON.parse(raw) : null;
}

export function logout() {
  localStorage.removeItem("reflex_session");
}

function authHeaders(): HeadersInit {
  const session = getSession();
  return session
    ? { Authorization: `Bearer ${session.accessToken}` }
    : {};
}

export async function getDeliveries(storeId: string): Promise<Delivery[]> {
  const res = await fetch(`${API_BASE}/deliveries`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Could not load deliveries");
  const all: Delivery[] = await res.json();
  return all.filter((d) => d.storeId === storeId);
}

export async function getAllDeliveries(): Promise<Delivery[]> {
  const res = await fetch(`${API_BASE}/deliveries`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Could not load deliveries");
  return res.json();
}

export async function getRiders(): Promise<Rider[]> {
  const res = await fetch(`${API_BASE}/riders`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Could not load riders");
  return res.json();
}

export async function getRiderProfile(): Promise<Rider | null> {
  const session = getSession();
  if (!session) return null;
  const riders = await getRiders();
  return riders.find((r) => r.userId === session.user.id) ?? null;
}

export async function assignDelivery(deliveryId: string, riderId: string): Promise<Delivery> {
  const session = getSession();
  const res = await fetch(`${API_BASE}/deliveries/${deliveryId}/assign`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ riderId, actorId: session?.user.id }),
  });
  if (!res.ok) throw new Error("Transition rejected");
  return res.json();
}

export async function pickupDelivery(deliveryId: string): Promise<Delivery> {
  const session = getSession();
  const res = await fetch(`${API_BASE}/deliveries/${deliveryId}/pickup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ actorId: session?.user.id }),
  });
  if (!res.ok) throw new Error("Transition rejected");
  return res.json();
}

export async function deliverDelivery(deliveryId: string): Promise<Delivery> {
  const session = getSession();
  const res = await fetch(`${API_BASE}/deliveries/${deliveryId}/deliver`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ actorId: session?.user.id }),
  });
  if (!res.ok) throw new Error("Transition rejected");
  return res.json();
}

export async function createDelivery(payload: {
  storeId: string;
  createdById: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  description: string;
}): Promise<Delivery> {
  const res = await fetch(`${API_BASE}/deliveries`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Could not create delivery");
  return res.json();
}
