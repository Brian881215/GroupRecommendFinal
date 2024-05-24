package com.example.GroupRecommend.repository;

import com.example.GroupRecommend.entity.RecommendGroup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RecommendGroupRepository extends JpaRepository<RecommendGroup, Long> {
    List<RecommendGroup> findByCreatorIdNot(Long creatorId);

    List<RecommendGroup> findByCreatorId(Long id);
    // 定義需要的查詢方法
}