# Paxnova Trust — VPS deployment

Production deployment to a fresh Ubuntu 22.04 / 24.04 VPS, fronted by
Caddy with Let's Encrypt TLS, running as a hardened systemd service.

## What you need before you start

1. SSH access to the VPS (root or a sudoer)
2. A domain pointed at the VPS public IP (A record for the apex, optional
   AAAA for IPv6, and a CNAME for `www`)
3. A **private** GitHub repo where this code lives
4. (Optional) Resend API key for outbound email and a Google Maps key for
   address autocomplete — both can be added later without rebuilding

## File map

```
deploy/
├── 01-provision.sh        # run once on a fresh box (root) — installs Node 22, Caddy, ufw, fail2ban
├── 02-deploy.sh           # run on every release (paxnova user) — npm ci, build, restart
├── paxnova-trust.service  # systemd unit — drop at /etc/systemd/system/
└── Caddyfile              # reverse-proxy + auto-TLS — drop at /etc/caddy/Caddyfile
```

The repo's `.env.production.example` is the template for environment
secrets; `02-deploy.sh` copies it to `.env.production` on first run and
auto-generates `SESSION_SECRET` + `ENCRYPTION_KEY`.

## End-to-end first-time deployment

### 1. Push your code to a private GitHub repo

Locally:

```bash
git remote add origin git@github.com:YOUR-USER/PaxnovaTrust.git
git push -u origin main
```

### 2. SSH into the VPS as root and provision

```bash
ssh root@YOUR-VPS-IP
curl -sSL https://raw.githubusercontent.com/YOUR-USER/PaxnovaTrust/main/deploy/01-provision.sh \
  | sudo bash
```

> If your repo is private, use a one-time read-only token in the URL or
> just `scp deploy/01-provision.sh root@VPS:/root/` and run it there.

This installs Node 22, Caddy, ufw, fail2ban, creates the `paxnova`
service user, prepares the persistent data volume at
`/var/lib/paxnovatrust/`, and opens ports 22 / 80 / 443.

### 3. Clone the repo as the paxnova user

```bash
sudo -iu paxnova
cd ~
# Personal access token URL or SSH key — pick one
git clone https://YOUR-PAT@github.com/YOUR-USER/PaxnovaTrust.git
cd PaxnovaTrust
```

### 4. Run the deploy script

```bash
bash deploy/02-deploy.sh
```

First run will:
- Bootstrap `.env.production` from the template
- Generate fresh `SESSION_SECRET` + `ENCRYPTION_KEY`
- `npm ci`, apply migrations, `next build`

Open `.env.production` and fill in the optional fields if you have them
(Resend, Google Maps).

### 5. Install the systemd unit

Still as `paxnova`:

```bash
sudo cp deploy/paxnova-trust.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now paxnova-trust
sudo systemctl --no-pager status paxnova-trust
```

Tail logs to confirm:

```bash
sudo journalctl -u paxnova-trust -f
```

### 6. Drop the Caddyfile + edit the domain

```bash
sudo cp deploy/Caddyfile /etc/caddy/Caddyfile
sudo systemctl reload caddy
sudo journalctl -u caddy -n 50 --no-pager
```

(The Caddyfile is pre-filled for `paxnovatrust.com` + `www.paxnovatrust.com`.)

Caddy will run the ACME HTTP-01 challenge on port 80 and pull two Let's
Encrypt certs — one for the apex, one for the www subdomain. First
request to `https://paxnovatrust.com` returns the Next.js home page.

### 7. Verify

```bash
curl -I https://paxnovatrust.com
```

You should see:
- `HTTP/2 200`
- `strict-transport-security: max-age=31536000; ...`
- `content-security-policy: default-src 'self'; ...`
- `x-content-type-options: nosniff`
- `x-frame-options: DENY`
- `referrer-policy: strict-origin-when-cross-origin`
- `permissions-policy: ...`

## Subsequent releases

```bash
ssh root@VPS
sudo -iu paxnova
cd ~/PaxnovaTrust
git pull
bash deploy/02-deploy.sh    # restarts the service automatically
```

## Backups (do this from day one)

The two pieces of state that matter:

1. `/var/lib/paxnovatrust/paxnovatrust.db` — the SQLite database
2. `/var/lib/paxnovatrust/uploads/` — KYC documents + business formation
   docs

A simple cron-driven backup snapshot to a remote bucket:

```bash
# As root, edit:
sudo crontab -e

# Add — runs daily at 02:30, keeps a week of nightly snapshots locally,
# plus an offsite copy on whatever you point rclone at.
30 2 * * * /usr/bin/sqlite3 /var/lib/paxnovatrust/paxnovatrust.db \
  ".backup '/var/backups/paxnovatrust-$(date +\%F).db'" && \
  find /var/backups -name 'paxnovatrust-*.db' -mtime +7 -delete
```

For uploads, `rclone sync /var/lib/paxnovatrust/uploads/ remote:bucket/`
once a day is the minimum bar.

## Rotating secrets

Both secrets live in `.env.production`. To rotate:

```bash
# Generate new values
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Edit /home/paxnova/PaxnovaTrust/.env.production
# Then:
sudo systemctl restart paxnova-trust
```

⚠ Rotating `ENCRYPTION_KEY` **invalidates every encrypted card blob in
the database** (PAN / CVV plaintext columns). If real card data has been
issued, decrypt-and-re-encrypt with both keys present before rotating.

## Hardening checklist

The following are already enforced by the codebase + this deploy
configuration:

- ✅ HSTS (1 year, includeSubDomains, preload-eligible)
- ✅ CSP with strict-dynamic nonce on every navigation
- ✅ frame-ancestors 'none' + X-Frame-Options DENY
- ✅ X-Content-Type-Options: nosniff
- ✅ Referrer-Policy: strict-origin-when-cross-origin
- ✅ Permissions-Policy locking every powerful API
- ✅ Cross-Origin-Opener-Policy + Cross-Origin-Resource-Policy
- ✅ X-Powered-By removed
- ✅ ufw default-deny inbound; only 22/80/443 open
- ✅ fail2ban guarding sshd
- ✅ unattended-upgrades for security patches
- ✅ Service runs as unprivileged `paxnova` user
- ✅ systemd sandbox: NoNewPrivileges, ProtectSystem=strict, ProtectHome,
     PrivateTmp, restricted namespaces + syscalls
- ✅ bcrypt(12) password hashing
- ✅ AES-256-GCM for reversible card data
- ✅ Iron-session signed cookies (httpOnly, secure, SameSite=Lax)
- ✅ Zod validation on every server action
- ✅ requireAdmin() on every admin action
- ✅ Per-IP + per-account rate limiting on login
- ✅ Persistent file storage outside the deploy tree

Things you should layer on top:

- 🔲 Configure DKIM / SPF on your mailing domain
- 🔲 Add a CDN (Cloudflare or BunnyCDN) for static asset offload
- 🔲 Wire `audit_log` SAR/CTR rows to off-host storage (S3 + KMS)
- 🔲 Move to managed Postgres once you have >100 active users
- 🔲 Wire alerting on the journalctl error stream
