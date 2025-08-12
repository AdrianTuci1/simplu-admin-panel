# Production Deployment Checklist - Simplu Admin Panel

## ✅ Pre-deployment Checks

### 1. Build Optimization
- [x] Vite config optimized for production
- [x] CSS minification with cssnano
- [x] JavaScript minification with terser
- [x] Code splitting configured
- [x] Bundle size optimized (244KB main bundle)

### 2. Environment Configuration
- [x] `.env.production` created
- [x] `VITE_DEV_MODE=false` set
- [x] All Cognito variables configured
- [x] API endpoints configured
- [x] Stripe keys configured

### 3. Authentication Setup
- [x] OIDC configuration optimized
- [x] Token bridge implemented
- [x] API interceptor configured
- [x] Debug logging added
- [x] Error handling improved

### 4. Performance Optimization
- [x] Preconnect headers added
- [x] Manifest.json optimized
- [x] PWA icons configured
- [x] SEO meta tags added
- [x] Structured data added

## 🚀 Deployment Steps

### 1. Build Application
```bash
# Clean and build
./build.sh

# Verify build output
ls -la dist/
du -sh dist/
```

### 2. EC2 Setup
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Create app directory
sudo mkdir -p /var/www/simplu-admin
sudo chown ubuntu:ubuntu /var/www/simplu-admin
```

### 3. Deploy Application
```bash
# Copy build files
cp -r dist/* /var/www/simplu-admin/

# Start with PM2
pm2 start /var/www/simplu-admin/index.html --name simplu-admin --spa
pm2 save
pm2 startup
```

### 4. Configure Application Load Balancer
- Target Group: HTTP:80
- Health Check: / (200)
- Security Groups: HTTP(80), HTTPS(443)
- Listener: Forward to target group

## 🔍 Post-deployment Verification

### 1. Authentication Flow
```javascript
// Test in browser console
console.log('🔍 Testing auth state...')
console.log('User:', auth.user)
console.log('Access token:', auth.user?.access_token ? 'Present' : 'Missing')
console.log('ID token:', auth.user?.id_token ? 'Present' : 'Missing')

// Test API call
const token = await tokenGetter()
console.log('Token result:', token ? 'Present' : 'Missing')
```

### 2. API Endpoints
- [ ] `/users/me` returns 200 with valid token
- [ ] `/users/me` returns 401 without token
- [ ] All business endpoints working
- [ ] All payment endpoints working

### 3. Performance Metrics
- [ ] First Contentful Paint < 2s
- [ ] Largest Contentful Paint < 3s
- [ ] Cumulative Layout Shift < 0.1
- [ ] First Input Delay < 100ms

### 4. Security Headers
- [ ] X-Frame-Options: SAMEORIGIN
- [ ] X-XSS-Protection: 1; mode=block
- [ ] X-Content-Type-Options: nosniff
- [ ] Content-Security-Policy configured

## 🐛 Troubleshooting Guide

### Authentication Issues
1. **401 Unauthorized**
   - Check Cognito configuration
   - Verify token is being sent
   - Check API Gateway authorizer

2. **Token not obtained**
   - Check OIDC configuration
   - Verify callback URLs
   - Check browser console logs

3. **CORS errors**
   - Check ALB configuration
   - Verify API Gateway CORS settings
   - Check security groups

### Performance Issues
1. **Slow loading**
   - Check bundle size
   - Verify CDN configuration
   - Check network latency

2. **High memory usage**
   - Monitor PM2 logs
   - Check for memory leaks
   - Optimize bundle splitting

## 📊 Monitoring Setup

### 1. CloudWatch Logs
```bash
# Configure log groups
aws logs create-log-group --log-group-name /aws/ec2/simplu-admin
aws logs put-retention-policy --log-group-name /aws/ec2/simplu-admin --retention-in-days 30
```

### 2. PM2 Monitoring
```bash
# Check status
pm2 status
pm2 logs simplu-admin
pm2 monit

# Monitor resources
pm2 show simplu-admin
```

### 3. Application Metrics
- [ ] Error rate < 1%
- [ ] Response time < 500ms
- [ ] Uptime > 99.9%
- [ ] Authentication success rate > 99%

## 🔧 Maintenance

### 1. Regular Updates
- [ ] Update dependencies monthly
- [ ] Security patches applied
- [ ] Performance monitoring
- [ ] Backup verification

### 2. Scaling
- [ ] Monitor CPU usage
- [ ] Monitor memory usage
- [ ] Auto-scaling configured
- [ ] Load balancer health checks

### 3. Security
- [ ] SSL certificate renewal
- [ ] Security group reviews
- [ ] Access key rotation
- [ ] Vulnerability scans

## 📞 Support Contacts

- **DevOps**: [Contact Info]
- **Backend API**: [Contact Info]
- **Cognito Admin**: [Contact Info]
- **AWS Support**: [Contact Info]

## 📝 Deployment Notes

### Version: 1.0.0
- Initial production deployment
- Cognito authentication implemented
- API integration completed
- Performance optimizations applied

### Known Issues
- None currently identified

### Future Improvements
- [ ] Implement service worker for offline support
- [ ] Add real-time notifications
- [ ] Optimize bundle size further
- [ ] Add comprehensive error tracking 