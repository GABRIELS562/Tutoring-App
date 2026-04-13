#!/bin/bash

# ============================================================================
# GitLab Repository Setup Script
# Angelo Tutoring Platform
# ============================================================================

set -e  # Exit on error

echo "============================================================================"
echo "GitLab Repository Setup for Angelo Tutoring Platform"
echo "============================================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ ${NC}$1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f ".gitlab-ci.yml" ]; then
    print_error "Error: Please run this script from the project root directory"
    exit 1
fi

print_success "Found project files"
echo ""

# Check git status
print_info "Checking git status..."
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not a git repository"
    exit 1
fi

print_success "Git repository detected"
echo ""

# Get GitLab username/URL
echo "============================================================================"
echo "Step 1: GitLab Repository Information"
echo "============================================================================"
echo ""

read -p "Enter your GitLab username or group name: " GITLAB_USERNAME
read -p "Enter your GitLab URL (press Enter for gitlab.com): " GITLAB_URL
GITLAB_URL=${GITLAB_URL:-gitlab.com}

REPO_URL="git@${GITLAB_URL}:${GITLAB_USERNAME}/angelo-tutoring.git"
HTTPS_URL="https://${GITLAB_URL}/${GITLAB_USERNAME}/angelo-tutoring.git"

echo ""
print_info "Repository URL (SSH): ${REPO_URL}"
print_info "Repository URL (HTTPS): ${HTTPS_URL}"
echo ""

read -p "Use SSH (recommended) or HTTPS? [ssh/https]: " PROTOCOL
PROTOCOL=${PROTOCOL:-ssh}

if [ "$PROTOCOL" = "https" ]; then
    REMOTE_URL=$HTTPS_URL
else
    REMOTE_URL=$REPO_URL
fi

# Check if remote already exists
if git remote get-url gitlab > /dev/null 2>&1; then
    print_warning "GitLab remote already exists"
    CURRENT_URL=$(git remote get-url gitlab)
    echo "   Current URL: ${CURRENT_URL}"
    read -p "Update to new URL? [y/N]: " UPDATE_REMOTE
    if [ "$UPDATE_REMOTE" = "y" ] || [ "$UPDATE_REMOTE" = "Y" ]; then
        git remote set-url gitlab $REMOTE_URL
        print_success "Updated GitLab remote URL"
    fi
else
    print_info "Adding GitLab remote..."
    git remote add gitlab $REMOTE_URL
    print_success "GitLab remote added"
fi

echo ""

# Show current branch
CURRENT_BRANCH=$(git branch --show-current)
print_info "Current branch: ${CURRENT_BRANCH}"
echo ""

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    print_warning "You have uncommitted changes"
    git status --short
    echo ""
    read -p "Commit changes before pushing? [Y/n]: " COMMIT_CHANGES
    if [ "$COMMIT_CHANGES" != "n" ] && [ "$COMMIT_CHANGES" != "N" ]; then
        read -p "Enter commit message: " COMMIT_MSG
        COMMIT_MSG=${COMMIT_MSG:-"Update code before GitLab push"}
        git add -A
        git commit -m "$COMMIT_MSG"
        print_success "Changes committed"
    fi
    echo ""
fi

# Push to GitLab
echo "============================================================================"
echo "Step 2: Push to GitLab"
echo "============================================================================"
echo ""

print_info "Ready to push ${CURRENT_BRANCH} branch to GitLab"
read -p "Push now? [Y/n]: " PUSH_NOW

if [ "$PUSH_NOW" != "n" ] && [ "$PUSH_NOW" != "N" ]; then
    print_info "Pushing to GitLab..."

    if git push gitlab $CURRENT_BRANCH; then
        print_success "Successfully pushed to GitLab!"
    else
        print_error "Push failed. You may need to create the repository first."
        echo ""
        print_info "Create repository at: https://${GITLAB_URL}/projects/new"
        exit 1
    fi
else
    print_warning "Push skipped"
    echo ""
    print_info "To push manually, run:"
    echo "   git push gitlab ${CURRENT_BRANCH}"
fi

echo ""

# Push all branches option
read -p "Push all branches? [y/N]: " PUSH_ALL
if [ "$PUSH_ALL" = "y" ] || [ "$PUSH_ALL" = "Y" ]; then
    git push gitlab --all
    print_success "All branches pushed"
fi

echo ""

# Push tags option
read -p "Push tags? [y/N]: " PUSH_TAGS
if [ "$PUSH_TAGS" = "y" ] || [ "$PUSH_TAGS" = "Y" ]; then
    git push gitlab --tags
    print_success "Tags pushed"
fi

echo ""
echo "============================================================================"
echo "Next Steps"
echo "============================================================================"
echo ""

print_info "1. Create GitLab repository (if not already created):"
echo "   https://${GITLAB_URL}/projects/new"
echo ""

print_info "2. View your repository:"
echo "   https://${GITLAB_URL}/${GITLAB_USERNAME}/angelo-tutoring"
echo ""

print_info "3. Configure CI/CD variables:"
echo "   https://${GITLAB_URL}/${GITLAB_USERNAME}/angelo-tutoring/-/settings/ci_cd"
echo ""

print_info "4. View pipeline:"
echo "   https://${GITLAB_URL}/${GITLAB_USERNAME}/angelo-tutoring/-/pipelines"
echo ""

print_info "5. Read the documentation:"
echo "   - DEPLOYMENT_SUMMARY.md (Quick start)"
echo "   - GITLAB_SETUP.md (Complete setup guide)"
echo "   - CI_CD_QUICK_REFERENCE.md (Daily operations)"
echo "   - INFRASTRUCTURE.md (Infrastructure setup)"
echo ""

print_success "Setup complete! 🚀"
echo ""
echo "============================================================================"
