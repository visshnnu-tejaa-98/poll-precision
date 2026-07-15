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

# Copy the rest and build (runs `prisma generate && next build`).
COPY . .
RUN npm run build

ENV NODE_ENV=production
# Railway injects PORT at runtime; server.js binds to it (EXPOSE is documentation).
EXPOSE 3000

# Start the custom Next + Socket.IO server. (If you set a custom start command in
# Railway — e.g. `npx prisma migrate deploy && npm start` — that overrides this.)
CMD ["npm", "run", "start"]
