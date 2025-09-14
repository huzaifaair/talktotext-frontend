# Deployment Guide

This guide covers deploying TalkToText Pro to various platforms with production-ready configurations.

## Vercel Deployment (Recommended)

### Prerequisites
- GitHub account with repository
- Vercel account
- Backend API deployed and accessible

### Step 1: Prepare Repository

\`\`\`bash
# Ensure all files are committed
git add .
git commit -m "Prepare for deployment"
git push origin main
\`\`\`

### Step 2: Connect to Vercel

1. **Import Project**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Build Settings**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

### Step 3: Environment Variables

Add these environment variables in Vercel dashboard:

\`\`\`env
NEXT_PUBLIC_API_BASE_URL=https://your-backend-api.com
NEXT_PUBLIC_APP_NAME=TalkToText Pro
VERCEL_ANALYTICS_ID=your_analytics_id
\`\`\`

### Step 4: Deploy

- Click "Deploy"
- Vercel will build and deploy automatically
- Get your deployment URL (e.g., `https://your-app.vercel.app`)

### Step 5: Custom Domain (Optional)

1. **Add Domain**
   - Go to Project Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

2. **Update Backend CORS**
   \`\`\`python
   CORS(app, origins=[
       "https://your-custom-domain.com",
       "https://your-app.vercel.app"
   ])
   \`\`\`

## Manual Deployment

### Docker Deployment

#### Dockerfile
\`\`\`dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
\`\`\`

#### docker-compose.yml
\`\`\`yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_BASE_URL=http://backend:8000
      - NEXT_PUBLIC_APP_NAME=TalkToText Pro
    depends_on:
      - backend
    networks:
      - app-network

  backend:
    # Your backend service configuration
    ports:
      - "8000:8000"
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
\`\`\`

#### Build and Run
\`\`\`bash
# Build the image
docker build -t talktotextpro-frontend .

# Run with docker-compose
docker-compose up -d
\`\`\`

### Traditional Server Deployment

#### Prerequisites
- Node.js 18+ installed
- PM2 for process management
- Nginx for reverse proxy

#### Step 1: Server Setup
\`\`\`bash
# Install Node.js (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt-get install nginx
\`\`\`

#### Step 2: Deploy Application
\`\`\`bash
# Clone repository
git clone <your-repo-url>
cd talktotextpro

# Install dependencies
npm install

# Build for production
npm run build

# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'talktotextpro',
    script: 'npm',
    args: 'start',
    cwd: '/path/to/your/app',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      NEXT_PUBLIC_API_BASE_URL: 'https://your-backend-api.com'
    }
  }]
}
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
\`\`\`

#### Step 3: Nginx Configuration
\`\`\`nginx
# /etc/nginx/sites-available/talktotextpro
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
\`\`\`

\`\`\`bash
# Enable site
sudo ln -s /etc/nginx/sites-available/talktotextpro /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
\`\`\`

#### Step 4: SSL with Let's Encrypt
\`\`\`bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
\`\`\`

## AWS Deployment

### Using AWS Amplify

#### Step 1: Install Amplify CLI
\`\`\`bash
npm install -g @aws-amplify/cli
amplify configure
\`\`\`

#### Step 2: Initialize Amplify
\`\`\`bash
amplify init
# Follow the prompts to configure your project
\`\`\`

#### Step 3: Add Hosting
\`\`\`bash
amplify add hosting
# Choose "Amazon CloudFront and S3"
\`\`\`

#### Step 4: Deploy
\`\`\`bash
amplify publish
\`\`\`

### Using EC2 + Load Balancer

#### Step 1: Launch EC2 Instance
- Choose Ubuntu 20.04 LTS
- Instance type: t3.medium or larger
- Configure security groups (ports 22, 80, 443)

#### Step 2: Setup Application
\`\`\`bash
# SSH into instance
ssh -i your-key.pem ubuntu@your-instance-ip

# Follow traditional server deployment steps above
\`\`\`

#### Step 3: Application Load Balancer
- Create ALB in AWS Console
- Configure target groups
- Add SSL certificate
- Route traffic to EC2 instances

## Environment-Specific Configurations

### Development
\`\`\`env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=TalkToText Pro (Dev)
NODE_ENV=development
\`\`\`

### Staging
\`\`\`env
NEXT_PUBLIC_API_BASE_URL=https://staging-api.your-domain.com
NEXT_PUBLIC_APP_NAME=TalkToText Pro (Staging)
NODE_ENV=production
\`\`\`

### Production
\`\`\`env
NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.com
NEXT_PUBLIC_APP_NAME=TalkToText Pro
NODE_ENV=production
VERCEL_ANALYTICS_ID=your_analytics_id
\`\`\`

## Performance Optimization

### Build Optimization
\`\`\`javascript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  
  // Bundle analyzer (development only)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config) => {
      config.plugins.push(
        new (require('@next/bundle-analyzer'))({
          enabled: true,
        })
      )
      return config
    },
  }),
}

export default nextConfig
\`\`\`

### CDN Configuration
\`\`\`javascript
// For static assets
const nextConfig = {
  assetPrefix: process.env.NODE_ENV === 'production' 
    ? 'https://cdn.your-domain.com' 
    : '',
}
\`\`\`

## Monitoring and Analytics

### Error Tracking with Sentry
\`\`\`bash
npm install @sentry/nextjs
\`\`\`

\`\`\`javascript
// sentry.client.config.js
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
})
\`\`\`

### Performance Monitoring
\`\`\`javascript
// lib/analytics.ts
export const trackEvent = (eventName: string, properties?: any) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, properties)
  }
}
\`\`\`

## Security Considerations

### Content Security Policy
\`\`\`javascript
// next.config.mjs
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          }
        ]
      }
    ]
  }
}
\`\`\`

### Environment Variable Security
- Never commit `.env.local` to version control
- Use different keys for different environments
- Rotate JWT secrets regularly
- Use secure random generators for secrets

## Backup and Recovery

### Database Backups
\`\`\`bash
# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > backup_$DATE.sql
aws s3 cp backup_$DATE.sql s3://your-backup-bucket/
\`\`\`

### Application Backups
\`\`\`bash
# Backup uploaded files
rsync -av /path/to/uploads/ s3://your-backup-bucket/uploads/

# Backup configuration
tar -czf config_backup_$DATE.tar.gz .env.production nginx.conf
\`\`\`

## Troubleshooting

### Common Issues

#### Build Failures
\`\`\`bash
# Clear Next.js cache
rm -rf .next
npm run build
\`\`\`

#### Memory Issues
\`\`\`javascript
// next.config.mjs
const nextConfig = {
  experimental: {
    largePageDataBytes: 128 * 1000, // 128KB
  },
}
\`\`\`

#### CORS Issues
- Verify backend CORS configuration
- Check environment variables
- Ensure proper protocol (http/https)

### Health Checks
\`\`\`javascript
// pages/api/health.js
export default function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  })
}
\`\`\`

This deployment guide provides comprehensive instructions for deploying TalkToText Pro to various platforms with production-ready configurations and best practices.
