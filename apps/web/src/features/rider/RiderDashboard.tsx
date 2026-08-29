import React, { useState, useEffect } from 'react';

interface Delivery {
  id: string;
  reference: string;
  customerName: string;
  deliveryAddress: string;
  description: string;
  status: 'PENDING' | 'ASSIGNED' | 'PICKED_UP' | 'DELIVERED';
  riderId: string | null;
}

export default function RiderDashboard() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [syncQueueCount, setSyncQueueCount] = useState(0);
  const CURRENT_RIDER_ID = 'RIDER-01'; // Simulate current signed-in runner

  useEffect(() => {
    const fetchRiderDeliveries = async () => {
      try {
        const res = await fetch('http://localhost:3000/deliveries');
        const data: Delivery[] = await res.json();
        // Filters only to items assigned specifically to this running rider
        setDeliveries(data.filter(d => d.riderId === CURRENT_RIDER_ID));
      } catch (error) {
        console.error("Failed fetching context logs", error);
      }
    };
    fetchRiderDeliveries();
  }, [syncQueueCount]);

  const handleStatusTransition = async (id: string, currentStatus: Delivery['status']) => {
    let endpointAction = '';
    let nextStatus: Delivery['status'] = 'PENDING';

    if (currentStatus === 'ASSIGNED') {
      endpointAction = 'pickup';
      nextStatus = 'PICKED_UP';
    } else if (currentStatus === 'PICKED_UP') {
      endpointAction = 'deliver';
      nextStatus = 'DELIVERED';
    } else {
      return; // Completed delivery terminal node
    }

    // 1. Optimistic Mutation Layer (Local execution response is 0ms)
    setDeliveries(prev => prev.map(d => d.id === id ? { ...d, status: nextStatus } : d));
    setSyncQueueCount(prev => prev + 1);

    // 2. Dispatch State Machine Execution to backend
    try {
      const res = await fetch(`http://localhost:3000/deliveries/${id}/${endpointAction}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actorId: CURRENT_RIDER_ID })
      });

      if (!res.ok) throw new Error('Transition rejected by backend logic assertions');
    } catch (err) {
      console.error("Network rollback triggered", err);
    } finally {
      setSyncQueueCount(prev => Math.max(0, prev - 1));
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans max-w-md mx-auto shadow-2xl flex flex-col">
      <header className="p-4 bg-slate-800 border-b border-slate-700 sticky top-0 z-10 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Reflex Rider Panel</h1>
          <p className="text-xs text-slate-400">ID: {CURRENT_RIDER_ID} • Active Shift</p>
        </div>
        {syncQueueCount > 0 ? (
          <div className="bg-amber-500/10 text-amber-400 text-xs px-2.5 py-1 rounded-full border border-amber-500/20 animate-pulse">
            Syncing...
          </div>
        ) : (
          <div className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-1 rounded-full border border-emerald-500/20">
            ● Online
          </div>
        )}
      </header>

      <main className="flex-1 p-4 space-y-4">
        <h2 className="text-sm font-semibold tracking-wider text-slate-400 uppercase">My Active Shifts</h2>

        {deliveries.filter(d => d.status !== 'DELIVERED').length === 0 ? (
          <div className="bg-slate-800 border border-slate-700/60 rounded-xl p-8 text-center text-slate-500">
            🎉 All orders clear! Waiting for dispatch assignments.
          </div>
        ) : (
          deliveries.filter(d => d.status !== 'DELIVERED').map(del => (
            <div key={del.id} className="bg-slate-800 border border-slate-700/60 rounded-xl p-4 shadow-md flex flex-col justify-between gap-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-mono font-bold text-slate-500">{del.reference}</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${
                    del.status === 'ASSIGNED' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {del.status}
                  </span>
                </div>
                <h3 className="font-bold text-white text-base">{del.customerName}</h3>
                <p className="text-sm text-slate-300 mt-1">📍 {del.deliveryAddress}</p>
                <p className="text-xs text-slate-400 mt-1.5 bg-slate-900/50 p-2 rounded border border-slate-700/40">
                  Cargo: {del.description}
                </p>
              </div>

              <button
                onClick={() => handleStatusTransition(del.id, del.status)}
                className={`w-full py-3 rounded-lg text-sm font-bold tracking-wide shadow-sm transition-all ${
                  del.status === 'ASSIGNED' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
                }`}
              >
                {del.status === 'ASSIGNED' ? '🚚 Confirm Pick Up' : '✅ Mark as Delivered'}
              </button>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
