package com.example.GroupRecommend.config;

import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.web.socket.server.support.HttpSessionHandshakeInterceptor;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import java.util.Map;
import org.springframework.web.util.UriTemplate;

public class GroupHandshakeInterceptor implements HandshakeInterceptor {

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
        // 获取 groupId 参数
//        String groupId = getQueryParam(request, "groupId");

        String path = request.getURI().getPath();
//        System.out.println("Request Path: " + path);

//        String groupId = getPathVariable(request, "groupId");

        // 使用 UriTemplate 提取路径变量
        UriTemplate uriTemplate = new UriTemplate("/api/groups/ws/messages/{groupId}");
        Map<String, String> variables = uriTemplate.match(path);
        String groupId = variables.get("groupId");

        if (groupId != null) {
            attributes.put("groupId", groupId);
//            System.out.println("Extracted Group ID: " + groupId);
        }else {
//            System.out.println("Group ID is null");
        }
        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception ex) {
        // 可以在握手之后添加逻辑
    }

    // Helper method to get query parameter from ServerHttpRequest
//    private String getQueryParam(ServerHttpRequest request, String name) {
//        return request.getURI().getQuery() != null ?
//                java.util.Arrays.stream(request.getURI().getQuery().split("&"))
//                        .map(param -> param.split("="))
//                        .filter(pair -> pair[0].equals(name))
//                        .map(pair -> pair[1])
//                        .findFirst()
//                        .orElse(null) : null;
//    }
//    private String getPathVariable(ServerHttpRequest request, String name) {
//        String path = request.getURI().getPath();
//        String[] pathSegments = path.split("/");
//        for (int i = 0; i < pathSegments.length; i++) {
//            if (pathSegments[i].equals(name) && i + 1 < pathSegments.length) {
//                return pathSegments[i + 1];
//            }
//        }
//        return null;
//    }
}