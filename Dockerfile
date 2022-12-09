FROM node:16.15.0-alpine as dev
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --only=development
COPY . .
RUN npm run build

FROM node:16.15.0-alpine as prod
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --only=production
COPY . .
COPY --from=dev /usr/src/app/dist ./dist
EXPOSE 3000

CMD ["node", "dist/main"]