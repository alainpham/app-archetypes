package x;

import java.io.Serializable;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.inject.Named;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.apache.camel.ProducerTemplate;

@ApplicationScoped
@Named("viewUpdate")
public class ViewUpdate {

    @Inject
    ProducerTemplate producer;

    void update(Serializable data,String type, Boolean notify, Boolean updateHeader, Boolean changeData,
            String dataOperationType, String targetTableId) throws JsonProcessingException {
        
        
        ObjectMapper objectMapper = new ObjectMapper();
        String value = objectMapper.writeValueAsString(SocketData.defaultSocketData(data, type, notify, updateHeader, changeData, dataOperationType, targetTableId));
        producer.sendBody("ahc-ws:{{quarkus.http.host}}:{{quarkus.http.port}}/websocket",value);


    }

}
