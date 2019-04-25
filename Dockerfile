FROM node:latest
WORKDIR /var/lib/jenkins/workspace/CICD_school_project_master
ADD ./NovelsHiveAPI /home/NovelsHiveAPI
RUN npm install
RUN npm start
EXPOSE 8080
CMD ["node", "/opt/src/index.js"]
