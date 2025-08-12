# Fix pentru problema cu token-ul Cognito

## Problema
API Error: `{method: 'GET', url: '/users/me', status: 401, message: 'Bearer token required'}`

## Cauze posibile

### 1. Token-ul nu este obținut corect
- Verifică dacă `access_token` este prezent în obiectul user
- Verifică dacă `scope` este configurat corect pentru a obține `access_token`

### 2. Token-ul nu este trimis în cereri
- Verifică dacă `OidcTokenBridge` setează corect `tokenGetter`
- Verifică dacă interceptorul din API adaugă header-ul Authorization

### 3. Token-ul este expirat
- Verifică dacă `automaticSilentRenew` este configurat corect
- Verifică dacă token-ul este reînnoit automat

## Soluții implementate

### 1. Configurare OIDC optimizată
```javascript
const cognitoAuthConfig = {
  authority: cognitoAuthority || cognitoDomain,
  client_id: import.meta.env.VITE_COGNITO_CLIENT_ID,
  redirect_uri: import.meta.env.VITE_APP_URL || window.location.origin,
  response_type: 'code',
  scope: 'openid email profile', // Scope optimizat
  monitorSession: false, // Dezactivat pentru performanță
  automaticSilentRenew: false, // Dezactivat pentru debugging
  loadUserInfo: false, // Dezactivat pentru performanță
  code_challenge_method: 'S256',
}
```

### 2. Token Bridge îmbunătățit
```javascript
setAuthTokenGetter(async () => {
  try {
    if (!auth.user) {
      console.warn('⚠️ No user found in auth context')
      return null
    }
    
    // Prefer access_token over id_token for API calls
    const token = auth.user.access_token || auth.user.id_token
    if (!token) {
      console.warn('⚠️ No token found in user object')
      return null
    }
    
    console.log('🔑 Token retrieved successfully')
    return token
  } catch (error) {
    console.error('❌ Error getting auth token:', error)
    return null
  }
})
```

### 3. Interceptor API îmbunătățit
```javascript
api.interceptors.request.use(async (config) => {
  if (typeof tokenGetter === 'function') {
    try {
      const token = await tokenGetter()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
        console.log('🔑 Request authorized with token')
      } else {
        console.warn('⚠️ No token available for request')
      }
    } catch (error) {
      console.error('❌ Error getting auth token for request:', error)
    }
  }
  return config
})
```

## Verificări pentru producție

### 1. Testare în browser console
```javascript
// Verifică starea de autentificare
console.log('Auth state:', auth.isLoading, auth.isAuthenticated, !!auth.user)

// Verifică token-ul
console.log('Access token:', auth.user?.access_token ? 'Present' : 'Missing')
console.log('ID token:', auth.user?.id_token ? 'Present' : 'Missing')

// Testează token getter
const token = await tokenGetter()
console.log('Token getter result:', token ? 'Present' : 'Missing')
```

### 2. Verificări în Network tab
- Verifică dacă header-ul `Authorization: Bearer <token>` este prezent
- Verifică dacă cererea către `/users/me` include token-ul
- Verifică dacă răspunsul este 200 în loc de 401

### 3. Verificări în Console
- Caută mesajele cu emoji-uri pentru debugging
- Verifică dacă nu există erori de CORS
- Verifică dacă nu există erori de autentificare

## Configurare pentru producție

### 1. Environment variables
```bash
VITE_DEV_MODE=false
VITE_COGNITO_AUTHORITY=https://auth.simplu.io/eu-central-1_KUaE0MTcQ
VITE_COGNITO_CLIENT_ID=ar2m2qg3gp4a0b4cld09aegdb
VITE_COGNITO_DOMAIN=https://auth.simplu.io
VITE_API_URL=https://api-management.simplu.io
VITE_APP_URL=https://app.simplu.io
```

### 2. Configurare Cognito User Pool
- Verifică dacă `app client` este configurat corect
- Verifică dacă `callback URLs` sunt setate corect
- Verifică dacă `allowed OAuth flows` include `Authorization code grant`
- Verifică dacă `allowed OAuth scopes` include `openid`, `email`, `profile`

### 3. Configurare API Gateway
- Verifică dacă `authorizer` este configurat corect
- Verifică dacă `JWT authorizer` folosește token-ul corect
- Verifică dacă `issuer` și `audience` sunt configurate corect

## Debugging în producție

### 1. Log-uri pentru debugging
```javascript
// Adaugă în OidcTokenBridge
console.log('🔗 OidcTokenBridge: Auth state changed', {
  isLoading: auth.isLoading,
  isAuthenticated: auth.isAuthenticated,
  hasUser: !!auth.user,
  userTokens: auth.user ? {
    accessToken: !!auth.user.access_token,
    idToken: !!auth.user.id_token,
    tokenType: auth.user.token_type
  } : null
})
```

### 2. Testare manuală
```javascript
// Testează manual token-ul
const testToken = async () => {
  try {
    const response = await fetch('https://api-management.simplu.io/users/me', {
      headers: {
        'Authorization': `Bearer ${auth.user.access_token}`,
        'Content-Type': 'application/json'
      }
    })
    console.log('Test response:', response.status, await response.json())
  } catch (error) {
    console.error('Test error:', error)
  }
}
```

## Monitorizare

### 1. CloudWatch Logs
- Configurare log groups pentru aplicație
- Monitorizare erori 401/403
- Alerting pentru probleme de autentificare

### 2. API Gateway Logs
- Verifică log-urile de autentificare
- Monitorizare rate limiting
- Verifică erorile de autorizare

### 3. Cognito Logs
- Verifică log-urile de autentificare
- Monitorizare erori de token
- Verifică refresh-ul token-urilor 