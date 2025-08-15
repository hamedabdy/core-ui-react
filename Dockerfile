FROM node:22-alpine

WORKDIR /app

COPY ./package*.json ./
RUN npm install

COPY . ./

EXPOSE 3001

# Start dev server, allow host 0.0.0.0
CMD ["npm", "start"]