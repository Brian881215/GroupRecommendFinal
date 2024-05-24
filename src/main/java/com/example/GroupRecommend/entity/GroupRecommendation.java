package com.example.GroupRecommend.entity;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;

@Getter
@Setter
@Table(name = "group_recommendation")
@Entity
public class GroupRecommendation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long groupId;
    private Long userId;
    private double recommendationScore1;
    private double recommendationScore2;
    private int loveCount1; // 推荐清单1的爱心数
    private int loveCount2; // 推荐清单2的爱心数
    private int groupDecision; // 最终选择的餐厅编号
}
