 #!/bin/sh
curl -o ../quarkus-camel/src/main/resources/archetype-resources/src/main/resources/xsd/camel-spring.xsd $1
curl -o ../spring-boot-camel/src/main/resources/archetype-resources/src/main/resources/xsd/camel-spring.xsd $1
curl -o ../plain-java/src/main/resources/archetype-resources/src/main/resources/xsd/camel-spring.xsd $1
curl -o ../version-watcher/src/main/resources/xsd//camel-spring.xsd $1
