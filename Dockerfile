FROM daschswiss/nginx-server:1.1.3-1-g93e1372

LABEL maintainer="support@dasch.swiss"

RUN rm -rf /public/*

COPY apps/dsp-app /public

EXPOSE 4200
