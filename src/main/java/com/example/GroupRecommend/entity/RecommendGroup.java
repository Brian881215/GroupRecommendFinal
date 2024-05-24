package com.example.GroupRecommend.entity;

import com.example.GroupRecommend.views.Views;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonView;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.util.*;
import java.util.stream.Collectors;

@Entity
@Table(name = "recommend_group")
@Getter
@Setter
public class RecommendGroup {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 10000) // 假設description不會超過10000字符
    private String description;

    @Column(name = "photo", columnDefinition="LONGTEXT")
    private String photo;
//    @Lob
//    @Column(columnDefinition = "TEXT") // 用於存儲大文本數據
//    private String photo; // Base64 編碼的圖片數據
//    @Column
//    private String districts;
    @Lob
    @Column
    private String districts; // 假設這是一個字符串列表

    @Column
    private String meetingPlace;

    @Column
    private Integer maxNumber;

//    @ElementCollection
//    private List<String> districts; // 假設這是一個字符串列表
    @Column
    private Double price;

    @Temporal(TemporalType.TIMESTAMP)
    private Date diningTime;

    //一個群組裡面可能會有多個users
    @ManyToMany
    @JoinTable(
            name = "group_users",
            joinColumns = @JoinColumn(name = "group_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
//    @JsonView(Views.Public.class)
    // @JsonView(Views.Internal.class) // 只有在Internal视图中才包含users
    @JsonIgnore  // 阻止序列化用户
    private Set<RecommendUser> users;  // Users part of this group

    //一個群組只能有一個creator創建，但一個creator(RecommendUser)可以創多個群組
    @ManyToOne
    @JoinColumn(name = "creator_id")  // 添加这个字段来指向创建者
//    @JsonView(Views.Internal.class)
//    @JsonView(Views.Public.class)
     @JsonIgnore
    private RecommendUser creator;

    @Lob
    @Column(length = 10000) // 設置足夠大的長度
    private String messages = "";


    public void addMessage(String message){
        if (this.messages == null) {
            this.messages = "";
        }
        if(!this.messages.isEmpty()){
            this.messages += ", ";
        }
        this.messages += message;
    }

    private String purpose;

    private String joinRequestUserIds;

    public void addJoinRequest(Long userId) {
        if (joinRequestUserIds == null || joinRequestUserIds.isEmpty()) {
            joinRequestUserIds = userId.toString();
        } else {
            joinRequestUserIds += "," + userId;
        }
    }

    public void removeJoinRequest(Long userId) {
        if (joinRequestUserIds != null && !joinRequestUserIds.isEmpty()) {
            List<String> ids = new ArrayList<>(Arrays.asList(joinRequestUserIds.split(",")));
            ids.remove(userId.toString());
            joinRequestUserIds = String.join(",", ids);
        }
    }

    public List<Long> getJoinRequestUserIds() {
        if (joinRequestUserIds == null || joinRequestUserIds.isEmpty()) {
            return new ArrayList<>();
        }
        return Arrays.stream(joinRequestUserIds.split(","))
                .map(Long::parseLong)
                .collect(Collectors.toList());
    }

    @Column(nullable = false)
    private boolean recommendationFlag;

    @Column(nullable = false)
    private boolean submitFlag;

    private String recommendIds;

    private String recommend2Ids;

}
