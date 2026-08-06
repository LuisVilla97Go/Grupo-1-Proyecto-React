import { useState, useMemo } from "react";
import { useStore } from "../../contexts/StoreContext";
import {
    Plus,
    Pencil,
    Trash2,
    Tag,
    Search,
    X,
    Save,
    AlertCircle,
    AlertTriangle,
    Loader2,
} from "lucide-react";
import { toast } from "sonner";

export default function Categories() {
    const { categories, products, addCategory, updateCategory, deleteCategory } =
        useStore();
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: "", description: "" });
    const [errors, setErrors] = useState<{ name?: string }>({});
    const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; name: string } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filtrar categorías
    const filteredCategories = useMemo(() => {
        return categories.filter(
            (c) =>
                c.name.toLowerCase().includes(search.toLowerCase()) ||
                c.description.toLowerCase().includes(search.toLowerCase()),
        );
    }, [categories, search]);

    // Contar productos por categoría
    const getCategoryProductCount = (categoryName: string) => {
        return products.filter((p) => p.category === categoryName).length;
    };

    const openCreateModal = () => {
        setEditingCategory(null);
        setFormData({ name: "", description: "" });
        setErrors({});
        setIsModalOpen(true);
    };

    const openEditModal = (categoryId: string) => {
        const category = categories.find((c) => c.id === categoryId);
        if (category) {
            setEditingCategory(categoryId);
            setFormData({ name: category.name, description: category.description });
            setErrors({});
            setIsModalOpen(true);
        }
    };

    const validateForm = () => {
        const newErrors: { name?: string } = {};
        const rawName = formData.name;
        const trimmed = rawName.trim();

        if (rawName.length > 0 && trimmed.length === 0) {
            newErrors.name = "El nombre no puede ser espacios vacios";
        } else if (rawName.length === 0) {
            newErrors.name = "El nombre de la categoría es obligatorio";
        } else if (/^\s/.test(rawName) || /\s$/.test(rawName)) {
            newErrors.name = "El nombre no puede comenzar ni terminar con espacios";
        } else if (trimmed.length < 3) {
            newErrors.name = "El nombre debe tener al menos 3 caracteres";
        } else if (/^\d+$/.test(trimmed)) {
            // No puede ser completamente numérico (ej: "1234")
            newErrors.name = "El nombre no puede ser solo números";
        } else if (!/[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]/.test(trimmed)) {
            // Debe tener al menos una letra (no solo símbolos + dígitos)
            newErrors.name = "El nombre debe contener al menos una letra";
        } else if (/\d{5,}/.test(trimmed)) {
            // No puede tener una secuencia de más de 4 dígitos consecutivos
            newErrors.name =
                "Los números en el nombre no pueden superar 4 dígitos consecutivos (ej: \"Top 10\" ✓, \"12345\" ✗)";
        } else {
            // Verificar si ya existe (excepto si estamos editando la misma)
            const exists = categories.find(
                (c) =>
                    c.name.toLowerCase() === trimmed.toLowerCase() &&
                    c.id !== editingCategory,
            );
            if (exists) {
                newErrors.name = "Ya existe una categoría con ese nombre";
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            if (editingCategory) {
                await updateCategory(editingCategory, formData);
                toast.success("Categoría actualizada correctamente");
            } else {
                await addCategory(formData);
                toast.success("Categoría creada correctamente");
            }
            setIsModalOpen(false);
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("Ocurrió un error inesperado");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (categoryId: string, categoryName: string) => {
        const productCount = getCategoryProductCount(categoryName);
        if (productCount > 0) {
            toast.error(
                `No se puede eliminar "${categoryName}" porque tiene ${productCount} producto(s)`,
            );
            return;
        }
        setCategoryToDelete({ id: categoryId, name: categoryName });
    };

    const confirmDelete = () => {
        if (categoryToDelete) {
            try {
                deleteCategory(categoryToDelete.id);
                toast.success("Categoría eliminada correctamente");
            } catch (error) {
                if (error instanceof Error) {
                    toast.error(error.message);
                } else {
                    toast.error("Ocurrió un error inesperado");
                }
            } finally {
                setCategoryToDelete(null);
            }
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Barra de búsqueda y botón */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center justify-between">
                {/* Búsqueda */}
                <div className="relative flex-1 max-w-md w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar categorías..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm transition-all"
                    />
                </div>

                {/* Botón Nueva Categoría */}
                <button
                    onClick={openCreateModal}
                    className="bg-rose-600 text-white px-5 py-2.5 rounded-lg hover:bg-rose-700 font-medium flex items-center gap-2 transition shadow-sm shadow-rose-600/20 whitespace-nowrap"
                >
                    <Plus className="w-4 h-4" />
                    Nueva Categoría
                </button>
            </div>

            {/* Lista de Categorías */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {filteredCategories.length === 0 ? (
                    <div className="p-12 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
                            <Tag className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">
                            {categories.length === 0
                                ? "No hay categorías registradas"
                                : "No se encontraron resultados"}
                        </h3>
                        <p className="text-slate-500 max-w-md mb-6">
                            {categories.length === 0
                                ? "Crea tu primera categoría para organizar tus productos."
                                : "Intenta con otros términos de búsqueda."}
                        </p>
                        {categories.length === 0 && (
                            <button
                                onClick={openCreateModal}
                                className="text-rose-600 hover:text-rose-700 font-medium text-sm flex items-center gap-1"
                            >
                                <Plus className="w-4 h-4" /> Crear primera categoría
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {filteredCategories.map((category) => {
                            const productCount = getCategoryProductCount(category.name);
                            return (
                                <div
                                    key={category.id}
                                    className="p-6 hover:bg-slate-50/50 transition-colors group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-lg flex items-center justify-center shrink-0">
                                                <Tag className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-semibold text-slate-800 mb-1">
                                                    {category.name}
                                                </h3>
                                                <p className="text-sm text-slate-500 truncate">
                                                    {category.description || "Sin descripción"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            {/* Contador de productos */}
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-slate-800">
                                                    {productCount}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {productCount === 1 ? "producto" : "productos"}
                                                </p>
                                            </div>

                                            {/* Acciones */}
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openEditModal(category.id)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                    title="Editar categoría"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(category.id, category.name)
                                                    }
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    title="Eliminar categoría"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal de Crear/Editar */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        {/* Header del Modal */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                            <h3 className="text-lg font-bold text-slate-800">
                                {editingCategory ? "Editar Categoría" : "Nueva Categoría"}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-slate-100 rounded-lg transition"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        {/* Formulario */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700">
                                    Nombre de la Categoría *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    placeholder="Ej: Electrónica, Top 10, Sale 2026, Deportes"
                                    className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 ${errors.name ? "border-red-500" : "border-slate-200"
                                        }`}
                                    autoFocus
                                />
                                {errors.name && (
                                    <div className="flex items-center gap-1 text-xs text-red-500">
                                        <AlertCircle className="w-3 h-3" />
                                        {errors.name}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700">
                                    Descripción
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({ ...formData, description: e.target.value })
                                    }
                                    placeholder="Descripción breve de la categoría (opcional)"
                                    rows={3}
                                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none"
                                />
                            </div>

                            {/* Footer */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                                <button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-slate-700 font-medium hover:bg-slate-100 rounded-lg transition disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2 bg-rose-600 text-white font-medium rounded-lg hover:bg-rose-700 transition flex items-center gap-2 shadow-sm shadow-rose-600/20 disabled:opacity-70 disabled:pointer-events-none"
                                >
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {isSubmitting ? "Guardando..." : (editingCategory ? "Guardar Cambios" : "Crear Categoría")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* MODAL: ELIMINAR CATEGORÍA */}
            {categoryToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    {/* Backdrop con desenfoque de fondo */}
                    <div
                        onClick={() => setCategoryToDelete(null)}
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
                                    <h3 className="text-base font-bold text-slate-800">Eliminar Categoría</h3>
                                    <p className="text-xs text-slate-400">Esta acción es irreversible</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setCategoryToDelete(null)}
                                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                            ¿Estás seguro de eliminar la categoría <span className="font-bold text-slate-800">"{categoryToDelete.name}"</span>? Se borrará de forma física de la lista y no podrá ser restaurada.
                        </p>

                        {/* Acciones */}
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setCategoryToDelete(null)}
                                className="px-4.5 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-red-600/10 active:scale-95"
                            >
                                Eliminar Categoría
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
