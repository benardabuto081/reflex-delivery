"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, logout, getDeliveries, createDelivery } from "../../../lib/api";
import type { Delivery, Session } from "../../../lib/types";

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber/20 text-amber",
  ASSIGNED: "bg-slate/20 text-slate",
  PICKED_UP: "bg-slate/20 text-slate",
  DELIVERED: "bg-green/20 text-green",
};

export default function RetailerDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [description, setDescription] = useState("");
  const [confirmation, setConfirmation] = useState("");

  useEffect(() => {
    const s = getSession();
    if (!s || s.user.role !== "RETAILER") {
      router.push("/login");
      return;
    }
    setSession(s);
    loadDeliveries(s.user.storeId);
  }, [router]);

  async function loadDeliveries(storeId: string) {
    setLoading(true);
    const list = await getDeliveries(storeId);
    setDeliveries(list);
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;

    const created = await createDelivery({
      storeId: session.user.storeId,
      createdById: session.user.id,
      customerName,
      customerPhone,
      deliveryAddress,
      description,
    });

    setConfirmation("Logged " + created.reference + " - status PENDING");
    setCustomerName("");
    setCustomerPhone("");
    setDeliveryAddress("");
    setDescription("");
    loadDeliveries(session.user.storeId);
  }

  function handleLogout() {
    logout();
    router.push("/login");
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-paper">
      <div className="flex justify-between items-center px-8 py-5 border-b border-border bg-card">
        <div>
          <h1 className="font-display text-lg font-bold text-ink">Reflex</h1>
          <p className="text-sm text-slate">{session.user.name} - Store {session.user.storeId}</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm border border-border rounded-md text-ink hover:bg-paper"
        >
          Log out
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <h2 className="font-display text-xl font-bold text-ink mb-4">New delivery request</h2>

        <form onSubmit={handleCreate} className="bg-card border border-border rounded-lg p-6 mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Customer name</label>
              <input
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-paper text-ink text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Customer phone</label>
              <input
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-paper text-ink text-sm"
              />
            </div>
          </div>

          <label className="block text-sm font-semibold text-ink mb-1.5 mt-4">Delivery address</label>
          <input
            required
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md bg-paper text-ink text-sm"
          />

          <label className="block text-sm font-semibold text-ink mb-1.5 mt-4">Item description</label>
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-border rounded-md bg-paper text-ink text-sm"
          />

          <button
            type="submit"
            className="mt-4 px-5 py-2.5 bg-ink text-paper font-display font-semibold rounded-md hover:opacity-90"
          >
            Log request
          </button>

          {confirmation && (
            <p className="text-green text-sm mt-3 font-mono">{confirmation}</p>
          )}
        </form>

        <h2 className="font-display text-xl font-bold text-ink mb-4 mt-8">Your deliveries</h2>

        {loading && <p className="text-slate text-sm">Loading...</p>}
        {!loading && deliveries.length === 0 && (
          <p className="text-slate text-sm">No deliveries yet - log your first one above.</p>
        )}

        {deliveries.map((d) => (
          <div
            key={d.id}
            className="waybill bg-card border border-dashed border-border rounded p-4 mb-3 flex justify-between items-center"
          >
            <div>
              <p className="font-mono text-xs text-slate mb-1">{d.reference}</p>
              <p className="text-ink font-semibold text-sm">{d.customerName}</p>
              <p className="text-slate text-xs">{d.deliveryAddress}</p>
            </div>
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide ${statusStyles[d.status]}`}
            >
              {d.status.replace("_", " ")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
