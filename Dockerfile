FROM node:lts-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
RUN printf 'server{\nlisten 80;\nroot /usr/share/nginx/html;\nindex index.html;\nlocation / { try_files $uri $uri/ /index.html; }\n}' \
    > /etc/nginx/conf.d/default.conf
EXPOSE 80
