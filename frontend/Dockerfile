# Stage 1: Build static assets
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built assets to Nginx html directory
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

# Copy custom Nginx configuration if any, else default Nginx is used
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
