FROM node:latest
#ADD ./NovelsHiveAPI /home/NovelsHiveAPI
EXPOSE 3000
RUN npm install
RUN npm start
#CMD ["node", "/opt/src/index.js"]
