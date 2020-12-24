#!/bin/bash 

# Replace scope manager and assets manager key with random keys
RANDOM_KEY1=$(openssl rand -hex 16)
RANDOM_KEY2=$(openssl rand -hex 16)
sed -i "s/{{RANDOM_KEY1}}/$RANDOM_KEY1/g" ./.env
sed -i "s/{{RANDOM_KEY2}}/$RANDOM_KEY2/g" ./.env

# Export .env variables
export $(grep -v '^#' .env | xargs)

# Create bouncer network
docker network create governify_network

# Docker compose
docker-compose -f docker-compose.yaml --env-file ./.env up -d

# Create dummy certificates
./utils/init-letsencrypt.sh 1 1

echo -e "\033[33m
                 **************************************************************
                 ****              WARNING: CPU LIMITS.                    ****
                 ****        None of the containers have CPU limits.       ****
                 ****        If you need to add those limits, do it        ****
                 ****        in the required compose files.                ****
                 **************************************************************\033[0m\n"



# declare -A SERVICES=([$SERVICES_PREFIX-assetsmanager-container]=assets.$SERVICES_PREFIX:80 [$SERVICES_PREFIX-scopemanager-container]=scopes.$SERVICES_PREFIX:80 [$SERVICES_PREFIX-eventcollector-container]=event.collector.$SERVICES_PREFIX:80 [$SERVICES_PREFIX-ptcollector-container]=pt.collector.$SERVICES_PREFIX:80 [$SERVICES_PREFIX-grafana-container]=dashboard.$SERVICES_PREFIX:3000 [$SERVICES_PREFIX-registry-container]=registry.$SERVICES_PREFIX:80 [$SERVICES_PREFIX-render-container]=ui.$SERVICES_PREFIX:80 [$SERVICES_PREFIX-connector-container]=pt.connector.$SERVICES_PREFIX:80 [$SERVICES_PREFIX-reporter-container]=reporter.$SERVICES_PREFIX:80)

#echo -e "List of services added to bouncer (maybe you want to add them to your hosts file):\n"
#for service in "${!SERVICES[@]}"; do
#  service_url=${SERVICES[$service]}
#  IFS=':' read -r -a splitted <<< "$service_url"
#  SERVICE_URL=${splitted[0]}$DNS_SUFFIX
#  SERVICE_PORT=${splitted[1]}
#
#  echo $SERVER_IP $SERVICE_URL
#done