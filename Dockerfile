FROM node:18-alpine AS base

# Install LibreOffice and dependencies
RUN apk add --no-cache libreoffice ttf-dejavu ttf-liberation ttf-freefont fontconfig

# Set up application
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the code
COPY . .

# Build the application
RUN npm run build

# Production image
FROM node:18-alpine AS runner
WORKDIR /app

# Install LibreOffice in the runner image
RUN apk add --no-cache libreoffice ttf-dejavu ttf-liberation ttf-freefont fontconfig

# Copy built files from previous stage
COPY --from=base /app/public ./public
COPY --from=base /app/.next/standalone ./
COPY --from=base /app/.next/static ./.next/static

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Run the server
CMD ["node", "server.js"]
