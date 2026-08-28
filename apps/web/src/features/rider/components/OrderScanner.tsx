import React, { useState, useEffect } from 'react';

interface OrderScannerProps {
  onScanSuccess: (scannedRef: string) => void;
  onClose: () => void;
}

export default function OrderScanner({ onScanSuccess, onClose }: OrderScannerProps) {
  const [scanning, setScanning] = useState(true);
  const [progress, setProgress] = useState(0);

  // Simulate automated camera barcode decoding layout activity
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setScanning(false);
          return 100;
        }
        return prev + 25;
      });
    }, 400);

    return () => clearInterval(timer);
  }, []);

  const handleSimulateScan = (mockRef: string) => {
    onScanSuccess(mockRef);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 z-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-bold text-slate-200 tracking-wide uppercase">📦 Package Confirmation Scanner</h3>
          <button onClick={onClose} className="text-xs bg-slate-800 text-slate-400 hover:text-slate-200 px-2.5 py-1 rounded-md">
            Cancel
          </button>
        </div>

        {/* Viewfinder Target Area */}
        <div className="relative aspect-video w-full bg-slate-950 rounded-xl border border-slate-700/60 overflow-hidden flex flex-center items-center justify-center group mb-6">
          {/* Laser scanning lines layout */}
          {scanning && (
            <div className="absolute inset-x-0 h-0.5 bg-emerald-500 shadow-[0_0_12px_#10b981] animate-bounce top-1/2"></div>
          )}
          
          <div className="text-center p-4">
            {scanning ? (
              <p className="text-xs text-emerald-400 font-mono tracking-pulse animate-pulse">
                [ CAMERA ACTIVE: Align Barcode... {progress}% ]
              </p>
            ) : (
              <p className="text-xs text-slate-400 font-mono">Barcode Captured successfully</p>
            )}
          </div>

          {/* Target Box Corners */}
          <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-emerald-400"></div>
          <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-emerald-400"></div>
          <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-emerald-400"></div>
          <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-emerald-400"></div>
        </div>

        {/* Interactive Sandbox Presets for Live Panel Presentation */}
        <div className="space-y-3">
          <p className="text-xs text-slate-400 font-medium">Select package barcode tag mock context to scan:</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleSimulateScan('RX-101')}
              disabled={scanning}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold p-2.5 rounded-lg border border-slate-700 disabled:opacity-40 transition-all text-center"
            >
              Scan Tag: RX-101
            </button>
            <button
              onClick={() => handleSimulateScan('RX-104')}
              disabled={scanning}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold p-2.5 rounded-lg border border-slate-700 disabled:opacity-40 transition-all text-center"
            >
              Scan Tag: RX-104
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
