#[[# Project]]# ${artifactId}

This project uses Quarkus, the Supersonic Subatomic Java Framework.

If you want to learn more about Quarkus, please visit its website: https://quarkus.io/ .

#[[## Running the application in dev mode]]#

You can run your application in dev mode that enables live coding using:
```
mvn quarkus:dev
```

Accessing the app : http://localhost:8080

Accessing SwaggerUi : http://localhost:8080/swagger-ui/

Accessing openapi spec of camel rests : http://localhost:8080/camel-openapi

Health UI : http://localhost:8080/health-ui/

Accessing metrics : http://localhost:8080/metrics

Metrics in json with filters on app metrics : `curl -H"Accept: application/json" localhost:8080/metrics/application`

#[[## Packaging and running the application]]#

The application can be packaged using `mvn package`.
It produces the `testing-1.0-SNAPSHOT-runner.jar` file in the `/target` directory.
Be aware that it’s not an _über-jar_ as the dependencies are copied into the `target/lib` directory.

The application is now runnable using `java -jar target/testing-1.0-SNAPSHOT-runner.jar`.

#[[## Creating a native executable]]#

You can create a native executable using: `mvn package -Pnative`.

Or, if you don't have GraalVM installed, you can run the native executable build in a container using: `mvn package -Pnative -Dquarkus.native.container-build=true`.

You can then execute your native executable with: `./target/testing-1.0-SNAPSHOT-runner`

If you want to learn more about building native executables, please consult https://quarkus.io/guides/building-native-image.

#[[## Run local container with specific network and IP address]]#

Optionally you can create a separate local docker network for this app

```
docker network create --driver=bridge --subnet=172.18.0.0/16 --gateway=172.18.0.1 primenet 
```

```
docker stop ${artifactId}
docker rm ${artifactId}
docker rmi ${artifactId}

docker build -f src/main/docker/Dockerfile.fast-jar -t ${artifactId}-fast .
docker build -f src/main/docker/Dockerfile.jvm -t ${artifactId} .
docker build -f src/main/docker/Dockerfile.native -t ${artifactId}-native .

docker run -d --net primenet --ip 172.18.0.10 --name ${artifactId} ${artifactId}
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
```

Choose one of methods
```
docker build -f src/main/docker/Dockerfile.fast-jar -t ${artifactId}-fast .
docker build -f src/main/docker/Dockerfile.jvm -t ${artifactId} .
docker build -f src/main/docker/Dockerfile.native -t ${artifactId}-native .```
```
```
for (( i=0; i<$NB_CONTAINERS; i++ ))
do
    docker run -d --net primenet --ip 172.18.0.1$i --name ${artifactId}-$i ${artifactId}
done

```


#[[## Push on dockerhub]]#

```
docker login
docker build -t ${artifactId} -f src/main/docker/Dockerfile.jvm .
docker tag ${artifactId}:latest YOUR_REPO/${artifactId}:latest
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

base64 tls/truststore.p12>tls/truststore.base64
base64 tls/keystore.p12>tls/keystore.base64

```