FROM nginx:1-alpine-slim

LABEL maintainer="support@dasch.swiss"

ENV NGINX_PORT 4200

## Add bash
RUN apk add bash

## Copy nginx config template
COPY nginx-config-template.conf /etc/nginx/config.template
COPY nginx-security-headers.conf /etc/nginx/security-headers.conf

## Move default nginx website
RUN mv /usr/share/nginx/html /public

## Copy DSP-APP distribution to the public folder for serving
COPY ./dist/apps/dsp-app /public

CMD /bin/bash -c "envsubst '\$NGINX_PORT' < /etc/nginx/config.template > /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"
