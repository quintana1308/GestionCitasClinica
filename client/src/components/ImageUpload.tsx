import React, { useState, useRef } from 'react';
import { 
  PhotoIcon, 
  XMarkIcon, 
  PlusIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import medicalHistoryService from '../services/medicalHistoryService';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  disabled?: boolean;
  clientInfo?: { clientId: string; clientName: string };
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onImagesChange,
  maxImages = 5,
  disabled = false,
  clientInfo
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Validar número máximo de imágenes
    if (images.length + files.length > maxImages) {
      toast.error(`Máximo ${maxImages} imágenes permitidas`);
      return;
    }

    // Validar tamaño de archivos
    for (let i = 0; i < files.length; i++) {
      if (files[i].size > 5 * 1024 * 1024) { // 5MB
        toast.error(`El archivo ${files[i].name} es demasiado grande. Máximo 5MB`);
        return;
      }
    }

    try {
      setUploading(true);
      const result = await medicalHistoryService.uploadImages(files, clientInfo);
      
      const newImages = [...images, ...result.images];
      onImagesChange(newImages);
      
      toast.success(`${result.count} imagen(es) subida(s) exitosamente`);
      
      // Limpiar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error al subir imágenes:', error);
      toast.error('Error al subir las imágenes');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (imageUrl: string, index: number) => {
    try {
      await medicalHistoryService.deleteImage(imageUrl);
      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);
      toast.success('Imagen eliminada exitosamente');
    } catch (error) {
      console.error('Error al eliminar imagen:', error);
      toast.error('Error al eliminar la imagen');
    }
  };

  const openPreview = (imageUrl: string) => {
    setPreviewImage(imageUrl);
  };

  const closePreview = () => {
    setPreviewImage(null);
  };

  const getImageUrl = (imagePath: string) => {
    const baseUrl = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${baseUrl}${imagePath}`;
  };

  return (
    <div className="space-y-4">
      {/* Botón para subir imágenes */}
      <div className="flex items-center gap-4">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || uploading || images.length >= maxImages}
        />
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading || images.length >= maxImages}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              Subiendo...
            </>
          ) : (
            <>
              <PlusIcon className="h-4 w-4" />
              Agregar Imágenes
            </>
          )}
        </button>
        
        <span className="text-sm text-gray-500">
          {images.length}/{maxImages} imágenes
        </span>
      </div>

      {/* Grid de imágenes */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={getImageUrl(imageUrl)}
                  alt={`Imagen ${index + 1}`}
                  className="w-full h-full object-cover"
                  onLoad={() => console.log('Imagen cargada:', getImageUrl(imageUrl))}
                  onError={(e) => {
                    console.error('Error cargando imagen:', getImageUrl(imageUrl));
                    const target = e.target as HTMLImageElement;
                    target.style.backgroundColor = '#f3f4f6';
                    target.style.display = 'flex';
                    target.style.alignItems = 'center';
                    target.style.justifyContent = 'center';
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiNmM2Y0ZjYiLz4KICA8cGF0aCBkPSJNMTIgMTJoMTZ2MTZIMTJWMTJ6IiBzdHJva2U9IiM5Y2E3YWYiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPgogIDxjaXJjbGUgY3g9IjE2IiBjeT0iMTYiIHI9IjIiIGZpbGw9IiM5Y2E3YWYiLz4KICA8cGF0aCBkPSJtMTIgMjQgNC00IDQgNCA4LTgiIHN0cm9rZT0iIzljYTdhZiIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+Cjwvc3ZnPg==';
                  }}
                />
              </div>
              
              {/* Overlay con botones */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openPreview(imageUrl)}
                    className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
                    title="Ver imagen"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(imageUrl, index)}
                      className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50 transition-colors"
                      title="Eliminar imagen"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mensaje cuando no hay imágenes */}
      {images.length === 0 && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">No hay imágenes adjuntas</p>
          <p className="text-xs text-gray-500">
            Haz clic en "Agregar Imágenes" para subir archivos
          </p>
        </div>
      )}

      {/* Modal de preview */}
      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={closePreview}
              className="absolute top-4 right-4 p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100 z-10"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            
            <img
              src={getImageUrl(previewImage)}
              alt="Preview"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
