# Infrastructure Setup Guide

This document outlines the infrastructure architecture and setup for the Angelo Tutoring Platform.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CDN (CloudFlare)                          │
│                     SSL/TLS Termination                          │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Load Balancer (Optional)                       │
└─────────────────────┬───────────────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
        ▼                           ▼
┌───────────────┐           ┌───────────────┐
│  App Server 1 │           │  App Server 2 │
│   (Next.js)   │           │   (Next.js)   │
└───────┬───────┘           └───────┬───────┘
        │                           │
        └───────────┬───────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌───────────────┐       ┌──────────────┐
│  PostgreSQL   │       │   Supabase   │
│   Database    │       │     Auth     │
└───────────────┘       └──────────────┘
```

## Infrastructure Components

### 1. Application Hosting

#### Option A: Vercel (Recommended for Quick Start)

**Pros**:
- Zero configuration deployments
- Automatic scaling
- Edge functions
- Built-in CDN
- SSL certificates
- Preview deployments for PRs

**Pricing**:
- Hobby: Free (100GB bandwidth)
- Pro: $20/month (1TB bandwidth)

**Setup**:
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Link project
vercel link

# Deploy
vercel --prod
```

**Environment Variables** (set in Vercel dashboard):
- All variables from `.env.example`
- Auto-deployments from GitLab via webhook

#### Option B: VPS (DigitalOcean, Linode, Vultr)

**Pros**:
- Full control
- Cost-effective for consistent traffic
- Can run multiple services

**Requirements**:
- Ubuntu 22.04 LTS or newer
- 2GB RAM minimum (4GB recommended)
- 50GB SSD storage
- Node.js 20+

**Setup Script**:
```bash
#!/bin/bash
# Run on fresh Ubuntu 22.04 VPS

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Configure firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Install Nginx
sudo apt install -y nginx

# Install SSL (Let's Encrypt)
sudo apt install -y certbot python3-certbot-nginx
```

**Nginx Configuration**:
```nginx
# /etc/nginx/sites-available/angelo-tutoring
server {
    listen 80;
    server_name angelo-tutoring.com www.angelo-tutoring.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/angelo-tutoring /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo certbot --nginx -d angelo-tutoring.com -d www.angelo-tutoring.com
```

#### Option C: Kubernetes (Enterprise Scale)

**Pros**:
- High availability
- Auto-scaling
- Container orchestration
- Ideal for microservices

**Requirements**:
- Kubernetes cluster (GKE, EKS, AKS, or self-hosted)
- kubectl configured
- Docker registry access

**Sample Deployment**:
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: angelo-tutoring
  namespace: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: angelo-tutoring
  template:
    metadata:
      labels:
        app: angelo-tutoring
    spec:
      containers:
      - name: app
        image: registry.gitlab.com/username/angelo-tutoring:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: angelo-tutoring-secrets
              key: database-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: angelo-tutoring-service
spec:
  selector:
    app: angelo-tutoring
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: angelo-tutoring-ingress
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - angelo-tutoring.com
    secretName: angelo-tutoring-tls
  rules:
  - host: angelo-tutoring.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: angelo-tutoring-service
            port:
              number: 80
```

Apply:
```bash
kubectl apply -f k8s/
kubectl rollout status deployment/angelo-tutoring
```

### 2. Database (PostgreSQL)

#### Option A: Managed Database (Recommended)

**Providers**:
- **Supabase Database** (included with auth)
  - Free tier: 500MB storage
  - Pro: $25/month (8GB storage)
  - Includes: Backups, monitoring, connection pooling

- **DigitalOcean Managed PostgreSQL**
  - Starts at $15/month (1GB RAM)
  - Automated backups
  - High availability option

- **AWS RDS PostgreSQL**
  - db.t3.micro: $15-20/month
  - Multi-AZ for high availability
  - Automated backups and patching

**Setup with Supabase**:
```bash
# Already configured if using Supabase auth
# Database connection is automatic
# URL format: postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
```

**Setup with DigitalOcean**:
```bash
# Get connection string from DigitalOcean dashboard
# Format: postgresql://user:password@host:port/database?sslmode=require

# Set in GitLab CI/CD variables
PRODUCTION_DATABASE_URL=postgresql://...

# Run migrations
npm run db:push
```

#### Option B: Self-Hosted PostgreSQL

**Requirements**:
- Separate server or same VPS
- PostgreSQL 15 or newer
- Regular backups

**Setup**:
```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE angelo_tutoring;
CREATE USER angelo_user WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE angelo_tutoring TO angelo_user;
\q

# Configure for remote access (if needed)
sudo nano /etc/postgresql/15/main/postgresql.conf
# Change: listen_addresses = '*'

sudo nano /etc/postgresql/15/main/pg_hba.conf
# Add: host all all 0.0.0.0/0 md5

sudo systemctl restart postgresql
```

**Backup Script**:
```bash
#!/bin/bash
# /usr/local/bin/backup-postgres.sh

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/postgresql"
DB_NAME="angelo_tutoring"

mkdir -p $BACKUP_DIR

