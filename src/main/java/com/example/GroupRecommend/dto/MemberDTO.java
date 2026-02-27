package com.example.GroupRecommend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MemberDTO {
    private Long userId;
    private String userName;
    public MemberDTO(Long userId, String userName) {
        this.userId = userId;
        this.userName = userName;
    }
}
