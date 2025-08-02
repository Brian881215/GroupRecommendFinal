package com.example.GroupRecommend.Controller;

import com.example.GroupRecommend.controller.GroupController;
import com.example.GroupRecommend.dto.RecommendGroupPhotoDTO;
import com.example.GroupRecommend.repository.RecommendGroupRepository;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class GroupControllerTest {

    @Autowired
    private RecommendGroupRepository groupRepository;

    @Autowired
    private GroupController groupController;

    private static final Logger logger = LoggerFactory.getLogger(GroupControllerTest.class);
    @Test
    public void testGetGroupById() {
        logger.info("測試開始：呼叫 groupController.getGroup(1L)");
        ResponseEntity<RecommendGroupPhotoDTO> response = groupController.getGroup(1L);
        logger.info("HTTP 狀態碼：{}", response.getStatusCode());
        assertEquals(HttpStatus.OK, response.getStatusCode());
        RecommendGroupPhotoDTO recommendGroupPhotoDTO = Objects.requireNonNull(response.getBody(), "Response body is null");
        logger.info("取得的群組標題：{}", recommendGroupPhotoDTO.getTitle());
        assertEquals("我的第一個群組", Objects.requireNonNull(response.getBody()).getTitle()); // 根據 DTO 欄位寫
    }
}
