package com.example.GroupRecommend.entity;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;

@Getter
@Setter
@Entity
@Table(name = "recommend_restaurant")
public class RecommendRestaurant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private double averageCost;

    @Column(nullable = false)
    private String district;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String openHours;

    @Column(nullable = false)
    private double rating;

    @Column(nullable = false)
    private int reviewCount;

    @Column(nullable = false)
    private String link;

    @Column(nullable = false)
    private String tags;

    private String classification;


}
