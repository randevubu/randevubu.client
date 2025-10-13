'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, GripVertical } from 'lucide-react';
import { useImageUpload } from '../../lib/hooks/useImageUpload';
import { ImageType, BusinessImages } from '../../types/business';

interface BusinessImageManagerProps {
  businessId: string;
  onImagesUpdated?: () => void;
}

interface ImageUploadSectionProps {
  title: string;
  description: string;
  currentImageUrl?: string;
  imageType: Exclude<ImageType, 'gallery'>;
  onUpload: (file: File, imageType: ImageType) => Promise<void>;
  onDelete: () => Promise<void>;
  uploading: boolean;
  aspectRatio?: string;
  recommendedSize?: string;
}

const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({
  title,
  description,
  currentImageUrl,
  imageType,
  onUpload,
  onDelete,
  uploading,
  aspectRatio = '16/9',
  recommendedSize = '800x450px'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file, imageType);
    }
    // Reset input so same file can be selected again
    if (event.target) {
      event.target.value = '';
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-[var(--theme-backgroundSecondary)] rounded-xl p-6 border border-[var(--theme-border)] transition-colors duration-300">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-[var(--theme-foreground)]">{title}</h3>
          <p className="text-sm text-[var(--theme-foregroundSecondary)] mt-1">{description}</p>
          <p className="text-xs text-[var(--theme-foregroundMuted)] mt-1">
            Önerilen boyut: {recommendedSize} • Maksimum: 5MB • Format: JPG, PNG, WebP, GIF
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Current Image Display */}
        {currentImageUrl ? (
          <div className="relative">
            <div 
              className="relative rounded-lg overflow-hidden bg-[var(--theme-backgroundTertiary)] border border-[var(--theme-border)]"
              style={{ aspectRatio }}
            >
              <img
                src={currentImageUrl}
                alt={title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  // Use a data URL for a simple placeholder instead of a non-existent file
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                <div className="flex space-x-2">
                  <button
                    onClick={triggerFileSelect}
                    disabled={uploading}
                    className="px-3 py-2 bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)] rounded-lg text-sm font-medium hover:bg-[var(--theme-primaryHover)] disabled:opacity-50 transition-colors"
                  >
                    {uploading ? 'Yükleniyor...' : 'Değiştir'}
                  </button>
                  <button
                    onClick={onDelete}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                  >
                    Sil
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Placeholder when no image
          <div
            className={`border-2 border-dashed border-[var(--theme-border)] rounded-lg p-8 text-center transition-all duration-200 ${
              uploading
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer hover:border-[var(--theme-primary)] hover:bg-[var(--theme-backgroundTertiary)]'
            }`}
            style={{ aspectRatio }}
            onClick={uploading ? undefined : triggerFileSelect}
          >
            <div className="flex flex-col items-center justify-center h-full">
              <svg className="w-12 h-12 text-[var(--theme-foregroundMuted)] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <p className="text-[var(--theme-foregroundSecondary)] font-medium mb-1">
                {uploading ? 'Yükleniyor...' : 'Görsel Yükle'}
              </p>
              <p className="text-[var(--theme-foregroundMuted)] text-sm">
                Tıklayın veya dosyayı sürükleyin
              </p>
            </div>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
        />

        {/* Upload Button (always visible for better UX) */}
        {currentImageUrl && (
          <button
            onClick={triggerFileSelect}
            disabled={uploading}
            className="w-full px-4 py-3 bg-[var(--theme-backgroundTertiary)] text-[var(--theme-foreground)] rounded-lg text-sm font-medium hover:bg-[var(--theme-background)] disabled:opacity-50 border border-[var(--theme-border)] transition-colors"
          >
            {uploading ? 'Yükleniyor...' : 'Yeni Görsel Yükle'}
          </button>
        )}
      </div>
    </div>
  );
};

interface GalleryManagerProps {
  galleryImages: string[];
  onUpload: (file: File, imageType: ImageType) => Promise<void>;
  onDelete: (imageUrl: string) => Promise<void>;
  onReorder: (orderedUrls: string[]) => Promise<void>;
  uploading: boolean;
}

const GalleryManager: React.FC<GalleryManagerProps> = ({
  galleryImages,
  onUpload,
  onDelete,
  onReorder,
  uploading
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file, 'gallery');
    }
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newImages = [...galleryImages];
    const draggedItem = newImages[draggedIndex];
    
    // Remove dragged item
    newImages.splice(draggedIndex, 1);
    
    // Insert at new position
    newImages.splice(dropIndex, 0, draggedItem);
    
    setDraggedIndex(null);
    await onReorder(newImages);
  };

  return (
    <div className="bg-[var(--theme-backgroundSecondary)] rounded-xl p-6 border border-[var(--theme-border)] transition-colors duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-[var(--theme-foreground)]">Galeri ({galleryImages.length}/5)</h3>
          <p className="text-sm text-[var(--theme-foregroundSecondary)] mt-1">
            İşletmenizin galeri görsellerini yönetin. Sürükle-bırak ile sıralayabilirsiniz.
          </p>
        </div>
        {galleryImages.length < 5 && (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)] rounded-lg text-sm font-semibold hover:bg-[var(--theme-primaryHover)] disabled:opacity-50 transition-colors"
          >
            {uploading ? 'Yükleniyor...' : 'Görsel Ekle'}
          </button>
        )}
      </div>

      {/* Gallery Grid */}
      {galleryImages.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {galleryImages.map((imageUrl, index) => (
            <div
              key={`${imageUrl}-${index}`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              className="relative group cursor-move aspect-square rounded-lg overflow-hidden bg-[var(--theme-backgroundTertiary)] border border-[var(--theme-border)] hover:border-[var(--theme-primary)] transition-all duration-200"
            >
              <img
                src={imageUrl}
                alt={`Galeri görseli ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  // Use a data URL for a simple placeholder instead of a non-existent file
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
                }}
              />
              
              {/* Order indicator */}
              <div className="absolute top-2 left-2 w-6 h-6 bg-black bg-opacity-60 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-semibold">{index + 1}</span>
              </div>

              {/* Delete button */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={() => onDelete(imageUrl)}
                  className="w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drag handle */}
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="w-6 h-6 bg-black bg-opacity-60 rounded flex items-center justify-center">
                  <GripVertical className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Empty state
        <div
          className={`border-2 border-dashed border-[var(--theme-border)] rounded-lg p-12 text-center transition-all duration-200 ${
            uploading
              ? 'opacity-50 cursor-not-allowed'
              : 'cursor-pointer hover:border-[var(--theme-primary)] hover:bg-[var(--theme-backgroundTertiary)]'
          }`}
          onClick={uploading ? undefined : () => fileInputRef.current?.click()}
        >
          <svg className="w-16 h-16 text-[var(--theme-foregroundMuted)] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-[var(--theme-foregroundSecondary)] font-medium mb-1">Galeri görselleri ekle</p>
          <p className="text-[var(--theme-foregroundMuted)] text-sm">
            İşletmenizi tanıtan görseller yükleyin (maksimum 5 adet)
          </p>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        disabled={uploading}
        className="hidden"
      />

      {/* Gallery limit info */}
      {galleryImages.length >= 5 && (
        <div className="mt-4 p-3 bg-[var(--theme-warningBackground)] border border-[var(--theme-warningBorder)] rounded-lg">
          <p className="text-sm text-[var(--theme-warningForeground)]">
            <strong>Maksimum görsel sınırına ulaştınız.</strong> Yeni görsel eklemek için önce mevcut görsellerden birini silmeniz gerekiyor.
          </p>
        </div>
      )}
    </div>
  );
};

export const BusinessImageManager: React.FC<BusinessImageManagerProps> = ({
  businessId,
  onImagesUpdated
}) => {
  const [images, setImages] = useState<BusinessImages | null>(null);
  const [loading, setLoading] = useState(true);
  
  const {
    uploading,
    error,
    uploadImage,
    deleteImage,
    deleteGalleryImage,
    updateGalleryOrder,
    getBusinessImages,
    clearError
  } = useImageUpload();

  const fetchImages = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedImages = await getBusinessImages(businessId);
      if (fetchedImages) {
        setImages(fetchedImages);
      }
    } catch (err) {
      console.error('Error fetching images:', err);
    } finally {
      setLoading(false);
    }
  }, [businessId, getBusinessImages]);

  useEffect(() => {
    if (businessId) {
      fetchImages();
    }
  }, [businessId, fetchImages]);

  const handleUpload = async (file: File, imageType: ImageType) => {
    const imageUrl = await uploadImage(businessId, file, imageType);
    if (imageUrl) {
      await fetchImages();
      onImagesUpdated?.();
    }
  };

  const handleDelete = async (imageType: Exclude<ImageType, 'gallery'>) => {
    const success = await deleteImage(businessId, imageType);
    if (success) {
      await fetchImages();
      onImagesUpdated?.();
    }
  };

  const handleGalleryDelete = async (imageUrl: string) => {
    const success = await deleteGalleryImage(businessId, imageUrl);
    if (success) {
      await fetchImages();
      onImagesUpdated?.();
    }
  };

  const handleGalleryReorder = async (orderedUrls: string[]) => {
    const success = await updateGalleryOrder(businessId, orderedUrls);
    if (success) {
      await fetchImages();
      onImagesUpdated?.();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-4 border-[var(--theme-primary)] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[var(--theme-foregroundSecondary)]">Görseller yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Error Display */}
      {error && (
        <div className="bg-[var(--theme-errorBackground)] border border-[var(--theme-errorBorder)] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-[var(--theme-errorForeground)] text-sm">{error}</p>
            <button
              onClick={clearError}
              className="text-[var(--theme-errorForeground)] hover:text-[var(--theme-errorForeground)]/80"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Logo */}
      <ImageUploadSection
        title="Logo"
        description="İşletmenizin logosunu yükleyin. Bu logo, işletmenizin profil sayfasında ve rezervasyon sisteminde görünecektir."
        currentImageUrl={images?.logoUrl}
        imageType="logo"
        onUpload={handleUpload}
        onDelete={() => handleDelete('logo')}
        uploading={uploading}
        aspectRatio="1/1"
        recommendedSize="400x400px"
      />

      {/* Cover Image */}
      <ImageUploadSection
        title="Kapak Görseli"
        description="İşletmenizin kapak görselini yükleyin. Bu görsel, işletme sayfanızın üst kısmında büyük boyutta görünecektir."
        currentImageUrl={images?.coverImageUrl}
        imageType="cover"
        onUpload={handleUpload}
        onDelete={() => handleDelete('cover')}
        uploading={uploading}
        aspectRatio="16/9"
        recommendedSize="1200x675px"
      />

      {/* Profile Image */}
      <ImageUploadSection
        title="Profil Görseli"
        description="İşletmenizin profil görselini yükleyin. Bu görsel, işletme kartlarında ve listeleme sayfalarında kullanılacaktır."
        currentImageUrl={images?.profileImageUrl}
        imageType="profile"
        onUpload={handleUpload}
        onDelete={() => handleDelete('profile')}
        uploading={uploading}
        aspectRatio="4/3"
        recommendedSize="800x600px"
      />

      {/* Gallery */}
      <GalleryManager
        galleryImages={images?.galleryImages || []}
        onUpload={handleUpload}
        onDelete={handleGalleryDelete}
        onReorder={handleGalleryReorder}
        uploading={uploading}
      />
    </div>
  );
};