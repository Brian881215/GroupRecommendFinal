package com.example.GroupRecommend.repository;

import com.example.GroupRecommend.entity.GroupRecommendation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GroupRecommendationRepository extends JpaRepository<GroupRecommendation, Long> {
    // 你可以根据需要添加自定义查询方法
    Optional<GroupRecommendation> findByGroupIdAndUserId(Long groupId, Long userId);
}