# API Endpoint Fix - Push Notifications

## ✅ Issue Fixed: Wrong API Endpoints

### Problem
Frontend was calling `/api/v1/push-notifications/*` but backend routes are at `/api/v1/notifications/push/*`

### Root Cause
Route mismatch between frontend and backend caused all push notification API calls to return 404.

---

## 🔧 Fixed Endpoints

### Before (❌ Wrong):
```typescript
// VAPID key
GET /api/v1/push-notifications/vapid-public-key

// Subscribe
POST /api/v1/push-notifications/subscribe

// Unsubscribe
POST /api/v1/push-notifications/unsubscribe

// User preferences
GET /api/v1/users/notification-preferences
PUT /api/v1/users/notification-preferences

// Test
POST /api/v1/businesses/my-business/test-reminder
```

### After (✅ Correct):
```typescript
// VAPID key
GET /api/v1/notifications/push/vapid-public-key

// Subscribe
POST /api/v1/notifications/push/subscribe

// Unsubscribe
POST /api/v1/notifications/push/unsubscribe

// User preferences
GET /api/v1/notifications/push/preferences
PUT /api/v1/notifications/push/preferences

// Test
POST /api/v1/notifications/push/test

// Business test (appointment reminder)
POST /api/v1/businesses/my-business/test-reminder
```

---

## 📁 Files Updated

### ✅ Fixed Files:
1. `src/lib/services/pushNotification.ts` - All 3 endpoints fixed
2. `src/lib/services/notifications.ts` - All 6 endpoints fixed

### Changes Made:
- `/api/v1/push-notifications/*` → `/api/v1/notifications/push/*`
- `/api/v1/users/notification-preferences` → `/api/v1/notifications/push/preferences`

---

## 🧪 How to Test

### Step 1: Clear Everything
1. Open DevTools (F12)
2. Application → Service Workers → Unregister all
3. Application → Storage → Clear site data
4. Reload page (Ctrl+R)

### Step 2: Subscribe
1. Go to `/dashboard/settings`
2. Click "Hatırlatma Ayarları"
3. Toggle ON "Push Bildirimleri"
4. Allow permission when browser asks

### Step 3: Verify Subscription
Open Console:
```javascript
// Should now work without 404 errors
navigator.serviceWorker.ready.then(async reg => {
  const sub = await reg.pushManager.getSubscription();
  console.log('Subscription:', sub ? '✅ Active' : '❌ None');
});
```

### Step 4: Test Notification
1. Go to `/test-reminders`
2. Click "🔔 Test Push Gönder"
3. **Notification should appear!** 🎉

---

## ✅ Expected Behavior Now

### Subscription Flow:
1. User enables push in settings
2. Frontend calls `/api/v1/notifications/push/vapid-public-key` ✅
3. Frontend calls `/api/v1/notifications/push/subscribe` ✅
4. Backend stores subscription ✅
5. User is subscribed ✅

### Test Flow:
1. User clicks test button
2. Frontend/Backend sends to push service ✅
3. Push service delivers to browser ✅
4. Service worker receives push event ✅
5. Notification appears ✅

---

## 🐛 If Still Not Working

### Check These:

1. **Service Worker Console**
   - DevTools → Application → Service Workers → Click "inspect"
   - Look for: `[Service Worker] Push notification received`

2. **Network Tab**
   - All `/api/v1/notifications/push/*` calls should return 200 OK
   - No more 404 errors

3. **Browser Console**
   - Run diagnostic:
   ```javascript
   fetch('http://localhost:3001/api/v1/notifications/push/vapid-public-key')
     .then(r => r.json())
     .then(data => console.log('VAPID Key:', data));
   ```

4. **Backend Logs**
   - Should see subscription being saved
   - Should see push notification being sent

---

## 📊 API Route Map (Backend)

```
/api/v1/notifications/push/
├── GET  /vapid-public-key      → Get VAPID public key
├── POST /subscribe              → Subscribe to push
├── POST /unsubscribe            → Unsubscribe from push
├── GET  /preferences            → Get user notification preferences
├── PUT  /preferences            → Update user preferences
└── POST /test                   → Send test notification

/api/v1/businesses/my-business/
├── GET  /notification-settings  → Get business settings
├── PUT  /notification-settings  → Update business settings
└── POST /test-reminder          → Test appointment reminder
```

---

## 🎯 What Should Happen Now

1. ✅ No more 404 errors
2. ✅ VAPID key fetches successfully
3. ✅ Subscription saves to backend
4. ✅ Push notifications delivered
5. ✅ Service worker receives events
6. ✅ Notifications appear on screen

---

## 🚀 Next Steps

1. **Clear browser data** (important!)
2. **Reload page**
3. **Enable push in settings**
4. **Test notification**
5. **Should work now!** 🎉

---

**Status:** ✅ Fixed
**Last Updated:** 2025-09-24