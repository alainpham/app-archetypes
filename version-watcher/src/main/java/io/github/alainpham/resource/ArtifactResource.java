package io.github.alainpham.resource;

import java.util.List;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.inject.Named;
import javax.persistence.EntityManager;
import javax.transaction.Transactional;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import com.fasterxml.jackson.core.JsonProcessingException;

import org.apache.camel.ProducerTemplate;

import io.github.alainpham.ViewUpdate;
import io.github.alainpham.model.Artifact;

@Path("/artifacts")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Transactional
@ApplicationScoped
@Named("artifactResource")
public class ArtifactResource {

    @Inject
    EntityManager em;

    @Inject
    ProducerTemplate producer;
    
    @Inject
    ViewUpdate viewUpdate;

    @GET
    @Path("/check")
    public List<Artifact> check(){
        List<Artifact> artifacts = Artifact.listAll();
        for (Artifact artifact : artifacts) {
            // get current resource where version is written
            String response = producer.requestBody(artifact.currentVersionResource,null,String.class);

            // extract version from resource
            artifact.currentVersion = producer.requestBody(artifact.currentVersionExpression, response, String.class);
            
            System.out.println("current version " + artifact.currentVersion);

            if(artifact.coordinates.startsWith("mvn:")){
                String groupId = artifact.coordinates.split(":")[1].replaceAll("\\.", "/");
                String artifactId = artifact.coordinates.split(":")[2];
                String artifactResource = "https://repo.maven.apache.org/maven2/" + groupId + "/" + artifactId + "/maven-metadata.xml";
                String artifactResourceContent = producer.requestBody(artifactResource,null,String.class);

                String xpath = "language:xpath://version[matches(.,'"+ artifact.latestVersionFilter +"')][last()]/text()";
                System.out.println("xpath " + xpath);

                String latestVersion = producer.requestBody("language:xpath://version[matches(.,'"+ artifact.latestVersionFilter +"')][last()]/text()",artifactResourceContent,String.class);
                artifact.latestAndGreatest = producer.requestBody("language:xpath://latest/text()",artifactResourceContent,String.class);
                System.out.println("latest version " + latestVersion);
                artifact.latestVersion = latestVersion;

                try {
                    viewUpdate.upsertData(artifact,"artifact","state-table");
                } catch (JsonProcessingException e) {
                    e.printStackTrace();
                }
            }

        }
        return artifacts;
    }

    @GET
    public List<Artifact> getAllArtifacts()  {
        List<Artifact> Artifacts = Artifact.listAll();
        return Artifacts;
    }

    @POST
    public Artifact createNewArtifact(Artifact artifact){
        artifact.persist();
        return artifact;
    }

    @POST
    @Path("/init")
    public List<Artifact> loadArtifacts(List<Artifact> artifacts){


        for (Artifact artifact : artifacts) {
            em.merge(artifact);
        }

        return artifacts;
    }

}
