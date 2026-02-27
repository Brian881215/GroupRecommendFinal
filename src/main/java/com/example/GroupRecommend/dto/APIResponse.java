package com.example.GroupRecommend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class APIResponse {
    private String message;
    public APIResponse(String message){
        this.message = message;
    }
}
