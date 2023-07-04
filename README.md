# Archetypes & Monitoring Tools for Java/Apache Camel developers

- [Archetypes \& Monitoring Tools for Java/Apache Camel developers](#archetypes--monitoring-tools-for-javaapache-camel-developers)
  - [Create a Spring Boot Camel Project](#create-a-spring-boot-camel-project)
  - [Create a Quarkus Camel Project](#create-a-quarkus-camel-project)
  - [Create a Plain Java Project](#create-a-plain-java-project)
  - [Observability Stack : Grafana Dashboard For Apache Camel](#observability-stack--grafana-dashboard-for-apache-camel)
  - [Install Prometheus \& Grafana on local docker engine for testing](#install-prometheus--grafana-on-local-docker-engine-for-testing)
    - [Create docker network for internal dns resolution](#create-docker-network-for-internal-dns-resolution)
    - [Run a smoke-test-app written with quarkus](#run-a-smoke-test-app-written-with-quarkus)
    - [Run Prometheus](#run-prometheus)
    - [Run Grafana](#run-grafana)
    - [Delete everything](#delete-everything)
  - [Install Prometheus \& Grafana on kubernetes](#install-prometheus--grafana-on-kubernetes)
  - [Current versions for plain java pojects](#current-versions-for-plain-java-pojects)
  - [Current versions for spring boot used](#current-versions-for-spring-boot-used)
  - [Current versions for quarkus used](#current-versions-for-quarkus-used)
  - [Next steps for this small project](#next-steps-for-this-small-project)

This repo contains archetypes that should be useful to camel developers that don't want to start with common things already included in their projects such as 
* Monitoring with Micrometer / Prometheus / Grafana
* HTTP Rest with OpenAPI / SwaggerUI
* Websockets
* Soap with CXF (Optional) -> not supported yet in the latest versions as we transition from javax to jakarta

It also contains the a comprehensive Grafana Dashboard for performance monitoring on metrics collected through Prometheus.

## Create a Spring Boot Camel Project

The following is a Spring Boot archetype

```
mvn archetype:generate \
    -DarchetypeGroupId=io.github.alainpham \
    -DarchetypeArtifactId=spring-boot-camel \
    -DarchetypeCatalog=local \
    -DarchetypeVersion=1.0.0
```

## Create a Quarkus Camel Project

The following is a Quarkus archetype

```
mvn archetype:generate \
    -DarchetypeGroupId=io.github.alainpham \
    -DarchetypeArtifactId=quarkus-camel \
    -DarchetypeCatalog=local \
    -DarchetypeVersion=1.0.0
```

## Create a Plain Java Project

```
mvn archetype:generate \
    -DarchetypeGroupId=io.github.alainpham \
    -DarchetypeArtifactId=plain-java \
    -DarchetypeCatalog=local \
    -DarchetypeVersion=1.0.0
```

## Observability Stack : Grafana Dashboard For Apache Camel

The dashboard that you can import can be found [here](camel-monitoring/camel-dashboards-for-import/apache-camel-micrometer.json)

In camel 2 we relied on JMX exporter. For Camel 3 & 4, the dashboard now uses metrics exposed by the micrometer library. This offers the same dashboard accross all flavors like Camel Spring, Camel Quarkus and Camel K.

It gives comprehensive metrics for performance monitoring. It focuses on monitoring route execution rate and average executions times that is broken down to processors & routes. You can use it to find your bottlenecks and detect degradations in quality of service.

Videos based on the JMX exporter version (micrometer version to come) : 
Here : http://www.youtube.com/watch?v=0LDgv1nIk-Y
or here : https://odysee.com/@alainpham:8/apache-camel-monitoring-prometheus-grafana:c 

[![Grafana](assets/grafana-dash-sample.png)](http://www.youtube.com/watch?v=0LDgv1nIk-Y)

## Install Prometheus & Grafana on local docker engine for testing

### Create docker network for internal dns resolution

```
docker network create --driver=bridge --subnet=172.22.0.0/16 --gateway=172.22.0.1 camelnet
```

### Run a smoke-test-app written with quarkus

```
docker run -d \
    --name=smoke-test-app-quarkus \
    --net camelnet \
    -p 7080:8080 \
    alainpham/smoke-test-app:2.0.0
```

### Run Prometheus

```
docker run -d \
    --name=camel-prometheus \
    --net camelnet \
    -p 9090:9090 \
    -v $(pwd)/camel-monitoring/prometheus.yml:/etc/prometheus/prometheus.yml:ro \
    prom/prometheus:v2.43.1
```

### Run Grafana

```
docker run -d \
    --name=camel-grafana \
    --net camelnet \
    -p 3000:3000 \
    -e GF_SECURITY_ADMIN_PASSWORD=password \
    -v $(pwd)/camel-monitoring/grafana-datasources.yml:/etc/grafana/provisioning/datasources/grafana-datasources.yml:ro \
    -v $(pwd)/camel-monitoring/camel-dashboards/:/etc/grafana/provisioning/dashboards:ro \
    grafana/grafana:9.5.2

```

### Delete everything

```
docker stop camel-grafana camel-prometheus smoke-test-app-quarkus

docker rm camel-grafana camel-prometheus smoke-test-app-quarkus

docker network rm camelnet
```

## Install Prometheus & Grafana on kubernetes

Use these commands if you want to quickly test the archetype out including some monitoring

```
WIP
```


## Current versions for plain java pojects

| Components                 | Version          |
|----------------------------|------------------|
| java                       | 17               |
| camel-version              | 3.21.0           |
| maven-compiler-plugin      | 3.11.0           |
| maven-dependency-plugin    | 3.6.0            |
| maven-jar-plugin           | 3.3.0            |
| logback-version            | 1.4.8            |


## Current versions for spring boot used

| Components                   | Version          |
|------------------------------|------------------|
| java                         | 17               |
| maven-compiler-plugin        | 3.11.0           |
| camel-version                | 4.0.0-RC1        |
| spring-boot-version          | 3.1.1            |
| swagger-ui-version           | 3.52.5           |
| swagger-codegen-version      | 3.0.46	          |
| (cxf-codegen-plugin-version) | (4.0.2) WIP      |
| logstash-encoder-version     | 7.4              |
| webjars-locator-version      | 0.47             |
| jmx_prometheus_javaagent     | 0.19.0           | 
| run-java-version             | 1.3.8            |
| temurin-image-version        | 17.0.7_7-jre     |


## Current versions for quarkus used

| Components                 | Version          |
|----------------------------|------------------|
| java                       | 17               |
| camel-version              | 4.0.0-RC1        |
| quarkus-version            | 3.1.3.Final	    |
| maven-compiler-plugin      | 3.11.0	        |
| surefire-plugin-version    | 3.1.2            |
| temurin-image-version      | 17.0.7_7-jre     |

## Next steps for this small project

* Add opentelemetry tracing and send data to Grafana Tempo.
* Link metrics to traces.
* Make a video on Grafana dashboard and the newer micrometer prometheus metrics