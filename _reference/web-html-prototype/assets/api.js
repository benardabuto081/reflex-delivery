// apps/web/assets/api.js
//
// Data layer for the Retailer Dashboard + Login.
// MOCK MODE: no real backend calls yet — auth and seed data don't
// exist on the API yet (see team notes, 27 Aug). Every function here
// matches the shape Ben's real endpoints will return, so swapping
// USE_MOCK to false + filling in the fetch calls is the only change
// needed later.

const USE_MOCK = true;
const API_BASE = "http://localhost:3000"; // Ben's NestJS server, once CORS is enabled

// --- Fake in-memory "database" for today only ---
const MOCK_STORE = { id: "store-1", name: "Kay's Electronics", address: "Nairobi CBD" };
const MOCK_USER = { id: "user-1", name: "Kay", email: "kay@reflex.test", role: "RETAILER", storeId: "store-1" };

let mockDeliveries = [
  {
    id: "d1",
    reference: "RFX-1001",
    storeId: "store-1",
    customerName: "John Mwangi",
    customerPhone: "0712345678",
    deliveryAddress: "Kilimani, Nairobi",
    description: "1x Blender",
    status: "PENDING",
    createdAt: new Date().toISOString(),
  },
  {
    id: "d2",
    reference: "RFX-1002",
    storeId: "store-1",
    customerName: "Grace Wanjiru",
    customerPhone: "0798765432",
    deliveryAddress: "Westlands, Nairobi",
    description: "Phone charger + case",
    status: "DELIVERED",
    createdAt: new Date().toISOString(),
  },
];

// --- Auth ---
// Real version later: POST /auth/login { email, password } -> { token, user }
async function login(email, password) {
  if (USE_MOCK) {
    if (email.toLowerCase() === MOCK_USER.email) {
      localStorage.setItem("reflex_session", JSON.stringify({ user: MOCK_USER, store: MOCK_STORE }));
      return { user: MOCK_USER, store: MOCK_STORE };
    }
    throw new Error("Invalid email or password");
  }
  // const res = await fetch(`${API_BASE}/auth/login`, { method: "POST", headers: {...}, body: JSON.stringify({ email, password }) });
  // ...
}

function getSession() {
  const raw = localStorage.getItem("reflex_session");
  return raw ? JSON.parse(raw) : null;
}

function logout() {
  localStorage.removeItem("reflex_session");
}

// --- Deliveries ---
// Real version later: GET /deliveries then filter/param by storeId
async function getDeliveries(storeId) {
  if (USE_MOCK) {
    return mockDeliveries.filter((d) => d.storeId === storeId);
  }
  // const res = await fetch(`${API_BASE}/deliveries`);
  // const all = await res.json();
  // return all.filter(d => d.storeId === storeId); // client-side filter until Ben adds a query param
}

// Real version later: POST /deliveries { storeId, createdById, customerName, customerPhone, deliveryAddress, description }
async function createDelivery(payload) {
  if (USE_MOCK) {
    const newDelivery = {
      id: `d${mockDeliveries.length + 1}`,
      reference: `RFX-${1000 + mockDeliveries.length + 1}`,
      status: "PENDING",
      createdAt: new Date().toISOString(),
      ...payload,
    };
    mockDeliveries.unshift(newDelivery);
    return newDelivery;
  }
  // const res = await fetch(`${API_BASE}/deliveries`, { method: "POST", headers: {...}, body: JSON.stringify(payload) });
  // return res.json();
}