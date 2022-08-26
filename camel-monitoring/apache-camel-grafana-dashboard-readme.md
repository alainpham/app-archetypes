# Apache Camel 3 - Statistics on Camel Context level

## Intro
Performance oriented monitoring on Apache Camel 3 deployments. Works ideally on Kubernetes deployments. Based on Prometheus datasource scraping metrics coming from the micrometer framework. Focuses on analyzing Camel Context, Route & Processor execution times and throughput.

## Application instrumentation

Micrometer is supported on Spring Boot, Quarkus and Camel K flavors. See the project archetypes for examples configurations. The instrumentation of the application is as simple as adding the following  dependencies to your project.

### For Quarkus

#### pom.xml
```
    <dependency>
      <groupId>io.micrometer</groupId>
      <artifactId>micrometer-registry-prometheus</artifactId>
    </dependency>
    <dependency>
      <groupId>org.apache.camel.quarkus</groupId>
      <artifactId>camel-quarkus-micrometer</artifactId>
    </dependency>
```
#### application.properties

```
quarkus.camel.metrics.enable-message-history=true
```
### For Spring Boot

#### pom.xml
```
        <dependency>
            <groupId>io.micrometer</groupId>
            <artifactId>micrometer-registry-prometheus</artifactId>
          </dependency>
        <dependency>
            <groupId>org.apache.camel.springboot</groupId>
            <artifactId>camel-micrometer-starter</artifactId>
        </dependency>
```

#### Configuration class
```
@Component
public class Configurator extends RouteBuilder {
	@Override
	public void configure() throws Exception {
		getContext().addRoutePolicyFactory(new MicrometerRoutePolicyFactory());
		getContext().setMessageHistoryFactory(new MicrometerMessageHistoryFactory());
		getCamelContext().getManagementStrategy().addEventNotifier(new MicrometerExchangeEventNotifier());
		getCamelContext().getManagementStrategy().addEventNotifier(new MicrometerRouteEventNotifier());
	}
}
```

## Video material

Watch a demo video here :
[https://www.youtube.com/watch?v=0LDgv1nIk-Y](https://www.youtube.com/watch?v=0LDgv1nIk-Y)

or here
[https://odysee.com/@alainpham:8/apache-camel-monitoring-prometheus-grafana:c](https://odysee.com/@alainpham:8/apache-camel-monitoring-prometheus-grafana:c)

Here is the git repo for setting up the demo : [https://github.com/alainpham/app-archetypes](https://github.com/alainpham/app-archetypes)

Feel free to asks questions and send me feedback on [LinkedIn](https://www.linkedin.com/in/alainpham/)
or [Twitter](https://twitter.com/alainphm)
