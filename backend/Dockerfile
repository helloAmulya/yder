# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json before running npm install
COPY package*.json ./

# Install dependencies
RUN npm install

# Install Python and yt-dlp
RUN apt-get update && apt-get install -y python3 python3-pip && pip3 install yt-dlp

# Copy the rest of the application files
COPY . .

# Expose the port the app runs on
EXPOSE 8080

# Start the server
CMD ["node", "server.js"]
