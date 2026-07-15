# A Dockerfile takes precedence over Railpack/Nixpacks on Railway, giving full
# control over install → build → start. It always runs on Linux, so the correct
# platform binaries (sharp / @emnapi / @img/sharp-linux-*) resolve at install
# time — no more lockfile-platform mismatch, and no `npm ci` sync errors.
FROM node:22-slim

WORKDIR /app

# Native runtime deps: libatomic1 for some native modules, openssl + ca-certificates
# so Prisma can detect libssl (silences the openssl warning) and TLS works.
RUN apt-get update \
  && apt-get install -y --no-install-recommends libatomic1 openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Install ALL dependencies, including devDependencies — prisma, tailwindcss and
# typescript are needed by `npm run build`. Using `npm install` (not `npm ci`)
# lets npm resolve the correct Linux binaries the macOS lockfile omits.
COPY package.json package-lock.json* ./
RUN npm install --include=dev --no-audit --no-fund

# NEXT_PUBLIC_* vars are inlined into the client bundle by `next build`, so they
# MUST be present at BUILD time — not just runtime. Railway passes service
# variables as Docker build args, so declaring this ARG pulls it in; ENV then
# exposes it to `next build`. Without it, Clerk's client components (the sign-in
# button) render with an undefined key and don't show.
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

# Copy the rest and build (runs `prisma generate && next build`).
COPY . .
RUN npm run build

ENV NODE_ENV=production
# Railway injects PORT at runtime; server.js binds to it (EXPOSE is documentation).
EXPOSE 3000

# Apply DB migrations, then start the custom Next + Socket.IO server. Baking this
# into the image makes startup deterministic — do NOT set a Custom Start Command
# in Railway, or it overrides this CMD.
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
