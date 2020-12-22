DYNAHOSTING_USER = 
DYNAHOSTING_PASSWORD = 

# Simple commands
install-prerequisites:
	./utils/preparation.sh

configure-envvars:
	nano .env

configure-dynahosting:
	./utils/createDNS.sh ${DYNAHOSTING_USER} ${DYNAHOSTING_PASSWORD}

edit-compose:
	nano ./docker-compose.yaml

deploy-bluejay:
	./utils/deploy.sh

generate-certificates-staging:
	./utils/init-letsencrypt.sh 1

generate-certificates-production:
	./utils/init-letsencrypt.sh 0

fix-system:
	docker restart bluejay-reporter
	docker restart bluejay-registry
	docker restart bluejay-eventcollector

# Complex workflows
install-with-prerequisites-and-nginx:
	./utils/preparation.sh
	echo "Please, enter the enviroment variables. Press a key to open the editor:"
	read nothing
	nano .env
	./utils/createDNS.sh ${DYNAHOSTING_USER} ${DYNAHOSTING_PASSWORD}
	./utils/deploy.sh
	./utils/init-letsencrypt.sh 0
	docker restart bluejay-reporter
	docker restart bluejay-registry
	docker restart bluejay-eventcollector
	
install-with-prerequisites:
	./utils/preparation.sh
	echo "Please, enter the enviroment variables. Press a key to open the editor:"
	read nothing
	nano .env
	./utils/createDNS.sh ${DYNAHOSTING_USER} ${DYNAHOSTING_PASSWORD}
	echo "Please, comment nginx in docker-compose.yaml. Press a key to open the editor:"
	read nothing
	nano ./docker-compose.yaml
	./utils/deploy.sh
	docker restart bluejay-reporter
	docker restart bluejay-registry
	docker restart bluejay-eventcollector

install-with-nginx:
	echo "Please, enter the enviroment variables. Press a key to open the editor:"
	read nothing
	nano .env
	./utils/createDNS.sh ${DYNAHOSTING_USER} ${DYNAHOSTING_PASSWORD}
	./utils/deploy.sh
	./utils/init-letsencrypt.sh 0
	docker restart bluejay-reporter
	docker restart bluejay-registry
	docker restart bluejay-eventcollector

install-local:
	echo "Please, enter the enviroment variables. Press a key to open the editor:"
	read nothing
	nano .env
	./utils/deploy.sh
	docker restart bluejay-reporter
	docker restart bluejay-registry
	docker restart bluejay-eventcollector

