# Backend Authentication Sync Guide

## 🚨 Critical Issue: Authentication Token Mismatch

The frontend is experiencing authentication failures due to backend cookie and token configuration issues. This guide outlines the exact problems and required fixes.

## 🔍 Current Problem Analysis

### Frontend Observations
- **Refresh Token Cookie Expiration**: `525` seconds (8.75 minutes) - TOO SHORT
- **Expected Refresh Token Lifetime**: 7-30 days (604,800 - 2,592,000 seconds)
- **Error Response**: `"Refresh token is invalid or expired"`
- **User Experience**: Users get redirected to login page despite having valid tokens

### Root Cause
The backend is setting refresh token cookies with incorrect expiration times, causing immediate token invalidation.

## 🛠️ Required Backend Fixes

### 1. Fix Refresh Token Cookie Expiration

**Current Issue**: Refresh token cookie expires in 525 seconds
**Required Fix**: Set proper expiration time

```javascript
// ❌ WRONG - Current backend implementation
res.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 525 * 1000 // 525 seconds - TOO SHORT!
});

// ✅ CORRECT - Required implementation
res.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
});
```

### 2. Align Token Lifetimes

**Access Token**: 15-30 minutes (current: likely correct)
**Refresh Token**: 7-30 days (current: 8.75 minutes - WRONG)

```javascript
// JWT payload should have consistent expiration
const refreshTokenPayload = {
  sub: userId,
  type: 'refresh',
  exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
  iat: Math.floor(Date.now() / 1000)
};
```

### 3. Fix Refresh Token Validation

**Current Issue**: Backend rejects valid refresh tokens
**Required Fix**: Proper validation logic

```javascript
// ✅ CORRECT refresh token validation
app.post('/api/v1/auth/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token not provided",
        error: {
          message: "Refresh token not provided",
          code: "UNAUTHORIZED",
          requestId: generateRequestId()
        }
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    
    // Check if token is expired (should not happen with proper maxAge)
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp <= now) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is invalid or expired",
        error: {
          message: "Refresh token is invalid or expired",
          code: "UNAUTHORIZED",
          requestId: generateRequestId()
        }
      });
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      { 
        sub: decoded.sub, 
        roles: decoded.roles,
        type: 'access'
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    );

    // Set new refresh token with proper expiration
    const newRefreshToken = jwt.sign(
      { 
        sub: decoded.sub, 
        type: 'refresh'
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    // Set cookies with proper expiration
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.cookie('hasAuth', '1', {
      httpOnly: false, // Frontend needs to read this
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json({
      success: true,
      data: {
        tokens: {
          accessToken: newAccessToken,
          expiresIn: 15 * 60 // 15 minutes in seconds
        }
      }
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: "Refresh token is invalid or expired",
      error: {
        message: "Refresh token is invalid or expired",
        code: "UNAUTHORIZED",
        requestId: generateRequestId()
      }
    });
  }
});
```

### 4. Environment Variables Check

Ensure these environment variables are properly set:

```env
# Access token (15-30 minutes)
ACCESS_TOKEN_SECRET=your-access-token-secret
ACCESS_TOKEN_EXPIRES_IN=15m

# Refresh token (7-30 days)
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REFRESH_TOKEN_EXPIRES_IN=7d

# Cookie settings
COOKIE_SECURE=true # in production
COOKIE_SAME_SITE=lax
```

### 5. Login Response Fix

Ensure login endpoint sets cookies correctly:

```javascript
// After successful login verification
app.post('/api/v1/auth/verify-login', async (req, res) => {
  // ... verification logic ...

  // Generate tokens
  const accessToken = jwt.sign(
    { sub: user.id, roles: user.roles, type: 'access' },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { sub: user.id, type: 'refresh' },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );

  // Set cookies with proper expiration
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.cookie('hasAuth', '1', {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });

  res.json({
    success: true,
    data: {
      user: userData,
      tokens: {
        accessToken,
        expiresIn: 15 * 60
      }
    }
  });
});
```

## 🧪 Testing Checklist

### 1. Cookie Expiration Test
- [ ] Check `refreshToken` cookie `maxAge` is 7 days (604,800,000 ms)
- [ ] Check `hasAuth` cookie `maxAge` is 24 hours (86,400,000 ms)
- [ ] Verify cookies persist across browser sessions

### 2. Token Refresh Test
- [ ] Login and verify cookies are set
- [ ] Wait for access token to expire (15 minutes)
- [ ] Verify refresh token still works
- [ ] Confirm new access token is generated
- [ ] Verify user stays logged in

### 3. Error Handling Test
- [ ] Test with expired refresh token
- [ ] Test with invalid refresh token
- [ ] Test with missing refresh token
- [ ] Verify proper error responses

## 🔧 Debugging Tools

### Frontend Debug Code
Add this to browser console to check cookie expiration:

```javascript
// Check refresh token cookie expiration
const cookies = document.cookie.split(';');
const refreshTokenCookie = cookies.find(c => c.trim().startsWith('refreshToken='));
if (refreshTokenCookie) {
  console.log('Refresh token cookie:', refreshTokenCookie);
  // Check if cookie has proper expiration
} else {
  console.log('No refresh token cookie found');
}
```

### Backend Debug Logging
Add these logs to track token issues:

```javascript
console.log('Refresh token received:', refreshToken ? 'Present' : 'Missing');
console.log('Refresh token expiration:', decoded?.exp);
console.log('Current time:', Math.floor(Date.now() / 1000));
console.log('Token valid for:', (decoded?.exp - Math.floor(Date.now() / 1000)) / 60, 'minutes');
```

## 📋 Implementation Priority

1. **HIGH PRIORITY**: Fix refresh token cookie expiration (7 days)
2. **HIGH PRIORITY**: Fix refresh token validation logic
3. **MEDIUM PRIORITY**: Add proper error logging
4. **LOW PRIORITY**: Add token rotation for security

## 🚀 Expected Outcome

After implementing these fixes:
- Users will stay logged in for 7 days (refresh token lifetime)
- Access tokens will refresh automatically every 15 minutes
- No more "Refresh token is invalid or expired" errors
- Smooth user experience without unexpected logouts

## 📞 Frontend Contact

If you need clarification on any frontend expectations or have questions about the authentication flow, please reach out to the frontend team.

---

**Note**: This issue is blocking user authentication and should be treated as a critical priority.



