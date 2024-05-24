package com.example.GroupRecommend.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.Date;
import java.util.List;

@Getter
@Setter
public class RecommendGroupDTO {
    //recommendGroup
    private Long id;
    private String title;
    private String description;
//    private String photo;
    private String meetingPlace;
    private Integer maxNumber;
    private Double price;
    private Date diningTime;
    private Long creatorId;
    private int memberCount;
    private List<String> messages; // 消息可以作为列表返回
    private List<Long> joinRequestUserIds;
    //recommendUser
    private String userName;
    private String purpose;

}
