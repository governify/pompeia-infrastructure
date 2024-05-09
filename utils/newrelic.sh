#!/bin/bash 

# Export .env variables
export $(grep -v '^#' .env | xargs)

curl -Ls https://download.newrelic.com/install/newrelic-cli/scripts/install.sh | bash && sudo NEW_RELIC_API_KEY=${NEW_RELIC_API_KEY} NEW_RELIC_ACCOUNT_ID=3811196 NEW_RELIC_REGION=EU /usr/local/bin/newrelic install

docker run \
-d \
--name newrelic-infra \
--network=host \
--cap-add=SYS_PTRACE \
--privileged \
--pid=host \
-v "/:/host:ro" \
-v "/var/run/docker.sock:/var/run/docker.sock" \
-e NRIA_LICENSE_KEY=${NEW_RELIC_LICENSE_KEY} \
newrelic/infrastructure:latest