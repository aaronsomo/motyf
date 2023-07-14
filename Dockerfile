# build command: docker build --tag motyf .
# run command: docker run -i -t motyf:latest

FROM node:15-alpine AS frontend-builder

# install node-gyp dependencies
RUN apk add --update-cache python build-base git

# install frontend dependencies
COPY ./frontend/package.json /frontend/package.json
COPY ./frontend/yarn.lock /frontend/yarn.lock
RUN cd /frontend && yarnpkg

# build frontend
COPY ./frontend /frontend
RUN cd /frontend && yarnpkg build

FROM --platform=linux/amd64 ubuntu:20.04

# install system dependencies
RUN apt-get -y update && DEBIAN_FRONTEND=noninteractive apt-get -y install python3-pip python3-psycopg2 libpq-dev gunicorn postgresql-client-12 wget npm

RUN npm install @openzeppelin/contracts

RUN wget https://github.com/ethereum/solidity/releases/download/v0.8.16/solc-static-linux && chmod +x ./solc-static-linux && cp solc-static-linux /usr/bin/solc

# install backend dependencies
COPY ./backend/requirements.txt /app/backend/requirements.txt
RUN cd /app/backend && python3 -m pip install -r requirements.txt

RUN pip install 'web3[tester]'
# build frontend
COPY --from=frontend-builder /frontend/build /app/frontend/build

# builds the backend
COPY ./backend /app/backend

# disable stdout buffering to avoid losing log messages
ENV PYTHONUNBUFFERED 1

# service is exposed on port 5000, load balancer will take care of the rest
EXPOSE 5000

# switch to a non-root user and start in the backend directory
RUN useradd -ms /bin/bash motyf
USER motyf
WORKDIR /app/backend

CMD [ "gunicorn", "server:app", "--bind", "0.0.0.0:5000", "--timeout", "1000", "--access-logfile", "-" ]
