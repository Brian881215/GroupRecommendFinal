package com.example.GroupRecommend.service;

import com.example.GroupRecommend.entity.GroupRecommendation;
import com.example.GroupRecommend.repository.GroupRecommendationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class GroupRecommendationService {
    @Autowired
    private GroupRecommendationRepository repository;

    public GroupRecommendation saveRecommendation(GroupRecommendation recommendation) {
        return repository.save(recommendation);
    }
}
