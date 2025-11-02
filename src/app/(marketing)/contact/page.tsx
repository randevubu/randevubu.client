'use client';

import { useState } from 'react';
import { contactService, ContactFormData, ContactResponse } from '@/src/lib/services/contact';

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
  general?: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState(false);
  const [rateLimitCooldown, setRateLimitCooldown] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user types
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation: 2-100 characters
    if (!formData.name.trim()) {
      newErrors.name = 'Ad soyad gereklidir';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Ad en az 2 karakter olmalıdır';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Ad en fazla 100 karakter olabilir';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'E-posta gereklidir';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz';
    }

    // Phone validation: 10-20 characters
    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefon gereklidir';
    } else if (formData.phone.trim().length < 10) {
      newErrors.phone = 'Telefon numarası en az 10 karakter olmalıdır';
    } else if (formData.phone.trim().length > 20) {
      newErrors.phone = 'Telefon numarası en fazla 20 karakter olabilir';
    }

    // Subject validation: 3-200 characters
    if (!formData.subject.trim()) {
      newErrors.subject = 'Konu gereklidir';
    } else if (formData.subject.trim().length < 3) {
      newErrors.subject = 'Konu en az 3 karakter olmalıdır';
    } else if (formData.subject.trim().length > 200) {
      newErrors.subject = 'Konu en fazla 200 karakter olabilir';
    }

    // Message validation: 10-2000 characters
    if (!formData.message.trim()) {
      newErrors.message = 'Mesaj gereklidir';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Mesaj en az 10 karakter olmalıdır';
    } else if (formData.message.trim().length > 2000) {
      newErrors.message = 'Mesaj en fazla 2000 karakter olabilir';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccess(false);

    // Client-side validation
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await contactService.submitContactForm(formData as ContactFormData);
      
      if (response.success) {
        setSuccess(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
        // Auto-hide success message after 5 seconds
        setTimeout(() => setSuccess(false), 5000);
      } else {
        // Handle API validation errors
        if (response.error?.details) {
          const newErrors: FormErrors = {};
          response.error.details.forEach(detail => {
            newErrors[detail.field as keyof FormErrors] = detail.message;
          });
          setErrors(newErrors);
        } else {
          setErrors({ general: response.message || 'Mesaj gönderilemedi' });
        }
      }
    } catch (error: unknown) {
      console.error('Contact form error:', error);
      
      const { extractErrorMessage, isAxiosError } = await import('../../../lib/utils/errorExtractor');
      const axiosError = isAxiosError(error);
      const errorMessage = extractErrorMessage(error, 'Mesaj gönderilemedi');
      
      if (errorMessage === 'RATE_LIMIT_EXCEEDED' || (axiosError && error.response?.status === 429)) {
        setErrors({ 
          general: 'Çok fazla istek gönderdiniz. Lütfen 15 dakika sonra tekrar deneyin.' 
        });
        setRateLimitCooldown(true);
        // Auto-enable after 15 minutes
        setTimeout(() => {
          setRateLimitCooldown(false);
          setErrors({});
        }, 15 * 60 * 1000);
      } else if (error.message.includes('Bağlantı hatası')) {
        setErrors({ general: error.message });
      } else {
        setErrors({ general: 'Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      
      {/* Hero Section */}
      <section className="relative bg-white pt-20 pb-16">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 via-white to-purple-50/30"></div>
        
        <div className="relative max-w-6xl mx-auto px-4 lg:px-6 text-center">
          <div className="inline-flex items-center px-3 py-1 bg-indigo-50 rounded-full text-indigo-600 font-medium text-xs mb-4">
            📞 İletişim
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6 leading-tight">
            Bizimle
            <br />
            <span className="text-indigo-600">İletişime Geçin</span>
          </h1>
          
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12">
            Sorularınız, önerileriniz veya destek talepleriniz için 7/24 buradayız. 
            Size en iyi şekilde yardımcı olmak için sabırsızlanıyoruz.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 lg:px-6">
          <div className="grid lg:grid-cols-2 gap-12">
            
            {/* Contact Info */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                İletişim Bilgileri
              </h2>
              
              <div className="space-y-6 mb-12">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Telefon</h3>
                    <p className="text-gray-600">+90 (212) 555-0123</p>
                    <p className="text-sm text-gray-500">Pazartesi - Cuma: 09:00 - 18:00</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">E-posta</h3>
                    <p className="text-gray-600">info@randevubu.com</p>
                    <p className="text-sm text-gray-500">24 saat içinde yanıtlıyoruz</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Adres</h3>
                    <p className="text-gray-600">
                      Maslak Mahallesi, Bilim Sokağı<br />
                      No: 5/A, 34398 Şişli/İstanbul
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">WhatsApp</h3>
                    <p className="text-gray-600">+90 (555) 123-4567</p>
                    <p className="text-sm text-gray-500">Hızlı destek için mesaj gönderin</p>
                  </div>
                </div>
              </div>

              {/* Working Hours */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Çalışma Saatleri</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pazartesi - Cuma</span>
                    <span className="font-medium text-gray-900">09:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cumartesi</span>
                    <span className="font-medium text-gray-900">10:00 - 16:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pazar</span>
                    <span className="font-medium text-gray-900">Kapalı</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">
                  Mesaj Gönderin
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Success Message */}
                  {success && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl">
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.</span>
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {errors.general && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl">
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span>{errors.general}</span>
                      </div>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Ad Soyad *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={isSubmitting || rateLimitCooldown}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                          errors.name ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Ahmet Yılmaz"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        E-posta *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={isSubmitting || rateLimitCooldown}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                          errors.email ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="ahmet@example.com"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Telefon *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={isSubmitting || rateLimitCooldown}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                        errors.phone ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="0555 123 45 67"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>


                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Konu *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleInputChange}
                      disabled={isSubmitting || rateLimitCooldown}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                        errors.subject ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Destek Talebi"
                    />
                    {errors.subject && (
                      <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Mesaj *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={handleInputChange}
                      disabled={isSubmitting || rateLimitCooldown}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none ${
                        errors.message ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Mesajınızı buraya yazın..."
                    />
                    {errors.message && (
                      <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || rateLimitCooldown}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-2xl font-semibold hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Gönderiliyor...</span>
                      </div>
                    ) : rateLimitCooldown ? (
                      'Çok fazla istek gönderdiniz'
                    ) : (
                      'Mesaj Gönder'
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}