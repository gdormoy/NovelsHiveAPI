FROM node:8
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
RUN rm -frv /app/server/config.local.sample.js /app/server/datasources.local.sample.js
EXPOSE 3000
CMD npm start
