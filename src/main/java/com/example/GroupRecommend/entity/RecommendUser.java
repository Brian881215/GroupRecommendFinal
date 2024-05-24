package com.example.GroupRecommend.entity;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.util.*;

@Entity
@Table(name = "recommend_users")
@Getter
@Setter
public class RecommendUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Lob  // 這個注解用於指定一個大對象，映射到 MySQL 的 LONGTEXT
    @Column(name = "photo", columnDefinition="LONGTEXT")
    private String photo;

    @Column(name = "name")
    private String name;

    @Column(name = "nickname")
    private String nickname;

    @Column(name = "email", unique = true)
    private String email;

    @Column(name = "bio")
    private String bio;

    @Column(name = "starSigns")
    private String starSigns;

    @Column(name = "gender")
    private String gender;

    @Column(name = "birthday")
    @Temporal(TemporalType.DATE)
    private Date birthday;

    @Column(name = "city")
    private String city;

    @Column(name = "title")
    private String title;

    @Column(name = "education")
    private String education;

    @Column(name = "grade")
    private String grade;

    @Column(name = "password")
    private String password;

    //一個user有加入的多個群組 多對多
    @ManyToMany(mappedBy = "users", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<RecommendGroup> groups;

    //一個user 可能有他創建的0到多個群組
    @OneToMany(mappedBy = "creator")  // 用户创建的群组
    private Set<RecommendGroup> createdGroups = new HashSet<>();

    private String joinRequestGroupIds = "";

    public void addJoinRequest(Long userId) {
        if (joinRequestGroupIds == null || joinRequestGroupIds.isEmpty()) {
            joinRequestGroupIds = userId.toString();
        } else {
            joinRequestGroupIds += "," + userId;
        }
    }

    @Lob  // 使用 TEXT 类型存储较大的 JSON 数据
    @Column(name = "expertise_ratings", columnDefinition = "TEXT")
    private String expertiseRatingsJson = "{}";

    @Lob
    @Column(name = "trust_ratings", columnDefinition = "TEXT")
    private String trustRatingsJson = "{}";

    private double TKI = 0.0;
    // 用于处理 JSON 数据的转换
//    public Map<String, Integer> getExpertiseRatings() {
//        return jsonToMap(expertiseRatingsJson);
//    }
    public Map<String, Double> getExpertiseRatings() {
        ObjectMapper mapper = new ObjectMapper();
        try {
            return mapper.readValue(expertiseRatingsJson, new TypeReference<Map<String, Double>>() {});
        } catch (Exception e) {
            throw new RuntimeException("Error converting JSON to Map", e);
        }
    }

    public void setExpertiseRatings(Map<String, Integer> ratings) {
        this.expertiseRatingsJson = mapToJson(ratings);
    }

    public Map<String, Integer> getTrustRatings() {
        ObjectMapper mapper = new ObjectMapper();
        try {
            return mapper.readValue(trustRatingsJson, new TypeReference<Map<String, Integer>>() {});
        } catch (Exception e) {
            throw new RuntimeException("Error converting JSON to Map", e);
        }
    }

    public void setTrustRatings(Map<String, Integer> ratings) {
        this.trustRatingsJson = mapToJson(ratings);
    }

    private static String mapToJson(Map<String, Integer> map) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.writeValueAsString(map);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error converting map to JSON", e);
        }
    }

}
