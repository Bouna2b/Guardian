'use client';
import { useRef, useState } from 'react';

export function SignatureModal({ onSigned }: { onSigned: (ok: boolean) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [open, setOpen] = useState(false);

  const sign = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    await fetch('/api/mandate', { method: 'POST' });
    onSigned(true);
    setOpen(false);
  };

  return (
    <div>
      <button className="px-4 py-2 rounded-lg bg-white/10" onClick={() => setOpen(true)}>Signer le mandat</button>
      {open && (
        <div className="fixed inset-0 bg-black/60 grid place-items-center">
          <div className="glass p-6 w-[480px]">
            <h3 className="text-lg mb-2">Signature</h3>
            <canvas ref={canvasRef} width={400} height={200} className="bg-white" />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="px-3 py-2 rounded bg-white/10">Annuler</button>
              <button onClick={sign} className="px-3 py-2 rounded bg-cyan-500">Signer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
