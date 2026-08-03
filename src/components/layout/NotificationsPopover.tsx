import { useState, useRef, useEffect } from "react";
import {
  Bell,
  Check,
  Trash2,
  ShoppingCart,
  Info,
  AlertTriangle,
} from "lucide-react";
import { useStore } from "../../contexts/StoreContext";

export default function NotificationsPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const { notifications, markNotificationAsRead, clearAllNotifications } =
    useStore();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <ShoppingCart className="w-5 h-5 text-emerald-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Justo ahora";
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} hr`;
    return `Hace ${diffDays} días`;
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Botón Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-xl transition-colors ${
          isOpen
            ? "bg-rose-50 text-rose-600"
            : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
        }`}
        title="Notificaciones"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse"></span>
        )}
      </button>

      {/* Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-2xl z-[100] animate-in slide-in-from-top-2 duration-200 overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              Notificaciones
              {unreadCount > 0 && (
                <span className="bg-rose-100 text-rose-600 text-[10px] px-2 py-0.5 rounded-full">
                  {unreadCount} nuevas
                </span>
              )}
            </h3>
            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1"
                title="Limpiar todas"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Limpiar
              </button>
            )}
          </div>

          {/* Body */}
          <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                  <Bell className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-600">
                  Sin notificaciones
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Aquí verás las ventas y alertas en tiempo real.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 flex gap-4 transition-colors ${
                      notif.isRead ? "bg-white opacity-70" : "bg-rose-50/30"
                    }`}
                  >
                    <div className="shrink-0 mt-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          notif.isRead
                            ? "bg-slate-100"
                            : "bg-white shadow-sm border border-rose-100"
                        }`}
                      >
                        {getIcon(notif.type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <p
                          className={`text-sm font-bold truncate ${notif.isRead ? "text-slate-600" : "text-slate-800"}`}
                        >
                          {notif.title}
                        </p>
                        <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap pt-0.5">
                          {getTimeAgo(notif.date)}
                        </span>
                      </div>
                      <p
                        className={`text-xs mt-1 line-clamp-2 ${notif.isRead ? "text-slate-400" : "text-slate-600"}`}
                      >
                        {notif.message}
                      </p>

                      {!notif.isRead && (
                        <button
                          onClick={() => markNotificationAsRead(notif.id)}
                          className="mt-2 text-[10px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-colors"
                        >
                          <Check className="w-3 h-3" />
                          Marcar como leída
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
