package com.example.GroupRecommend.service;

import com.example.GroupRecommend.dto.UserProgressDTO;
import com.example.GroupRecommend.entity.RecommendGroup;
import com.example.GroupRecommend.entity.RecommendUser;
import com.example.GroupRecommend.repository.RecommendGroupRepository;
import com.example.GroupRecommend.repository.RecommendUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.util.Map;

import java.util.List;

import java.util.Optional;

// UserService.java
@Service
public class UserService {
    // 这里是伪代码，你需要替换为实际的数据库访问代码
    @Autowired
    private RecommendUserRepository recommendUserRepository;

    @Autowired
    private RecommendGroupRepository recommendGroupRepository;

    private ObjectMapper objectMapper = new ObjectMapper();
    public RecommendUser findByEmail(String email) {
        // 实现查找用户逻辑
//        return recommendUserRepository.findByEmail(email); // 假设用户存在
        Optional<RecommendUser> userOpt = recommendUserRepository.findByEmail(email);
        return userOpt.orElse(null);
    }
    public String getUserJoinRequests(Long userId) {
        // 假设 User 对象关联了 Group 对象，可以直接调用 repository 查询
        RecommendUser user = recommendUserRepository.findById(userId).orElseThrow(() -> new RuntimeException("Group not found"));
        return user.getJoinRequestGroupIds();
    }
    public boolean checkPassword(String rawPassword, String encryptedPassword) {
        // 实现密码匹配逻辑
        // 在生产环境中，你应该使用密码哈希函数如BCrypt
        return rawPassword.equals(encryptedPassword);
    }

    public boolean checkEmailExistence(String email) {
        return recommendUserRepository.findByEmail(email).isPresent();
    }

    public UserProgressDTO getProgress(Long id) {
        UserProgressDTO userProgressDTO = new UserProgressDTO();
        userProgressDTO.setCountCreated(recommendGroupRepository.findByCreatorId(id).size());
        return userProgressDTO;
    }

    public double getAverageExpertise(String expertiseRatingsJson) throws IOException {
        Map<String, Double> ratings = objectMapper.readValue(expertiseRatingsJson, new TypeReference<Map<String, Double>>() {});
        return ratings.values().stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
    }

    public double getTrustRatingForPurpose(String trustRatingsJson, String purpose) throws IOException {
        Map<String, Double> ratings = objectMapper.readValue(trustRatingsJson, new TypeReference<Map<String, Double>>() {});
//        for (Map.Entry<String, Double> entry : ratings.entrySet()) {
//            System.out.println("Key: " + entry.getKey() + ", Value: " + entry.getValue());
//        }
        return ratings.getOrDefault(purpose, 0.0);
    }
}
