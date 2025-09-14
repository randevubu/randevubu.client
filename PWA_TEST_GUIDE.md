# 🚀 PWA Test Guide

## Quick Start Testing

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Visit Test Page
Navigate to: `http://localhost:3000/test`

### 3. Test Steps
1. **Click "1. Request Notification Permission"**
   - Should prompt for notification permission
   - Check browser console for logs

2. **Click "2. Subscribe to Push Notifications"**
   - Will attempt to subscribe to push notifications
   - Requires backend to be running

3. **Click "3. Send Test Notification"**
   - Sends a test notification
   - Should appear as browser notification

## Backend Requirements

Your backend should be running on `http://localhost:3001` with these endpoints:
- `GET /api/v1/notifications/push/vapid-key`
- `POST /api/v1/notifications/push/subscribe`
- `POST /api/v1/notifications/push/test`

## Testing Without Backend

If you don't have the backend running, you can still test:
1. Service Worker registration
2. PWA manifest loading
3. Installation prompts (in production build)

## Production Testing

For full PWA testing:
```bash
npm run build
npm start
```

Then visit `http://localhost:3000/test` in Chrome/Edge for:
- PWA installation prompts
- Add to homescreen
- Offline functionality

## Debugging

Check these in browser DevTools:
- **Console**: Error messages and logs
- **Application > Service Workers**: Registration status
- **Application > Manifest**: PWA manifest validity
- **Network**: API call success/failure

## Common Issues

1. **Service Worker not registering**: Check console for errors
2. **Notifications not working**: Ensure permission granted
3. **PWA not installable**: Must be HTTPS (except localhost)
4. **Backend errors**: Ensure backend is running and CORS configured

## Expected Behavior

✅ Service worker registers successfully  
✅ PWA manifest loads without errors  
✅ Notification permission can be requested  
✅ Push subscription works (with backend)  
✅ Test notifications appear  
✅ PWA can be installed (production build)  

## Icons

I've created basic SVG icons for testing. For production:
1. Replace `/public/icon-192.svg` and `/public/icon-512.svg` with PNG versions
2. Update manifest.json to use `.png` instead of `.svg`
3. Use your actual app logo/branding