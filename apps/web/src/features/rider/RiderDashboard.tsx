import React, { useState } from 'react';

interface AssignedDelivery {
  id: string;
  retailerName: string;
  address: string;
  item: string;
  status: 'ASSIGNED' | 'PICKED_UP' | 'DELIVERED';
}

export default function RiderDashboard() {
  // Mock data representing deliveries assigned to this rider
  const [deliveries, setDeliveries] = useState<AssignedDelivery[]>([
    { id: 'DEL-101', retailerName: 'Jumia Electronics', address: 'Biashara St, Nairobi', item: 'Samsung S24 Ultra', status: 'ASSIGNED' },
    { id: 'DEL-104', retailerName: 'Ananas Hardware', address: 'Ngong Road, Nairobi', item: 'Drill Bit Set x3', status: 'PICKED_UP' }
  ]);

  const [syncQueueCount, setSyncQueueCount] = useState(0);

  // Optimistic UI Update Handler
  const handleStatusUpdate = async (id: string, currentStatus: AssignedDelivery['status']) => {
    let nextStatus: AssignedDelivery['status'] = 'ASSIGNED';
    if (currentStatus === 'ASSIGNED') nextStatus = 'PICKED_UP';
    if (currentStatus === 'PICKED_UP') nextStatus = 'DELIVERED';
    if (currentStatus === 'DELIVERED') return; // Flow terminates at delivered

    // 1. Instant Local State Mutation (0ms UI Response)
    setDeliveries(prev => prev.map(del => del.id === id ? { ...del, status: nextStatus } : del));
    setSyncQueueCount(prev => prev + 1);

    // 2. Background API Synchronization
    try {
      // Replace with your real NestJS backend route later:
      // await fetch(`http://localhost:3000/deliveries/${id}/status`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ status: nextStatus })
      // });
      
      // Simulate network latency delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSyncQueueCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Network sync failed, queueing retry.", error);
      // In a full implementation, you would trigger a toast banner warning the rider 
      // but keeping their screen exactly as they mutated it until internet reconnects.
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans max-w-md mx-auto shadow-2xl flex flex-col">
      {/* Mobile-Optimized Status Header */}
      <header className="p-4 bg-slate-800 border-b border-slate-700 sticky top-0 z-10 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Reflex Rider Panel</h1>
          <p className="text-xs text-slate-400">Rider Portal • Active Shift</p>
        </div>
        {syncQueueCount > 0 ? (
          <div className="bg-amber-500/10 text-amber-400 text-xs px-2.5 py-1 rounded-full border border-amber-500/20 flex items-center gap-1.5 animate-pulse">
            <span>Syncing ({syncQueueCount})</span>
          </div>
        ) : (
          <div className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            <span>Online</span>
          </div>
        )}
      </header>

      {/* Active Run Sheet */}
      <main className="flex-1 p-4 space-y-4">
        <h2 className="text-sm font-semibold tracking-wider text-slate-400 uppercase">My Active Task Run-Sheet</h2>

        {deliveries.filter(d => d.status !== 'DELIVERED').length === 0 ? (
          <div className="bg-slate-800 border border-slate-700/60 rounded-xl p-8 text-center text-slate-500 my-4">
            🎉 All orders clear! Waiting for dispatch assignments.
          </div>
        ) : (
          deliveries.map(del => (
            <div key={del.id} className="bg-slate-800 border border-slate-700/60 rounded-xl p-4 shadow-md flex flex-col justify-between gap-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-mono font-bold text-slate-500">{del.id}</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${
                    del.status === 'ASSIGNED' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {del.status === 'ASSIGNED' ? 'Assigned' : 'Picked Up'}
                  </span>
                </div>
                <h3 className="font-bold text-white text-base">{del.retailerName}</h3>
                <p className="text-sm text-slate-300 mt-1">📍 {del.address}</p>
                <p className="text-xs text-slate-400 mt-1.5 bg-slate-900/50 p-2 rounded border border-slate-700/40">
                  <span className="font-semibold text-slate-300">Cargo:</span> {del.item}
                </p>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleStatusUpdate(del.id, del.status)}
                className={`w-full py-3 rounded-lg text-sm font-bold tracking-wide transition-all shadow-sm active:scale-[0.98] ${
                  del.status === 'ASSIGNED' 
                    ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
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
