import { Check, X, Plus, Edit, Trash2, Save, RefreshCw, AlertCircle, CheckCircle, Clock, User, Phone, Mail, MapPin, Settings, BarChart3, Home, CreditCard, FileText, HelpCircle, Info, AlertTriangle, Ban, Shield, Users, Building, Star, Heart, Zap, Lock, Unlock, Eye, EyeOff, Calendar, Search, Filter, SortAsc, SortDesc, MoreVertical, MoreHorizontal, Download, Upload, Loader2, Moon, Sun, XCircle, Tag, Bell, ChevronDown, ChevronLeft, ChevronRight, ArrowRight, ArrowLeft } from 'lucide-react';
import { Features } from '../../../components';

export default function FeaturesPage() {
  return (
    <div className="min-h-screen">

      {/* Hero Section */}
      <section className="relative bg-white pt-20 pb-16">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 via-white to-purple-50/30"></div>

        <div className="relative max-w-6xl mx-auto px-4 lg:px-6 text-center">
          <div className="inline-flex items-center px-3 py-1 bg-indigo-50 rounded-full text-indigo-600 font-medium text-xs mb-4">
            ⚡ Tüm Özellikler
          </div>

          <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6 leading-tight">
            RandevuBu'nun
            <br />
            <span className="text-indigo-600">Güçlü Özellikleri</span>
          </h1>

          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12">
            Salon işletmenizi dijital çağa taşıyan, müşteri memnuniyetini artıran ve gelirinizi optimize eden
            kapsamlı özellik setimizi keşfedin.
          </p>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-16">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="text-3xl font-bold text-indigo-600 mb-2">2,500+</div>
              <div className="text-sm text-gray-600">Aktif Salon</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="text-3xl font-bold text-purple-600 mb-2">1M+</div>
              <div className="text-sm text-gray-600">Rezervasyon</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="text-3xl font-bold text-emerald-600 mb-2">%75</div>
              <div className="text-sm text-gray-600">Daha Az No-Show</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
              <div className="text-sm text-gray-600">Otomatik Sistem</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Component */}
      <Features />

      {/* Additional Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 lg:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4">
              Daha Fazla
              <span className="text-indigo-600"> Avantaj</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Rekabette öne çıkmanızı sağlayan ek özelliklerimiz
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white mb-6">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Veri Güvenliği</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Müşteri bilgileriniz SSL şifrelemesi ve KVKK uyumluluğu ile korunur.
                Düzenli yedekleme sistemi ile verileriniz güvende.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  </div>
                  256-bit SSL şifrelemesi
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  </div>
                  KVKK uyumlu sistem
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  </div>
                  Günlük otomatik yedekleme
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Hızlı Performans</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Bulut tabanlı altyapı ile yüksek hızlı performans.
                Mobil uyumlu arayüz ile her cihazda sorunsuz çalışır.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mr-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full" />
                  </div>
                  %99.9 uptime garantisi
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mr-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full" />
                  </div>
                  Hızlı sayfa yükleme
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mr-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full" />
                  </div>
                  Mobil responsive tasarım
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}