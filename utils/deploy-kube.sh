#!/bin/bash 
prod=${1:-0}
dryrun=null

if [ $prod -eq 0 ]; then
    dryrun="--dry-run"
else
    dryrun=""
fi

# Export .env variables
set -a
. .env
set +a

# Declare args as string for reusing
args="--set services_prefix=$SERVICES_PREFIX \
--set dns_suffix=$DNS_SUFFIX \
--set user_assets=$USER_ASSETS \
--set pass_assets=$PASS_ASSETS \
--set user_render=$USER_RENDER \
--set pass_render=$PASS_RENDER \
--set login_password=$LOGIN_PASSWORD \
--set gov_infrastructure=$GOV_INFRASTRUCTURE \
--set influx_url=$INFLUX_URL \
--set key_assets_manager_private=$KEY_ASSETS_MANAGER_PRIVATE \
--set assets_repository_branch=$ASSETS_REPOSITORY_BRANCH \
--set node_env=$NODE_ENV \
--set key_github=$KEY_GITHUB \
--set key_pivotal=$KEY_PIVOTAL \
--set key_heroku=$KEY_HEROKU \
--set key_travis_public=$KEY_TRAVIS_PUBLIC \
--set key_travis_private=$KEY_TRAVIS_PRIVATE \
--set key_codeclimate=$KEY_CODECLIMATE \
--set key_pseudonymizer=$KEY_PSEUDONYMIZER \
--set key_scope_manager=$KEY_SCOPE_MANAGER"

# Install helm charts
helm install bluejay-assets-manager ./helm/bluejay-assets-manager $dryrun $args

helm install bluejay-mongo-registry ./helm/bluejay-mongo-registry $dryrun $args
helm install bluejay-redis-ec ./helm/bluejay-redis-ec $dryrun $args
helm install bluejay-influx-reporter ./helm/bluejay-influx-reporter $dryrun $args

helm install bluejay-collector-events ./helm/bluejay-collector-events $dryrun $args
helm install bluejay-dashboard ./helm/bluejay-dashboard $dryrun $args
helm install bluejay-director ./helm/bluejay-director $dryrun $args
helm install bluejay-registry ./helm/bluejay-registry $dryrun $args
helm install bluejay-render ./helm/bluejay-render $dryrun $args
helm install bluejay-reporter ./helm/bluejay-reporter $dryrun $args
helm install bluejay-scope-manager ./helm/bluejay-scope-manager $dryrun $args

helm install bluejay-join ./helm/bluejay-join $dryrun $args

