"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import OrderScanner from "./components/OrderScanner";
import {
  getSession,
  getAllDeliveries,
  getRiderProfile,
  pickupDelivery,
  deliverDelivery,
} from "../../lib/api";
import type { Delivery, Rider } from "../../lib/types";

export default function RiderPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [riderProfile, setRiderProfile] = useState<Rider | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncQueueCount, setSyncQueueCount] = useState(0);
  const [activeScannerDeliveryId, setActiveScannerDeliveryId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.push("/login");
      return;
    }

    const fetchRiderDeliveries = async () => {
      try {
        const profile = await getRiderProfile();
        setRiderProfile(profile);
        if (!profile) {
          setLoading(false);
          return;
        }
        const all = await getAllDeliveries();
        setDeliveries(all.filter((d) => d.riderId === profile.id));
        setLoading(false);
      } catch (error) {
        console.error("Failed fetching tasks", error);
        setLoading(false);
      }
    };

    fetchRiderDeliveries();
  }, [syncQueueCount, router]);

  const executeStatusTransition = async (id: string, currentStatus: Delivery["status"]) => {
    let nextStatus: Delivery["status"] = "PENDING";
    let action: (id: string) => Promise<Delivery>;

    if (currentStatus === "ASSIGNED") {
      nextStatus = "PICKED_UP";
      action = pickupDelivery;
    } else if (currentStatus === "PICKED_UP") {
      nextStatus = "DELIVERED";
      action = deliverDelivery;
    } else {
      return;
    }

    setDeliveries((prev) => prev.map((d) => (d.id === id ? { ...d, status: nextStatus } : d)));
    setSyncQueueCount((prev) => prev + 1);

    try {
      await action(id);
    } catch (err) {
      console.error("Network rollback triggered", err);
    } finally {
      setSyncQueueCount((prev) => Math.max(0, prev - 1));
    }
  };

  const handleScanSuccess = (scannedRef: string) => {
    const delivery = deliveries.find((d) => d.id === activeScannerDeliveryId);
    if (delivery && delivery.reference === scannedRef) {
      executeStatusTransition(delivery.id, delivery.status);
    } else {
      alert("Barcode mismatch! Scanning wrong package tag.");
    }
    setActiveScannerDeliveryId(null);
  };

  if (loading) return <div className="p-8 text-slate-400 bg-slate-900 min-h-screen">Loading your tasks...</div>;

  if (!riderProfile) {
    return (
      <div className="p-8 text-slate-400 bg-slate-900 min-h-screen">
        No rider profile found for this account. Contact a dispatcher.
      </div>
    );
  }

  const activeDelivery = deliveries.find((d) => d.id === activeScannerDeliveryId);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans max-w-md mx-auto shadow-2xl flex flex-col">
      <header className="p-4 bg-slate-800 border-b border-slate-700 sticky top-0 z-10 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Reflex Rider Panel</h1>
          <p className="text-xs text-slate-400">Next.js Framework Router View</p>
        </div>
        <div className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-1 rounded-full border border-emerald-500/20">
          Online
        </div>
      </header>

      <main className="flex-1 p-4 space-y-4">
        <h2 className="text-sm font-semibold tracking-wider text-slate-400 uppercase">My Active Task Run-Sheet</h2>

        {deliveries.filter((d) => d.status !== "DELIVERED").length === 0 ? (
          <div className="bg-slate-800 border border-slate-700/60 rounded-xl p-8 text-center text-slate-500">
            All orders clear! Waiting for assignments.
          </div>
        ) : (
          deliveries
            .filter((d) => d.status !== "DELIVERED")
            .map((del) => (
              <div key={del.id} className="bg-slate-800 border border-slate-700/60 rounded-xl p-4 shadow-md flex flex-col justify-between gap-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-mono font-bold text-slate-500">{del.reference}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                      {del.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-base">{del.customerName}</h3>
                  <p className="text-sm text-slate-300 mt-1">{del.deliveryAddress}</p>
                </div>

                <button
                  onClick={() => setActiveScannerDeliveryId(del.id)}
                  className="w-full py-3 rounded-lg text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white tracking-wide"
                >
                  {del.status === "ASSIGNED" ? "Scan to Pick Up" : "Scan to Deliver"}
                </button>
              </div>
            ))
        )}
      </main>

      {activeScannerDeliveryId && activeDelivery && (
        <OrderScanner
          correctReference={activeDelivery.reference}
          onScanSuccess={handleScanSuccess}
          onClose={() => setActiveScannerDeliveryId(null)}
        />
      )}
    </div>
  );
}
