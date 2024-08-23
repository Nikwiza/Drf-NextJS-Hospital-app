FROM node:18-alpine

WORKDIR /app/frontend/

COPY package*.json .

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

# Develop mode
CMD ["npm", "run", "dev"]

# Production mode
# CMD ["npm", "start"]