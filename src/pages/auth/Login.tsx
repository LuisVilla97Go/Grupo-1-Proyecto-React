import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";
import {
    Lock,
    User,
    Eye,
    EyeOff,
    Store,
    ArrowRight,
    Loader2,
} from "lucide-react";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!username.trim() || !password.trim()) {
            toast.error("Por favor, completa todos los campos.");
            return;
        }

        setIsSubmitting(true);
        try {
            const success = await login(username, password);
            if (success) {
                toast.success("¡Bienvenido al sistema!");
                navigate("/admin");
            } else {
                toast.error("Usuario o contraseña incorrectos");
            }
        } catch {
            toast.error("Ocurrió un error al intentar iniciar sesión");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-radial from-slate-900 via-slate-950 to-black p-4 relative overflow-hidden font-sans">
            {/* Elementos decorativos de fondo */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-rose-600/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />

            <div className="w-full max-w-md z-10 transition-all duration-500">
                {/* Logo / Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl mb-4 shadow-inner shadow-rose-500/10 animate-pulse">
                        <Store className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">
                        G32 - Grupo 01 Tienda
                    </h1>
                    <p className="text-slate-400 text-sm mt-2">
                        Ingresa al panel de control de tu negocio
                    </p>
                </div>

                {/* Tarjeta de Login (Glassmorphism) */}
                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl shadow-black/40">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Input Usuario */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                                Usuario
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                                    <User className="w-5 h-5" />
                                </span>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Escribe tu usuario"
                                    disabled={isSubmitting}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-950/60 border border-slate-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all disabled:opacity-50 placeholder:text-slate-600"
                                />
                            </div>
                        </div>

                        {/* Input Contraseña */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                                Contraseña
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                                    <Lock className="w-5 h-5" />
                                </span>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    disabled={isSubmitting}
                                    className="w-full pl-11 pr-12 py-3 bg-slate-950/60 border border-slate-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all disabled:opacity-50 placeholder:text-slate-600"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Botón Ingresar */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 px-4 bg-linear-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-semibold rounded-xl transition-all duration-300 transform active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-rose-500/40 shadow-lg shadow-rose-500/10 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Iniciando sesión...</span>
                                </>
                            ) : (
                                <>
                                    <span>Ingresar al Dashboard</span>
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-slate-600 mt-6">
                    &copy; {new Date().getFullYear()} Dash Tienda. Todos los derechos
                    reservados.
                </p>
            </div>
        </div>
    );
}
