# GitLab Repository Setup & CI/CD Configuration Guide

This guide walks you through setting up the GitLab repository and CI/CD pipeline for the Angelo Tutoring Platform.

## Table of Contents

1. [Create GitLab Repository](#1-create-gitlab-repository)
2. [Push Code to GitLab](#2-push-code-to-gitlab)
3. [Configure CI/CD Variables](#3-configure-cicd-variables)
4. [Pipeline Overview](#4-pipeline-overview)
5. [Deployment Options](#5-deployment-options)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. Create GitLab Repository

### Option A: Using GitLab Web Interface

1. **Navigate to GitLab**
   - Go to https://gitlab.com (or your self-hosted GitLab instance)
   - Sign in to your account

2. **Create New Project**
   - Click the "+" icon in the top navigation
   - Select "New project/repository"
   - Choose "Create blank project"

3. **Configure Project**
   - **Project name**: `angelo-tutoring`
   - **Project URL**: Choose your namespace (user or group)
   - **Visibility Level**: Private (recommended)
   - **Initialize repository with a README**: Uncheck (we have existing code)
   - Click "Create project"

4. **Copy the Repository URL**
   - You'll see the Git URL like: `git@gitlab.com:username/angelo-tutoring.git`

### Option B: Using GitLab API (curl)

```bash
# Set your GitLab personal access token
GITLAB_TOKEN="your-personal-access-token"
GITLAB_URL="https://gitlab.com"

# Create repository
curl --request POST \
  --header "PRIVATE-TOKEN: ${GITLAB_TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{
    "name": "angelo-tutoring",
    "visibility": "private",
    "description": "Next.js 16 tutoring platform with PostgreSQL, Supabase auth, PWA, and i18n support"
  }' \
  "${GITLAB_URL}/api/v4/projects"
```

---

## 2. Push Code to GitLab

### Step 1: Commit Current Changes

```bash
cd /Users/user/Updated-tutorial-app-2026/angelo-tutoring

# Add the modified CLAUDE.md file
git add CLAUDE.md

# Commit the changes
git commit -m "Update CLAUDE.md with documentation"
```

### Step 2: Add GitLab Remote

```bash
# Add GitLab as a remote (replace with your actual GitLab URL)
git remote add gitlab git@gitlab.com:username/angelo-tutoring.git

# Or if using HTTPS:
# git remote add gitlab https://gitlab.com/username/angelo-tutoring.git

# Verify remotes
git remote -v
```

You should see:
```
gitlab  git@gitlab.com:username/angelo-tutoring.git (fetch)
gitlab  git@gitlab.com:username/angelo-tutoring.git (push)
origin  https://github.com/GABRIELS562/Tutoring-App.git (fetch)
origin  https://github.com/GABRIELS562/Tutoring-App.git (push)
```

### Step 3: Add New Files

```bash
# Add the CI/CD configuration files
git add .gitlab-ci.yml
git add Dockerfile
git add .dockerignore
git add .env.example
git add GITLAB_SETUP.md

# Commit the CI/CD setup
git commit -m "Add GitLab CI/CD pipeline configuration

- Complete CI/CD pipeline with lint, test, build, and deploy stages
- Dockerfile for containerized deployments
- Environment variable examples
- Support for Vercel, VPS, and Kubernetes deployments
- Infrastructure as Code stage for Terraform
- Automated database migrations
- Comprehensive caching strategy
"
```

### Step 4: Push to GitLab

```bash
# Push to GitLab (master branch)
git push gitlab master

# If you want to push all branches:
# git push gitlab --all

# If you want to push tags:
# git push gitlab --tags
```

### Step 5: Set GitLab as Default Remote (Optional)

```bash
# If you want to make GitLab the default remote
git remote rename origin github
git remote rename gitlab origin

# Now 'git push' will push to GitLab by default
```

---

## 3. Configure CI/CD Variables

### Access CI/CD Settings

1. Navigate to your GitLab project
2. Go to **Settings > CI/CD**
3. Expand the **Variables** section
4. Click **Add variable** for each variable below

### Required Variables by Environment

#### Deployment Configuration

| Variable | Type | Protected | Masked | Value |
|----------|------|-----------|--------|-------|
| `DEPLOY_METHOD` | Variable | No | No | `vercel`, `vps`, or `kubernetes` |

#### Staging Environment

| Variable | Type | Protected | Masked | Value |
|----------|------|-----------|--------|-------|
| `STAGING_DATABASE_URL` | Variable | Yes | Yes | `postgresql://user:pass@host:5432/db` |
| `STAGING_SERVER_HOST` | Variable | Yes | No | `staging.example.com` |
| `STAGING_SERVER_USER` | Variable | Yes | No | `deploy` |
| `STAGING_SSH_PRIVATE_KEY` | File | Yes | Yes | SSH private key content |
| `STAGING_DEPLOY_PATH` | Variable | Yes | No | `/var/www/angelo-tutoring` |
| `NEXT_PUBLIC_SUPABASE_URL` | Variable | No | No | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Variable | No | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Variable | Yes | Yes | Supabase service role key |

#### Production Environment

| Variable | Type | Protected | Masked | Value |
|----------|------|-----------|--------|-------|
| `PRODUCTION_DATABASE_URL` | Variable | Yes | Yes | `postgresql://user:pass@host:5432/db` |
| `PRODUCTION_SERVER_HOST` | Variable | Yes | No | `angelo-tutoring.com` |
| `PRODUCTION_SERVER_USER` | Variable | Yes | No | `deploy` |
| `PRODUCTION_SSH_PRIVATE_KEY` | File | Yes | Yes | SSH private key content |
| `PRODUCTION_DEPLOY_PATH` | Variable | Yes | No | `/var/www/angelo-tutoring` |
| `NEXT_PUBLIC_SUPABASE_URL` | Variable | Yes | No | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Variable | Yes | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Variable | Yes | Yes | Supabase service role key |
| `ANTHROPIC_API_KEY` | Variable | Yes | Yes | Claude API key |
| `RESEND_API_KEY` | Variable | Yes | Yes | Email service API key |
| `PAYFAST_MERCHANT_ID` | Variable | Yes | No | PayFast merchant ID |
| `PAYFAST_MERCHANT_KEY` | Variable | Yes | Yes | PayFast merchant key |

#### Container Registry (for Docker builds)

| Variable | Type | Protected | Masked | Value |
|----------|------|-----------|--------|-------|
| `CI_REGISTRY` | Variable | No | No | Auto-set by GitLab |
| `CI_REGISTRY_USER` | Variable | No | No | Auto-set by GitLab |
| `CI_REGISTRY_PASSWORD` | Variable | Yes | Yes | Auto-set by GitLab |

#### Vercel Deployment (if using Vercel)

| Variable | Type | Protected | Masked | Value |
|----------|------|-----------|--------|-------|
| `VERCEL_TOKEN` | Variable | Yes | Yes | Vercel deployment token |
| `VERCEL_ORG_ID` | Variable | No | No | Vercel organization ID |
| `VERCEL_PROJECT_ID` | Variable | No | No | Vercel project ID |

### Variable Configuration Tips

- **Protected**: Enable for production/staging variables (only available on protected branches)
- **Masked**: Enable for sensitive data (API keys, passwords) to hide in logs
- **Environment Scope**: Set specific variables for different environments
- **File Variables**: Use for SSH keys, certificates, or large configuration files

---

## 4. Pipeline Overview

### Pipeline Stages

The CI/CD pipeline consists of 6 stages:

```
validate → test → build → infrastructure → deploy-staging → deploy-prod
```

#### Stage 1: Validate (Runs on all branches)

- **install_dependencies**: Install npm packages and cache them
- **lint**: Run ESLint for code quality
- **typecheck**: TypeScript type checking
- **security_audit**: npm audit for vulnerabilities

#### Stage 2: Test

- **test_unit**: Run unit tests (placeholder - add Jest/Vitest)
- **validate_migrations**: Check Drizzle migration files

#### Stage 3: Build

- **build_application**: Build Next.js production bundle
- **build_docker**: Build Docker image (manual trigger)

#### Stage 4: Infrastructure

- **infrastructure_plan**: Run Terraform plan (manual)
- **infrastructure_apply**: Apply infrastructure changes (manual)

#### Stage 5: Deploy Staging

- **deploy_staging**: Deploy to staging environment
  - Runs automatically on `develop` branch
  - Manual trigger on `main`/`master` branch
- **stop_staging**: Stop staging environment (manual)

#### Stage 6: Deploy Production

- **deploy_production**: Deploy to production
  - Manual trigger only on `main`/`master` branch
  - Includes database migrations
  - Health checks before and after deployment
- **rollback_production**: Rollback to previous version (manual)

### Pipeline Execution Flow

```mermaid
graph LR
    A[Push Code] --> B[Validate]
    B --> C[Test]
    C --> D[Build]
    D --> E{Branch?}
    E -->|develop| F[Auto Deploy Staging]
    E -->|main| G[Manual Deploy Staging]
    G --> H[Manual Deploy Production]
    F --> H
```

### Caching Strategy

The pipeline uses intelligent caching to speed up builds:

- **node_modules**: Cached based on `package-lock.json`
- **.next/cache**: Next.js build cache
- **.npm**: npm package cache

Average pipeline execution time:
- First run: ~8-10 minutes
- Subsequent runs with cache: ~3-5 minutes

---

## 5. Deployment Options

### Option 1: Vercel Deployment

**Best for**: Quick setup, automatic scaling, edge functions

```bash
# Set deployment method
DEPLOY_METHOD=vercel
```

**Required Variables**:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

**Pipeline will**:
1. Install Vercel CLI
2. Deploy with environment variables
3. Provide deployment URL

### Option 2: VPS Deployment

**Best for**: Full control, cost-effective for consistent traffic

**Required Variables**:
- `STAGING_SERVER_HOST` / `PRODUCTION_SERVER_HOST`
- `STAGING_SERVER_USER` / `PRODUCTION_SERVER_USER`
- `STAGING_SSH_PRIVATE_KEY` / `PRODUCTION_SSH_PRIVATE_KEY`
- `STAGING_DEPLOY_PATH` / `PRODUCTION_DEPLOY_PATH`

**Server Requirements**:
- Node.js 20+
- PM2 process manager
- PostgreSQL database

**Pipeline will**:
1. rsync code to server
2. Install dependencies
3. Build application
4. Restart PM2 process

**Server Setup**:
```bash
# On your VPS
sudo apt update
sudo apt install -y nodejs npm postgresql
sudo npm install -g pm2

# Create deployment directory
sudo mkdir -p /var/www/angelo-tutoring
sudo chown $USER:$USER /var/www/angelo-tutoring

# Start application with PM2
cd /var/www/angelo-tutoring
npm install
npm run build
pm2 start npm --name angelo-tutoring -- start
pm2 save
pm2 startup
```

### Option 3: Kubernetes Deployment

**Best for**: Large scale, microservices, container orchestration

**Required Variables**:
- `KUBECONFIG` (Kubernetes configuration)
- `CI_REGISTRY_IMAGE` (Docker image URL)

**Pipeline will**:
1. Build Docker image
2. Push to GitLab Container Registry
3. Update Kubernetes deployment
4. Monitor rollout status

**Kubernetes Setup**:
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: angelo-tutoring
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
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: angelo-tutoring-secrets
              key: database-url
```

---

## 6. Troubleshooting

### Common Issues

#### 1. Pipeline Fails at "install_dependencies"

**Symptom**: npm ci fails with "package-lock.json does not match package.json"

**Solution**:
```bash
rm package-lock.json
npm install
git add package-lock.json
git commit -m "Update package-lock.json"
git push
```

#### 2. ESLint Errors Block Pipeline

**Symptom**: Pipeline stops at lint stage

**Solution**:
```bash
# Run locally to see errors
npm run lint

# Fix errors or temporarily allow failure
# Edit .gitlab-ci.yml and set: allow_failure: true
```

#### 3. Build Fails with "Module not found"

**Symptom**: Next.js build fails with import errors

**Solution**:
- Check that all dependencies are in `package.json`
- Verify TypeScript paths in `tsconfig.json`
- Ensure `.env.example` has all required variables

#### 4. Docker Build Fails

**Symptom**: "Cannot connect to Docker daemon"

**Solution**:
- Ensure GitLab Runner has Docker executor configured
- Check that `docker:dind` service is enabled
- Verify CI/CD settings allow Docker-in-Docker

#### 5. Deployment Fails with SSH Error

**Symptom**: "Permission denied (publickey)"

**Solution**:
```bash
# Generate new SSH key
ssh-keygen -t ed25519 -C "gitlab-ci@angelo-tutoring"

# Add public key to server
ssh-copy-id deploy@your-server.com

# Add private key to GitLab CI/CD variables
# Settings > CI/CD > Variables > Add variable
# Name: PRODUCTION_SSH_PRIVATE_KEY
# Type: File
# Value: [paste private key content]
```

#### 6. Database Migration Fails

**Symptom**: "Error: Cannot connect to database"

**Solution**:
- Verify `DATABASE_URL` is correct in CI/CD variables
- Check database server allows connections from GitLab runners
- Test connection locally: `npx drizzle-kit push`

### View Pipeline Logs

1. Go to **CI/CD > Pipelines**
2. Click on the pipeline run
3. Click on the failed job
4. View logs to identify the issue

### Retry Failed Jobs

- Click the retry icon (↻) next to a failed job
- Or retry the entire pipeline from the pipeline overview

### Enable Debug Mode

Add to `.gitlab-ci.yml` for verbose logging:

```yaml
variables:
  CI_DEBUG_TRACE: "true"
```

---

## Next Steps

1. **Set Up Infrastructure**
   - Create `infrastructure/` directory
   - Add Terraform/Pulumi configuration for:
     - PostgreSQL database (RDS/managed)
     - Application hosting
     - CDN (CloudFlare)
     - SSL certificates

2. **Configure Monitoring**
   - Set up Sentry for error tracking
   - Add Google Analytics
   - Configure uptime monitoring (UptimeRobot)

3. **Add Tests**
   - Install Jest or Vitest
   - Write unit tests for utilities
   - Add integration tests for API routes
   - Update `test_unit` job in pipeline

4. **Set Up Scheduled Jobs**
   - Configure daily database backups
   - Schedule dependency audits
   - Set up performance monitoring

5. **Configure Environments**
   - Go to **Deployments > Environments**
   - Set up staging and production environments
   - Configure environment-specific variables

---

## Additional Resources

- [GitLab CI/CD Documentation](https://docs.gitlab.com/ee/ci/)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Drizzle ORM Migrations](https://orm.drizzle.team/docs/migrations)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

---

## Support

For questions or issues:
- Create an issue in the GitLab repository
- Contact the development team
- Review pipeline logs in GitLab CI/CD

---

**Happy Deploying! 🚀**
