package com.example.GroupRecommend.config;

import com.example.GroupRecommend.entity.RecommendGroup;
import com.example.GroupRecommend.repository.RecommendGroupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;
import java.util.concurrent.LinkedBlockingQueue;

import org.springframework.web.socket.CloseStatus;

@Component
public class GroupChatHandler extends TextWebSocketHandler {

    private ConcurrentHashMap<String, CopyOnWriteArraySet<WebSocketSession>> groupSessions = new ConcurrentHashMap<>();
    private final RecommendGroupRepository groupRepository;
    private final ConcurrentHashMap<String, BlockingQueue<String>> messageQueues = new ConcurrentHashMap<>();
    private final ThreadPoolTaskExecutor taskExecutor;

    @Autowired
    public GroupChatHandler(RecommendGroupRepository groupRepository, ThreadPoolTaskExecutor taskExecutor) {
        this.groupRepository = groupRepository;
        this.taskExecutor = taskExecutor;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String groupId = (String) session.getAttributes().get("groupId");
        if (groupId == null) {
//            System.err.println("groupId is null in afterConnectionEstablished");
            return;
        }
        groupSessions.computeIfAbsent(groupId, k -> new CopyOnWriteArraySet<>()).add(session);
        //messageQueue機制
        messageQueues.computeIfAbsent(groupId, k -> new LinkedBlockingQueue<>());
//        System.out.println("New connection established for group: " + groupId);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String groupId = (String) session.getAttributes().get("groupId");
//        System.out.println("handleText GroupId:"+ groupId);
        if (groupId == null) {
//            System.err.println("groupId is null in handleTextMessage");
            return;
        }
//        System.out.println("handleText GroupId long:"+ Long.parseLong(groupId));
        // Add message to queue
        messageQueues.get(groupId).add(message.getPayload());

        // Save message to database
//        Long groupIdLong = Long.parseLong(groupId);
//        RecommendGroup group = groupRepository.findById(groupIdLong).orElse(null);
//        if (group != null) {
//            group.addMessage(message.getPayload());
//            groupRepository.save(group);
//        }

        for (WebSocketSession s : groupSessions.getOrDefault(groupId, new CopyOnWriteArraySet<>())) {
            s.sendMessage(message);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String groupId = (String) session.getAttributes().get("groupId");
        if (groupId == null) {
//            System.err.println("groupId is null in afterConnectionClosed");
            return;
        }
        groupSessions.getOrDefault(groupId, new CopyOnWriteArraySet<>()).remove(session);
//        System.out.println("Connection closed for group: " + groupId);
    }

    // 定期从队列中读取消息并写入数据库
    @Scheduled(fixedRate = 5000) // 每5秒执行一次
    public void saveMessages() {
        for (String groupId : messageQueues.keySet()) {
            BlockingQueue<String> queue = messageQueues.get(groupId);
            List<String> messages = new ArrayList<>();
            queue.drainTo(messages);
            if (!messages.isEmpty()) {
                taskExecutor.execute(() -> {
                    Long groupIdLong = Long.parseLong(groupId);
                    RecommendGroup group = groupRepository.findById(groupIdLong).orElse(null);
                    if (group != null) {
                        messages.forEach(group::addMessage);
                        groupRepository.save(group);
                    }
                });
            }
        }
    }
}