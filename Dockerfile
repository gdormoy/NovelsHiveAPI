FROM node:latest
#ADD ./NovelsHiveAPI /home/NovelsHiveAPI
RUN npm install
RUN npm start
EXPOSE 8080
#CMD ["node", "/opt/src/index.js"]
