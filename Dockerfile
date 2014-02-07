FROM ubuntu:12.04

RUN apt-get update
RUN apt-get install -y curl build-essential checkinstall

RUN curl http://nodejs.org/dist/v0.10.25/node-v0.10.25.tar.gz | tar xvz
RUN cd node-v0.10.25 && ./configure && make && sudo make install

ADD . /src
RUN cd /src && npm install

EXPOSE 8080

CMD ["/src/app.js"]
ENTRYPOINT ["node"]
