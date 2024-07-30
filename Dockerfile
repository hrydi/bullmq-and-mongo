FROM node:lts-alpine3.20 AS node-base

# argument
ARG ci_commit_tag='development'
# end argument

# environment
ENV CI_COMMIT_TAG=${ci_commit_tag}
ENV TZ=Asia/Jakarta
# end environment

# update & installing dependencies
RUN apk update
RUN apk upgrade
RUN apk add ca-certificates && update-ca-certificates
RUN apk add --no-cache --update \
    tzdata \
    git \
    curl \
    unzip

RUN npm install -g npm
RUN rm -rf /var/cache/apk/* /tmp/*
# end update & installing dependencies

# create workdir
RUN mkdir -p /home/node/apps \
    && chown -R node:node /home/node

WORKDIR /home/node/apps

FROM node-base AS dev
USER node