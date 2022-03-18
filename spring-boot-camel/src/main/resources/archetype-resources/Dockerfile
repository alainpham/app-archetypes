FROM registry.access.redhat.com/ubi8/openjdk-11-runtime:${ubi-image-version}

ARG RUN_JAVA_VERSION=${run-java-version}

ENV LANG='en_US.UTF-8' LANGUAGE='en_US:en'

# Configure the JAVA_OPTIONS, you can add -XshowSettings:vm to also display the heap size.

user root
RUN curl https://repo1.maven.org/maven2/io/prometheus/jmx/jmx_prometheus_javaagent/${jmx-prometheus-javaagent-version}/jmx_prometheus_javaagent-${jmx-prometheus-javaagent-version}.jar -o /opt/jmx_prometheus_javaagent.jar \
    && curl https://repo1.maven.org/maven2/io/fabric8/run-java-sh/${RUN_JAVA_VERSION}/run-java-sh-${RUN_JAVA_VERSION}-sh.sh -o /deployments/run-java.sh \
    && chmod 755 /deployments/run-java.sh

ENV JAVA_OPTIONS="-javaagent:/opt/jmx_prometheus_javaagent.jar=9779:/deployments/prometheus-config.yml"

# We make four distinct layers so if there are application changes the library layers can be re-used

COPY --chown=185 target/*.jar /deployments/
COPY --chown=185 src/main/fabric8-includes/prometheus-config.yml /deployments/prometheus-config.yml
COPY --chown=185 tls/* /deployments/tls/

EXPOSE 8080
USER 185

ENTRYPOINT [ "/deployments/run-java.sh" ]