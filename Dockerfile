# Stage 1: Build with modern Node
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --production=false
COPY . .
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
RUN echo 'server_tokens off;' > /etc/nginx/conf.d/security.conf
