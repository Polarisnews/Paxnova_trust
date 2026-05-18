#!/usr/bin/env bash
# ────────────────────────────────────────────────────────────────────────
# Paxnova Trust — one-time VPS provisioning
#
# Run on a FRESH Ubuntu 22.04 / 24.04 box as root (or via `sudo bash`).
# Installs Node 22 LTS, Caddy, creates the `paxnova` service user, opens
# the firewall, and prepares the data + uploads volumes.
#
# Re-running is safe — every step is idempotent (apt installs, useradd
# with --comment, mkdir -p, ufw rules are append-only).
# ────────────────────────────────────────────────────────────────────────

set -euo pipefail

if [[ $EUID -ne 0 ]]; then
	echo "This script must run as root. Re-run with: sudo bash $0"
	exit 1
fi

echo "▶ Updating package index + base utilities…"
apt-get update -y
apt-get install -y curl ca-certificates gnupg lsb-release ufw fail2ban unattended-upgrades sqlite3

echo "▶ Installing Node.js 22 LTS via NodeSource…"
if ! command -v node >/dev/null 2>&1 || ! node -v | grep -qE '^v(2[2-9]|[3-9][0-9])\.'; then
	curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
	apt-get install -y nodejs
fi
echo "  node $(node -v) / npm $(npm -v)"

echo "▶ Installing Caddy…"
if ! command -v caddy >/dev/null 2>&1; then
	apt-get install -y debian-keyring debian-archive-keyring apt-transport-https
	curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
		| gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
	curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
		| tee /etc/apt/sources.list.d/caddy-stable.list >/dev/null
	apt-get update -y
	apt-get install -y caddy
fi
echo "  caddy $(caddy version | head -1)"

echo "▶ Creating dedicated service user 'paxnova'…"
if ! id -u paxnova >/dev/null 2>&1; then
	useradd -r -m -d /home/paxnova -s /bin/bash --comment "Paxnova Trust app" paxnova
fi

echo "▶ Creating persistent data volumes (DB + uploads)…"
install -d -m 0750 -o paxnova -g paxnova /var/lib/paxnovatrust
install -d -m 0750 -o paxnova -g paxnova /var/lib/paxnovatrust/uploads

echo "▶ Configuring firewall (UFW)…"
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 80/tcp comment 'HTTP (Caddy ACME challenge + redirect)'
ufw allow 443/tcp comment 'HTTPS (Caddy)'
ufw --force enable
ufw status verbose

echo "▶ Enabling unattended security upgrades…"
dpkg-reconfigure --priority=low unattended-upgrades || true

echo "▶ Tightening fail2ban (default SSH jail)…"
systemctl enable --now fail2ban
fail2ban-client status sshd || true

echo
echo "✅ Provisioning complete."
echo
echo "Next steps (run as the paxnova user):"
echo "  1. sudo -iu paxnova"
echo "  2. cd /home/paxnova"
echo "  3. git clone <your-private-repo-url> PaxnovaTrust"
echo "  4. cd PaxnovaTrust && bash deploy/02-deploy.sh"
echo "  5. Edit .env.production with the generated secrets"
echo "  6. sudo cp deploy/paxnova-trust.service /etc/systemd/system/"
echo "  7. sudo cp deploy/Caddyfile /etc/caddy/Caddyfile  # edit domain first"
echo "  8. sudo systemctl daemon-reload"
echo "  9. sudo systemctl enable --now paxnova-trust"
echo " 10. sudo systemctl reload caddy"
