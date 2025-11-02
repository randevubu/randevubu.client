'use client';

import { useEffect, useState } from 'react';
import { useTrialNotifications } from '../../lib/hooks/useTrialSubscription';

interface TrialNotificationsProps {
  subscription: any;
  onUpdatePayment?: () => void;
  onSubscribe?: () => void;
}

export default function TrialNotifications({ subscription, onUpdatePayment, onSubscribe }: TrialNotificationsProps) {
  const { trialInfo, notificationMessage } = useTrialNotifications(subscription);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState<'info' | 'warning' | 'error'>('info');

  useEffect(() => {
    if (!trialInfo || subscription?.status !== 'TRIAL') {
      setShowNotification(false);
      return;
    }

    // Show notifications based on days left
    if (trialInfo.daysLeft <= 0) {
      setNotificationType('error');
      setShowNotification(true);
    } else if (trialInfo.daysLeft === 1) {
      setNotificationType('warning');
      setShowNotification(true);
    } else if (trialInfo.daysLeft === 3) {
      setNotificationType('info');
      setShowNotification(true);
    } else {
      setShowNotification(false);
    }
  }, [trialInfo, subscription?.status]);

  if (!showNotification || !trialInfo) {
    return null;
  }

  const getNotificationIcon = () => {
    switch (notificationType) {
      case 'error':
        return (
          <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      default:
        return (
          <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getNotificationStyles = () => {
    switch (notificationType) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getActionButton = () => {
    if (trialInfo.isExpired) {
      return (
        <button
          onClick={onSubscribe}
          className="ml-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
        >
          Subscribe Now
        </button>
      );
    } else if (trialInfo.daysLeft <= 3) {
      return (
        <button
          onClick={onUpdatePayment}
          className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
        >
          Update Payment
        </button>
      );
    }
    return null;
  };

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-md ${getNotificationStyles()} border rounded-lg shadow-lg p-4`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getNotificationIcon()}
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium">
            {trialInfo.isExpired ? 'Trial Expired' : 
             trialInfo.daysLeft === 1 ? 'Trial Ending Tomorrow' :
             trialInfo.daysLeft === 3 ? 'Trial Ending Soon' : 'Trial Notification'}
          </h3>
          <p className="mt-1 text-sm">
            {notificationMessage}
          </p>
          {trialInfo.daysLeft > 0 && (
            <div className="mt-2">
              <div className="flex items-center text-xs">
                <span className="mr-2">Trial Progress:</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(0, Math.min(100, ((7 - trialInfo.daysLeft) / 7) * 100))}%` }}
                  />
                </div>
                <span className="ml-2">{trialInfo.daysLeft} days left</span>
              </div>
            </div>
          )}
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          {getActionButton()}
          <button
            onClick={() => setShowNotification(false)}
            className="ml-2 text-gray-400 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook for managing trial notifications globally
export function useTrialNotificationManager() {
  const [notifications, setNotifications] = useState<any[]>([]);

  const addNotification = (notification: any) => {
    setNotifications(prev => [...prev, { ...notification, id: Date.now() }]);
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
  };
}




