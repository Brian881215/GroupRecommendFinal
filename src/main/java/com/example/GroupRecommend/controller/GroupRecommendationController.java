package com.example.GroupRecommend.controller;

import com.example.GroupRecommend.entity.GroupRecommendation;
import com.example.GroupRecommend.repository.GroupRecommendationRepository;
import com.example.GroupRecommend.service.GroupRecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/groups")
@CrossOrigin(origins = "*")
public class GroupRecommendationController {

    @Autowired
    private GroupRecommendationService recommendationService;

    @Autowired
    private GroupRecommendationRepository groupRecommendationRepository;

    @PostMapping("/recommendations")
    public ResponseEntity<GroupRecommendation> saveRecommendation(@RequestBody GroupRecommendation recommendation) {
        GroupRecommendation savedRecommendation = recommendationService.saveRecommendation(recommendation);
        return ResponseEntity.ok(savedRecommendation);
    }

//    @GetMapping("/recommendations/{groupId}")
//    public ResponseEntity<?> getRecommendation(@PathVariable Long groupId, @RequestParam Long userId) {
//        Optional<GroupRecommendation> recommendation = groupRecommendationRepository.findByGroupIdAndUserId(groupId, userId);
//        return recommendation.map(ResponseEntity::ok)
//                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("error", "Recommendation not found")));
//    }
    @GetMapping("/recommendations/{groupId}")
    public ResponseEntity<?> getRecommendation(@PathVariable Long groupId, @RequestParam Long userId) {
        Optional<GroupRecommendation> recommendation = groupRecommendationRepository.findByGroupIdAndUserId(groupId, userId);
        if (recommendation.isPresent()) {
            return ResponseEntity.ok(recommendation.get());
        } else {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Recommendation not found");
            return ResponseEntity.status(404).body(errorResponse);
    }
}

}
