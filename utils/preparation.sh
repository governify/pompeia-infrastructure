yum update -y
yum install docker -y
service docker start
sudo curl -L "https://github.com/docker/compose/releases/download/1.27.4/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
# chmod +x setup.sh
# chmod +x init-letsencrypt.sh
# chmod +x utils/createDNS.sh