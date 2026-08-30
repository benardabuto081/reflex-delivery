import type { Session, User, Delivery } from "./types";

// MOCK MODE: Bernard's auth endpoint isn't confirmed live yet.
// Flip USE_MOCK to false once POST /auth/login is tested and working -
// no other code should need to change, since every function below
// already matches the real contract from his spec.
const USE_MOCK = true;
const API_BASE = "http://localhost:3000";

const MOCK_USER: User = {
  id: "user-1",
  name: "Kay",
  email: "kay@reflex.test",
  role: "RETAILER",
  storeId: "store-1",
};

let mockDeliveries: Delivery[] = [
  {
    id: "d1",
    reference: "RFX-1001",
    storeId: "store-1",
    createdById: "user-1",
    customerName: "John Mwangi",
    customerPhone: "0712345678",
    deliveryAddress: "Kilimani, Nairobi",
    description: "1x Blender",
    status: "PENDING",
    createdAt: new Date().toISOString(),
  },
];

export async function login(email: string, password: string): Promise<Session> {
  if (USE_MOCK) {
    if (email.toLowerCase() === MOCK_USER.email) {
      const session: Session = { accessToken: "mock-token", user: MOCK_USER };
      localStorage.setItem("reflex_session", JSON.stringify(session));
      return session;
    }
    throw new Error("Invalid email or password");
  }
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

export async function getDeliveries(storeId: string): Promise<Delivery[]> {
  if (USE_MOCK) {
    return mockDeliveries.filter((d) => d.storeId === storeId);
  }
  const res = await fetch(`${API_BASE}/deliveries`);
  const all: Delivery[] = await res.json();
  return all.filter((d) => d.storeId === storeId); // client-side filter until Bernard confirms createdById filtering
}

export async function createDelivery(payload: {
  storeId: string;
  createdById: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  description: string;
}): Promise<Delivery> {
  if (USE_MOCK) {
    const newDelivery: Delivery = {
      id: `d${mockDeliveries.length + 1}`,
      reference: `RFX-${1000 + mockDeliveries.length + 1}`,
      status: "PENDING",
      createdAt: new Date().toISOString(),
      ...payload,
    };
    mockDeliveries.unshift(newDelivery);
    return newDelivery;
  }
  const res = await fetch(`${API_BASE}/deliveries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}
