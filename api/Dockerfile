# Create image from base nodejs v18
FROM node:18

# create "/api" directory and "cd" into it.
WORKDIR /api

# copy the package.json and package-lock.json files into "WORKDIR"
COPY package.json ./

# install all dependencies
RUN npm install

# copy typescript configuration file into container image
COPY tsconfig.json ./

# copy sources from "src" folder into WORKDIR
COPY ./src /api/

# execute "build" script from "package.json", it will build typescript into javacript
RUN npm run build

# expose port 3000 so that it's accessible
EXPOSE 3000

# start the api server
CMD ["node", "./build/"]