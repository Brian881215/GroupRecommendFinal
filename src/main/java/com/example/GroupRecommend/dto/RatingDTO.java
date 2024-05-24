package com.example.GroupRecommend.dto;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.Lob;
import java.util.Map;

@Getter
@Setter
public class RatingDTO {
    private String userId;
    private Map<String, Integer> expertiseRatings;
    private Map<String, Integer> trustRatings;
//    private String expertiseRatingsJson;
//    private String trustRatingsJson;

//    public Map<String, Integer> getExpertiseRatings() {
//        ObjectMapper mapper = new ObjectMapper();
//        try {
//            return mapper.readValue(expertiseRatingsJson, new TypeReference<Map<String, Integer>>() {
//            });
//        } catch (Exception e) {
//            throw new RuntimeException("Error converting JSON to Map", e);
//        }
//    }
//
//    public Map<String, Integer> getTrustRatings() {
//        ObjectMapper mapper = new ObjectMapper();
//        try {
//            return mapper.readValue(trustRatingsJson, new TypeReference<Map<String, Integer>>() {});
//        } catch (Exception e) {
//            throw new RuntimeException("Error converting JSON to Map", e);
//        }
//    }

}
