# 🔐 Authentication Flow: Backend & Frontend Guide

## 📋 Quick Summary

**Your Backend**: Uses industry-standard **token rotation** with dual support for web (HttpOnly cookies) and mobile (secure storage).

**Your Frontend**: Must handle tokens differently based on platform:
- **Web Apps** → Browser manages refresh token automatically via HttpOnly cookies
- **Mobile Apps** → Must store and update refresh token in secure storage

---

## 🎯 What Your Backend Does

### 1. Login/Registration (`POST /api/v1/auth/verify-login`)

**Backend Behavior:**

```typescript
// When user logs in with phone + verification code
1. ✅ Validates verification code
2. ✅ Creates/finds user in database
3. ✅ Generates TWO tokens:
   - Access Token (15 minutes) → Short-lived for API calls
   - Refresh Token (30 days) → Long-lived for getting new access tokens
4. ✅ Stores refresh token in database with metadata (device, IP, user agent)
5. ✅ Detects client type (web vs mobile)
6. ✅ Responds differently based on client:

   // For WEB CLIENTS (default)
   - Sets refresh token as HttpOnly cookie (browser stores it)
   - Sets hasAuth=1 cookie (readable by JavaScript)
   - Returns only access token in response body
   
   // For MOBILE CLIENTS (header: x-client-type: mobile)
   - Returns BOTH tokens in response body
   - No cookies set
```

**Response for Web:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "id": "...", "phoneNumber": "...", ... },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "expiresIn": 900
      // ❌ No refreshToken (it's in HttpOnly cookie)
    }
  }
}
```

**Response for Mobile:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "id": "...", "phoneNumber": "...", ... },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc...",  // ✅ Included for mobile
      "expiresIn": 900,
      "refreshExpiresIn": 2592000
    }
  }
}
```

---

### 2. Token Refresh (`POST /api/v1/auth/refresh`)

**Backend Behavior:**

```typescript
// When access token expires and needs refresh
1. ✅ Detects client type:
   - Web: Looks for refresh token in HttpOnly cookie
   - Mobile: Looks for refresh token in request body
   
2. ✅ Validates refresh token:
   - Checks JWT signature
   - Checks if token exists in database
   - Checks if token is revoked
   - Checks if token is expired
   - Checks if user is still active
   
3. ✅ REVOKES old refresh token (token rotation security)
   - Marks old token as isRevoked: true in database
   - This prevents token reuse if stolen
   
4. ✅ Generates NEW token pair:
   - New access token (15 minutes)
   - New refresh token (30 days)
   
5. ✅ Stores new refresh token in database

6. ✅ Responds based on client type:
   - Web: Sets new refresh token cookie + returns access token
   - Mobile: Returns BOTH tokens in body
```

**Request from Web:**
```typescript
// Frontend does NOT send refresh token manually
fetch('http://api.example.com/api/v1/auth/refresh', {
  method: 'POST',
  credentials: 'include' // ⚠️ CRITICAL: Browser sends cookie automatically
})
```

**Request from Mobile:**
```typescript
// Frontend MUST send refresh token in body
fetch('http://api.example.com/api/v1/auth/refresh', {
  method: 'POST',
  headers: { 
    'x-client-type': 'mobile',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    refreshToken: 'eyJhbGc...' // From secure storage
  })
})
```

**Response for Web:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "tokens": {
      "accessToken": "eyJhbGc...",  // New access token
      "expiresIn": 900
      // ❌ No refreshToken (it's in new HttpOnly cookie)
    }
  }
}
```

**Response for Mobile:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "tokens": {
      "accessToken": "eyJhbGc...",      // New access token
      "refreshToken": "eyJhbGc...",     // ✅ NEW refresh token (must update!)
      "expiresIn": 900,
      "refreshExpiresIn": 2592000
    }
  }
}
```

---

### 3. Token Rotation Explained

