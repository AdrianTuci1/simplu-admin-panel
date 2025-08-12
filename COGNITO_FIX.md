# Fix pentru "Invalid Request" de la Cognito

## Problema
Modificările făcute la configurația OIDC au cauzat erori "invalid request" de la Cognito.

## Soluția implementată

### 1. Revenire la configurația originală OIDC
```javascript
const cognitoAuthConfig = {
  authority: cognitoDomain, // Folosește doar cognitoDomain
  client_id: import.meta.env.VITE_COGNITO_CLIENT_ID,
  redirect_uri: import.meta.env.VITE_APP_URL || window.location.origin,
  response_type: 'code',
  scope: 'phone openid email', // Scope original
  monitorSession: true,
  checkSessionIntervalInSeconds: 60,
  automaticSilentRenew: true,
  silent_redirect_uri: import.meta.env.VITE_APP_URL || window.location.origin,
  loadUserInfo: true,
  code_challenge_method: 'S256',
  
  metadata: {
    issuer: cognitoDomain,
    authorization_endpoint: `${cognitoDomain}/oauth2/authorize`,
    token_endpoint: `${cognitoDomain}/oauth2/token`,
    userinfo_endpoint: `${cognitoDomain}/oauth2/userInfo`,
    jwks_uri: `${cognitoDomain}/.well-known/jwks.json`,
    end_session_endpoint: `${cognitoDomain}/logout`
  }
}
```

### 2. Simplificare OidcTokenBridge
- Eliminat logging-ul excesiv
- Păstrat doar funcționalitatea esențială
- Eliminat verificările complexe

### 3. Simplificare API Interceptor
- Eliminat logging-ul detaliat
- Păstrat doar mesajele esențiale
- Eliminat verificările complexe

### 4. Eliminare delay din DashboardLayout
- Eliminat timeout-ul de 2 secunde
- Revenire la apelul direct UserAPI.me()

## Configurația Cognito corectă

### Environment Variables
```bash
VITE_COGNITO_DOMAIN=https://auth.simplu.io
VITE_COGNITO_CLIENT_ID=ar2m2qg3gp4a0b4cld09aegdb
VITE_APP_URL=https://app.simplu.io
```

### Cognito User Pool Settings
- **App Client**: ar2m2qg3gp4a0b4cld09aegdb
- **Callback URLs**: https://app.simplu.io
- **Allowed OAuth Flows**: Authorization code grant
- **Allowed OAuth Scopes**: phone, openid, email
- **Allowed OAuth Flows**: Authorization code grant

## Verificări

### 1. Testare autentificare
1. Deschide aplicația în browser
2. Verifică dacă nu există erori în console
3. Încearcă să te autentifici
4. Verifică dacă token-ul este obținut

### 2. Testare API calls
1. După autentificare, verifică în Network tab
2. Caută cererea către `/users/me`
3. Verifică dacă header-ul Authorization este prezent
4. Verifică dacă răspunsul este 200

### 3. Debugging
```javascript
// În browser console
console.log('Auth state:', auth.isLoading, auth.isAuthenticated)
console.log('User:', auth.user)
console.log('Access token:', auth.user?.access_token ? 'Present' : 'Missing')
```

## Pași pentru testare

1. **Restart aplicația**:
   ```bash
   npm run dev
   ```

2. **Clear browser cache**:
   - Șterge cookies și cache
   - Deschide aplicația într-o fereastră incognito

3. **Testează autentificarea**:
   - Încearcă să te autentifici
   - Verifică dacă nu există erori "invalid request"

4. **Verifică token-ul**:
   - După autentificare, verifică în console
   - Testează apelul către API

## Dacă problema persistă

### 1. Verifică configurația Cognito
- Verifică dacă app client este configurat corect
- Verifică dacă callback URLs sunt setate corect
- Verifică dacă OAuth scopes sunt configurate corect

### 2. Verifică environment variables
- Verifică dacă VITE_COGNITO_DOMAIN este corect
- Verifică dacă VITE_COGNITO_CLIENT_ID este corect
- Verifică dacă VITE_APP_URL este corect

### 3. Verifică browser console
- Caută erori specifice Cognito
- Verifică dacă există erori de CORS
- Verifică dacă există erori de network

## Configurația finală

Aplicația folosește acum configurația originală care funcționa, cu doar îmbunătățiri minime pentru debugging și logging. Aceasta ar trebui să rezolve problema cu "invalid request" de la Cognito. 