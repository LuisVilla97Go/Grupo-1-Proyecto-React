import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import confetti from "canvas-confetti";
import { X } from "lucide-react";

function EasterEggModal({ onClose }: { onClose: () => void }) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;

    let animationFrameId: number;

    const fireFromLeft = () =>
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: ["#f43f5e", "#ec4899", "#fbbf24", "#34d399", "#60a5fa"],
        zIndex: 100000,
      });

    const fireFromRight = () =>
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: ["#f43f5e", "#ec4899", "#fbbf24", "#34d399", "#60a5fa"],
        zIndex: 100000,
      });

    let lastFire = Date.now();
    const frame = () => {
      // Disparar confetti cada 100ms para un loop continuo suave
      if (Date.now() - lastFire > 100) {
        fireFromLeft();
        fireFromRight();
        lastFire = Date.now();
      }
      animationFrameId = requestAnimationFrame(frame);
    };
    frame();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md"
      onClick={onClose}
    >
      {/* Contenedor del Modal elevado a 100001 para estar sobre el confetti (100000) */}
      <div
        className="relative z-[100001] flex flex-col md:flex-row bg-transparent rounded-3xl max-w-[70vw] min-h-[50vh] w-full overflow-hidden shadow-2xl"
        style={{ animation: "zoomIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Contenedor de la imagen (Fondo transparente/blur) */}
        <div className="flex-1 bg-white/5 flex items-center justify-center p-8 md:p-12 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-blue-500/10" />
          <img
            src="/images/gato-donatto.png"
            alt="Gato Donatto"
            className="w-full h-full max-h-[60vh] object-contain drop-shadow-2xl relative z-10 hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Card para el texto */}
        <div className="flex-1 bg-white flex flex-col justify-center p-8 md:p-16 relative">
          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-slate-100 hover:bg-rose-100 hover:text-rose-600 rounded-full text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="space-y-8 text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight leading-tight uppercase">
              ¡Hasta otra oportunidad!
            </h2>
            <p className="text-slate-600 text-lg md:text-xl leading-relaxed">
              Gracias Profesor por la paciencia y la motivación para seguir
              aprendiendo más sobre programación.
            </p>
            <div className="pt-8 border-t border-slate-100">
              <p className="text-slate-500 font-medium">
                Atte.{" "}
                <span className="text-rose-600 font-bold text-lg">Luis V.</span> y{" "}
                <span className="text-rose-600 font-bold text-lg">Pedro F.</span>
              </p>
            </div>
            <h2 className="text-2xl md:text-2xl font-black text-slate-800 tracking-tight leading-tight uppercase">
              G32 - Grupo 1
            </h2>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>,
    document.body
  );
}

interface CongratsProps {
  isCollapsed?: boolean;
  isMobile?: boolean;
}

export default function Congrats({ isCollapsed = false, isMobile = false }: CongratsProps) {
  const [showEasterEgg, setShowEasterEgg] = useState(false);

  if (isCollapsed && !isMobile) return null;

  return (
    <>
      <div className="px-4 py-5 mx-3 mb-4 mt-2 rounded-2xl bg-slate-900/60 border border-white/10 flex flex-col items-center gap-4 relative overflow-hidden group">
        {/* Fondo animado sutil */}
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-transparent to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

        <div className="relative z-10 flex flex-col items-center gap-1 w-full">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-400">
            • SECCIÓN OCULTA •
          </span>
          <h4 className="text-sm text-slate-200 font-semibold text-center tracking-wide mt-1">
            Presione aquí, Profe
          </h4>
        </div>

        <button
          onClick={() => setShowEasterEgg(true)}
          className="relative z-10 w-full flex items-center justify-center gap-2 bg-white text-slate-900 px-6 py-2.5 rounded-xl shadow-[0_0_20px_-3px_rgba(244,63,94,0.2)] hover:shadow-[0_0_25px_-2px_rgba(244,63,94,0.4)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 hover:bg-rose-50 font-bold text-sm group/btn"
        >
          <span>Ver</span>
          <span className="text-rose-500 group-hover/btn:translate-x-1 transition-transform">→</span>
        </button>
      </div>

      {showEasterEgg && <EasterEggModal onClose={() => setShowEasterEgg(false)} />}
    </>
  );
}
