package com.example.GroupRecommend.controller;

import com.example.GroupRecommend.entity.RecommendGroup;
import com.example.GroupRecommend.exception.ResourceNotFoundException;
import com.example.GroupRecommend.repository.RecommendGroupRepository;
import com.example.GroupRecommend.repository.RecommendRestaurantRepository;
import com.example.GroupRecommend.repository.RecommendUserRepository;
import com.example.GroupRecommend.service.GroupService;
import com.example.GroupRecommend.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(GroupController.class)
class GroupControllerCreateGroupTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private GroupService groupService;
    @MockBean
    private UserService userService;
    @MockBean
    private RecommendGroupRepository groupRepository;
    @MockBean
    private RecommendUserRepository userRepository;
    @MockBean
    private RecommendRestaurantRepository recommendRestaurantRepository;

    private Map<String, Object> validRequestBody() {
        Map<String, Object> body = new HashMap<>();
        body.put("title", "找人一起吃飯");
        body.put("description", "期末考壓力大，想找人聊聊");
        body.put("purpose", "找一般朋友或新朋友");
        body.put("meetingPlace", "政大商院一樓");
        body.put("maxNumber", 5);
        body.put("price", 500.0);
        body.put("diningTime", System.currentTimeMillis());
        return body;
    }

    @Test
    void createGroup_validRequest_returns201() throws Exception {
        RecommendGroup saved = new RecommendGroup();
        saved.setId(10L);
        saved.setTitle("找人一起吃飯");
        when(groupService.createGroup(anyLong(), any())).thenReturn(saved);

        mockMvc.perform(post("/api/groups/{id}", 1L)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(validRequestBody())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.title").value("找人一起吃飯"));
    }

    // 照 CreatePage 實際送出的格式:數字來自 Input 是字串、時間是 ISO 字串、districts 是陣列
    @Test
    void createGroup_frontendPayload_returns201() throws Exception {
        when(groupService.createGroup(anyLong(), any())).thenReturn(new RecommendGroup());

        Map<String, Object> body = validRequestBody();
        body.put("maxNumber", "5");
        body.put("price", "500");
        body.put("diningTime", "2026-11-01T10:00:00.000Z");
        body.put("districts", Arrays.asList("大安區", "文山區"));

        mockMvc.perform(post("/api/groups/{id}", 1L)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated());
    }

    @Test
    void createGroup_districtsAsString_returns400() throws Exception {
        Map<String, Object> body = validRequestBody();
        body.put("districts", "大安區, 文山區");

        mockMvc.perform(post("/api/groups/{id}", 1L)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createGroup_missingTitle_returns400() throws Exception {
        Map<String, Object> body = validRequestBody();
        body.remove("title");

        mockMvc.perform(post("/api/groups/{id}", 1L)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createGroup_creatorNotFound_returns404() throws Exception {
        when(groupService.createGroup(anyLong(), any()))
                .thenThrow(new ResourceNotFoundException("User not found"));

        mockMvc.perform(post("/api/groups/{id}", 999L)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(validRequestBody())))
                .andExpect(status().isNotFound());
    }
}
