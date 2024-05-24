package com.example.GroupRecommend.utility;

import lombok.Getter;

@Getter
public enum GroupPurpose {
    FIND_NEW_FRIENDS("找一般朋友或新朋友"),
    SOLVE_PROBLEMS("為了互相解決特定問題"),
    FIND_MENTORS("學長姐學弟妹或是上對下關係的人"),
    DINE_WITH_LOVED_ONES("與好朋友，家人，或是伴侶");

    private final String description;

    GroupPurpose(String description) {
        this.description = description;
    }

}
