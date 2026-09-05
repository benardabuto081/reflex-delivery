"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession, getAllDeliveries, getRiders, assignDelivery } from "../../lib/api";
import type { Delivery, Rider } from "../../lib/types";

export default function DispatcherPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRider, setSelectedRider] = useState<{ [deliveryId: string]: string }>({});
  const router = useRouter();

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.push("/login");
      return;
    }

    const fetchPendingData = async () => {
      try {
        const [allDeliveries, allRiders] = await Promise.all([
          getAllDeliveries(),
          getRiders(),
        ]);
        setDeliveries(allDeliveries.filter((d) => d.status === "PENDING"));
        setRiders(allRiders);
        setLoading(false);
      } catch (error) {
        console.error("Live polling sync failed...", error);
      }
    };

    fetchPendingData();
    const interval = setInterval(fetchPendingData, 5000);
    return () => clearInterval(interval);
  }, [router]);

  const handleAssign = async (deliveryId: string) => {
    const riderId = selectedRider[deliveryId];
    if (!riderId) return alert("Please select a rider first");

    setDeliveries((prev) => prev.filter((d) => d.id !== deliveryId));

    try {
      await assignDelivery(deliveryId, riderId);
    } catch (error) {
      alert("Assignment failed due to state machine or network conflict.");
    }
  };

  if (loading) return <div className="p-8 text-slate-500">Syncing live logistics feed...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <header className="mb-8 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reflex Dispatch Control</h1>
          <p className="text-sm text-slate-500">Standard Next.js Route - 5s Polling Active</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">Connected to NestJS</span>
        </div>
      </header>

      <main className="space-y-4 max-w-4xl">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          Open Requests to Assign
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">{deliveries.length}</span>
        </h2>

        {deliveries.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 rounded-xl p-12 text-center text-slate-400">
            No pending delivery requests available.
          </div>
        ) : (
          deliveries.map((del) => (
            <div key={del.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-slate-400">{del.reference}</span>
                </div>
                <h3 className="font-semibold text-slate-800">{del.customerName}</h3>
                <p className="text-sm text-slate-600 mt-1">{del.deliveryAddress}</p>
                <p className="text-xs text-slate-400 mt-1">Cargo: {del.description}</p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                  onChange={(e) => setSelectedRider((prev) => ({ ...prev, [del.id]: e.target.value }))}
                  defaultValue=""
                >
                  <option value="" disabled>Select active rider...</option>
                  {riders.map((r) => (
                    <option key={r.id} value={r.id}>{r.id} ({r.availabilityStatus})</option>
                  ))}
                </select>
                <button
                  onClick={() => handleAssign(del.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  Assign
                </button>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
