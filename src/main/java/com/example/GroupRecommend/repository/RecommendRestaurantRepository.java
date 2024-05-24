package com.example.GroupRecommend.repository;

import com.example.GroupRecommend.entity.RecommendRestaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface RecommendRestaurantRepository extends JpaRepository<RecommendRestaurant, Long> {

    @Query("SELECT r FROM RecommendRestaurant r WHERE r.district IN :districts AND r.averageCost <= :maxCost")
    List<RecommendRestaurant> findByDistrictsAndMaxCost(List<String> districts, double maxCost);

    List<RecommendRestaurant> findByIdIn(List<Long> ids);
}
