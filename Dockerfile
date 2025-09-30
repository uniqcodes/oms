e Node.js 18 LTS as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies)
RUN npm install

# Install nodemon globally for auto-reload
RUN npm install -g nodemon

# Copy application source code
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Set environment to development
ENV NODE_ENV=development

# Run the application with nodemon
CMD ["nodemon", "server.js"]
