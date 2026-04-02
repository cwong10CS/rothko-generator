#!/usr/bin/env bash
set -euo pipefail

# Optionally load deployment settings from a server-local file.
DEPLOY_CONFIG_FILE="${DEPLOY_CONFIG_FILE:-/etc/rothko-generator/deploy.env}"
if [[ -f "$DEPLOY_CONFIG_FILE" ]]; then
  # shellcheck disable=SC1090
  source "$DEPLOY_CONFIG_FILE"
fi

if [[ -z "${DEPLOY_PATH:-}" ]]; then
  echo "DEPLOY_PATH is required (set it in deploy env file or as env var)."
  exit 1
fi

if [[ -z "${RESTART_COMMAND:-}" ]]; then
  echo "RESTART_COMMAND is required (set it in deploy env file or as env var)."
  exit 1
fi

mkdir -p "$DEPLOY_PATH"

# Keep deployment content deterministic and exclude build/cache metadata.
rsync -az --delete \
  --exclude ".git" \
  --exclude ".github" \
  --exclude "node_modules" \
  --exclude ".next" \
  --exclude ".env*" \
  ./ "$DEPLOY_PATH/"

pushd "$DEPLOY_PATH" > /dev/null
npm ci --omit=dev
npm run build

if [[ -n "${APP_USER:-}" && -n "${APP_GROUP:-}" ]]; then
  chown -R "$APP_USER:$APP_GROUP" "$DEPLOY_PATH"
fi

# Example values:
# RESTART_COMMAND="pm2 restart rothko-art-generator"
# RESTART_COMMAND="sudo systemctl restart rothko-art-generator.service"
eval "$RESTART_COMMAND"
popd > /dev/null

echo "Deployment complete: $DEPLOY_PATH"
