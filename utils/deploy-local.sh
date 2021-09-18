#!/bin/bash
 
# Docker compose
docker-compose -f ./docker/docker-compose-local.yaml --env-file ./.env-local up -d