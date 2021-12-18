# Archetypes & Monitoring Tools for Java/Apache Camel developers

This repo contains archetypes that should be useful to camel developers that don't want to start with common things already included in their projects such as monitoring, circuit breaking, swagger ui etc..

It also contains the a comprehensive Grafana Dashboard for performance monitoring on metrics collected through Prometheus.

## Create a Spring Boot Camel Project

The following is a Spring Boot archetype

```
mvn archetype:generate \
    -DarchetypeGroupId=io.github.alainpham \
    -DarchetypeArtifactId=spring-boot-camel \
    -DarchetypeVersion=1.0.0
```

## Create a Quarkus Camel Project

The following is a Quarkus archetype

```
mvn archetype:generate \
    -DarchetypeGroupId=io.github.alainpham \
    -DarchetypeArtifactId=quarkus-camel \
    -DarchetypeVersion=1.0.0
```

## Create a Plain Java Project

```
mvn archetype:generate \
    -DarchetypeGroupId=io.github.alainpham \
    -DarchetypeArtifactId=plain-java \
    -DarchetypeVersion=1.0.0
```

## Grafana Dashboard For Camel Monitoring

The dashboard that you can import can be found [here](camel-monitoring/dashboards-for-import/Camel%20Dashboard%20-%20Context%20View.json)


It gives comprehensive metrics for performance monitoring. It focuses on monitoring route execution rate and average executions times that is broken down to processors & routes. You can use it to find your bottlenecks and detect degradations in quality of service.

Videos : 
Here : http://www.youtube.com/watch?v=0LDgv1nIk-Y
or here : https://odysee.com/@alainpham:8/apache-camel-monitoring-prometheus-grafana:c 

[![Grafana](assets/grafana-dash-sample.png)](http://www.youtube.com/watch?v=0LDgv1nIk-Y)

## Install Prometheus and Grafana Kubernetes/Openshift Namespace for monitoring

Use these commands if you want to quickly test the archetype out including some monitoring

```
oc project ###YOUR_TARGET_NAMESPACE_HERE###

cat camel-monitoring/prometheus-local.yaml | sed -E "s/TARGET_NAMESPACE/###YOUR_TARGET_NAMESPACE_HERE###/"| oc apply -f -

oc create configmap grafana-dashboards --from-file=camel-monitoring/dashboards

oc apply -f camel-monitoring/grafana.yaml
```

## Install Prometheus & Grafana on local docker engine for testing

Follow these instructions linked here to have Prometheus and Grafana running as local docker containers. 

https://github.com/alainpham/dev-env-scripts#monitoring

By editing the prometheus config we can set static targets on your local env to emulate the behavior of auto discovered pods on Kubernetes.

## Current versions for spring booot used

| Components                 | Version       |
|----------------------------|---------------|
| camel-version              | 3.13.0        |
| spring-boot-version        | 2.6.1         |
| swagger-ui-version         | 3.52.5        |
| swagger-codegen-version    | 2.4.24        |
| fmp-version                | 4.4.1         |
| cxf-codegen-plugin-version | 3.4.5         |
| logstash-encoder-version   | 7.0.1         |
| webjars-locator-version    | 0.42          |
| hawtio-springboot-version  | 2.14.2        |
| jmx_prometheus_javaagent   | 0.16.1        |

## Current versions for quarkus used

(To be updated to quarlus 2.x)

| Components                 | Version       |
|----------------------------|---------------|
| quarkus-version            | 1.13.3.Final  |
| camel-version              | 3.9.0         |

## Next steps for this small project

* Build a Dashboard for Camel Quarkus with the microprofile metrics componenents. This will be great for SLA management as their are some cool metrics like quantiles on execution time.
