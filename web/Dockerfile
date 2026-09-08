# Stage 1: Build the React web application
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build argument for API URL during build time
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# Stage 2: Serve using high-performance Nginx Alpine
FROM nginx:alpine

ENV PORT=80

# Copy nginx template with dynamic $PORT support
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Copy compiled static assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
