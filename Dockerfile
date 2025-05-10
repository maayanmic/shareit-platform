# Use Node.js to build the app
FROM node:18 as builder

WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Serve the build with a lightweight web server
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
