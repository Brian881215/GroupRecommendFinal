package com.example.GroupRecommend.repository;

import com.example.GroupRecommend.entity.RecommendUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RecommendUserRepository extends JpaRepository<RecommendUser, Long> {

    List<Long> findRequestedGroupIdsById(Long id);
    Optional<RecommendUser> findByEmail(String email);
}
