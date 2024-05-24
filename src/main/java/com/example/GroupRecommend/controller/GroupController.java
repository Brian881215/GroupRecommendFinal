package com.example.GroupRecommend.controller;

import com.example.GroupRecommend.dto.MemberDTO;
import com.example.GroupRecommend.dto.MemberGroupDTO;
import com.example.GroupRecommend.dto.RecommendGroupDTO;
import com.example.GroupRecommend.dto.RecommendGroupPhotoDTO;
import com.example.GroupRecommend.entity.RecommendGroup;
import com.example.GroupRecommend.entity.RecommendRestaurant;
import com.example.GroupRecommend.entity.RecommendUser;
import com.example.GroupRecommend.repository.RecommendGroupRepository;
import com.example.GroupRecommend.repository.RecommendRestaurantRepository;
import com.example.GroupRecommend.repository.RecommendUserRepository;
import com.example.GroupRecommend.service.GroupService;
import com.example.GroupRecommend.service.UserService;
import com.example.GroupRecommend.views.Views;
import com.fasterxml.jackson.annotation.JsonView;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/groups")
@CrossOrigin(origins = "*")
public class GroupController {
    @Autowired
    private RecommendGroupRepository groupRepository;

    @Autowired
    private RecommendUserRepository userRepository;

    @Autowired
    private RecommendRestaurantRepository recommendRestaurantRepository;

    @Autowired
    private GroupService groupService;

