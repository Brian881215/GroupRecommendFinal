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
}
