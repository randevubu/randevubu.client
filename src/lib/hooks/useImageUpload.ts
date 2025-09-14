import { useState, useCallback } from 'react';
import { businessService } from '../services/business';
import { ImageType, BusinessImages } from '../../types/business';
import { handleApiError, showSuccessToast, showLoadingToast, dismissToast } from '../utils/toast';

interface UseImageUploadResult {
  uploading: boolean;
  error: string | null;
  uploadImage: (businessId: string, file: File, imageType: ImageType) => Promise<string | null>;
  deleteImage: (businessId: string, imageType: Exclude<ImageType, 'gallery'>) => Promise<boolean>;
  deleteGalleryImage: (businessId: string, imageUrl: string) => Promise<boolean>;
  updateGalleryOrder: (businessId: string, orderedUrls: string[]) => Promise<boolean>;
  getBusinessImages: (businessId: string) => Promise<BusinessImages | null>;
  clearError: () => void;
}

export const useImageUpload = (): UseImageUploadResult => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const validateFile = (file: File): string | null => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

    if (file.size > maxSize) {
      return 'Dosya boyutu çok büyük. Maksimum izin verilen boyut 5MB\'dir.';
    }

    if (!allowedTypes.includes(file.type)) {
      return 'Geçersiz dosya türü. Sadece JPEG, PNG, WebP ve GIF görüntüleri kabul edilir.';
    }

    return null;
  };

  const uploadImage = useCallback(async (
    businessId: string,
    file: File,
    imageType: ImageType
  ): Promise<string | null> => {
    setUploading(true);
    setError(null);

    let loadingToastId: string | undefined;

    try {
      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        handleApiError({ message: validationError });
        return null;
      }

      // Show loading toast
      loadingToastId = showLoadingToast('Yükleniyor...');

      const response = await businessService.uploadBusinessImage(businessId, file, imageType);

      if (response.success && response.data) {
        // Dismiss loading toast before showing success
        if (loadingToastId) {
          dismissToast(loadingToastId);
          loadingToastId = undefined;
        }

        const imageTypeNames = {
          logo: 'Logo',
          cover: 'Kapak görseli',
          profile: 'Profil görseli',
          gallery: 'Galeri görseli'
        };

        showSuccessToast(`${imageTypeNames[imageType]} başarıyla yüklendi`);
        return response.data.imageUrl;
      } else {
        const errorMessage = response.message || 'Upload failed';
        setError(errorMessage);
        handleApiError(response);
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      handleApiError(err);
      return null;
    } finally {
      // Dismiss loading toast if still active
      if (loadingToastId) {
        dismissToast(loadingToastId);
      }
      setUploading(false);
    }
  }, []);

  const deleteImage = useCallback(async (
    businessId: string,
    imageType: Exclude<ImageType, 'gallery'>
  ): Promise<boolean> => {
    setError(null);

    try {
      const response = await businessService.deleteBusinessImage(businessId, imageType);

      if (response.success) {
        const imageTypeNames = {
          logo: 'Logo',
          cover: 'Kapak görseli',
          profile: 'Profil görseli'
        };

        showSuccessToast(`${imageTypeNames[imageType]} başarıyla silindi`);
        return true;
      } else {
        const errorMessage = response.message || 'Delete failed';
        setError(errorMessage);
        handleApiError(response);
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Delete failed';
      setError(errorMessage);
      handleApiError(err);
      return false;
    }
  }, []);

  const deleteGalleryImage = useCallback(async (
    businessId: string,
    imageUrl: string
  ): Promise<boolean> => {
    setError(null);

    try {
      const response = await businessService.deleteGalleryImage(businessId, imageUrl);

      if (response.success) {
        showSuccessToast('Galeri görseli başarıyla silindi');
        return true;
      } else {
        const errorMessage = response.message || 'Delete failed';
        setError(errorMessage);
        handleApiError(response);
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Delete failed';
      setError(errorMessage);
      handleApiError(err);
      return false;
    }
  }, []);

  const updateGalleryOrder = useCallback(async (
    businessId: string,
    orderedUrls: string[]
  ): Promise<boolean> => {
    setError(null);

    try {
      const response = await businessService.updateGalleryOrder(businessId, orderedUrls);

      if (response.success) {
        showSuccessToast('Galeri sıralaması güncellendi');
        return true;
      } else {
        const errorMessage = response.message || 'Update failed';
        setError(errorMessage);
        handleApiError(response);
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Update failed';
      setError(errorMessage);
      handleApiError(err);
      return false;
    }
  }, []);

  const getBusinessImages = useCallback(async (
    businessId: string
  ): Promise<BusinessImages | null> => {
    setError(null);

    try {
      const response = await businessService.getBusinessImages(businessId);

      if (response.success && response.data) {
        // The API response has a nested structure: response.data.data.images
        // But TypeScript expects response.data.images, so we need to cast it
        const responseData = response.data as any;
        const images = responseData.data?.images || responseData.images;
        
        return images;
      } else {
        const errorMessage = response.message || 'Failed to fetch images';
        setError(errorMessage);
        handleApiError(response);
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch images';
      setError(errorMessage);
      handleApiError(err);
      return null;
    }
  }, []);

  return {
    uploading,
    error,
    uploadImage,
    deleteImage,
    deleteGalleryImage,
    updateGalleryOrder,
    getBusinessImages,
    clearError,
  };
};