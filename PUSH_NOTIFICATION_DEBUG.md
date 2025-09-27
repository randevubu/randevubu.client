# Push Notification Debug Guide

## Quick Diagnosis Steps

### 1. Check Service Worker Status
Open DevTools (F12) → Application → Service Workers
- Is `/sw-custom.js` registered and active?
- Any errors in service worker console?

### 2. Check Push Subscription
```javascript
// In browser console:
navigator.serviceWorker.ready.then(reg => {
  return reg.pushManager.getSubscription();
}).then(sub => {
  console.log('Subscription:', sub);
  if (sub) console.log('Endpoint:', sub.endpoint);
});
```

### 3. Check Notification Permission
```javascript
console.log('Permission:', Notification.permission);
```

### 4. Test Manual Notification
```javascript
new Notification('Test', { body: 'Manual test' });
```

## Common Issues & Fixes

### Issue 1: Multiple Service Workers
**Problem**: Both `sw.js` and `sw-custom.js` are registered
**Fix**: Unregister all, refresh, re-subscribe

### Issue 2: VAPID Key Mismatch
**Problem**: Frontend and backend use different VAPID keys
**Fix**: Ensure same key for subscription and sending

### Issue 3: Service Worker Not Active
**Problem**: Service worker is in "redundant" state
**Fix**: Clear cache, unregister, refresh

### Issue 4: Browser Blocking Notifications
**Problem**: Browser/OS blocking notifications
**Fix**: Check browser notification settings

## Quick Test Commands

```javascript
// Check support
console.log('Push supported:', 'PushManager' in window);

// Check permission
console.log('Permission:', Notification.permission);

// Check subscription
navigator.serviceWorker.ready.then(reg => {
  return reg.pushManager.getSubscription();
}).then(sub => console.log('Sub:', sub));

// Test notification
new Notification('Test', { body: 'Test' });
```

## Most Likely Causes

1. **VAPID key mismatch** (most common)
2. **Service worker not active**
3. **Browser blocking notifications**
4. **Multiple service workers conflicting**
5. **Backend not actually sending to correct endpoint**
