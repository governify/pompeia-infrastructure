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

declare -A SERVICES=([$SERVICES_PREFIX-scopemanager-container]=sm.$SERVICES_PREFIX:80 [$SERVICES_PREFIX-eventcollector-container]=event.collector.$SERVICES_PREFIX:80 [$SERVICES_PREFIX-ptcollector-container]=pt.collector.$SERVICES_PREFIX:80 [$SERVICES_PREFIX-grafana-container]=dashboard.$SERVICES_PREFIX:3000 [$SERVICES_PREFIX-registry-container]=registry.$SERVICES_PREFIX:80 [$SERVICES_PREFIX-render-container]=ui.$SERVICES_PREFIX:80 [$SERVICES_PREFIX-connector-container]=pt.connector.$SERVICES_PREFIX:80 [$SERVICES_PREFIX-reporter-container]=reporter.$SERVICES_PREFIX:80)

docker network create bouncer_bouncer_network

sed -i "s/{{DNS_SUFFIX}}/$DNS_SUFFIX/g" governify-project-bluejay-infrastructure/docker-compose.yaml
sed -i "s/{{SERVICES_PREFIX}}/$SERVICES_PREFIX/g" governify-project-bluejay-infrastructure/docker-compose.yaml

find governify-project-bluejay-infrastructure/renders-bluejay-template/renders/tpa/ -type f -name *.json -exec sed -i "s/{{DNS_SUFFIX}}/$DNS_SUFFIX/g" {} \;
find governify-project-bluejay-infrastructure/renders-bluejay-template/renders/tpa/ -type f -name *.json -exec sed -i "s/{{SERVICES_PREFIX}}/$SERVICES_PREFIX/g" {} \;

mv governify-project-bluejay-infrastructure/renders-bluejay-template/ governify-project-bluejay-infrastructure/renders/

find governify-project-bluejay-infrastructure/configurations -type f -name *.yaml -exec sed -i "s/{{DNS_SUFFIX}}/$DNS_SUFFIX/g" {} \;
find governify-project-bluejay-infrastructure/configurations -type f -name *.yaml -exec sed -i "s/{{SERVICES_PREFIX}}/$SERVICES_PREFIX/g" {} \;

docker-compose -f governify-project-bluejay-infrastructure/docker-compose.yaml up -d

rm -rf governify-bouncer-infrastructure/config/services-nginx-config/$SERVICES_PREFIX*


# TESTS
sed -i "s/{{DNS_SUFFIX}}/$DNS_SUFFIX/g" governify-project-bluejay-infrastructure/docker-compose-testing.yaml
sed -i "s/{{SERVICES_PREFIX}}/$SERVICES_PREFIX/g" governify-project-bluejay-infrastructure/docker-compose-testing.yaml

find governify-project-bluejay-infrastructure/tests/ -type f -name *.json -exec sed -i "s/{{DNS_SUFFIX}}/$DNS_SUFFIX/g" {} \;
find governify-project-bluejay-infrastructure/tests/ -type f -name *.json -exec sed -i "s/{{SERVICES_PREFIX}}/$SERVICES_PREFIX/g" {} \;

find governify-project-bluejay-infrastructure/tests/eventCollectorMockups/ -type f -name *.json -exec sed -i "s/{{DNS_SUFFIX}}/$DNS_SUFFIX/g" {} \;
find governify-project-bluejay-infrastructure/tests/eventCollectorMockups/ -type f -name *.json -exec sed -i "s/{{SERVICES_PREFIX}}/$SERVICES_PREFIX/g" {} \;



for service in "${!SERVICES[@]}"; do
  service_url=${SERVICES[$service]}
  IFS=':' read -r -a splitted <<< "$service_url"
  SERVICE_URL=${splitted[0]}$DNS_SUFFIX
  SERVICE_PORT=${splitted[1]}

  echo -e "server {
    resolver consul valid=2s;

    listen 443 ssl;

    server_name $SERVICE_URL;
    set \$proxied_url http://$service.service.consul;

    location / {
        proxy_pass \$proxied_url:$SERVICE_PORT;
    }

    proxy_set_header Host \"$SERVICE_URL\";
}" >> governify-bouncer-infrastructure/config/services-nginx-config/$service.conf
done

echo ""
echo "--------"
echo "Generating a temporary SSL cert"
echo ""

rm governify-bouncer-infrastructure/certs/cert.pem
rm governify-bouncer-infrastructure/certs/privkey.pem
rm governify-bouncer-infrastructure/certs/fullchain.pem

mkdir governify-project-bluejay-infrastructure/tmp

docker run -it -v $(pwd)/governify-project-bluejay-infrastructure/tmp:/export frapsoft/openssl req -x509 -nodes -new -newkey rsa:4096 -sha256 -keyout /export/privkey.pem -out /export/cert.pem -days 365 -subj '/CN=localhost'
docker run -it -v $(pwd)/governify-project-bluejay-infrastructure/tmp:/export frapsoft/openssl openssl dhparam -dsaparam -out /export/dhparam4096.pem 4096

mv governify-project-bluejay-infrastructure/tmp/cert.pem governify-bouncer-infrastructure/certs/cert.pem
mv governify-project-bluejay-infrastructure/tmp/privkey.pem governify-bouncer-infrastructure/certs/privkey.pem
cp governify-bouncer-infrastructure/certs/cert.pem governify-bouncer-infrastructure/certs/fullchain.pem
mv governify-project-bluejay-infrastructure/tmp/dhparam4096.pem governify-bouncer-infrastructure/certs/dhparam4096.pem


rm -rf governify-project-bluejay-infrastructure/tmp

echo "Certificate created. The last thing is to start the bouncer..."

docker-compose -f governify-bouncer-infrastructure/docker-compose.yaml up -d

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
