FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm config set engine-strict true
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build --layers || true
EXPOSE 3000
CMD ["npm", "run", "start"]
