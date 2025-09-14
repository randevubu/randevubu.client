'use client';

import { useState, useEffect } from 'react';
import { appointmentService } from '../../lib/services/appointments';
import { formatTimeUntil, formatAppointmentTime, getTimeUntilAppointment } from '../../lib/utils/appointmentHelpers';
import { Appointment } from '../../types';
import Link from 'next/link';

interface NearestAppointmentWidgetProps {
  className?: string;
  showDetails?: boolean;
  autoRefresh?: boolean;
}

export default function NearestAppointmentWidget({ 
  className = '',
  showDetails = true,
  autoRefresh = true
}: NearestAppointmentWidgetProps) {
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [timeUntil, setTimeUntil] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNearestAppointment();
    
    if (autoRefresh) {
      // Refresh every minute
      const interval = setInterval(loadNearestAppointment, 60000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  useEffect(() => {
    if (appointment) {
      updateTimeDisplay();
      
      if (autoRefresh) {
        // Update time display every second
        const interval = setInterval(updateTimeDisplay, 1000);
        return () => clearInterval(interval);
      }
    }
  }, [appointment, autoRefresh]);

  const loadNearestAppointment = async () => {
    try {
      setError(null);
      const response = await appointmentService.getNearestAppointmentCurrentHour();
      
      if (response.success && response.data) {
        setAppointment(response.data.appointment);
      } else {
        setAppointment(null);
      }
    } catch (error) {
      console.error('Failed to load nearest appointment:', error);
      setError('Randevular yüklenemedi');
      setAppointment(null);
    } finally {
      setLoading(false);
    }
  };

  const updateTimeDisplay = () => {
    if (appointment) {
      const timeUntilMs = getTimeUntilAppointment(appointment);
      setTimeUntil(formatTimeUntil(timeUntilMs));
      
      // If appointment time has passed, reload
      if (timeUntilMs <= 0 && autoRefresh) {
        loadNearestAppointment();
      }
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-2">
          <span className="text-red-500">⚠️</span>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
        <button 
          onClick={loadNearestAppointment}
          className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className={`bg-gray-50 rounded-lg border border-gray-200 p-4 ${className}`}>
        <div className="text-center">
          <span className="text-2xl mb-2 block">📅</span>
          <h3 className="font-medium text-gray-900 mb-1">Yakın Randevu Yok</h3>
          <p className="text-gray-600 text-sm">Bu saat içinde randevunuz bulunmuyor</p>
          <Link 
            href="/dashboard/appointments"
            className="inline-block mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
          >
            Tüm Randevuları Görüntüle
          </Link>
        </div>
      </div>
    );
  }

  const isUrgent = getTimeUntilAppointment(appointment) <= 15 * 60 * 1000; // 15 minutes

  return (
    <div className={`bg-white rounded-lg border-2 p-4 transition-colors ${
      isUrgent 
        ? 'border-red-400 bg-red-50' 
        : 'border-blue-400 bg-blue-50'
    } ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className={`text-2xl ${isUrgent ? '⚠️' : '🔔'}`}>
            {isUrgent ? '⚠️' : '🔔'}
          </span>
          <h3 className={`font-semibold ${
            isUrgent ? 'text-red-800' : 'text-blue-800'
          }`}>
            {isUrgent ? 'ACİL RANDEVU!' : 'Sonraki Randevu'}
          </h3>
        </div>
        
        {timeUntil && (
          <span className={`px-2 py-1 rounded text-sm font-medium ${
            isUrgent 
              ? 'bg-red-100 text-red-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            {timeUntil}
          </span>
        )}
      </div>

      <div className="space-y-2">
        <div>
          <h4 className={`font-medium ${isUrgent ? 'text-red-900' : 'text-blue-900'}`}>
            {appointment.service.name}
          </h4>
          {appointment.business && (
            <p className={`text-sm ${isUrgent ? 'text-red-700' : 'text-blue-700'}`}>
              📍 {appointment.business.name}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-4 text-sm">
          <span className={`flex items-center space-x-1 ${
            isUrgent ? 'text-red-700' : 'text-blue-700'
          }`}>
            <span>🕐</span>
            <span>{formatAppointmentTime(appointment.startTime, appointment.endTime)}</span>
          </span>
          
          <span className={`flex items-center space-x-1 ${
            isUrgent ? 'text-red-700' : 'text-blue-700'
          }`}>
            <span>📅</span>
            <span>{new Date(appointment.appointmentDate).toLocaleDateString('tr-TR')}</span>
          </span>
        </div>

        {showDetails && appointment.customer && (
          <div className={`text-sm ${isUrgent ? 'text-red-700' : 'text-blue-700'}`}>
            <span>👤 {appointment.customer.name}</span>
            {appointment.customer.phone && (
              <span className="ml-2">📞 {appointment.customer.phone}</span>
            )}
          </div>
        )}

        {appointment.notes && (
          <div className={`text-sm ${isUrgent ? 'text-red-700' : 'text-blue-700'} bg-white bg-opacity-50 p-2 rounded`}>
            <span className="font-medium">Not: </span>
            <span>{appointment.notes}</span>
          </div>
        )}
      </div>

      <div className="mt-3 flex space-x-2">
        <Link
          href={`/dashboard/appointments?id=${appointment.id}`}
          className={`flex-1 px-3 py-2 rounded text-center text-sm font-medium transition-colors ${
            isUrgent
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          Detayları Görüntüle
        </Link>
        
        <button
          onClick={loadNearestAppointment}
          className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
            isUrgent
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          }`}
          title="Yenile"
        >
          🔄
        </button>
      </div>
    </div>
  );
}