#[[# Spring Boot with camel and other useful things]]# ${artifactId} 

#[[## To build this project use]]#

```
mvn install
```

#[[## To run this project with Maven use]]#

```
mvn spring-boot:run
```


#[[## For testing]]#

```
curl http://localhost:8090/camel/api-docs
curl http://localhost:8090/camel/ping
```


#[[## Acces Swagger UI with definition]]#

```
http://localhost:8090/webjars/swagger-ui/${swagger-ui-version}/index.html?url=/camel/api-docs
```

#[[## Call the ping rest operation]]#
```
curl http://localhost:8090/camel/restsvc/ping
```

#[[## Run local container with specific network and IP address]]#

Optionally you can create a separate local docker network for this app

```
docker network create --driver=bridge --subnet=172.18.0.0/16 --gateway=172.18.0.1 primenet 
```

```
docker stop ${artifactId}
docker rm ${artifactId}
docker rmi ${artifactId}
docker build -t ${artifactId} .
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

for (( i=0; i<$NB_CONTAINERS; i++ ))
do
    docker run -d --net primenet --ip 172.18.0.1$i --name ${artifactId}-$i ${artifactId}
done
```