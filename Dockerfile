FROM node:8

LABEL maintainer 'Wolfbot <wolfbotbr@gmail.com>'

ENV HOME=/home/app

COPY package.json package-lock.json $HOME/api/

WORKDIR $HOME/api

RUN npm install

COPY . $HOME/api

CMD [ "npm", "start" ]
