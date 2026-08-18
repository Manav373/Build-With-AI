# Build the Vite React App
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Serve the static files with NGINX
FROM nginx:alpine
# Place the config in the templates directory. 
# Nginx alpine image will automatically run envsubst and place the result in /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080
