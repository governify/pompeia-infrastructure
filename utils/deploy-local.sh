#!/bin/bash 
# Replace scope manager and assets manager key with random keys
RANDOM_KEY1=$(openssl rand -hex 16)
RANDOM_KEY2=$(openssl rand -hex 16)
sed -i "s/{{RANDOM_KEY1}}/$RANDOM_KEY1/g" ./.envlocal
sed -i "s/{{RANDOM_KEY2}}/$RANDOM_KEY2/g" ./.envlocal

# Export .env variables
export $(grep -v '^#' .env | xargs)

# Create bouncer network
docker network create governify_network

# Docker compose
docker-compose -f ./local-deploy/docker-compose-local.yaml --env-file ./local-deploy/envlocal up -d