package ${package};

import java.util.Map;
import java.util.TreeMap;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.eclipse.microprofile.config.ConfigProvider;

@Path("/uiconfig")
public class UiConfigRestController {
    private Map<String,String> uiConfig;

    public UiConfigRestController() {
        uiConfig = new TreeMap<String,String>();
        uiConfig.put("theme", ConfigProvider.getConfig().getValue("theme",String.class));
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Map<String,String> getUiConfig(){
        return uiConfig;
    }
}
