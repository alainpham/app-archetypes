FROM registry.access.redhat.com/ubi8/ubi-minimal:${ubi-image-version}

ARG JAVA_PACKAGE=${jdk-version}
ARG RUN_JAVA_VERSION=${run-java-version}

ENV LANG='en_US.UTF-8' LANGUAGE='en_US:en'

# Install java and the run-java script
# Also set up permissions for user `1001`
RUN microdnf install curl vi ca-certificates ${JAVA_PACKAGE} \
    && microdnf update \
    && microdnf clean all \
    && mkdir /deployments \
    && chown 1001 /deployments \
    && chmod "g+rwX" /deployments \
    && chown 1001:root /deployments \
    && curl https://repo1.maven.org/maven2/io/prometheus/jmx/jmx_prometheus_javaagent/${jmx-prometheus-javaagent-version}/jmx_prometheus_javaagent-${jmx-prometheus-javaagent-version}.jar -o /opt/jmx_prometheus_javaagent.jar \
    && curl https://repo1.maven.org/maven2/io/fabric8/run-java-sh/${RUN_JAVA_VERSION}/run-java-sh-${RUN_JAVA_VERSION}-sh.sh -o /deployments/run-java.sh \
    && chown 1001 /deployments/run-java.sh \
    && chmod 540 /deployments/run-java.sh \
    && echo "securerandom.source=file:/dev/urandom" >> /etc/alternatives/jre/lib/security/java.security

# Configure the JAVA_OPTIONS, you can add -XshowSettings:vm to also display the heap size.
ENV JAVA_OPTIONS="-javaagent:/opt/jmx_prometheus_javaagent.jar=9779:/deployments/prometheus-config.yml"

COPY target/*.jar /deployments/
COPY src/main/fabric8-includes/prometheus-config.yml /deployments/prometheus-config.yml
COPY tls/* /deployments/tls/

EXPOSE 8080
USER 1001

ENTRYPOINT [ "/deployments/run-java.sh" ]
