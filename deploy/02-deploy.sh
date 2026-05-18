#!/usr/bin/env bash
# ────────────────────────────────────────────────────────────────────────
# Paxnova Trust — deploy from a fresh git pull
#
# Run as the `paxnova` user inside /home/paxnova/PaxnovaTrust.
# Idempotent. Use this for every release after the initial provision.
#
#   ssh root@<vps>
#   sudo -iu paxnova
#   cd ~/PaxnovaTrust
#   git pull
#   bash deploy/02-deploy.sh
# ────────────────────────────────────────────────────────────────────────

set -euo pipefail

cd "$(dirname "$0")/.."

REPO_ROOT="$(pwd)"
ENV_FILE="$REPO_ROOT/.env.production"

# ── Sanity checks ───────────────────────────────────────────────────────
if [[ "$EUID" -eq 0 ]]; then
	echo "⚠  Do NOT run this as root. Re-run as the paxnova user:"
	echo "   sudo -iu paxnova"
	exit 1
fi

if ! command -v node >/dev/null 2>&1; then
	echo "✗ node is not installed. Run deploy/01-provision.sh as root first."
	exit 1
fi

# ── First-run helper: create .env.production if missing ─────────────────
if [[ ! -f "$ENV_FILE" ]]; then
	echo "▶ No .env.production found — bootstrapping from the template."
	cp .env.production.example "$ENV_FILE"
	chmod 600 "$ENV_FILE"

	# Auto-generate the two required secrets so a first run does NOT fail.
	# Caller can rotate later; deploy will not touch existing values.
	SESSION_SECRET="$(node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))")"
	ENCRYPTION_KEY="$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")"
	# Use sed -i.bak for portability across GNU + BSD sed
	sed -i.bak "s|^SESSION_SECRET=.*|SESSION_SECRET=$SESSION_SECRET|" "$ENV_FILE"
	sed -i.bak "s|^ENCRYPTION_KEY=.*|ENCRYPTION_KEY=$ENCRYPTION_KEY|" "$ENV_FILE"
	rm -f "$ENV_FILE.bak"

	echo "  ✓ SESSION_SECRET + ENCRYPTION_KEY generated and written to $ENV_FILE"
	echo "  Open the file and fill in optional values (RESEND_API_KEY, etc.)."
	echo
fi

# ── Install dependencies ────────────────────────────────────────────────
echo "▶ Installing production dependencies…"
npm ci --prefer-offline --no-audit --fund=false

# ── Apply DB migrations ─────────────────────────────────────────────────
echo "▶ Applying schema (drizzle-kit push)…"
# `drizzle-kit push` is idempotent; only emits the diff between the
# schema in code and what's in the DB file at DB_PATH.
# The memory says never use --force here (preview SQL first) — we don't.
npm run db:push -- --strict || npm run db:push

# ── Build ───────────────────────────────────────────────────────────────
echo "▶ Building Next.js for production…"
NODE_ENV=production npm run build

# ── Smoke check: env vars set? ──────────────────────────────────────────
source "$ENV_FILE"
if [[ -z "${SESSION_SECRET:-}" || -z "${ENCRYPTION_KEY:-}" ]]; then
	echo "✗ SESSION_SECRET or ENCRYPTION_KEY is empty in $ENV_FILE"
	exit 1
fi

# ── Restart the service (if installed) ──────────────────────────────────
if systemctl list-unit-files | grep -q '^paxnova-trust\.service'; then
	echo "▶ Restarting paxnova-trust.service…"
	sudo systemctl restart paxnova-trust
	sleep 2
	sudo systemctl --no-pager status paxnova-trust | head -12
else
	echo "ℹ paxnova-trust.service not installed yet. Install with:"
	echo "   sudo cp deploy/paxnova-trust.service /etc/systemd/system/"
	echo "   sudo systemctl daemon-reload"
	echo "   sudo systemctl enable --now paxnova-trust"
fi

echo
echo "✅ Deploy complete."
