FROM openjdk:11-jre-buster
ADD https://repo1.maven.org/maven2/io/prometheus/jmx/jmx_prometheus_javaagent/${jmx-prometheus-javaagent-version}/jmx_prometheus_javaagent-${jmx-prometheus-javaagent-version}.jar jmx_prometheus_javaagent.jar
COPY target/*.jar app.jar
COPY src/main/prometheus/prometheus-config.yml prometheus-config.yml
ENTRYPOINT ["java","-javaagent:/jmx_prometheus_javaagent.jar=9779:/prometheus-config.yml","-jar","/app.jar"]
EXPOSE 8080
EXPOSE 8081
EXPOSE 9779
