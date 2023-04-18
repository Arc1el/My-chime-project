FROM node:18-alpine

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Copy the rest of the application files
COPY . .

# Expose port 3000 for the application
EXPOSE 3000

# Start the application
CMD [ "npm", "start" ]