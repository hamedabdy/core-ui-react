FROM node:22-alpine AS base

ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

# Set the ESLINT_CACHE_DIR environment variable
ENV ESLINT_CACHE_DIR=/tmp/.eslintcache

# Install dependencies needed for the build (bash, git, etc.)
RUN apk add --no-cache bash git

# Create non-root user 'app'
# RUN addgroup app && adduser -S -G app app

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json first
COPY --chown=node:node ./package*.json ./

# Ensure app directory is owned by the non-root user
RUN chown -R node:node /app

# Switch to non-root user to install dependencies
USER node

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY --chown=node:node . ./

# Expose the application port (for documentation purposes)
EXPOSE 3001

FROM base AS development
# Run in dev mode with nodemon
CMD ["npm", "start"]

FROM base AS production
CMD ["sh", "-c", "start:prod"]