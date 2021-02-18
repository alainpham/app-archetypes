#[[# Spring Boot with camel and other useful things]]# ${artifactId} 


#[[## To build this project use]]#

```
mvn install
```

#[[## To run this project with Maven use]]#

```
mvn spring-boot:run
```

#[[##Dealing with SSL/TLS]]#

Generate some private keys and truststores

```
keytool -genkey \
    -alias ${artifactId}  \
    -storepass password \
    -keyalg RSA \
    -storetype PKCS12 \
    -dname "cn=${artifactId}" \
    -validity 365000 \
    -keystore tls/keystore.p12

keytool -export \
    -alias ${artifactId} \
    -rfc \
    -storepass password \
    -keystore tls/broker-keystore.p12 \
    -file tls/${artifactId}.pem

FILES=tls/trusted-certs/*
for f in $FILES
do
#[[    full="${f##*/}"]]#
#[[    extension="${full##*.}"]]#
#[[    filename="${full%.*}"]]#
    echo "importing $full in alias $filename"

    keytool -import \
        -alias $filename \
        -storepass password\
        -storetype PKCS12 \
        -noprompt \
        -keystore tls/truststore.p12 \
        -file $f
done

keytool -list -storepass password -keystore tls/keystore.p12 -v
keytool -list -storepass password -keystore tls/truststore.p12 -v
```


#[[## To deploy directly on openshift]]#

```
oc create secret generic ${artifactId}-tls-secret \
--from-file=keystore.p12=tls/keystore.p12 \
--from-file=truststore.p12=tls/truststore.p12

oc create secret generic ${artifactId}-prop-secret \
--from-file=application.properties=src/main/resources/application.properties

mvn -P k8s fabric8:deploy fabric8:build
```

#[[## For testing]]#

```
curl http://localhost:8090/camel/api-docs
curl http://localhost:8090/camel/ping
```


#[[## Acces Swagger UI with definition]]#

```
http://localhost:8090/webjars/swagger-ui/index.html?url=/camel/api-docs
```

#[[## Call the ping rest operation]]#
```
curl http://localhost:8090/camel/restsvc/ping
```

#[[## Run local container with specific network and IP address]]#


```
docker stop ${artifactId}
docker rm ${artifactId}
docker rmi ${artifactId}
docker build -t ${artifactId} .
docker run -d --net primenet --ip 172.18.0.10 --name ${artifactId} -e SPRING_PROFILES_ACTIVE=dev ${artifactId}
```

Stop or launch multple instaces

```
NB_CONTAINERS=2
for (( i=0; i<$NB_CONTAINERS; i++ ))
do
   docker stop ${artifactId}-$i
   docker rm ${artifactId}-$i
done

docker rmi ${artifactId}
docker build -t ${artifactId} .

for (( i=0; i<$NB_CONTAINERS; i++ ))
do
    docker run -d --net primenet --ip 172.18.0.1$i --name ${artifactId}-$i -e SPRING_PROFILES_ACTIVE=dev ${artifactId}
done
```

#[[## To release without deploying straight to an ocp cluster]]#

```
mvn  -P k8s package
```

#[[## Push on dockerhub]]#

```
docker login
docker build -t ${artifactId} .
docker tag ${artifactId}:latest YOUR_REPO/${artifactId}:latest
```