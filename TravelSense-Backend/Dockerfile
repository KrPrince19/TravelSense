FROM node:20-alpine

WORKDIR /app

# Copy package files first (better layer caching)
COPY package*.json ./

RUN npm install --omit=dev

# Copy the rest of the source
COPY . .

EXPOSE 5000

CMD ["node", "server.js"]