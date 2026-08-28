import React, { useState, useEffect } from 'react';

interface DeliveryRequest {
  id: string;
  customerName: string;
  address: string;
  itemDescription: string;
  status: 'PENDING' | 'ASSIGNED' | 'PICKED_UP' | 'DELIVERED';
}

interface Rider {
  id: string;
  name: string;
  status: 'AVAILABLE' | 'BUSY';
}

export default function DispatcherDashboard() {
  const [requests, setRequests] = useState<DeliveryRequest[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [selectedRider, setSelectedRider] = useState<{ [requestId: string]: string }>({});
  const [loading, setLoading] = useState(true);

  // Simulate High-Frequency Sync via Polling (Every 5 seconds)
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Replace with your real NestJS backend endpoints later:
        // const reqRes = await fetch('http://localhost:3000/deliveries/pending');
        
        // Mocking Live Database Data for Presentation Setup
        const mockRequests: DeliveryRequest[] = [
          { id: 'DEL-101', customerName: 'Jumia Retailer A', address: 'Biashara St, Nairobi', itemDescription: 'Samsung S24 Ultra', status: 'PENDING' },
          { id: 'DEL-102', customerName: 'Pharm Plus Kilimani', address: 'Chania Rd, Nairobi', itemDescription: 'Amoxicillin Batch B', status: 'PENDING' },
        ];
        
        const mockRiders: Rider[] = [
          { id: 'RIDER-01', name: 'John Kamau', status: 'AVAILABLE' },
          { id: 'RIDER-02', name: 'Mercy Wanjiku', status: 'AVAILABLE' },
        ];

        setRequests(mockRequests);
        setRiders(mockRiders);
        setLoading(false);
      } catch (error) {
        console.error("Sync Error:", error);
      }
    };

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5000); // Polls every 5s

    return () => clearInterval(interval);
  }, []);

  const handleAssign = async (requestId: string) => {
    const riderId = selectedRider[requestId];
    if (!riderId) return alert('Please select a rider first');

    // Optimistic state change
    setRequests(prev => prev.filter(req => req.id !== requestId));
    
    try {
      // Mock API call to your NestJS backend:
      // await fetch(`http://localhost:3000/deliveries/${requestId}/assign`, {
      //   method: 'PATCH',
      //   body: JSON.stringify({ riderId })
      // });
      console.log(`Successfully assigned ${requestId} to ${riderId}`);
    } catch (error) {
      alert('Assignment failed, reverting UI');
      // Re-fetch data to restore UI state
    }
  };

  if (loading) return <div className="p-8 text-slate-500">Syncing live logistics feed...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <header className="mb-8 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reflex Dispatch Control</h1>
          <p className="text-sm text-slate-500">Live hybrid sync active (5s intervals)</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">Connected to API</span>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/Middle Column: Open Requests */}
        <section className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            Open Delivery Requests 
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">{requests.length}</span>
          </h2>
          
          {requests.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-200 rounded-xl p-12 text-center text-slate-400">
              No pending delivery requests at this moment.
            </div>
          ) : (
            requests.map(req => (
              <div key={req.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-slate-400">{req.id}</span>
                    <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded font-medium">Unassigned</span>
                  </div>
                  <h3 className="font-semibold text-slate-800">{req.customerName}</h3>
                  <p className="text-sm text-slate-600 mt-1">{req.address}</p>
                  <p className="text-xs text-slate-400 mt-1">Item: {req.itemDescription}</p>
                </div>
                
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <select 
                    className="w-full md:w-48 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => setSelectedRider(prev => ({ ...prev, [req.id]: e.target.value }))}
                    defaultValue=""
                  >
                    <option value="" disabled>Select available rider...</option>
                    {riders.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                  <button 
                    onClick={() => handleAssign(req.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
                  >
                    Assign Rider
                  </button>
                </div>
              </div>
            ))
          )}
        </section>

        {/* Right Column: Fleet Status Monitor */}
        <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm h-fit">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Active Fleet Status</h2>
          <div className="space-y-3">
            {riders.map(rider => (
              <div key={rider.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-sm font-medium text-slate-700">{rider.name}</span>
                <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                  {rider.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
