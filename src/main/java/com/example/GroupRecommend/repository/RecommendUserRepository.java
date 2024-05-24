package com.example.GroupRecommend.repository;

import com.example.GroupRecommend.entity.RecommendUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RecommendUserRepository extends JpaRepository<RecommendUser, Long> {
//    RecommendUser findByEmail(String email);

    List<Long> findRequestedGroupIdsById(Long id);

    Optional<RecommendUser> findByEmail(String email);
//    RecommendUser findById(long id);
    //無需做，spring boot 已經提供Optional方法
}
