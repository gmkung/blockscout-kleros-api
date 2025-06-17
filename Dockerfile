# Dockerfile best practices
# https://docs.docker.com/develop/develop-images/dockerfile_best-practices/
# Dockerized NodeJS best practices
# https://github.com/nodejs/docker-node/blob/master/docs/BestPractices.md
# https://www.bretfisher.com/node-docker-good-defaults/
# http://goldbergyoni.com/checklist-best-practice-of-node-js-in-production/

# ---
# Local development
#
FROM node:22.16-alpine AS dev
# Set to production environment to have development parity with the productions stage.
ENV NODE_ENV=production

# Create user folder
WORKDIR /home/node

# Set Docker as a non-root user (need to be performed after yarn policies due to permissions)
USER node

# Copy package.json, yarn.lock and .yarnrc to cache the installation layer
COPY --chown=node:node  package.json yarn.lock .yarnrc.yml ./

# Install all dependencies (dev & production). devDependencies are needed to run
# locally for development and also to build the images in the next stage.
# with yarn4 there is no need to pass the --production=false flag.
RUN yarn set version 4.9.1
RUN yarn install

# Copy source code into app folder
COPY --chown=node:node . .
# Build the code, is needed for the typeorm migrations
RUN yarn build

ENTRYPOINT [ "yarn", "dev" ]

# ---
# Production Server
#
FROM node:22.16-alpine AS production
ENV NODE_ENV=production

WORKDIR /home/node

USER node

# Copy just bin and built code needed to run the application
COPY --from=dev --chown=node:node /home/node/dist/ ./dist

# Copy package json and yarn files needed to install production dependencies and run migrations
COPY --from=dev --chown=node:node  /home/node/package.json /home/node/yarn.lock /home/node/.yarnrc.yml ./

# Install only the production dependencies and clean cache to optimize image size.
# This overrides node_modules folder, reducing image size.
RUN yarn set version 4.9.1
RUN yarn workspaces focus --production && yarn cache clean

CMD ["yarn", "start"]