#!/bin/bash 
# Replace scope manager and assets manager key with random keys
RANDOM_KEY1=$(openssl rand -hex 16)
RANDOM_KEY2=$(openssl rand -hex 16)
sed -i "s/{{RANDOM_KEY1}}/$RANDOM_KEY1/g" ./.env-local
sed -i "s/{{RANDOM_KEY2}}/$RANDOM_KEY2/g" ./.env-local

# Export .env variables
export $(grep -v '^#' ./.env-local | xargs)

# Create bouncer network
docker network create governify_network

# Docker compose
docker-compose -f ./docker-compose-local.yaml --env-file ./.env-local up -d