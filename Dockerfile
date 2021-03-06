FROM node:8
WORKDIR /app
COPY package.json /app
RUN npm install
RUN npm install html-pdf
RUN npm install loopback-connector-mysql
COPY . /app
RUN rm -frv /app/server/config.local.sample.js /app/server/datasources.local.sample.js
EXPOSE 3000
CMD npm start
