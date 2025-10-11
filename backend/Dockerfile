FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build # This will transpile TypeScript to JavaScript in a 'dist' folder
EXPOSE 5000
CMD ["node", "dist/index.js"]