# Create image from base nodejs v18
FROM node:18

# create "/web" directory and "cd" into it.
WORKDIR /web

# copy the package.json and package-lock.json files into "WORKDIR"
COPY package.json ./

# install all dependencies
RUN npm install


# copy sources from "src" folder into WORKDIR
COPY ./src /web/

# expose port 3001 so that it's accessible
EXPOSE 3001

# start the api server
CMD ["node", "."]