# GitLab CI/CD Quick Reference

## Pipeline Commands

### View Pipeline Status
```bash
# List recent pipelines
git log --oneline -5

# Check pipeline status in GitLab
# Visit: https://gitlab.com/username/angelo-tutoring/-/pipelines
```

### Trigger Manual Jobs

From GitLab UI:
1. Go to **CI/CD > Pipelines**
2. Click on the pipeline
3. Click the play icon (▶) next to manual jobs

Manual jobs:
- `build_docker` - Build Docker image
- `infrastructure_plan` - Plan infrastructure changes
- `infrastructure_apply` - Apply infrastructure
- `deploy_staging` (on main branch) - Deploy to staging
- `deploy_production` - Deploy to production
- `rollback_production` - Rollback production
- `stop_staging` - Stop staging environment

### Skip Pipeline

```bash
# Commit with [skip ci] to skip pipeline
git commit -m "Update docs [skip ci]"
```

## Common Workflows

### Deploy to Staging (develop branch)

```bash
git checkout develop
git add .
git commit -m "feat: Add new feature"
git push gitlab develop
# Pipeline automatically deploys to staging
```

### Deploy to Production

```bash
git checkout main
git merge develop
git push gitlab main
# Go to GitLab UI and manually trigger 'deploy_production'
```

### Rollback Production

1. Go to **CI/CD > Pipelines**
2. Find the last successful production pipeline
3. Click on it
4. Click play icon next to `rollback_production`

### Build Docker Image

1. Push to main/develop branch
2. Go to pipeline in GitLab
3. Click play icon next to `build_docker`
4. Image will be at: `registry.gitlab.com/username/angelo-tutoring:latest`

## Environment Variables

### Check Variables

GitLab UI: **Settings > CI/CD > Variables**

### Add New Variable

```bash
# Using GitLab API
curl --request POST \
  --header "PRIVATE-TOKEN: your-token" \
  --form "key=NEW_VARIABLE" \
  --form "value=new-value" \
  "https://gitlab.com/api/v4/projects/:project_id/variables"
```

### Required for Deployment

Minimum for VPS deployment:
- `DEPLOY_METHOD=vps`
- `PRODUCTION_DATABASE_URL`
- `PRODUCTION_SERVER_HOST`
- `PRODUCTION_SERVER_USER`
- `PRODUCTION_SSH_PRIVATE_KEY`
- `PRODUCTION_DEPLOY_PATH`

## Troubleshooting

### Pipeline Stuck

```bash
# Cancel stuck pipeline
# GitLab UI > CI/CD > Pipelines > Click pipeline > Cancel

# Clear runner cache
# Settings > CI/CD > Runners > Click runner > Clear caches
```

### Build Fails

```bash
# Check job logs
# Click on failed job in pipeline view

# Retry single job
# Click retry icon next to job

# Retry entire pipeline
# Click retry icon in pipeline overview
```

### SSH Connection Fails

```bash
# Test SSH connection from local machine
ssh -i ~/.ssh/deploy_key deploy@your-server.com

# Verify SSH key in GitLab variables
# Settings > CI/CD > Variables > Check PRODUCTION_SSH_PRIVATE_KEY
```

## Pipeline Status Badges

Add to README.md:

```markdown
[![Pipeline Status](https://gitlab.com/username/angelo-tutoring/badges/main/pipeline.svg)](https://gitlab.com/username/angelo-tutoring/-/commits/main)

[![Coverage Report](https://gitlab.com/username/angelo-tutoring/badges/main/coverage.svg)](https://gitlab.com/username/angelo-tutoring/-/commits/main)
```

## Performance Tips

### Speed Up Builds

1. **Use cache effectively**
   - Cache is automatic in our pipeline
   - Shared across branches with same package-lock.json

2. **Parallelize jobs**
   - lint, typecheck, security_audit run in parallel
   - Use `needs:` to specify dependencies

3. **Use shallow clones**
   - Add to .gitlab-ci.yml:
   ```yaml
   variables:
     GIT_DEPTH: 10
   ```

### Reduce Pipeline Time

Average times:
- Validate stage: 2 min
- Test stage: 1 min
- Build stage: 3 min
- Deploy stage: 2-5 min (varies by method)

Total: ~8-11 minutes per full pipeline

## Monitoring

### View Recent Deployments

```bash
# GitLab UI
# Deployments > Environments > Production/Staging

# Check deployment status
curl https://angelo-tutoring.com/api/health
```

### View Logs

For VPS deployments:
```bash
# SSH to server
ssh deploy@your-server.com

# View PM2 logs
pm2 logs angelo-tutoring --lines 100

# View error logs only
pm2 logs angelo-tutoring --err
```

For Kubernetes:
```bash
kubectl logs -f deployment/angelo-tutoring
```

## Scheduled Pipelines

### Set Up Backup Schedule

1. Go to **CI/CD > Schedules**
2. Click **New schedule**
3. Configure:
   - Description: "Daily database backup"
   - Interval pattern: `0 2 * * *` (2 AM daily)
   - Target branch: main
   - Variables: `SCHEDULE_TYPE=backup`
4. Save pipeline schedule

## Security

### Rotate Secrets

```bash
# Generate new SSH key
ssh-keygen -t ed25519 -C "gitlab-ci-new@angelo-tutoring"

# Update in GitLab
# Settings > CI/CD > Variables > PRODUCTION_SSH_PRIVATE_KEY
# Edit and replace with new key

# Add new public key to server
ssh-copy-id -i ~/.ssh/new_key deploy@your-server.com
```

### Audit Trail

View who changed what:
- **Settings > CI/CD > Variables** - Shows modification history
- **CI/CD > Pipelines** - Shows who triggered pipelines
- **Repository > Commits** - Shows code changes

## Resources

- [Pipeline reference](https://docs.gitlab.com/ee/ci/yaml/)
- [Job artifacts](https://docs.gitlab.com/ee/ci/yaml/#artifacts)
- [Environment variables](https://docs.gitlab.com/ee/ci/variables/)
- [GitLab API](https://docs.gitlab.com/ee/api/api_resources.html)

## Emergency Contacts

- **Production issues**: Check #ops-alerts channel
- **Pipeline failures**: Check CI/CD logs first
- **Security concerns**: Contact security team immediately

---

**Last Updated**: April 2026
**Pipeline Version**: 1.0
**Maintained By**: DevOps Team
