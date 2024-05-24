package com.example.GroupRecommend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class GroupRecommendApplication {

	public static void main(String[] args) {
		SpringApplication.run(GroupRecommendApplication.class, args);
	}

}
