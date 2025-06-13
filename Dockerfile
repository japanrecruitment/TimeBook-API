#dockerfile

#base image
FROM node:20.19-alpine3.21


# create & set working directory
RUN mkdir -p /usr/src
WORKDIR /usr/src

# copy source files
COPY . /usr/src
# Not sure if you will need this
RUN apk add --update openssl

# install deps and run postinstall in one step
RUN yarn install && yarn postinstall

#expose port
EXPOSE 3001

#run the application
CMD ["yarn", "local"]
