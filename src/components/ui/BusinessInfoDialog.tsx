'use client';

import { Building, MapPin, Phone, Mail, Globe, Calendar, Tag } from 'lucide-react';
import Dialog from './Dialog';
import { Business } from '../../types/business';

interface BusinessInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  business: Business | null;
}

export default function BusinessInfoDialog({ isOpen, onClose, business }: BusinessInfoDialogProps) {
  if (!business) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Belirtilmemiş';
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="İşletme Bilgileri"
      size="lg"
    >
      <div className="space-y-6">
        {/* Business Name and Type */}
        <div className="text-center pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{business.name}</h2>
          {business.businessType && (
            <div className="flex items-center justify-center gap-2 text-indigo-600">
              <span className="font-medium">{business.businessType.displayName}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {business.description && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Building className="w-4 h-4" />
              Açıklama
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">{business.description}</p>
          </div>
        )}

        {/* Contact Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {business.phone && (
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-gray-700 mb-1">Telefon</h3>
                <a 
                  href={`tel:${business.phone}`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  {business.phone}
                </a>
              </div>
            </div>
          )}

          {business.email && (
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-gray-700 mb-1">E-posta</h3>
                <a 
                  href={`mailto:${business.email}`}
                  className="text-green-600 hover:text-green-800 text-sm font-medium break-all"
                >
                  {business.email}
                </a>
              </div>
            </div>
          )}

          {business.website && (
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Globe className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-gray-700 mb-1">Web Sitesi</h3>
                <a 
                  href={business.website.startsWith('http') ? business.website : `https://${business.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-800 text-sm font-medium break-all"
                >
                  {business.website}
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Address */}
        {(business.address || business.city) && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Adres
            </h3>
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
              {business.address && <p className="mb-1">{business.address}</p>}
              {business.city && (
                <p>
                  {[business.city, business.state, business.country]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              )}
              {business.postalCode && <p className="mt-1">Posta Kodu: {business.postalCode}</p>}
            </div>
          </div>
        )}

        {/* Tags */}
        {business.tags && business.tags.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Etiketler
            </h3>
            <div className="flex flex-wrap gap-2">
              {business.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Business Status */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div>
            <h3 className="text-xs font-semibold text-gray-700 mb-1">Durum</h3>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${business.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span className="text-sm text-gray-600">
                {business.isActive ? 'Aktif' : 'Pasif'}
              </span>
            </div>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Oluşturulma Tarihi
            </h3>
            <p className="text-sm text-gray-600">{formatDate(business.createdAt)}</p>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