pg_dump $DB_NAME | gzip > $BACKUP_DIR/angelo_tutoring_$TIMESTAMP.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed: angelo_tutoring_$TIMESTAMP.sql.gz"
```

Set up cron:
```bash
sudo crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-postgres.sh
```

### 3. CDN & SSL

#### CloudFlare (Recommended)

**Features**:
- Free SSL certificates
- DDoS protection
- Caching
- Analytics
- DNS management

**Setup**:
1. Create CloudFlare account
2. Add domain
3. Update nameservers at domain registrar
4. Configure SSL mode: "Full (strict)"
5. Enable Auto Minify (HTML, CSS, JS)
6. Set up Page Rules:
   - Cache everything on `/public/*`
   - Always use HTTPS

**Caching Rules**:
```
# Images, fonts, static assets - cache for 1 month
/public/* → Cache Level: Cache Everything, Edge TTL: 1 month

# API routes - no cache
/api/* → Cache Level: Bypass

# Pages - cache for 1 hour
/* → Cache Level: Standard, Edge TTL: 1 hour
```

### 4. Monitoring & Logging

#### Sentry (Error Tracking)

**Setup**:
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

Add to `.env.production`:
```bash
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
SENTRY_AUTH_TOKEN=your-auth-token
```

#### Uptime Monitoring

**Options**:
- **UptimeRobot** (Free, 50 monitors)
- **BetterUptime** ($10/month)
- **Pingdom** (More features, $10/month)

**Monitor URLs**:
- `https://angelo-tutoring.com` (200 OK)
- `https://angelo-tutoring.com/api/health` (Health check)

#### Log Management

**For VPS**:
```bash
# PM2 logs
pm2 logs angelo-tutoring --lines 1000

# PM2 log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

**For Kubernetes**:
```bash
# Install logging stack (ELK or Loki)
helm install loki grafana/loki-stack
kubectl logs -f deployment/angelo-tutoring
```

## Infrastructure as Code (Terraform)

Create `infrastructure/` directory with Terraform configurations:

```hcl
# infrastructure/main.tf
terraform {
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
  }
}

provider "digitalocean" {
  token = var.do_token
}

# VPS Droplet
resource "digitalocean_droplet" "web" {
  image    = "ubuntu-22-04-x64"
  name     = "angelo-tutoring-prod"
  region   = "fra1"
  size     = "s-2vcpu-4gb"
  ssh_keys = [var.ssh_fingerprint]

  tags = ["production", "web"]
}

# Managed Database
resource "digitalocean_database_cluster" "postgres" {
  name       = "angelo-tutoring-db"
  engine     = "pg"
  version    = "15"
  size       = "db-s-1vcpu-1gb"
  region     = "fra1"
  node_count = 1

  tags = ["production", "database"]
}

# Database
resource "digitalocean_database_db" "app_db" {
  cluster_id = digitalocean_database_cluster.postgres.id
  name       = "angelo_tutoring"
}

# Output
output "droplet_ip" {
  value = digitalocean_droplet.web.ipv4_address
}

output "database_uri" {
  value     = digitalocean_database_cluster.postgres.uri
  sensitive = true
}
```

```hcl
# infrastructure/variables.tf
variable "do_token" {
  description = "DigitalOcean API Token"
  type        = string
  sensitive   = true
}

variable "ssh_fingerprint" {
  description = "SSH key fingerprint"
  type        = string
}
```

**Usage**:
```bash
cd infrastructure/
terraform init
terraform plan
terraform apply
```

## Cost Estimates

### Minimal Setup (Staging)
- Vercel Hobby: Free
- Supabase Free Tier: Free
- CloudFlare: Free
- **Total: $0/month**

### Standard Setup (Production)
- DigitalOcean Droplet (2vCPU, 4GB): $24/month
- DigitalOcean Managed PostgreSQL: $15/month
- CloudFlare Pro (optional): $20/month
- Sentry (Team): $26/month
- **Total: $65-85/month**

### Enterprise Setup
- Kubernetes Cluster (3 nodes): $120/month
- Managed PostgreSQL (HA): $80/month
- CloudFlare Business: $200/month
- Monitoring Suite: $100/month
- **Total: $500+/month**

## Security Checklist

- [ ] SSL/TLS certificates configured
- [ ] Database connection uses SSL
- [ ] Environment variables not in code
- [ ] SSH keys properly secured
- [ ] Firewall rules configured
- [ ] Regular backups automated
- [ ] Monitoring and alerting set up
- [ ] DDoS protection enabled (CloudFlare)
- [ ] Rate limiting configured
- [ ] Security headers configured
- [ ] Regular security audits scheduled

## Next Steps

1. **Choose deployment platform** (Vercel/VPS/K8s)
2. **Set up database** (Supabase/managed/self-hosted)
3. **Configure domain and SSL**
4. **Set up CI/CD variables** in GitLab
5. **Run first deployment**
6. **Configure monitoring**
7. **Set up backups**
8. **Load testing** (optional)

## Support

For infrastructure questions:
- Review [GITLAB_SETUP.md](./GITLAB_SETUP.md)
- Check [CI_CD_QUICK_REFERENCE.md](./CI_CD_QUICK_REFERENCE.md)
- Consult provider documentation
- Contact DevOps team

---

**Last Updated**: April 2026
