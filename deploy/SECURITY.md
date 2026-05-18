# Paxnova Trust — security posture

Inventory of every defense applied to the codebase plus a short checklist
of the remaining production hardening you should do on the VPS / DNS /
mailing-domain side.

## Application defenses (already in the codebase)

### Identity & sessions

- **bcrypt(12)** password hashing in `src/lib/password.ts`
- **iron-session** signed, encrypted cookies — httpOnly, secure
  (production), SameSite=Lax (`src/lib/session.ts`)
- **`SESSION_SECRET`** rotated via env (≥32 random bytes; the deploy
  script generates a strong one on first run)
- **Per-IP + per-account rate limiting** on `loginAction` — IP burst of
  15 / 60s, account lockout after 8 failures for 30 minutes
  (`src/app/actions/auth.ts`)
- **`requireAuth()`** on every dashboard route + **`requireAdmin()`** on
  every admin route + admin server action
- USA PATRIOT Act §326 CIP enforcement on signup
- E-SIGN consent timestamped per user
- PII (SSN, ID number) stored hashed; only last-4 retained in clear

### Encryption at rest

- **AES-256-GCM** reversible encryption for card data (PAN / CVV
  plaintext columns), key from `ENCRYPTION_KEY` env (32 bytes /
  64 hex), implemented in `src/lib/crypto.ts`
- KYC documents stored outside the webroot under `UPLOAD_DIR` with
  random storage names; original filenames retained only for display
- Card data revealed via a dedicated admin/owner-only action that
  emits a fresh decrypt; no client-side caching

### Input validation

- **Zod schemas** on every server action — type coercion, length caps,
  email + ZIP + EIN + SSN regex, enum guards
- Server-side file validation: required documents enforced even if the
  client wizard skips the check
- Beneficial-owner FinCEN CDD validation (25%+ ownership, ≥1 owner, max
  4 owners, SSN length, ownership-percentage bounds)

### Browser hardening (middleware-driven, per-request)

- **Content-Security-Policy** with `nonce-<random>` + `strict-dynamic`
  (every navigation gets a fresh nonce; layout passes it to the
  anti-FOUC inline script). No `'unsafe-inline'` for scripts in prod.
- `frame-ancestors 'none'` — primary clickjacking guard
- **HSTS** `max-age=31536000; includeSubDomains; preload` (prod only)
- **X-Content-Type-Options: nosniff**
- **X-Frame-Options: DENY** (legacy backstop)
- **Referrer-Policy: strict-origin-when-cross-origin**
- **Permissions-Policy** disabling 18+ powerful APIs (camera, mic,
  geolocation, payment, USB, etc.)
- **Cross-Origin-Opener-Policy: same-origin**
- **Cross-Origin-Resource-Policy: same-origin**
- **`X-Powered-By` stripped** by middleware before responding
- `connect-src` allow-list (Resend, Google Maps, FX provider) — every
  other outbound fetch from the browser is blocked by CSP

### Cryptographic + audit trail

- Every wire approval / rejection writes an admin audit row with the
  actor's user-id (visible in admin Reviews)
- Transaction edits trigger a full balance-chain rebalance, preserving
  the invariant that the running `balance_after` matches the account's
  current balance
- Reference numbers on transfers, wires, applications, and bill
  payments are unique and non-sequential where it matters

### Banking-specific compliance

- USA PATRIOT Act CIP §326 — collection, verification, retention
- E-SIGN Act consent capture
- W-9 / W-8 certification capture
- USA PATRIOT Act notice + acknowledgement
- BSA Travel Rule originator data on wires ≥$3,000
- OFAC screening hook on wire submissions (placeholder — wire to a real
  list provider in production)
- FDIC notice surfaced in the deposit account flow and on every receipt

## Production network defenses (set up by the provision script)

- **UFW default-deny** inbound; only 22 (SSH), 80 (HTTP for ACME +
  Caddy redirect), 443 (HTTPS) open
- **fail2ban** with the default sshd jail
- **unattended-upgrades** for daily security patches
- **Dedicated unprivileged service user** (`paxnova`); the app never
  runs as root
- **systemd sandbox** on the unit:
  `NoNewPrivileges`, `ProtectSystem=strict`, `ProtectHome=read-only`,
  `PrivateTmp`, `PrivateDevices`, `ProtectKernel*`,
  `ProtectControlGroups`, `RestrictNamespaces`, `RestrictRealtime`,
  `RestrictSUIDSGID`, `LockPersonality`,
  `SystemCallArchitectures=native`, narrow `ReadWritePaths`
- **Caddy** terminates TLS via Let's Encrypt (ECDSA + RSA fallback),
  HTTP/2, HTTP/3; backstop security headers if middleware ever misses
  one; access logs to `/var/log/caddy/paxnovatrust.access.log` with
  rotation

## Things still on you (post-deploy)

- [ ] Configure **SPF + DKIM + DMARC** on `paxnovatrust.com` if you'll
      send mail (Resend gives you the records; add them at your DNS
      registrar)
- [ ] Submit the domain to the **HSTS preload list** once you've been
      TLS-only for >2 weeks: <https://hstspreload.org/>
- [ ] Wire **off-host backups** via rclone to S3 / B2 / Wasabi — daily
      DB + uploads snapshots
- [ ] **Monitor** the `journalctl -u paxnova-trust` error stream — pipe
      to Sentry / BetterStack / a webhook
- [ ] If you'll handle real card numbers, complete a **PCI DSS SAQ A-EP
      attestation** with your card-issuing partner
- [ ] Submit to the **OFAC SDN list** screening provider you settle on
      (the placeholder in the wire flow needs a real check)
- [ ] Get a **third-party pen test** before going live with real money

## Incident response — quick reference

| Event | First action |
|---|---|
| Suspected credential leak | `sudo systemctl restart paxnova-trust` after rotating `SESSION_SECRET`. Force every session to re-authenticate. |
| Unauthorized DB access | Restore from latest backup; rotate `ENCRYPTION_KEY` only after re-encrypting card blobs with both keys present. |
| Brute-force on SSH | `fail2ban-client status sshd` to see banned IPs; consider moving SSH to a non-default port. |
| Caddy / TLS issue | `sudo journalctl -u caddy -n 100`. Most issues are DNS — confirm A record points at the box. |
| App crash loop | `sudo journalctl -u paxnova-trust -n 200`. systemd auto-restarts up to 10× per minute, then backs off. |
