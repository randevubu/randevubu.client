# Frontend Implementation Guide: Notification Test Rate Limiting

## Overview
The backend now implements rate limiting for SMS tests while allowing unlimited push notification tests. This guide explains how the frontend should handle these changes.

## Backend Changes Summary

### SMS Rate Limiting
- **Rate limit**: 5 minutes between SMS tests per user
- **Response**: Returns `RATE_LIMITED` status with remaining time
- **Cost protection**: Prevents expensive SMS abuse

### Push Notifications
- **No rate limiting**: Can test every few seconds
- **Free testing**: No cost implications

## Frontend Implementation Requirements

### 1. UI/UX Changes

#### Test Button States
```typescript
interface TestButtonState {
  push: 'idle' | 'testing' | 'success' | 'error';
  sms: 'idle' | 'testing' | 'success' | 'error' | 'rate_limited';
}
```

#### Rate Limiting Display
- Show countdown timer for SMS rate limiting
- Display clear messaging about SMS costs
- Allow push notification testing even when SMS is rate limited

### 2. API Response Handling

#### Updated Response Format
```typescript
interface TestReminderResponse {
  success: boolean;
  data: {
    results: Array<{
      success: boolean;
      error?: string;
      channel: 'SMS' | 'PUSH' | 'EMAIL';
      status: 'SENT' | 'FAILED' | 'RATE_LIMITED';
    }>;
    summary: {
      total: number;
      successful: number;
      failed: number;
      channels: string[];
      testMessage: string;
    };
  };
  message: string;
}
```

#### Handle Rate Limiting Response
```typescript
const handleTestResponse = (response: TestReminderResponse) => {
  response.data.results.forEach(result => {
    if (result.channel === 'SMS' && result.status === 'RATE_LIMITED') {
      // Extract remaining time from error message
      const timeMatch = result.error?.match(/(\d+) more minute\(s\)/);
      const remainingMinutes = timeMatch ? parseInt(timeMatch[1]) : 5;

      // Start countdown timer
      startSMSCountdown(remainingMinutes * 60);

      // Show user-friendly message
      showNotification({
        type: 'warning',
        title: 'SMS Test Limited',
        message: `To control costs, SMS tests are limited to once every 5 minutes. ${remainingMinutes} minute(s) remaining.`
      });
    }
  });
};
```

### 3. User Interface Components

#### Separate Test Controls
```jsx
// Instead of single "Test All" button, provide granular control
<div className="notification-test-controls">
  <TestButton
    channel="PUSH"
    disabled={isPushTesting}
    cooldown={0} // No cooldown for push
    onTest={() => testChannel('PUSH')}
  >
    Test Push Notification
  </TestButton>

  <TestButton
    channel="SMS"
    disabled={isSMSTesting || smsRateLimited}
    cooldown={smsCountdown}
    onTest={() => testChannel('SMS')}
    showCostWarning={true}
  >
    Test SMS (Limited)
  </TestButton>
</div>
```

#### Cost Warning Component
```jsx
const SMSCostWarning = () => (
  <div className="cost-warning">
    <Icon name="info" />
    <span>SMS tests are limited to prevent charges. Push notifications can be tested freely.</span>
  </div>
);
```

### 4. State Management

#### Rate Limiting State
```typescript
interface NotificationTestState {
  sms: {
    isRateLimited: boolean;
    remainingSeconds: number;
    lastTestTime: Date | null;
  };
  push: {
    canTest: boolean;
    lastTestTime: Date | null;
  };
}
```

#### Countdown Timer Implementation
```typescript
const useSMSCountdown = (initialSeconds: number) => {
  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (remainingSeconds <= 0) return;

    const timer = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingSeconds]);

  return {
    remainingSeconds,
    isRateLimited: remainingSeconds > 0,
    formatTime: () => {
      const minutes = Math.floor(remainingSeconds / 60);
      const seconds = remainingSeconds % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  };
};
```

### 5. User Experience Improvements

#### Progressive Testing
```typescript
// Allow testing push first, then offer SMS with warning
const testNotifications = async (channels: string[]) => {
  // Always test push first (free and fast)
  if (channels.includes('PUSH')) {
    await testChannel('PUSH');
  }

  // SMS requires confirmation due to costs
  if (channels.includes('SMS')) {
    const confirmed = await showConfirmDialog({
      title: 'Test SMS Notification',
      message: 'SMS tests are limited to once every 5 minutes due to costs. Continue?',
      confirmText: 'Send SMS Test',
      cancelText: 'Skip SMS'
    });

    if (confirmed) {
      await testChannel('SMS');
    }
  }
};
```

#### Visual Feedback
```jsx
const TestButton = ({ channel, cooldown, showCostWarning }) => (
  <button
    className={`test-btn ${channel.toLowerCase()}`}
    disabled={cooldown > 0}
  >
    {cooldown > 0 ? (
      <span>Wait {formatTime(cooldown)}</span>
    ) : (
      <span>Test {channel}</span>
    )}

    {showCostWarning && <CostIcon />}
  </button>
);
```

### 6. Error Handling

#### Rate Limit Errors
```typescript
const handleRateLimitError = (error: string) => {
  // Extract time from error message
  const timeMatch = error.match(/(\d+) more minute\(s\)/);
  const minutes = timeMatch ? parseInt(timeMatch[1]) : 5;

  // Update UI state
  setSMSRateLimit({
    isLimited: true,
    remainingSeconds: minutes * 60,
    message: `SMS testing available in ${minutes} minute(s)`
  });
};
```

## Implementation Checklist

### Backend Integration
- [ ] Update API client to handle new response format
- [ ] Parse rate limiting responses correctly
- [ ] Handle `RATE_LIMITED` status appropriately

### UI Components
- [ ] Separate test buttons for each channel
- [ ] Add countdown timer for SMS rate limiting
- [ ] Show cost warnings for SMS tests
- [ ] Progressive disclosure for expensive operations

### User Experience
- [ ] Clear messaging about rate limits
- [ ] Visual indicators for different channel states
- [ ] Graceful degradation when SMS is limited
- [ ] Immediate feedback for push notification tests

### Error Handling
- [ ] Parse rate limit error messages
- [ ] Display user-friendly error messages
- [ ] Maintain state consistency across rate limit cycles

## Testing Scenarios

1. **First-time SMS test**: Should work immediately
2. **Rapid SMS testing**: Should show rate limit after first test
3. **Push notification testing**: Should always work regardless of SMS state
4. **Mixed channel testing**: Push should work, SMS should respect rate limits
5. **Countdown completion**: SMS button should re-enable after countdown

## Configuration

### Frontend Constants
```typescript
const NOTIFICATION_CONFIG = {
  SMS_RATE_LIMIT_MINUTES: 5,
  PUSH_COOLDOWN_SECONDS: 2, // Prevent UI spam
  SHOW_COST_WARNINGS: true,
  ENABLE_PROGRESSIVE_TESTING: true
};
```

This implementation ensures cost control while maintaining a smooth user experience for notification testing.