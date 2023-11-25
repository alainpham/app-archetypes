#[[# Project]]# ${artifactId}

Optionally you can create a separate local docker network for this app

```
docker network create --driver=bridge --subnet=172.18.0.0/16 --gateway=172.18.0.1 primenet 
```

Launch project

```

mvn package

docker stop ${artifactId}
docker rm ${artifactId}
docker rmi ${artifactId}

docker build -f src/main/docker/Dockerfile.multiarch -t ${artifactId}:${version} .

docker run --rm ${artifactId}:${version}

docker run -d --net primenet --ip 172.18.0.10 --name ${artifactId} ${artifactId}:${version}
```

Launch multple instaces

```
NB_CONTAINERS=2

for (( i=0; i<$NB_CONTAINERS; i++ ))
do
    docker run -d --net primenet --ip 172.18.0.1$i --name ${artifactId}-$i ${artifactId}:${version}
done

for (( i=0; i<$NB_CONTAINERS; i++ ))
do
   docker stop ${artifactId}-$i
   docker rm ${artifactId}-$i
done

```


#[[## Push on registry and deploy on kube]]#

change to your registry and ingress root domain

```

export localregistry=registry.work.lan
export kube_ingress_root_domain=kube.loc 

mvn clean package -DskipTests

docker build -f src/main/docker/Dockerfile.multiarch -t ${artifactId}:${version} .
docker tag ${artifactId}:${version} ${localregistry}/${artifactId}:${version}
docker push ${localregistry}/${artifactId}:${version}

envsubst < src/main/kube/deploy.envsubst.yaml | kubectl delete -f -
envsubst < src/main/kube/deploy.envsubst.yaml | kubectl apply -f -

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