**❗ CRITICAL CONCEPT: Your backend implements token rotation**

```
User logs in:
├─ Backend generates: RefreshToken_v1
├─ Backend stores: RefreshToken_v1 (isRevoked: false)
└─ User receives: RefreshToken_v1

15 minutes later, access token expires...
User calls refresh:
├─ User sends: RefreshToken_v1
├─ Backend validates: RefreshToken_v1 ✅
├─ Backend generates: RefreshToken_v2 (new)
├─ Backend REVOKES: RefreshToken_v1 (isRevoked: true) ← OLD TOKEN DEAD!
├─ Backend stores: RefreshToken_v2 (isRevoked: false)
└─ User receives: RefreshToken_v2

If user tries to use RefreshToken_v1 again:
└─ Backend rejects: "Refresh token is invalid or expired" ❌

User must use RefreshToken_v2 for next refresh
```

**Why Token Rotation?**
- 🔒 **Security**: Stolen tokens become useless after one use
- 🔍 **Detection**: If old token is reused, indicates compromise
- ⏱️ **Limited Window**: Even if stolen, attacker has limited time

---

## 💻 What Your Frontend Should Do

### For Web Apps (React, Vue, Angular, etc.)

#### 1. Configure HTTP Client

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api/v1',
  withCredentials: true // ⚠️ CRITICAL: Sends/receives cookies
});

export default api;
```

#### 2. Store Tokens Correctly

```typescript
// ✅ CORRECT: Access token in memory only
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

// ❌ WRONG: Never use localStorage for tokens (XSS risk)
localStorage.setItem('accessToken', token); // DON'T DO THIS!

// ❌ WRONG: Don't try to access refresh token
document.cookie; // Won't see refreshToken (it's HttpOnly)
```

#### 3. Login Flow

```typescript
const login = async (phoneNumber: string, code: string) => {
  const response = await api.post('/auth/verify-login', {
    phoneNumber,
    verificationCode: code
  });

  // Store access token in memory
  setAccessToken(response.data.data.tokens.accessToken);
  
  // ✅ Refresh token is in HttpOnly cookie (automatic)
  // ✅ Browser will send it automatically on every request
  // ❌ Don't try to read or store it manually

  return response.data.data.user;
};
```

#### 4. Automatic Token Refresh (Axios Interceptor)

```typescript
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

