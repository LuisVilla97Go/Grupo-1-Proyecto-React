import { useState, useCallback } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { Upload, X, Image as ImageIcon, AlertCircle } from "lucide-react";

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export default function ImageUploader({
  images,
  onImagesChange,
  maxImages = 8,
}: ImageUploaderProps) {
  const [error, setError] = useState<string>("");

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      // Manejar errores
      if (rejectedFiles.length > 0) {
        const file = rejectedFiles[0];
        if (file.errors[0]?.code === "file-too-large") {
          setError("El archivo es demasiado grande. Máximo 5MB");
        } else if (file.errors[0]?.code === "file-invalid-type") {
          setError("Solo se permiten imágenes (JPG, PNG, WEBP)");
        }
        setTimeout(() => setError(""), 3000);
        return;
      }

      // Convertir archivos a base64 y agregar
      acceptedFiles.forEach((file) => {
        if (images.length >= maxImages) {
          setError(`Máximo ${maxImages} imágenes permitidas`);
          setTimeout(() => setError(""), 3000);
          return;
        }

        const reader = new FileReader();
        reader.onload = () => {
          if (reader.result && images.length < maxImages) {
            onImagesChange([...images, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    },
    [images, maxImages, onImagesChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/webp": [".webp"],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    maxFiles: maxImages - images.length,
  });

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  const setAsMain = (index: number) => {
    if (index === 0) return;
    const newImages = [images[index], ...images.filter((_, i) => i !== index)];
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Área de Upload */}
      {images.length < maxImages && (
        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragActive
              ? "border-rose-500 bg-rose-50"
              : "border-slate-300 hover:border-rose-400 hover:bg-slate-50"
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                isDragActive ? "bg-rose-100" : "bg-slate-100"
              }`}
            >
              <Upload
                className={`w-8 h-8 ${isDragActive ? "text-rose-600" : "text-slate-400"}`}
              />
            </div>
            <p className="text-slate-700 font-medium mb-1">
              {isDragActive
                ? "Suelta las imágenes aquí..."
                : "Arrastra imágenes aquí o haz clic"}
            </p>
            <p className="text-sm text-slate-500">
              PNG, JPG, WEBP hasta 5MB • {images.length}/{maxImages} imágenes
            </p>
          </div>
        </div>
      )}

      {/* Mensaje de Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Preview de Imágenes */}
      {images.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-slate-700">
              Imágenes del producto
            </h4>
            <span className="text-xs text-slate-500">
              {images.length} de {maxImages}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((img, i) => (
              <div key={i} className="relative group aspect-square">
                <img
                  src={img}
                  alt={`Producto ${i + 1}`}
                  className="w-full h-full object-cover rounded-lg border-2 border-slate-200 group-hover:border-rose-300 transition-colors"
                />

                {/* Overlay con acciones */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                  {i !== 0 && (
                    <button
                      type="button"
                      onClick={() => setAsMain(i)}
                      className="bg-white text-slate-800 p-2 rounded-full hover:bg-slate-100 transition"
                      title="Establecer como principal"
                    >
                      <ImageIcon className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                    title="Eliminar imagen"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Badge de imagen principal */}
                {i === 0 && (
                  <span className="absolute top-2 left-2 bg-rose-600 text-white text-xs px-2 py-1 rounded font-medium shadow-lg">
                    Principal
                  </span>
                )}

                {/* Número de imagen */}
                <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
                  {i + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
