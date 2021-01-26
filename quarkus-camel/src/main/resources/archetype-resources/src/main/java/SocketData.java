package ${package};

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;
import javax.enterprise.context.ApplicationScoped;
import javax.inject.Named;

@ApplicationScoped
@Named("socketData")
public class SocketData implements Serializable{

    /**
     *
     */
    private static final long serialVersionUID = 1L;

    private String elementId;
    private Set<String> actions=new TreeSet<String>();
    private List<Serializable> data=new ArrayList<Serializable>();

    public SocketData defaultSocketData(Serializable data,String targetTableId){
        SocketData dataElement=new SocketData();
        dataElement.setElementId(targetTableId);
        dataElement.getActions().add("notify");
        dataElement.getActions().add("update-header");
        dataElement.getActions().add("append-data");
        dataElement.getData().add(data);
        return dataElement;
    }

    public String getElementId() {
        return elementId;
    }

    public void setElementId(String elementId) {
        this.elementId = elementId;
    }

    public Set<String> getActions() {
        return actions;
    }

    public void setActions(Set<String> actions) {
        this.actions = actions;
    }

    public List<Serializable> getData() {
        return data;
    }

    public void setData(List<Serializable> data) {
        this.data = data;
    }

    

    
}
