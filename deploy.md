# Deployment Guide - Simplu Admin Panel

## EC2 + Application Load Balancer Setup

### 1. Build pentru producție

```bash
# Rulare script de build
./build.sh

# Sau manual
npm run build
```

### 2. Configurare EC2

#### Instalare Node.js și PM2
```bash
# Instalare Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalare PM2 pentru process management
sudo npm install -g pm2
```

#### Configurare aplicație
```bash
# Creare director pentru aplicație
sudo mkdir -p /var/www/simplu-admin
sudo chown ubuntu:ubuntu /var/www/simplu-admin

# Copiere fișiere build
cp -r dist/* /var/www/simplu-admin/

# Configurare PM2
pm2 start /var/www/simplu-admin/index.html --name simplu-admin --spa
pm2 save
pm2 startup
```

### 3. Configurare Nginx (dacă necesar)

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/simplu-admin;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Handle SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API proxy (dacă necesar)
    location /api/ {
        proxy_pass https://api-management.simplu.io/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 4. Configurare Application Load Balancer

#### Target Group
- Protocol: HTTP
- Port: 80
- Health Check Path: /
- Health Check Protocol: HTTP
- Success Codes: 200

#### Listener Rules
- Default action: Forward to target group
- Priority: 1

#### Security Groups
- Inbound: HTTP (80), HTTPS (443)
- Outbound: All traffic

### 5. Verificare autentificare Cognito

#### Testare token
```javascript
// În browser console
console.log('🔍 Testing auth state...')
console.log('User:', auth.user)
console.log('Access token:', auth.user?.access_token ? 'Present' : 'Missing')
console.log('ID token:', auth.user?.id_token ? 'Present' : 'Missing')
```

#### Debug API calls
```javascript
// Verificare interceptor
console.log('Token getter:', typeof tokenGetter)
const token = await tokenGetter()
console.log('Token result:', token ? 'Present' : 'Missing')
```

### 6. Monitorizare

#### PM2 Commands
```bash
pm2 status
pm2 logs simplu-admin
pm2 monit
```

#### CloudWatch Logs
- Configurare log groups pentru aplicație
- Monitorizare erori 401/403
- Alerting pentru probleme de autentificare

### 7. Troubleshooting

#### Probleme comune
1. **401 Unauthorized**: Verifică token Cognito
2. **CORS errors**: Verifică configurarea ALB
3. **SPA routing**: Verifică try_files în nginx
4. **Token expiration**: Verifică automaticSilentRenew

#### Debug commands
```bash
# Verificare servicii
sudo systemctl status nginx
pm2 status

# Verificare log-uri
sudo tail -f /var/log/nginx/error.log
pm2 logs simplu-admin

# Verificare porturi
sudo netstat -tlnp | grep :80
``` 