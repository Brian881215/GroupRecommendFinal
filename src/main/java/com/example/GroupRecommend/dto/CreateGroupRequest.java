package com.example.GroupRecommend.dto;

import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.Min;
import javax.validation.constraints.Max;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.util.Date;
import java.util.List;

@Getter
@Setter
public class CreateGroupRequest {

    @NotBlank
    private String title;

    @Size(max = 10000)
    private String description;

    @NotBlank
    private String purpose;

    private String photo;

    @NotBlank
    private String meetingPlace;

    @NotNull
    @Min(2)
    @Max(10)
    private Integer maxNumber;

    private List<String> districts;

    @NotNull
    @Min(100)
    private Double price;

    @NotNull
    private Date diningTime;
}
