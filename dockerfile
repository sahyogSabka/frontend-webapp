# Use an official Node.js runtime as a base image
FROM node:18 AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first (improves caching)
COPY package.json package-lock.json  ./
RUN npm install 

# Copy the entire project after dependencies are installed
COPY . .

# Ensure the .env file is included in the container
COPY .env ./

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
