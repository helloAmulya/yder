# Use an official Node.js image
FROM node:18

# Install Python and yt-dlp
RUN apt-get update && apt-get install -y python3 python3-pip && ln -s /usr/bin/python3 /usr/bin/python

# Install yt-dlp
RUN pip3 install yt-dlp

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app files
COPY . .

# Expose port
EXPOSE 8080

# Start the server
CMD ["node", "server.js"]
