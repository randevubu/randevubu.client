'use client';

import { useParams } from 'next/navigation';
import { useMonitorAppointments } from '../../../../lib/hooks/useMonitorAppointments';
import { Clock, User, Phone, MapPin, RefreshCw, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function MonitorPage() {
  const params = useParams();
  const businessId = params.businessId as string;
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(true);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const {
    currentAppointment,
    nextAppointment,
    waitingQueue,
    stats,
    businessInfo,
    isLoading,
    isError,
    error,
    lastUpdated,
    refreshNow
  } = useMonitorAppointments({
    businessId,
    refetchInterval: 15000, // 15 seconds
    autoRefresh: true,
    includeStats: true,
    maxQueueSize: 10
  });

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatWaitTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} dakika`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} saat ${remainingMinutes} dakika`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'text-green-600 bg-green-100';
      case 'CONFIRMED':
        return 'text-blue-600 bg-blue-100';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100';
      case 'CANCELLED':
      case 'NO_SHOW':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'Hizmet Veriliyor';
      case 'CONFIRMED':
        return 'Onaylandı';
      case 'PENDING':
        return 'Beklemede';
      case 'CANCELLED':
        return 'İptal Edildi';
      case 'NO_SHOW':
        return 'Gelmedi';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Yükleniyor...</h2>
          <p className="text-gray-400 mt-2">Randevu bilgileri alınıyor</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-500">Hata</h2>
          <p className="text-gray-400 mt-2">{error?.message || 'Randevu bilgileri alınamadı'}</p>
          <button
            onClick={refreshNow}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white monitor-container">
      {/* Connection Status Indicator */}
      <div className={`monitor-connection-status ${isOnline ? 'monitor-connection-online' : 'monitor-connection-offline'}`}>
        {isOnline ? 'Bağlı' : 'Bağlantı Yok'}
      </div>

      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-6 monitor-header">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white">
              {businessInfo?.name || 'Diş Kliniği'}
            </h1>
            <p className="text-gray-400 text-lg mt-1">Randevu Kuyruğu</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-2xl font-mono monitor-time">
              <Clock className="w-6 h-6" />
              {formatTime(currentTime)}
            </div>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
              {isOnline ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-500" />
              )}
              {lastUpdated && (
                <span>Son güncelleme: {formatTime(lastUpdated)}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Current Appointment */}
        {currentAppointment && (
          <div className="mb-8 monitor-fade-in">
            <div className="bg-green-600 text-white p-8 rounded-2xl shadow-2xl monitor-current monitor-current-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
                <h2 className="text-3xl font-bold monitor-section">ŞUAN HİZMET VERİLİYOR</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 monitor-grid">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Hasta</h3>
                  <p className="text-2xl font-bold monitor-appointment-name">
                    {currentAppointment.appointment.customer.firstName} {currentAppointment.appointment.customer.lastName}
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Hizmet</h3>
                  <p className="text-2xl font-bold monitor-appointment-detail">Diş Temizliği</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Oda</h3>
                  <p className="text-2xl font-bold monitor-appointment-detail">{currentAppointment.room || 'Oda 1'}</p>
                </div>
              </div>
              {currentAppointment.startedAt && (
                <div className="mt-4 text-lg">
                  <span className="opacity-80">Başlama: </span>
                  <span className="font-semibold">
                    {formatTime(new Date(currentAppointment.startedAt))}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Next Appointment */}
        {nextAppointment && (
          <div className="mb-8 monitor-fade-in">
            <div className="bg-blue-600 text-white p-8 rounded-2xl shadow-2xl monitor-next">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-4 h-4 bg-white rounded-full"></div>
                <h2 className="text-3xl font-bold monitor-section">SIRADAKİ</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 monitor-grid">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Hasta</h3>
                  <p className="text-2xl font-bold monitor-appointment-name">
                    {nextAppointment.appointment.customer.firstName} {nextAppointment.appointment.customer.lastName}
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Hizmet</h3>
                  <p className="text-2xl font-bold monitor-appointment-detail">Kontrol</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Tahmini Başlama</h3>
                  <p className="text-2xl font-bold monitor-appointment-detail">
                    {nextAppointment.estimatedStartTime ? 
                      formatTime(new Date(nextAppointment.estimatedStartTime)) : 
                      'Bekleniyor'
                    }
                  </p>
                </div>
              </div>
              {nextAppointment.waitTimeMinutes && (
                <div className="mt-4 text-lg">
                  <span className="opacity-80">Tahmini Bekleme: </span>
                  <span className="font-semibold">
                    {formatWaitTime(nextAppointment.waitTimeMinutes)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Waiting Queue */}
        {waitingQueue.length > 0 && (
          <div className="mb-8 monitor-fade-in">
            <h2 className="text-3xl font-bold mb-6 text-white monitor-section">BEKLEYENLER</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 monitor-queue-grid">
              {waitingQueue.map((appointment, index) => (
                <div key={appointment.appointment.id} className="bg-gray-800 p-6 rounded-xl shadow-lg monitor-queue-item monitor-waiting">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-yellow-500 text-black rounded-full flex items-center justify-center font-bold text-lg">
                        {index + 1}
                      </div>
                      <span className="text-yellow-500 font-semibold text-lg">Sıra</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.appointment.status)}`}>
                      {getStatusText(appointment.appointment.status)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-gray-400" />
                      <span className="text-xl font-semibold">
                        {appointment.appointment.customer.firstName} {appointment.appointment.customer.lastName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <span className="text-lg">
                        {appointment.estimatedStartTime ? 
                          formatTime(new Date(appointment.estimatedStartTime)) : 
                          'Bekleniyor'
                        }
                      </span>
                    </div>
                    {appointment.waitTimeMinutes && (
                      <div className="text-gray-400">
                        Tahmini bekleme: {formatWaitTime(appointment.waitTimeMinutes)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Statistics */}
        {stats && (
          <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl monitor-fade-in">
            <h2 className="text-3xl font-bold mb-6 text-white monitor-section">GÜNLÜK İSTATİSTİKLER</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 monitor-grid">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-500 monitor-stats-number">{stats.completedToday}</div>
                <div className="text-gray-400 mt-1 monitor-stats-label">Tamamlanan</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-500 monitor-stats-number">{stats.inProgress}</div>
                <div className="text-gray-400 mt-1 monitor-stats-label">Devam Eden</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-500 monitor-stats-number">{stats.waiting}</div>
                <div className="text-gray-400 mt-1 monitor-stats-label">Bekleyen</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-500 monitor-stats-number">{stats.totalScheduled}</div>
                <div className="text-gray-400 mt-1 monitor-stats-label">Toplam Randevu</div>
              </div>
            </div>
            {stats.averageWaitTime > 0 && (
              <div className="mt-6 text-center">
                <div className="text-2xl font-bold text-white">
                  Ortalama Bekleme: {formatWaitTime(Math.round(stats.averageWaitTime))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* No appointments message */}
        {!currentAppointment && !nextAppointment && waitingQueue.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📅</div>
            <h2 className="text-3xl font-bold text-white mb-4">Bugün Randevu Yok</h2>
            <p className="text-gray-400 text-xl">Henüz bugün için randevu bulunmuyor.</p>
          </div>
        )}
      </div>
    </div>
  );
}
