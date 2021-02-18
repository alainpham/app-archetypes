package ${package};


import org.apache.camel.Body;
import org.apache.camel.Exchange;
import org.apache.camel.ExchangeProperty;
import org.apache.camel.Header;
import org.apache.camel.MessageHistory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import net.logstash.logback.argument.StructuredArgument;

import static net.logstash.logback.argument.StructuredArguments.*;

import java.io.Serializable;
import java.util.Date;
import java.util.LinkedList;


/**
 * A sample transform
 */
@Component
public class EventLogger {

    private StructuredArgument safeBody(Object body){
        if (!(body instanceof Serializable ) ){
            return null;
        }else{
            return kv("body",body);
        }
    }

    public void logStartAndBody(Exchange exchange, @Body Object body) {

                
        Logger logger;
        logger = LoggerFactory.getLogger("eventLogger." + exchange.getContext().getName() + "." + exchange.getFromRouteId());
        Date logDate = new Date();
        logger.info("Route has started",
        kv("state","started"),
        kv("startDate",exchange.getCreated()),
        kv("elapsed", logDate.getTime() - exchange.getCreated()),
        safeBody(body),
        kv("camel.breadcrumbId", exchange.getExchangeId()),
        kv("camel.fromRouteId",exchange.getFromRouteId()),
        kv("camel.routeId",exchange.getFromRouteId()),
        kv("camel.contextId",exchange.getContext().getName())
        );
    }

    public void logElapsedTimeAndBody(Exchange exchange,
            @ExchangeProperty(value = Exchange.EXCEPTION_CAUGHT) Exception exception, @Body Object body
            ) {

        Logger logger;
        logger = LoggerFactory.getLogger("eventLogger." + exchange.getContext().getName() + "." + exchange.getFromRouteId());
        Date logDate = new Date();
        
        if (exception==null){
                logger.info(null,
                kv("state","success"),
                kv("startDate",exchange.getCreated()),
                kv("elapsed", logDate.getTime() - exchange.getCreated()),
                safeBody(body),
                kv("camel.breadcrumbId", exchange.getExchangeId()),
                kv("camel.fromRouteId",exchange.getFromRouteId()),
                kv("camel.routeId",exchange.getFromRouteId()),
                kv("camel.contextId",exchange.getContext().getName())
                );
            }
        else
            {
                logger.error(exception.getMessage(),
                kv("state","error"),
                kv("startDate",exchange.getCreated()),
                kv("elapsed", logDate.getTime() - exchange.getCreated()),
                kv("camel.breadcrumbId", exchange.getExchangeId()),
                kv("camel.fromRouteId",exchange.getFromRouteId()),
                kv("camel.routeId",exchange.getFromRouteId()),
                kv("camel.contextId",exchange.getContext().getName())
                );
            }


    }
    
}
