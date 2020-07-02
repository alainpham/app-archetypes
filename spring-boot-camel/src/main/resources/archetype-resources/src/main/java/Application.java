package ${package};
#if (${cxfSupport} == 'true')
import org.apache.cxf.transport.servlet.CXFServlet;
#end
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ImportResource;
import org.springframework.beans.factory.annotation.Value;

import org.apache.camel.component.hystrix.metrics.servlet.HystrixEventStreamServlet;
import org.springframework.boot.web.servlet.ServletRegistrationBean;

@SpringBootApplication
public class Application {

#if (${cxfSupport} == 'true')

    @Value("${cxf.path}")
    private String cxfPath;

    @Bean
    public ServletRegistrationBean dispatcherServlet() {
        return new ServletRegistrationBean(new CXFServlet(), cxfPath+"/*");
    }

#end
    // must have a main method spring-boot can run
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

    @Bean
    ServletRegistrationBean hystrixServletRegistrationBean() {
        ServletRegistrationBean mapping = new ServletRegistrationBean();
        mapping.setServlet(new HystrixEventStreamServlet());
        mapping.addUrlMappings("/hystrix.stream");
        mapping.setName("HystrixEventStreamServlet");

        return mapping;
    }


}