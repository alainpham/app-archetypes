package ${package};


import java.io.Serializable;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;



@Component
public class ViewUpdate {

	@Autowired
	WebSocketTextHandler webSocketTextHandler;

    public void update(Serializable data,String type, Boolean notify, Boolean updateHeader, Boolean changeData,
            String dataOperationType, String targetTableId) throws JsonProcessingException {
        
        ObjectMapper objectMapper = new ObjectMapper();
        String value = objectMapper.writeValueAsString(SocketData.defaultSocketData(data, type, notify, updateHeader, changeData, dataOperationType, targetTableId));
        webSocketTextHandler.sendMessageToAllClients(new TextMessage(value));

    }

    public void updateHeader(Serializable data,String type, String targetTableId) throws JsonProcessingException {
        update(data, type, true, true, false, null, targetTableId);
    }

    public void appendData(Serializable data,String type, String targetTableId) throws JsonProcessingException {
        update(data, type, true, true, true, SocketData.APPEND_DATA, targetTableId);
    }

    public void upsertData(Serializable data,String type, String targetTableId) throws JsonProcessingException{
        update(data, type, true, true, true, SocketData.UPSERT_DATA, targetTableId);
    }

    public void refreshData(Serializable data,String type, String targetTableId) throws JsonProcessingException{
        update(data, type, true, true, true, SocketData.REFRESH_DATA, targetTableId);
    }
    public void clearData(String type, String targetTableId) throws JsonProcessingException {
        update(null, type, false, false, true, SocketData.CLEAR_DATA, targetTableId);
    }

    
}
