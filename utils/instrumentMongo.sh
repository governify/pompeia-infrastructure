export $(grep -v '^#' .env | xargs)

docker run -d --name pompeia-mongodb-exporter --network governify-pompeia -p 9216:9216 -p 17001:17001 bitnami/mongodb-exporter:latest --mongodb.uri=mongodb://pompeia-mongo-registry:27017 --collect-all --discovering-mode

docker run -d --restart unless-stopped \
    --name nri-prometheus \
    -e LICENSE_KEY=${NEW_RELIC_LICENSE_KEY} \
    -v "$(pwd)/configurations/prometheus/config.yaml:/config.yaml" \
    newrelic/nri-prometheus:1.5