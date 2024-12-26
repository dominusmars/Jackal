FROM node:20

WORKDIR /usr/src/app/server
COPY /server/package*.json .

# Install dependencies
RUN npm install

# Build lib
COPY lib /usr/src/app/server/lib

# Install remaining dependencies
COPY server /usr/src/app/server
RUN npm install
RUN npm install file:./lib

# Build project
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
