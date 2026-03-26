# 1. Base image
FROM node:24-alpine

# 2. Set working directory
WORKDIR /app

# 3. Copy package files first (for caching)
COPY package*.json ./

# 4. Install dependencies
RUN npm install 

# 5. Copy rest of the app
COPY . .

# 6. Expose port
EXPOSE 3000

# 7. Start the app
CMD ["npm", "start"]