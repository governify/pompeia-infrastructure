#!/bin/bash
 
# Docker compose
docker-compose -f ./docker-bluejay/docker-compose-local.yaml --env-file ./.env-local up -d