"use client";

import React, { useState, useEffect } from 'react';

interface OrderScannerProps {
  onScanSuccess: (scannedRef: string) => void;
  onClose: () => void;
}

export default function OrderScanner({ onScanSuccess, onClose }: OrderScannerProps) {
  const [scanning, setScanning] = useState(true);
  const [progress, setProgress] = useState(0);

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

  return (
    <div className="fixed inset-0 bg-slate-950/90 z-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-bold text-slate-200 tracking-wide uppercase">📦 Next.js Barcode Scanner</h3>
          <button onClick={onClose} className="text-xs bg-slate-800 text-slate-400 hover:text-slate-200 px-2.5 py-1 rounded-md">
            Cancel
          </button>
        </div>

        <div className="relative aspect-video w-full bg-slate-950 rounded-xl border border-slate-700/60 overflow-hidden flex items-center justify-center mb-6">
          {scanning && (
            <div className="absolute inset-x-0 h-0.5 bg-emerald-500 shadow-[0_0_12px_#10b981] animate-bounce top-1/2"></div>
          )}
          <div className="text-center p-4">
            <p className="text-xs text-emerald-400 font-mono animate-pulse">
              {scanning ? `[ OVERLAY ACTIVE: Processing ${progress}% ]` : '[ Verification Ready ]'}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs text-slate-400 font-medium">Simulate live hardware scan input event:</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onScanSuccess('RX-101')}
              disabled={scanning}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono p-2.5 rounded-lg border border-slate-700 disabled:opacity-40"
            >
              Scan Tag: RX-101
            </button>
            <button
              onClick={() => onScanSuccess('RX-104')}
              disabled={scanning}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono p-2.5 rounded-lg border border-slate-700 disabled:opacity-40"
            >
              Scan Tag: RX-104
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
