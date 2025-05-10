
# this script launches all observability backends for microcks
# create docker network for mlt apps

# https://hub.docker.com/r/prom/prometheus/tags?page=1&name=3.
export prometheus_image=prom/prometheus:v3.3.1

# https://hub.docker.com/r/grafana/loki/tags?page=1&name=3.
export loki_image=grafana/loki:3.5.0

# https://hub.docker.com/r/grafana/tempo/tags?page=1&name=2.
export tempo_image=grafana/tempo:2.7.2

# https://hub.docker.com/r/grafana/alloy/tags?page=1&name=v1.
export alloy_image=grafana/alloy:v1.8.3

# https://hub.docker.com/r/otel/opentelemetry-collector-contrib/tags?page=&page_size=&ordering=&name=0.
export otelcol_image=otel/opentelemetry-collector-contrib:0.123.0

# https://hub.docker.com/r/grafana/grafana/tags?page=1&name=12.
export grafana_image=grafana/grafana:12.0.0

#Network name
export DOCKER_NETWORK_NAME=primenet
export DOCKER_NETWORK_SUBNET=18


function readiness_check {
  name=$1
  url=$2
  res=$(curl --retry 10 -f --retry-all-errors --retry-delay 5 -s -w "%{http_code}" -o /dev/null  "$url") && if [ $res -eq "200" ]; then echo "✅ $name OK"; else echo "❌ $name FAILED"; fi
}

##############################
### Docker Network############
##############################

echo "Setting up dedicated network bridge.."

if [ -z $(docker network ls --filter name=^${DOCKER_NETWORK_NAME}$ --format="{{ .Name }}") ] ; then 
echo "Setting up dedicated network bridge.."
docker network create --driver=bridge --subnet=172.${DOCKER_NETWORK_SUBNET}.0.0/16 --gateway=172.${DOCKER_NETWORK_SUBNET}.0.1 ${DOCKER_NETWORK_NAME} ; 
echo "✅ $DOCKER_NETWORK_NAME docker network created !"
else
echo "✅ $DOCKER_NETWORK_NAME docker network exists !"
fi

##############################
### Prometheus ###############
##############################

CONTAINER_NAME=prometheus
if ! docker ps -a --format '{{.Names}}' | grep -w $CONTAINER_NAME &> /dev/null; then

     docker volume create prometheus_data

     docker run -d \
          --name $CONTAINER_NAME \
          -h $CONTAINER_NAME \
          --network=$DOCKER_NETWORK_NAME \
          -v prometheus_data:/prometheus:rw \
          -p 9080:9090 \
          $prometheus_image \
          --web.enable-remote-write-receiver \
          --web.enable-otlp-receiver \
          --enable-feature=exemplar-storage \
          --enable-feature=native-histograms \
          --enable-feature=promql-experimental-functions \
          --config.file=/etc/prometheus/prometheus.yml

else
     docker start $CONTAINER_NAME
fi

##############################
### Loki #####################
##############################

CONTAINER_NAME=loki
if ! docker ps -a --format '{{.Names}}' | grep -w $CONTAINER_NAME &> /dev/null; then
     docker volume create loki_data
     docker run --rm -v loki_data:/data alpine:3.21.3 chown -R 10001:10001 /data
     docker run -d \
          --name $CONTAINER_NAME \
          -h $CONTAINER_NAME \
          --network=$DOCKER_NETWORK_NAME \
          -v "$(pwd)/configs/loki:/config:ro" \
          -v loki_data:/data/loki:rw \
          -p 3100:3100 \
          $loki_image \
          -config.file=/config/config.yaml
else
     docker start $CONTAINER_NAME
fi

##############################
### Tempo ####################
##############################

CONTAINER_NAME=tempo
if ! docker ps -a --format '{{.Names}}' | grep -w $CONTAINER_NAME &> /dev/null; then
     docker volume create tempo_data
     docker run --rm -v tempo_data:/data alpine:3.21.3 chown -R 10001:10001 /data
     docker run -d \
          --name $CONTAINER_NAME \
          -h $CONTAINER_NAME \
          --network=$DOCKER_NETWORK_NAME \
          -p 3200:3200 \
          -p 4417:4417 \
          -p 4418:4418 \
          -v $(pwd)/configs/tempo:/config:ro \
          -v tempo_data:/data/tempo:rw \
          $tempo_image \
          -config.file=/config/config.yaml
else
     docker start $CONTAINER_NAME
fi

##############################
### OTEL #####################
##############################

CONTAINER_NAME=otelcol
if ! docker ps -a --format '{{.Names}}' | grep -w $CONTAINER_NAME &> /dev/null; then
     docker run -d \
          --name $CONTAINER_NAME \
          -h $CONTAINER_NAME \
          --network=$DOCKER_NETWORK_NAME \
          -p 4517:4317 \
          -p 4518:4318 \
          -p 13133:13133 \
          -v $(pwd)/configs/otelcol:/config:ro \
          $otelcol_image \
          --config=/config/config.yaml
else
     docker start $CONTAINER_NAME
fi

##############################
### ALLOY ####################
##############################

CONTAINER_NAME=alloy
if ! docker ps -a --format '{{.Names}}' | grep -w $CONTAINER_NAME &> /dev/null; then
     docker volume create alloy_data
     docker run -d \
          --name $CONTAINER_NAME \
          --user "0:0" \
          --pid="host" \
          --uts="host" \
          --network=$DOCKER_NETWORK_NAME \
          -p "12345:12345" \
          -p "4317:4317" \
          -p "4318:4318" \
          -v "$(pwd)/configs/alloy:/config:ro" \
          -v alloy_data:/data:rw \
          -v "/:/host/root:ro,rslave" \
          -v "/sys:/host/sys:ro,rslave" \
          -v "/proc:/host/proc:ro,rslave" \
          -v "/var/run/docker.sock:/var/run/docker.sock:rw" \
          -v "/var/log/journal:/var/log/journal:ro,rslave" \
          $alloy_image \
          run \
          --server.http.listen-addr=0.0.0.0:12345 \
          --storage.path=/data \
          /config/config.alloy
else
     docker start $CONTAINER_NAME
fi



##############################
### Grafana ##################
##############################

CONTAINER_NAME=grafana
if ! docker ps -a --format '{{.Names}}' | grep -w $CONTAINER_NAME &> /dev/null; then
     docker run -d \
          --name $CONTAINER_NAME \
          -h $CONTAINER_NAME \
          --network=$DOCKER_NETWORK_NAME \
          -p 3000:3000 \
          -e GF_AUTH_ANONYMOUS_ENABLED=true \
          -e GF_AUTH_ANONYMOUS_ORG_ROLE=Admin \
          -v $(pwd)/configs/grafana/ds.yaml:/etc/grafana/provisioning/datasources/datasources.yaml:ro \
          -v $(pwd)/dashboards/:/etc/grafana/provisioning/dashboards/:ro \
          $grafana_image \

else
     docker start $CONTAINER_NAME
fi



echo "Check state of the stack !"
readiness_check Prometheus localhost:9080/metrics &
readiness_check Loki localhost:3100/ready &
readiness_check Tempo localhost:3200/ready &
readiness_check Otelcol localhost:13133 &
readiness_check Alloy localhost:12345/ready &
readiness_check Grafana localhost:3000/api/health &

wait 
echo "Finished !"