// Add access token to all requests
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request
        return new Promise((resolve) => {
          refreshSubscribers.push((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call refresh - cookie sent automatically
        const response = await api.post('/auth/refresh');
        const newAccessToken = response.data.data.tokens.accessToken;

        // Update access token in memory
        setAccessToken(newAccessToken);

        // Process queued requests
        refreshSubscribers.forEach((callback) => callback(newAccessToken));
        refreshSubscribers = [];

        // Retry failed request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout
        setAccessToken(null);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
```

#### 5. What You DON'T Need to Do (Web)

```typescript
// ❌ DON'T manually manage refresh token
// ❌ DON'T send refresh token in request body
// ❌ DON'T store refresh token anywhere
// ❌ DON'T update refresh token after refresh

// ✅ Browser does ALL of this automatically!
```

---

### For Mobile Apps (React Native, Flutter, etc.)

#### 1. Configure HTTP Client

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.example.com/api/v1',
  headers: {
    'x-client-type': 'mobile' // ⚠️ CRITICAL: Tells backend you're mobile
  }
});

export default api;
```

#### 2. Store Tokens Securely

```typescript
import * as SecureStore from 'expo-secure-store';

const TokenStorage = {
  // Access Token
  async saveAccessToken(token: string) {
    await SecureStore.setItemAsync('accessToken', token);
  },
  
  async getAccessToken() {
    return await SecureStore.getItemAsync('accessToken');
  },
  
  // Refresh Token
  async saveRefreshToken(token: string) {
    // ⚠️ CRITICAL: Must use secure storage (encrypted)
    await SecureStore.setItemAsync('refreshToken', token);
  },
  
  async getRefreshToken() {
    return await SecureStore.getItemAsync('refreshToken');
  },
  
  async clearAll() {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
  }
};

// ❌ WRONG: Never use AsyncStorage for tokens (not encrypted)
AsyncStorage.setItem('refreshToken', token); // DON'T DO THIS!
```

#### 3. Login Flow

```typescript
const login = async (phoneNumber: string, code: string) => {
  const response = await api.post('/auth/verify-login', {
    phoneNumber,
    verificationCode: code
  });

  const { accessToken, refreshToken } = response.data.data.tokens;

  // ⚠️ CRITICAL: Store BOTH tokens securely
  await TokenStorage.saveAccessToken(accessToken);
  await TokenStorage.saveRefreshToken(refreshToken);

  return response.data.data.user;
};
```

#### 4. Automatic Token Refresh

```typescript
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

// Add access token to all requests
api.interceptors.request.use(async (config) => {
  const token = await TokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshSubscribers.push((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Get refresh token from secure storage
        const refreshToken = await TokenStorage.getRefreshToken();
        
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        // ⚠️ CRITICAL: Send refresh token in body
        const response = await api.post('/auth/refresh', {
          refreshToken
        });

        const { accessToken, refreshToken: newRefreshToken } = 
          response.data.data.tokens;

        // ⚠️ CRITICAL: Update BOTH tokens
        await TokenStorage.saveAccessToken(accessToken);
        await TokenStorage.saveRefreshToken(newRefreshToken); // NEW token!

        // Process queued requests
        refreshSubscribers.forEach((callback) => callback(accessToken));
        refreshSubscribers = [];

        // Retry failed request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout
        await TokenStorage.clearAll();
        // Navigate to login screen
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
```

#### 5. What You MUST Do (Mobile)

```typescript
// ✅ MUST send x-client-type: mobile header
// ✅ MUST store refresh token in secure storage
// ✅ MUST send refresh token in request body
// ✅ MUST update BOTH tokens after refresh
// ✅ MUST use encrypted storage (SecureStore/Keychain/Keystore)
```

---

## 🔍 Key Differences: Web vs Mobile

| Aspect | Web Apps | Mobile Apps |
|--------|----------|-------------|
| **Refresh Token Storage** | HttpOnly Cookie (browser) | Secure Storage (encrypted) |
| **Refresh Token Sending** | Automatic (cookie) | Manual (request body) |
| **Client Detection** | Default | Header: `x-client-type: mobile` |
| **Login Response** | Access token only | Both tokens |
| **Refresh Response** | Access token only | Both tokens (NEW) |
| **Token Update** | Automatic (browser) | Manual (must save new token) |
| **Security Model** | XSS protection via HttpOnly | Encryption via secure storage |

---

## 🚨 Common Mistakes & Solutions

### Mistake 1: Reusing Old Refresh Token

```typescript
// ❌ WRONG: Using same refresh token repeatedly
const refreshToken = 'abc123';
await refresh(refreshToken); // Works
await refresh(refreshToken); // ❌ FAILS - token was revoked!

// ✅ CORRECT: Updating refresh token after each refresh
let currentToken = 'abc123';
const result1 = await refresh(currentToken);
currentToken = result1.refreshToken; // Update!

const result2 = await refresh(currentToken);
currentToken = result2.refreshToken; // Update again!
```

### Mistake 2: Not Sending Credentials (Web)

```typescript
// ❌ WRONG: Cookies won't be sent
axios.get('/api/users');

// ✅ CORRECT: Cookies are sent
axios.get('/api/users', { withCredentials: true });

// OR set globally
axios.defaults.withCredentials = true;
```

### Mistake 3: Storing Tokens Insecurely (Mobile)

```typescript
// ❌ WRONG: Not encrypted (anyone can read)
AsyncStorage.setItem('refreshToken', token);

// ✅ CORRECT: Encrypted storage
SecureStore.setItemAsync('refreshToken', token);
```

### Mistake 4: Not Detecting Client Type

```typescript
// ❌ WRONG: Mobile app without header
const api = axios.create({
  baseURL: 'https://api.example.com'
});

// ✅ CORRECT: Mobile app with header
const api = axios.create({
  baseURL: 'https://api.example.com',
  headers: { 'x-client-type': 'mobile' }
});
```

### Mistake 5: Storing Access Token in localStorage (Web)

```typescript
// ❌ WRONG: Vulnerable to XSS attacks
localStorage.setItem('accessToken', token);

// ✅ CORRECT: Memory only (React state, Zustand, Redux)
const [accessToken, setAccessToken] = useState(null);
```

---

## 📊 Complete Flow Diagram

### Web App Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. LOGIN                                                         │
└─────────────────────────────────────────────────────────────────┘
   Frontend                    Backend                    Browser
      │                           │                           │
      │──POST /auth/verify-login──>                          │
      │  {phone, code}            │                          │
      │                           │                          │
      │                           │ Generate tokens          │
      │                           │ - accessToken (15min)    │
      │                           │ - refreshToken (30d)     │
      │                           │                          │
      │<─────Response─────────────│                          │
      │  {accessToken}            │─Set-Cookie: refreshToken─>
      │                           │  (HttpOnly, Secure)      │
      │                           │─Set-Cookie: hasAuth=1────>
      │                           │                          │
   Store accessToken              │                    Stores cookies
   in memory (React)              │                    automatically


┌─────────────────────────────────────────────────────────────────┐
│ 2. API CALL (15 minutes later, access token expired)            │
└─────────────────────────────────────────────────────────────────┘
   Frontend                    Backend                    Browser
      │                           │                           │
      │──GET /api/users───────────>                          │
      │  Auth: Bearer [EXPIRED]   │                          │
      │                           │                          │
      │<────401 Unauthorized──────│                          │
      │                           │                          │
      │                           │                          │
      │──POST /auth/refresh───────>                          │
      │  (no body)                │<─Cookie: refreshToken────│
      │                           │  (automatic)             │
      │                           │                          │
      │                           │ Validate refresh token   │
      │                           │ Revoke old token         │
      │                           │ Generate new tokens      │
      │                           │                          │
      │<────Response──────────────│                          │
      │  {newAccessToken}         │─Set-Cookie: NEW refresh──>
      │                           │  (automatic rotation)    │
      │                           │                          │
   Update accessToken             │                    Updates cookie
   in memory                      │                    automatically
      │                           │                          │
      │──GET /api/users (retry)───>                          │
      │  Auth: Bearer [NEW]       │                          │
      │<────200 OK────────────────│                          │


┌─────────────────────────────────────────────────────────────────┐
│ KEY POINT: Frontend never touches refresh token!                │
│ Browser manages it automatically via cookies.                    │
└─────────────────────────────────────────────────────────────────┘
```

### Mobile App Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. LOGIN                                                         │
└─────────────────────────────────────────────────────────────────┘
   Frontend                         Backend
      │                                │
      │──POST /auth/verify-login───────>
      │  Header: x-client-type: mobile │
      │  {phone, code}                 │
      │                                │
      │                                │ Generate tokens
      │                                │ Detect mobile client
      │                                │
      │<─────Response──────────────────│
      │  {                             │
      │    accessToken,                │
      │    refreshToken  ←── Both!     │
      │  }                             │
      │                                │
   Save BOTH to SecureStore            │
   (encrypted storage)                 │


┌─────────────────────────────────────────────────────────────────┐
│ 2. API CALL (15 minutes later, access token expired)            │
└─────────────────────────────────────────────────────────────────┘
   Frontend                         Backend
      │                                │
      │──GET /api/users────────────────>
      │  Auth: Bearer [EXPIRED]        │
      │                                │
      │<────401 Unauthorized───────────│
      │                                │
   Get refreshToken                    │
   from SecureStore                    │
      │                                │
      │──POST /auth/refresh────────────>
      │  Header: x-client-type: mobile │
      │  {                             │
      │    refreshToken ←── Send it!   │
      │  }                             │
      │                                │
      │                                │ Validate refresh token
      │                                │ Revoke old token
      │                                │ Generate new tokens
      │                                │
      │<─────Response──────────────────│
      │  {                             │
      │    accessToken,                │
      │    refreshToken (NEW!)         │
      │  }                             │
      │                                │
   Save BOTH NEW tokens                │
   to SecureStore                      │
      │                                │
      │──GET /api/users (retry)────────>
      │  Auth: Bearer [NEW]            │
      │<────200 OK─────────────────────│


┌─────────────────────────────────────────────────────────────────┐
│ KEY POINT: Frontend MUST update refresh token after each        │
│ refresh because backend rotates it (old one is revoked).        │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✅ Implementation Checklist

### Backend (Already Done ✅)

- [x] Token rotation on refresh
- [x] HttpOnly cookies for web clients
- [x] Token in body for mobile clients
- [x] Client type detection
- [x] Database storage of refresh tokens
- [x] Token revocation system
- [x] Device tracking
- [x] Audit logging

### Frontend - Web

- [ ] Configure `withCredentials: true`
- [ ] Store access token in memory only
- [ ] Never store refresh token (browser handles it)
- [ ] Implement axios interceptor for auto-refresh
- [ ] Handle 401 errors with refresh logic
- [ ] Clear tokens on logout
- [ ] Never use localStorage for tokens

### Frontend - Mobile

- [ ] Send `x-client-type: mobile` header
- [ ] Use secure storage (SecureStore/Keychain)
- [ ] Store BOTH tokens after login
- [ ] Send refresh token in request body
- [ ] Update BOTH tokens after refresh
- [ ] Clear secure storage on logout
- [ ] Never use AsyncStorage for tokens

---

## 🆘 Troubleshooting

### Error: "Refresh token is invalid or expired"

**Causes:**
1. ❌ Reusing old refresh token after refresh (token rotation)
2. ❌ Token actually expired (30 days passed)
3. ❌ Token was revoked by logout
4. ❌ User was deactivated

**Solutions:**
1. ✅ Update refresh token after each refresh (mobile)
2. ✅ Let browser handle cookie update (web)
3. ✅ Redirect to login if refresh fails

### Web: Cookies Not Being Sent

**Causes:**
1. ❌ Missing `withCredentials: true`
2. ❌ CORS not configured for credentials
3. ❌ Different domain (localhost vs 127.0.0.1)

**Solutions:**
1. ✅ Set `withCredentials: true` in axios
2. ✅ Backend CORS: `credentials: true`
3. ✅ Use consistent domain/port

### Mobile: Token Not Updating

**Causes:**
1. ❌ Not saving new refresh token after refresh
2. ❌ Missing `x-client-type: mobile` header
3. ❌ Backend returning web-style response

**Solutions:**
1. ✅ Save both tokens after refresh
2. ✅ Always send mobile header
3. ✅ Backend correctly detects client type

---

## 📚 Additional Resources

- Your existing guides:
  - `FRONTEND_TOKEN_REFRESH_GUIDE.md` - Web implementation details
  - `INDUSTRY_BEST_PRACTICES.md` - Complete security patterns
  - `BACKEND_AUTH_VERIFICATION.md` - API endpoint specifications

- Industry standards:
  - [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
  - [OAuth 2.0 Best Practices](https://oauth.net/2/best-practices/)
  - [Auth0 Token Best Practices](https://auth0.com/docs/secure/tokens/token-best-practices)

---

**Questions?** Review the detailed guides above or contact the development team.