    @Autowired
    private UserService userService;
    //    @Transactional
    @PostMapping("/{id}")
//    @JsonView(Views.Internal.class) // 使用Public视图，users不会被序列化
    public ResponseEntity<RecommendGroup> createGroup(@PathVariable("id") Long id, @RequestBody RecommendGroup group) {
        //你首先保存了 group 实体，然后添加了用户到 group。这种顺序在某些情况下可能会导致 Hibernate 或 JPA
        //框架无法正确更新关系表。尤其是在新建实体的时候，先保存实体再建立关联可能导致关联未能持久化。
        Set<RecommendUser> users = new HashSet<>();
        RecommendUser user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        users.add(user);
        group.setUsers(users);
        group.setCreator(user);

        RecommendGroup savedGroup = groupRepository.save(group);
        return new ResponseEntity<>(savedGroup, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RecommendGroupPhotoDTO> getGroup(@PathVariable("id") Long id) {
        RecommendGroup group = groupRepository.findById(id).orElse(null);
        RecommendGroupPhotoDTO DTOGroup;
        if(group == null){
            return  ResponseEntity.notFound().build();
        }else {
           DTOGroup = groupService.convertToDtoPhoto(group);
        }
       return ResponseEntity.ok(DTOGroup);
//        return groupRepository.findById(id)
//                .map(ResponseEntity::ok)  // 如果用戶存在，返回200 OK
//                .orElseGet(() -> ResponseEntity.notFound().build());  // 如果用戶不存在，返回404 Not Found
    }

    @GetMapping("/not-created-by/{creatorId}")
    public ResponseEntity<List<RecommendGroupPhotoDTO>> getGroupNotCreatedBy (@PathVariable("creatorId") Long creatorId){
        List<RecommendGroup> groups = groupRepository.findByCreatorIdNot(creatorId);
        List<RecommendGroupPhotoDTO> DTOGroups = new ArrayList<RecommendGroupPhotoDTO>();
        for(RecommendGroup group:  groups){
            DTOGroups.add(groupService.convertToDtoPhoto(group));
        }
        return ResponseEntity.ok(DTOGroups);
    }

    @GetMapping("/created-by/{creatorId}")
    public ResponseEntity<List<RecommendGroupPhotoDTO>> getGroupCreatedBy (@PathVariable("creatorId") Long creatorId){
        List<RecommendGroup> groups = groupRepository.findByCreatorId(creatorId);
        List<RecommendGroupPhotoDTO> DTOGroups = new ArrayList<RecommendGroupPhotoDTO>();
        for(RecommendGroup group:  groups){
            DTOGroups.add(groupService.convertToDtoPhoto(group));
        }
        return ResponseEntity.ok(DTOGroups);
    }

    @PostMapping("/messages/{groupId}")
    public ResponseEntity<?> addMessageToGroup(@PathVariable Long groupId, @RequestBody String message){
        RecommendGroup group = groupRepository.findById(groupId).orElse(null);
        if(group == null){
            return ResponseEntity.status(404).body(Map.of("error", "Group not found"));
        }
        group.addMessage(message);
        groupRepository.save(group);
        //回傳原本的message就可以了{ ....}
        return ResponseEntity.ok(message);
    }
    @GetMapping("/messages/{groupId}")
    public ResponseEntity<?> getMessages(@PathVariable Long groupId){
        return groupRepository.findById(groupId)
                .map(group -> ResponseEntity.ok().body(group.getMessages()))
                .orElse(ResponseEntity.notFound().build());
    }

    // 获取加入请求
    @GetMapping("/join-requests/{groupId}")
    public ResponseEntity<List<MemberGroupDTO>> getJoinRequests(@PathVariable Long groupId) {
        RecommendGroup currentGroup = groupRepository.findById(groupId).orElse(null);

        List<Long> requests = groupService.getJoinRequests(groupId);
//        System.out.println(requests.size());
        for(Long i : requests){
//            System.out.print(i+ ", ");
        }
        List<MemberGroupDTO> userDTOs = new ArrayList<MemberGroupDTO>();
        for(Long userId : requests){
            RecommendUser user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
            MemberGroupDTO memberDTO = new MemberGroupDTO(userId, user.getName());
            if(currentGroup != null) {
//                System.out.println("Count max number:"+currentGroup.getMaxNumber());
//                System.out.println("Count current number:"+currentGroup.getUsers().size());
                memberDTO.setMaxNumber(currentGroup.getMaxNumber());
                memberDTO.setMemberCount(currentGroup.getUsers().size());
            }
            userDTOs.add(memberDTO);
        }
        return ResponseEntity.ok(userDTOs);
    }

    // 批准加入请求
    @PostMapping("/{groupId}/approve/{userId}")
    public ResponseEntity<?> approveJoinRequest(@PathVariable Long groupId, @PathVariable Long userId) {
        groupService.approveJoinRequest(groupId, userId);
        return ResponseEntity.ok().build();
    }

    // 添加加入请求
    @PostMapping("/{groupId}/request/{userId}")
    public ResponseEntity<?> addJoinRequest(@PathVariable Long groupId, @PathVariable Long userId) {
        groupService.addJoinRequest(groupId, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/members/{groupId}")
    public ResponseEntity<List<MemberDTO>> getGroupMembers(@PathVariable Long groupId) {
        // 获取群组成员
//        Set<RecommendUser> members = groupService.getGroupMembers(groupId);
//
//        // 将用户对象集合转换为用户ID集合
//        return members.stream().map(RecommendUser::getId).collect(Collectors.toSet());
        Set<RecommendUser> members = groupService.getGroupMembers(groupId);

        // 将用户对象集合转换为DTO集合
        List<MemberDTO> memberDTOs = members.stream()
                .map(member -> new MemberDTO(member.getId(),member.getName()))
                .collect(Collectors.toList());
//        for(MemberDTO memberDTO: memberDTOs){
//           System.out.println(memberDTO.getUserId());
//           System.out.println(memberDTO.getUserName());
//           System.out.println(memberDTO.getUsers.size());
//        }
        return ResponseEntity.ok(memberDTOs);
    }

    @GetMapping("/recommend/{groupId}")
    public ResponseEntity<List<RecommendRestaurant>> getTop10Restaurant(@PathVariable Long groupId) throws IOException {

        RecommendGroup currentGroup = groupRepository.findById(groupId).orElse(null);
        String purpose = groupService.getEngPurpose(groupId);
//        System.out.println("My purpose:"+purpose);
        Set<RecommendUser>  recommendUserSet = groupService.getUsersByGroupId(groupId);
        List<Double> TKIs = new ArrayList<Double>();
        List<Double> trusts = new ArrayList<Double>();
        List<RecommendUser> users = new ArrayList<RecommendUser>();
        List<Double> avgExpertises = new ArrayList<>();
        for(RecommendUser user: recommendUserSet){
            users.add(user);
            TKIs.add(user.getTKI());
//            System.out.println("my purpose value:"+ userService.getTrustRatingForPurpose(user.getTrustRatingsJson(),purpose));
            //這裡只要傳用戶對於這個團體purpose的信任程度即可
//            double finalExpertise = ( userService.getAverageExpertise(user.getExpertiseRatingsJson()) + userService.getTrustRatingForPurpose(user.getTrustRatingsJson(),purpose) )/2;
            double avgExpertise = userService.getAverageExpertise(user.getExpertiseRatingsJson());
            double myPurposeTrust = userService.getTrustRatingForPurpose(user.getTrustRatingsJson(),purpose);
            trusts.add(myPurposeTrust);
            avgExpertises.add(avgExpertise);
        }
        double[][] influenceMatrix =  groupService.getInfluenceMatrix(avgExpertises,users,TKIs,trusts);
        List<RecommendRestaurant> recommendRestaurantList = groupService.influenceRecommend(influenceMatrix,users,groupId);
        String restaurantIds = recommendRestaurantList.stream()
                .map(RecommendRestaurant::getId)
                .map(String::valueOf)
                .collect(Collectors.joining(","));
        if(currentGroup != null) {
            currentGroup.setRecommendIds(restaurantIds);
            groupRepository.save(currentGroup);
        }
        return ResponseEntity.ok(recommendRestaurantList);
    }

    @GetMapping("/recommend2/{groupId}")
    public ResponseEntity<List<RecommendRestaurant>> getTop10Restaurant2(@PathVariable Long groupId) throws IOException {

        RecommendGroup currentGroup = groupRepository.findById(groupId).orElse(null);
        String purpose = groupService.getEngPurpose(groupId);
//        System.out.println("My purpose2:"+purpose);
        Set<RecommendUser>  recommendUserSet = groupService.getUsersByGroupId(groupId);
        List<Double> TKIs = new ArrayList<Double>();
        List<Double> trusts = new ArrayList<Double>();
        List<RecommendUser> users = new ArrayList<RecommendUser>();

        for(RecommendUser user: recommendUserSet){
            users.add(user);
            TKIs.add(user.getTKI());
//            System.out.println("my purpose value2:"+ userService.getTrustRatingForPurpose(user.getTrustRatingsJson(),purpose));
//            double finalExpertise = ( userService.getAverageExpertise(user.getExpertiseRatingsJson()) + userService.getTrustRatingForPurpose(user.getTrustRatingsJson(),purpose) )/2;
            double finalExpertise = userService.getTrustRatingForPurpose(user.getTrustRatingsJson(),purpose);
            trusts.add(finalExpertise);
        }
//        double[][] influenceMatrix =  groupService.getInfluenceMatrix(TKIs,trusts);
        List<RecommendRestaurant> recommendRestaurantList = groupService.traditionalRecommend(TKIs,trusts,users,groupId);

        String restaurantIds = recommendRestaurantList.stream()
                .map(RecommendRestaurant::getId)
                .map(String::valueOf)
                .collect(Collectors.joining(","));
        if(currentGroup != null) {
            currentGroup.setRecommend2Ids(restaurantIds);
            groupRepository.save(currentGroup);
        }
        return ResponseEntity.ok(recommendRestaurantList);
    }

    @GetMapping("/recommendDB/{groupId}")
    public ResponseEntity<?> getRecommendRestaurants(@PathVariable Long groupId) {
        RecommendGroup currentGroup = groupRepository.findById(groupId).orElse(null);
        List<RecommendRestaurant> recommendRestaurants = new ArrayList<RecommendRestaurant>();
        if(currentGroup != null){
            List<Long> idList = Arrays.stream(currentGroup.getRecommendIds().split(","))
                    .map(Long::valueOf)
                    .toList();
            recommendRestaurants = recommendRestaurantRepository.findByIdIn(idList);
            return ResponseEntity.ok(recommendRestaurants);
        }
        return ResponseEntity.status(404).body(Map.of("error", "Group not found"));
    }

    @GetMapping("/recommend2DB/{groupId}")
    public ResponseEntity<?> getRecommend2Restaurants(@PathVariable Long groupId) {
        // 将传入的字符串转换为 Long 类型的 ID 列表
        RecommendGroup currentGroup = groupRepository.findById(groupId).orElse(null);
        List<RecommendRestaurant> recommendRestaurants = new ArrayList<RecommendRestaurant>();
        if(currentGroup != null){
            List<Long> idList = Arrays.stream(currentGroup.getRecommend2Ids().split(","))
                    .map(Long::valueOf)
                    .toList();
            recommendRestaurants = recommendRestaurantRepository.findByIdIn(idList);
            return ResponseEntity.ok(recommendRestaurants);
        }
        return ResponseEntity.status(404).body(Map.of("error", "Group not found"));
    }

    @PostMapping("/recommendationFlag/{groupId}")
    public ResponseEntity<?> updateRecommendationFlag(@PathVariable Long groupId) {
        RecommendGroup group = groupRepository.findById(groupId).orElse(null);
        if (group == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Group not found"));
        }
        group.setRecommendationFlag(true);
        groupRepository.save(group);
        return ResponseEntity.ok(Map.of("success", "Recommendation flag updated"));
    }

    @PostMapping("/submitFlag/{groupId}")
    public ResponseEntity<?> updateSubmitFlag(@PathVariable Long groupId) {
        RecommendGroup group = groupRepository.findById(groupId).orElse(null);
        if (group == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Group not found"));
        }
        group.setSubmitFlag(true);
        groupRepository.save(group);
        return ResponseEntity.ok(Map.of("success", "Submit flag updated"));
    }
}