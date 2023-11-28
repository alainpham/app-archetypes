
# this script launches all observability backends for microcks
# create docker network for mlt apps

function readiness_check {
  name=$1
  url=$2
  res=$(curl --retry 10 -f --retry-all-errors --retry-delay 5 -s -w "%{http_code}" -o /dev/null  "$url") && if [ $res -eq "200" ]; then echo "✅ $name OK"; else echo "❌ $name FAILED"; fi
}

##############################
### Docker Network############
##############################

NETWORK_NAME=o11y

echo "Setting up dedicated network bridge.."

if [ -z $(docker network ls --filter name=^${NETWORK_NAME}$ --format="{{ .Name }}") ] ; then 
     docker network create --driver=bridge --subnet=172.19.0.0/16 --gateway=172.19.0.1 ${NETWORK_NAME} ; 
     echo "✅ $NETWORK_NAME docker network created !"
else
     echo "✅ $NETWORK_NAME already exisits ! "
fi

##############################
### Prometheus ###############
##############################

CONTAINER_NAME=o11y_prom
if ! docker ps -a --format '{{.Names}}' | grep -w $CONTAINER_NAME &> /dev/null; then
     docker run -d \
          --name $CONTAINER_NAME \
          -h $CONTAINER_NAME \
          --network=$NETWORK_NAME \
          -p 9080:9090 \
          prom/prometheus:v2.47.2  --config.file=/etc/prometheus/prometheus.yml --web.enable-remote-write-receiver --enable-feature=exemplar-storage
else
     docker start $CONTAINER_NAME
fi

##############################
### Loki #####################
##############################

CONTAINER_NAME=o11y_loki
if ! docker ps -a --format '{{.Names}}' | grep -w $CONTAINER_NAME &> /dev/null; then
     docker run -d \
          --name $CONTAINER_NAME \
          -h $CONTAINER_NAME \
          --network=$NETWORK_NAME \
          -p 3100:3100 \
          grafana/loki:2.9.2 -config.file=/etc/loki/local-config.yaml
else
     docker start $CONTAINER_NAME
fi

##############################
### Tempo ####################
##############################

CONTAINER_NAME=o11y_tempo
if ! docker ps -a --format '{{.Names}}' | grep -w $CONTAINER_NAME &> /dev/null; then
     docker run -d \
          --name $CONTAINER_NAME \
          -h $CONTAINER_NAME \
          --network=$NETWORK_NAME \
          -p 3200:3200 \
          -v $(pwd)/configs/tempo.yaml:/etc/tempo.yaml:ro \
          grafana/tempo:2.3.0 -config.file=/etc/tempo.yaml
else
     docker start $CONTAINER_NAME
fi

##############################
### OTEL #####################
##############################

CONTAINER_NAME=o11y_otel
if ! docker ps -a --format '{{.Names}}' | grep -w $CONTAINER_NAME &> /dev/null; then
     docker run -d \
          --name $CONTAINER_NAME \
          -h $CONTAINER_NAME \
          --network=$NETWORK_NAME \
          -p 4317:4317 \
          -p 13133:13133 \
          -v $(pwd)/configs/otel-collector.yaml:/etc/otel-collector.yaml:ro \
          otel/opentelemetry-collector-contrib:0.88.0 --config=/etc/otel-collector.yaml
else
     docker start $CONTAINER_NAME
fi


##############################
### Grafana ##################
##############################

CONTAINER_NAME=o11y_grafana
if ! docker ps -a --format '{{.Names}}' | grep -w $CONTAINER_NAME &> /dev/null; then
     docker run -d \
          --name $CONTAINER_NAME \
          -h $CONTAINER_NAME \
          --network=$NETWORK_NAME \
          -p 3000:3000 \
          -e GF_AUTH_ANONYMOUS_ENABLED=true \
          -e GF_AUTH_ANONYMOUS_ORG_ROLE=Admin \
          -v $(pwd)/configs/grafana-datasources.yaml:/etc/grafana/provisioning/datasources/datasources.yaml:ro \
          -v $(pwd)/dashboards/:/etc/grafana/provisioning/dashboards/:ro \
          grafana/grafana:10.2.0

else
     docker start $CONTAINER_NAME
fi



echo "Check state of the stack !"
readiness_check Prometheus localhost:9080/metrics &
readiness_check Loki localhost:3100/ready &
readiness_check Tempo localhost:3200/ready &
readiness_check OpenTelemetryCollector localhost:13133 &
readiness_check Grafana localhost:3000/api/health &

wait 
echo "Finished !"