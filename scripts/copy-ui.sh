#!/bin/sh
rm -r ../quarkus-camel/src/main/resources/archetype-resources/src/main/resources/META-INF/resources/resources/*
cp -R ../js-front/static/* ../quarkus-camel/src/main/resources/archetype-resources/src/main/resources/META-INF/resources/

rm -r ../spring-boot-camel/src/main/resources/archetype-resources/src/main/resources/static/*
cp -R ../js-front/static/* ../spring-boot-camel/src/main/resources/archetype-resources/src/main/resources/static/

rm -r ../spring-boot/src/main/resources/archetype-resources/src/main/resources/static/*
cp -R ../js-front/static/* ../spring-boot/src/main/resources/archetype-resources/src/main/resources/static/

