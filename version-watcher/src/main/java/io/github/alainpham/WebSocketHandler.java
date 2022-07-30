package io.github.alainpham;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import javax.enterprise.context.ApplicationScoped;
import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.server.ServerEndpoint;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


import javax.websocket.Session;

@ServerEndpoint("/websocket")
@ApplicationScoped
public class WebSocketHandler {

    private Set< Session> sessions = Collections.synchronizedSet(new HashSet<Session>());
    private static final Logger logger = LoggerFactory.getLogger(WebSocketHandler.class);

    @OnOpen
    public void onOpen(Session session) {
        sessions.add(session);
        logger.info(session.getId() + " connected");
    }

    @OnClose
    public void onClose(Session session) {
        sessions.remove(session);
        logger.info(session.getId() + " disconnected");
    }

    @OnError
    public void onError(Session session, Throwable throwable) {
        sessions.remove(session);
        logger.info(session.getId() + " disconnected");
    }

    @OnMessage
    public void onMessage(String message) {
        broadcast(message);
    }

    private void broadcast(String message) {
        sessions.forEach(s -> {
            s.getAsyncRemote().sendObject(message, result ->  {
                if (result.getException() != null) {
                    logger.error("unable to send message",result.getException());
                }
            });
        });
    }

}
