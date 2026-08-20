# ─── Stage 1: Build Angular Application ─────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files for dependency caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy full application code
COPY . .

# Build production Angular bundle
RUN npm run build -- --configuration=production

# ─── Stage 2: Runtime with Nginx ────────────────────────────────────────────────
FROM nginx:alpine AS runtime

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from build stage
COPY --from=build /app/dist/the_bridge_frontend/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
