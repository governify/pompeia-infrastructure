export $(grep -v '^#' .env | xargs)

# ${DNS_SUFFIX/./} - DNS suffix with initial . removed
curl "https://dinahosting.com/special/api.php?AUTH_USER=$1&AUTH_PWD=$2&responseType=Json&domain=${DNS_SUFFIX/./}&hostname=ui.${SERVICES_PREFIX}&ip=${SERVER_IP}&command=Domain_Zone_AddTypeA"
curl "https://dinahosting.com/special/api.php?AUTH_USER=$1&AUTH_PWD=$2&responseType=Json&domain=${DNS_SUFFIX/./}&hostname=dashboard.${SERVICES_PREFIX}&ip=${SERVER_IP}&command=Domain_Zone_AddTypeA"
curl "https://dinahosting.com/special/api.php?AUTH_USER=$1&AUTH_PWD=$2&responseType=Json&domain=${DNS_SUFFIX/./}&hostname=scopes.${SERVICES_PREFIX}&ip=${SERVER_IP}&command=Domain_Zone_AddTypeA"
curl "https://dinahosting.com/special/api.php?AUTH_USER=$1&AUTH_PWD=$2&responseType=Json&domain=${DNS_SUFFIX/./}&hostname=reporter.${SERVICES_PREFIX}&ip=${SERVER_IP}&command=Domain_Zone_AddTypeA"
curl "https://dinahosting.com/special/api.php?AUTH_USER=$1&AUTH_PWD=$2&responseType=Json&domain=${DNS_SUFFIX/./}&hostname=registry.${SERVICES_PREFIX}&ip=${SERVER_IP}&command=Domain_Zone_AddTypeA"
curl "https://dinahosting.com/special/api.php?AUTH_USER=$1&AUTH_PWD=$2&responseType=Json&domain=${DNS_SUFFIX/./}&hostname=assets.${SERVICES_PREFIX}&ip=${SERVER_IP}&command=Domain_Zone_AddTypeA"