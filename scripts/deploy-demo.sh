#!/usr/bin/env bash
#
# Redeploys the demo to server1.
#
#   ./scripts/deploy-demo.sh
#
# Ships the COMMITTED tree (git archive HEAD), installs, rebuilds and
# restarts. Takes about two minutes, most of it the build.
#
# The one thing that must not be forgotten is NEXT_PUBLIC_DEMO_DEPLOYMENT
# at BUILD time. Next inlines NEXT_PUBLIC_* into the bundle, so a build
# without it produces an app that refuses to boot (assertProductionEnv) -
# and setting it only in the systemd unit does not help, because by then
# the value is already baked in. That is why it lives here and not in a
# shell profile on the server.
set -euo pipefail

HOST=${DEPLOY_HOST:-server1}
DIR=${DEPLOY_DIR:-apps/angelo-tutoring}

cd "$(dirname "$0")/.."

say() { printf "\n\033[1m==> %s\033[0m\n" "$1"; }

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Working tree is dirty. This ships HEAD, so uncommitted work would be"
  echo "silently left behind. Commit or stash first."
  exit 1
fi

say "shipping $(git rev-parse --short HEAD) to $HOST:~/$DIR"
ssh "$HOST" "mkdir -p ~/$DIR"
git archive --format=tar HEAD | ssh "$HOST" "tar x -C ~/$DIR"

say "installing dependencies"
ssh "$HOST" "cd ~/$DIR && npm ci --no-audit --no-fund >/dev/null" 

say "building (demo flag set at build time)"
ssh "$HOST" "cd ~/$DIR && NEXT_PUBLIC_DEMO_DEPLOYMENT=true npm run build >/dev/null"

say "restarting"
# The unit is root-owned, so this is the one step that needs a password.
ssh -t "$HOST" "sudo systemctl restart angelo-tutoring.service"

say "verifying"
ssh "$HOST" '
  sleep 4
  fail=0
  check() {
    got=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "http://127.0.0.1:3000$1")
    [ "$got" = "$2" ] && printf "    ok   %-32s %s\n" "$1" "$got" \
                      || { printf "    FAIL %-32s got %s want %s\n" "$1" "$got" "$2"; fail=1; }
  }
  check /dashboard 200
  check /papers 200
  check /exam 200
  # Demo mode must NOT mean an open admin panel: isDemoAuth() is false in a
  # production build, so this falls through to requireAdmin() and redirects.
  check /admin 307
  check /topics/bogus 404
  curl -s --max-time 10 http://127.0.0.1:3000/dashboard | grep -q "are not saved" \
    && echo "    ok   demo banner present" \
    || { echo "    FAIL demo banner missing - was it built without the flag?"; fail=1; }
  exit $fail
'

say "done"
echo "    https://tutorial.lucidbuilds.co.za"
