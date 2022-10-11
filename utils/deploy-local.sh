#!/bin/bash
 
# Docker compose
docker-compose -f ./docker-pompeia/docker-compose-local.yaml --env-file ./.env-local up -d