import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { type User as UserType } from "../../types";
import { toast } from "sonner";
import {
    Users as UsersIcon,
    UserPlus,
    Trash2,
    X,
    Shield,
    Key,
    AlertTriangle,
} from "lucide-react";

export default function Users() {
    const { users, user: currentUser, createUser, deleteUser } = useAuth();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [role, setRole] = useState("Administrador");
    const [userToDelete, setUserToDelete] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (/^\s/.test(name) || /\s$/.test(name)) {
            toast.error("El nombre no puede comenzar ni terminar con espacios.");
            return;
        }
        if (/^\s/.test(username) || /\s$/.test(username)) {
            toast.error("El nombre de usuario no puede comenzar ni terminar con espacios.");
            return;
        }

        if (!name.trim() || !username.trim()) {
            toast.error("Por favor completa el nombre y el usuario.");
            return;
        }

        const newUser: UserType = {
            name: name.trim(),
            username: username.trim().replace(/\s+/g, ""), // Eliminar espacios
            role,
        };

        const success = createUser(newUser);

        if (success) {
            toast.success("Usuario creado con éxito.");
            // Limpiar y cerrar modal
            setName("");
            setUsername("");
            setRole("Administrador");
            setIsModalOpen(false);
        } else {
            toast.error("El nombre de usuario ya está registrado.");
        }
    };

    const handleDelete = (usernameToDelete: string) => {
        setUserToDelete(usernameToDelete);
    };

    const confirmDelete = () => {
        if (userToDelete) {
            deleteUser(userToDelete);
            toast.success("Usuario eliminado correctamente.");
            setUserToDelete(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Sección */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <UsersIcon className="w-6 h-6 text-rose-600" />
                        Control de Personal
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Administra los accesos y roles de los usuarios que entran al
                        sistema.
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold px-4 py-2.5 rounded-xl transition shadow-lg shadow-rose-600/20 active:scale-[0.98]"
                >
                    <UserPlus className="w-5 h-5" />
                    Registrar Usuario
                </button>
            </div>

            {/* Nota de credenciales */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 text-sm text-amber-800">
                <Key className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                    <span className="font-bold">Información de Accesos:</span> Por
                    política actual del sistema, la contraseña por defecto para ingresar
                    de cualquier nuevo usuario es **exactamente el mismo nombre de
                    usuario** (respetando mayúsculas y minúsculas).
                </div>
            </div>

            {/* Grid de Usuarios */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map((u) => {
                    const isSelf = u.username === currentUser?.username;
                    return (
                        <div
                            key={u.username}
                            className={`bg-white rounded-2xl border p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-lg ${isSelf
                                    ? "border-rose-300 ring-1 ring-rose-100 bg-rose-50/10"
                                    : "border-slate-200"
                                }`}
                        >
                            <div>
                                {/* Cabecera Tarjeta */}
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-12 h-12 shrink-0 rounded-full bg-linear-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                            {u.name.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-slate-800 flex items-center gap-1.5">
                                                <span className="truncate">{u.name}</span>
                                                {isSelf && (
                                                    <span className="shrink-0 text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-semibold">
                                                        Tú
                                                    </span>
                                                )}
                                            </h3>
                                            <p className="text-xs text-slate-500 font-mono mt-0.5 truncate">
                                                @{u.username}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex">
                                        <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md text-slate-600 text-xs font-semibold">
                                            <Shield className="w-3.5 h-3.5" />
                                            {u.role}
                                        </div>
                                    </div>
                                </div>

                                {/* Info adicional */}
                                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-500">
                                    <div className="flex items-center justify-between">
                                        <span>Estado:</span>
                                        <span className="font-semibold text-emerald-600 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            Activo
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Método Login:</span>
                                        <span className="font-medium text-slate-700">
                                            Usuario / Contraseña
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Botón borrar */}
                            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
                                <button
                                    onClick={() => handleDelete(u.username)}
                                    className="flex items-center gap-1 text-slate-400 hover:text-red-600 transition px-2 py-1 rounded-lg hover:bg-red-50 text-xs font-medium"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Eliminar Acceso
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal / Formulario Registro (Glassmorphism Modal Backdrop) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header Modal */}
                        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
                            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-rose-600" />
                                Registrar Nuevo Personal
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Formulario */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                                    Nombre Completo
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Tu nombre completo.."
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                                    Nombre de Usuario
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Inicial + Primer Apellido ..."
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
                                />
                                <p className="text-[10px] text-slate-400">
                                    Sin espacios. Servirá también como su contraseña de primer
                                    ingreso.
                                </p>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                                    Rol Asignado
                                </label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white transition"
                                >
                                    <option value="Administrador">Administrador</option>
                                    <option value="Supervisor">Supervisor</option>
                                    <option value="Vendedor">Vendedor</option>
                                </select>
                            </div>

                            {/* Botones Acciones */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition text-sm font-semibold"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition text-sm font-semibold shadow-lg shadow-rose-600/10 active:scale-[0.98]"
                                >
                                    Confirmar Registro
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* MODAL ELIMINAR USUARIO */}
            {userToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    {/* Backdrop con desenfoque de fondo */}
                    <div
                        onClick={() => setUserToDelete(null)}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
                    />

                    {/* Tarjeta de Confirmación */}
                    <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 z-10">
                        {/* Header Modal */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 shrink-0 animate-pulse">
                                    <AlertTriangle className="w-5.5 h-5.5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-800">
                                        {userToDelete === currentUser?.username ? "Auto-Eliminación Activa" : "Eliminar Usuario"}
                                    </h3>
                                    <p className="text-xs text-slate-400">Esta acción es irreversible</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setUserToDelete(null)}
                                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                            {userToDelete === currentUser?.username ? (
                                <>
                                    <span className="font-extrabold text-red-600 block mb-1">¡ATENCIÓN CRÍTICA!</span>
                                    Estás a punto de eliminar **tu propia cuenta activa**. Si procedes, el sistema destruirá tu sesión y serás redirigido inmediatamente a la pantalla de acceso.
                                </>
                            ) : (
                                <>
                                    ¿Estás seguro de que deseas eliminar al usuario <span className="font-bold text-slate-800">"{userToDelete}"</span>? Esta persona perderá todo acceso al panel administrativo de inmediato.
                                </>
                            )}
                        </p>

                        {/* Acciones */}
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setUserToDelete(null)}
                                className="px-4.5 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-red-600/10 active:scale-95"
                            >
                                {userToDelete === currentUser?.username ? "Confirmar y Cerrar Sesión" : "Eliminar Usuario"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
