package com.example.GroupRecommend.dto;

import com.example.GroupRecommend.entity.RecommendGroup;
import com.example.GroupRecommend.entity.RecommendUser;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
public class MemberDTO {
    private Long userId;
    private String userName;
//    private Set<RecommendUser> users;
    // 构造函数
    public MemberDTO(Long userId, String userName) {
        this.userId = userId;
        this.userName = userName;
//        this.users = users;
    }
}
