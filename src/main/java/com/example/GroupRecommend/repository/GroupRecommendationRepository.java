package com.example.GroupRecommend.repository;

import com.example.GroupRecommend.entity.GroupRecommendation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GroupRecommendationRepository extends JpaRepository<GroupRecommendation, Long> {
   //某groupId底下的所有user的推薦清單會是一樣的，所以好像不需要多放userId
    Optional<GroupRecommendation> findByGroupIdAndUserId(Long groupId, Long userId);
}