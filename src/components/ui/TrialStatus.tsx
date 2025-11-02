'use client';

import { useTrialNotifications } from '../../lib/hooks/useTrialSubscription';

interface TrialStatusProps {
  subscription: any;
  onCancel?: () => void;
  onUpdatePayment?: () => void;
}

export default function TrialStatus({ subscription, onCancel, onUpdatePayment }: TrialStatusProps) {
  const { trialInfo, notificationMessage } = useTrialNotifications(subscription);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'TRIAL':
        return {
          label: 'Free Trial',
          color: 'blue',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-600'
        };
      case 'ACTIVE':
        return {
          label: 'Active',
          color: 'green',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          iconColor: 'text-green-600'
        };
      case 'CANCELED':
        return {
          label: 'Canceled',
          color: 'red',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-600'
        };
      case 'EXPIRED':
        return {
          label: 'Expired',
          color: 'red',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-600'
        };
      case 'PAST_DUE':
        return {
          label: 'Past Due',
          color: 'yellow',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-600'
        };
      default:
        return {
          label: 'Unknown',
          color: 'gray',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-800',
          iconColor: 'text-gray-600'
        };
    }
  };

  const statusInfo = getStatusInfo(subscription?.status);
  const showCancel = subscription?.status === 'TRIAL' || subscription?.status === 'ACTIVE';
  const showUpdatePayment = subscription?.status === 'TRIAL' || subscription?.status === 'ACTIVE';

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-3 ${
              statusInfo.color === 'blue' ? 'bg-blue-500' :
              statusInfo.color === 'green' ? 'bg-green-500' :
              statusInfo.color === 'red' ? 'bg-red-500' :
              statusInfo.color === 'yellow' ? 'bg-yellow-500' :
              'bg-gray-500'
            }`} />
            <h3 className="text-lg font-semibold text-gray-900">
              Subscription Status
            </h3>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bgColor} ${statusInfo.textColor}`}>
            {statusInfo.label}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-4">
        {/* Trial Countdown */}
        {subscription?.status === 'TRIAL' && trialInfo && (
          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-blue-900">Trial Period</h4>
                <div className="text-sm text-blue-700">
                  {trialInfo.daysLeft > 0 ? `${trialInfo.daysLeft} days left` : 'Expired'}
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.max(0, Math.min(100, (trialInfo.daysLeft / 7) * 100))}%` 
                  }}
                />
              </div>
              
              <div className="text-xs text-blue-600">
                Trial ends: {trialInfo.trialEndDate.toLocaleDateString()}
              </div>
            </div>
          </div>
        )}

        {/* Notification Message */}
        {notificationMessage && (
          <div className={`mb-4 p-3 rounded-md border ${
            subscription?.status === 'TRIAL' ? 'bg-blue-50 border-blue-200' : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-start">
              <svg className={`h-5 w-5 mr-2 mt-0.5 flex-shrink-0 ${
                subscription?.status === 'TRIAL' ? 'text-blue-600' : 'text-yellow-600'
              }`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className={`text-sm ${
                subscription?.status === 'TRIAL' ? 'text-blue-800' : 'text-yellow-800'
              }`}>
                {notificationMessage}
              </p>
            </div>
          </div>
        )}

        {/* Subscription Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-sm font-medium text-gray-500">Plan</label>
            <p className="text-sm text-gray-900">{subscription?.plan?.displayName || 'Unknown'}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Status</label>
            <p className="text-sm text-gray-900">{statusInfo.label}</p>
          </div>
          
          {subscription?.currentPeriodStart && (
            <div>
              <label className="text-sm font-medium text-gray-500">Period Start</label>
              <p className="text-sm text-gray-900">
                {new Date(subscription.currentPeriodStart).toLocaleDateString()}
              </p>
            </div>
          )}
          
          {subscription?.currentPeriodEnd && (
            <div>
              <label className="text-sm font-medium text-gray-500">Period End</label>
              <p className="text-sm text-gray-900">
                {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </p>
            </div>
          )}
          
          {subscription?.nextBillingDate && (
            <div>
              <label className="text-sm font-medium text-gray-500">Next Billing</label>
              <p className="text-sm text-gray-900">
                {new Date(subscription.nextBillingDate).toLocaleDateString()}
              </p>
            </div>
          )}
          
          {subscription?.autoRenewal !== undefined && (
            <div>
              <label className="text-sm font-medium text-gray-500">Auto Renewal</label>
              <p className="text-sm text-gray-900">
                {subscription.autoRenewal ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          )}
        </div>

        {/* Trial Conversion Notice */}
        {subscription?.status === 'TRIAL' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-green-900 mb-1">
                  Automatic Conversion
                </h4>
                <p className="text-sm text-green-800">
                  Your subscription will automatically convert to a paid plan after the trial period ends.
                  You can cancel anytime before the trial ends to avoid charges.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          {showUpdatePayment && onUpdatePayment && (
            <button
              onClick={onUpdatePayment}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
            >
              Update Payment Method
            </button>
          )}
          
          {showCancel && onCancel && (
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm font-medium"
            >
              Cancel Subscription
            </button>
          )}
        </div>

        {/* Cancellation Notice */}
        {subscription?.cancelAtPeriodEnd && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm text-yellow-800">
                  <strong>Subscription will be canceled at period end.</strong> You'll continue to have access until {new Date(subscription.currentPeriodEnd).toLocaleDateString()}.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}




