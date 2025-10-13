'use client';

import { useMonitorAppointments } from '../../../lib/hooks/useMonitorAppointments';
import { useDashboardBusiness } from '../../../context/DashboardContext';
import { Clock, User, Phone, MapPin, RefreshCw, Wifi, WifiOff, AlertCircle, Maximize2, Minimize2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function MonitorPage() {
  const business = useDashboardBusiness();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Update time every second
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

  // Fullscreen functionality
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
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
    businessId: business?.id || '',
    refetchInterval: 15000, // 15 seconds
    autoRefresh: true,
    includeStats: true,
    maxQueueSize: 10
  });

  // Filter appointments by status
  const confirmedAppointments = [
    ...waitingQueue.filter(appointment => appointment.appointment.status === 'CONFIRMED'),
    ...(nextAppointment && nextAppointment.appointment.status === 'CONFIRMED' ? [nextAppointment] : [])
  ];
  
  const inProgressAppointments = currentAppointment ? [currentAppointment] : [];

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Europe/Istanbul'
    });
  };

  const formatLastUpdated = (dateString: string | Date) => {
    try {
      console.log('🔍 Last updated raw value:', dateString);
      
      // Since backend sends time in format "2025-10-10 13:52" (already in Istanbul time)
      // We can extract just the time part and format it
      if (typeof dateString === 'string' && dateString.includes(' ')) {
        const timePart = dateString.split(' ')[1]; // Extract "13:52"
        console.log('🔍 Extracted time part:', timePart);
        
        // Add seconds if not present
        const timeWithSeconds = timePart.includes(':') && timePart.split(':').length === 2 
          ? timePart + ':00' 
          : timePart;
        
        console.log('🔍 Time with seconds:', timeWithSeconds);
        return timeWithSeconds;
      }
      
      // Fallback to date parsing if format is different
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Geçersiz tarih';
      }
      
      return date.toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Europe/Istanbul'
      });
    } catch (error) {
      console.error('Error formatting last updated time:', error);
      return 'Hata';
    }
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
    <div className={`min-h-screen bg-white text-gray-900 monitor-container ${isFullscreen ? 'monitor-fullscreen' : ''}`}>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200 p-8 monitor-header shadow-lg">
        <div className="flex justify-center items-center relative">
          {/* Fullscreen button - top right */}
          <button
            onClick={toggleFullscreen}
            className="absolute top-0 right-0 p-3 bg-white hover:bg-blue-50 rounded-xl shadow-md transition-all duration-200 hover:shadow-lg"
            title={isFullscreen ? 'Tam Ekrandan Çık' : 'Tam Ekran Yap'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-6 h-6 text-blue-600" />
            ) : (
              <Maximize2 className="w-6 h-6 text-blue-600" />
            )}
          </button>
          
          {/* Center content */}
        <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {businessInfo?.name || business?.name || 'Diş Kliniği'}
              </h1>
            </div>
            <p className="text-gray-600 text-xl font-medium">Randevu Kuyruğu</p>
            <div className="mt-2 w-24 h-1 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full mx-auto"></div>
          </div>
          
          {/* Time and status - top left */}
          <div className="absolute top-0 left-0">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Canlı</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 font-mono">
                {formatTime(currentTime)}
              </div>
              {lastUpdated && (
                <div className="text-xs text-gray-400 mt-1">
                  Güncellendi: {formatLastUpdated(lastUpdated)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 h-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full relative">
          {/* Vertical divider line */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-300 transform -translate-x-1/2"></div>
          {/* Left Side - Confirmed Appointments Waiting */}
          <div className="flex flex-col pr-4">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 monitor-section">BEKLEYENLER</h2>
            <div className="flex-1 overflow-y-auto">
              {confirmedAppointments.length > 0 ? (
                <div className="space-y-4">
                  {confirmedAppointments.map((appointment, index) => (
                    <div key={appointment.appointment.id} className="bg-gray-100 border border-gray-300 p-6 rounded-xl shadow-lg monitor-queue-item monitor-waiting">
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
              ) : (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">⏰</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Bekleyen Yok</h3>
                  <p className="text-gray-600 text-lg">Henüz bekleyen randevu bulunmuyor.</p>
                </div>
              )}
            </div>
          </div>

           {/* Right Side - Active Appointments (IN_PROGRESS) */}
           <div className="flex flex-col space-y-6 pl-4">
             <h2 className="text-3xl font-bold mb-6 text-gray-900 monitor-section">AKTİF RANDEVULAR</h2>
            {/* Active Appointments */}
            {inProgressAppointments.length > 0 ? (
              <div className="space-y-4">
                {inProgressAppointments.map((appointment, index) => (
                  <div key={appointment.appointment.id} className="monitor-fade-in">
                    <div className="bg-green-600 text-white p-8 rounded-2xl shadow-2xl monitor-current monitor-current-pulse">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
                        <h2 className="text-3xl font-bold monitor-section">ŞUAN HİZMET VERİLİYOR</h2>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-xl font-semibold mb-2">Hasta</h3>
                          <p className="text-2xl font-bold monitor-appointment-name">
                            {appointment.appointment.customer.firstName} {appointment.appointment.customer.lastName}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold mb-2">Hizmet</h3>
                          <p className="text-2xl font-bold monitor-appointment-detail">Diş Temizliği</p>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold mb-2">Oda</h3>
                          <p className="text-2xl font-bold monitor-appointment-detail">{appointment.room || 'Oda 1'}</p>
                        </div>
                        {appointment.startedAt && (
                          <div className="mt-4 text-lg">
                            <span className="opacity-80">Başlama: </span>
                            <span className="font-semibold">
                              {formatTime(new Date(appointment.startedAt))}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Aktif Randevu Yok</h3>
                <p className="text-gray-600 text-lg">Şu anda hizmet verilen randevu bulunmuyor.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
