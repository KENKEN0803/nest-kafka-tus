FROM node:16

COPY . ./app

WORKDIR /app

#RUN npm i @nestjs/cli -g

RUN yarn

#RUN nest build

#HEALTHCHECK --interval=5s --timeout=3s --start-period=30s --retries=3 CMD curl -f http://localhost:80/ || exit 1

#SHELL ["/bin/bash", "-c"]

#ADD ./docker-entrypoint.sh /docker-entrypoint.sh

#RUN chmod +x /docker-entrypoint.sh

#ENTRYPOINT ["/docker-entrypoint.sh"]

ENV NODE_ENV production

EXPOSE 80

CMD ["npm", "run", "start:prod"]
