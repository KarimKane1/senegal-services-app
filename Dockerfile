# Dev-oriented Dockerfile for Next.js (JS only)
FROM node:20-alpine

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

EXPOSE 3000

# Default command: dev server
CMD ["npm", "run", "dev"]


