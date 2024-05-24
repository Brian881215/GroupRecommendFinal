package com.example.GroupRecommend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MemberGroupDTO {
    private Long userId;
    private String userName;

    private int maxNumber;
    private int memberCount;
    public MemberGroupDTO(Long userId, String userName) {
        this.userId = userId;
        this.userName = userName;
    }
}
