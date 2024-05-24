package com.example.GroupRecommend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final GroupChatHandler groupChatHandler;

    @Autowired
    public WebSocketConfig(GroupChatHandler groupChatHandler) {
        this.groupChatHandler = groupChatHandler;
    }
//    @Override
//    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
//        registry.addHandler(new GroupChatHandler(), "/ws/groups/{groupId}/messages").setAllowedOrigins("*");
//    }
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(groupChatHandler, "/api/groups/ws/messages/{groupId}")
                .setAllowedOrigins("*")
                .addInterceptors(new GroupHandshakeInterceptor());
    }
}