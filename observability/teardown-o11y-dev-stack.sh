
export NETWORK_NAME=mainnet

docker rm -f o11y_prom o11y_loki o11y_tempo o11y_grafana o11y_otel
docker network rm $NETWORK_NAME