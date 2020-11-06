# Pulls latest docker image within the docker hub
FROM node:latest


# Create working directory. If the dir dne, it will create it
WORKDIR /usr/src/app

COPY  . .

# Expose port 80
EXPOSE 8080

# Create bash
CMD ["node","main.js"]