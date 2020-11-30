#!/bin/bash

if [ -z $1 ]
  then 
  echo -e "Usage: governify-project-bluejay-infrastructure/setup.up DNS_SUFFIX [SERVER_IP] [SERVICES_PREFIX]

DNS_SUFFIX: Your domain suffix (if any). If you don't have a domain suffix, just provide .com, .es, or your domain type. Example: .suffix.com for having dashboard.suffix.com

SERVER_IP (optional): The server IP in which you will deploy the system. This is just for generating a domain list in hosts file format, pointing to that IP, so you don't need to have the domain names registered. If this is not provided, just a list with the services added will be prompted.

SERVICES_PREFIX (optional): The prefix that will be used for every service name (default: ceap).
"
  exit 0
fi

SERVER_IP=""
RANDOM_KEY1=$(openssl rand -hex 16)
RANDOM_KEY2=$(openssl rand -hex 16)

if [ -z $2 ]
then
  echo -e "\033[33mWARNING: No SERVER_IP provided. No hosts file list will be promted\033[0m\n"
else
  SERVER_IP=$2
fi

SERVICES_PREFIX="ceap"
if [ -z $3 ]
then
  echo -e "\033[33mWARNING: No SERVICES_PREFIX provided, ceap will be used\033[0m\n"
else
  SERVICES_PREFIX=$3
fi

DNS_SUFFIX=$1

declare -A SERVICES=([$SERVICES_PREFIX-assetsmanager-container]=assets.$SERVICES_PREFIX:80 [$SERVICES_PREFIX-scopemanager-container]=scopes.$SERVICES_PREFIX:80 [$SERVICES_PREFIX-eventcollector-container]=event.collector.$SERVICES_PREFIX:80 [$SERVICES_PREFIX-ptcollector-container]=pt.collector.$SERVICES_PREFIX:80 [$SERVICES_PREFIX-grafana-container]=dashboard.$SERVICES_PREFIX:3000 [$SERVICES_PREFIX-registry-container]=registry.$SERVICES_PREFIX:80 [$SERVICES_PREFIX-render-container]=ui.$SERVICES_PREFIX:80 [$SERVICES_PREFIX-connector-container]=pt.connector.$SERVICES_PREFIX:80 [$SERVICES_PREFIX-reporter-container]=reporter.$SERVICES_PREFIX:80)

docker network create bouncer_bouncer_network

#sed -i "s/{{DNS_SUFFIX}}/$DNS_SUFFIX/g" docker-compose.yaml
#sed -i "s/{{SERVICES_PREFIX}}/$SERVICES_PREFIX/g" docker-compose.yaml

#find 'configurations/' -type f -name '*.yaml' -exec sed -i "s/{{DNS_SUFFIX}}/$DNS_SUFFIX/g" {} \;
#find 'configurations/' -type f -name '*.yaml' -exec sed -i "s/{{SERVICES_PREFIX}}/$SERVICES_PREFIX/g" {} \;

# Replace scope manager and assets manager key with random keys
sed -i "s/{{RANDOM_KEY1}}/$RANDOM_KEY1/g" ./.env
sed -i "s/{{RANDOM_KEY2}}/$RANDOM_KEY2/g" ./.env

docker-compose -f docker-compose.yaml --env-file ./.env up -d

# TESTS
#sed -i "s/{{DNS_SUFFIX}}/$DNS_SUFFIX/g" docker-compose-testing.yaml
#sed -i "s/{{SERVICES_PREFIX}}/$SERVICES_PREFIX/g" docker-compose-testing.yaml

#find 'tests/' -type f -name '*.json' -exec sed -i "s/{{DNS_SUFFIX}}/$DNS_SUFFIX/g" {} \;
#find 'tests/' -type f -name '*.json' -exec sed -i "s/{{SERVICES_PREFIX}}/$SERVICES_PREFIX/g" {} \;

#find 'tests/eventCollectorMockups/' -type f -name '*.json' -exec sed -i "s/{{DNS_SUFFIX}}/$DNS_SUFFIX/g" {} \;
#find 'tests/eventCollectorMockups/' -type f -name '*.json' -exec sed -i "s/{{SERVICES_PREFIX}}/$SERVICES_PREFIX/g" {} \;

#Nginx Services configuration replacement prefixes
#sed -i "s/{{DNS_SUFFIX}}/$DNS_SUFFIX/g" config/services-nginx-config/dashboard.conf
#sed -i "s/{{SERVICES_PREFIX}}/$SERVICES_PREFIX/g" config/services-nginx-config/dashboard.conf
#sed -i "s/{{DNS_SUFFIX}}/$DNS_SUFFIX/g" config/services-nginx-config/registry.conf
#sed -i "s/{{SERVICES_PREFIX}}/$SERVICES_PREFIX/g" config/services-nginx-config/registry.conf
#sed -i "s/{{DNS_SUFFIX}}/$DNS_SUFFIX/g" config/services-nginx-config/reporter.conf
#sed -i "s/{{SERVICES_PREFIX}}/$SERVICES_PREFIX/g" config/services-nginx-config/reporter.conf
#sed -i "s/{{DNS_SUFFIX}}/$DNS_SUFFIX/g" config/services-nginx-config/ui.conf
#sed -i "s/{{SERVICES_PREFIX}}/$SERVICES_PREFIX/g" config/services-nginx-config/ui.conf
#sed -i "s/{{DNS_SUFFIX}}/$DNS_SUFFIX/g" config/services-nginx-config/scopes.conf
#sed -i "s/{{SERVICES_PREFIX}}/$SERVICES_PREFIX/g" config/services-nginx-config/scopes.conf
#sed -i "s/{{DNS_SUFFIX}}/$DNS_SUFFIX/g" config/services-nginx-config/assets.conf
#sed -i "s/{{SERVICES_PREFIX}}/$SERVICES_PREFIX/g" config/services-nginx-config/assets.conf


#Replacement for letsencrypt file for certificate request
sed -i "s/{{DNS_SUFFIX}}/$DNS_SUFFIX/g" init-letsencrypt.sh
sed -i "s/{{SERVICES_PREFIX}}/$SERVICES_PREFIX/g" init-letsencrypt.sh


echo -e "\033[33m
                 **************************************************************
                 ****              WARNING: CPU LIMITS.                    ****
                 ****        None of the containers have CPU limits.       ****
                 ****        If you need to add those limits, do it        ****
                 ****        in the required compose files.                ****
                 **************************************************************\033[0m\n"

echo -e "List of services added to bouncer (maybe you want to add them to your hosts file):\n"
for service in "${!SERVICES[@]}"; do
  service_url=${SERVICES[$service]}
  IFS=':' read -r -a splitted <<< "$service_url"
  SERVICE_URL=${splitted[0]}$DNS_SUFFIX
  SERVICE_PORT=${splitted[1]}

  echo $SERVER_IP $SERVICE_URL
done

