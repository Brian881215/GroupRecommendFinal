package com.example.GroupRecommend.controller;

import com.example.GroupRecommend.dto.GroupCountDTO;
import com.example.GroupRecommend.dto.LoginDto;
import com.example.GroupRecommend.dto.RatingDTO;
import com.example.GroupRecommend.dto.RecommendGroupDTO;
import com.example.GroupRecommend.entity.RecommendGroup;
import com.example.GroupRecommend.entity.RecommendUser;
import com.example.GroupRecommend.repository.RecommendGroupRepository;
import com.example.GroupRecommend.repository.RecommendUserRepository;
import com.example.GroupRecommend.service.GroupService;
import com.example.GroupRecommend.service.UserService;
import com.example.GroupRecommend.utility.Utility;
import org.apache.coyote.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {
    @Autowired
    private RecommendUserRepository userRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private GroupService groupService;
    //url要完全一模一樣，差一個斜線也會錯

    @Autowired
    private RecommendGroupRepository recommendGroupRepository;

   Utility utility = new Utility();

    @PostMapping("")
    public ResponseEntity<RecommendUser> createUser(@RequestBody RecommendUser user) {
        RecommendUser savedUser = userRepository.save(user);
        return new ResponseEntity<>(savedUser, HttpStatus.CREATED);
    }
     @GetMapping("/user-requests/{userId}")
     public ResponseEntity<String> getUserJoinRequests(@PathVariable Long userId){
         String requestedGroupIds = userService.getUserJoinRequests(userId);
         return ResponseEntity.ok(requestedGroupIds);
    }
    @GetMapping("/{id}")
    public ResponseEntity<RecommendUser> getUser(@PathVariable("id") Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)  // 如果用戶存在，返回200 OK
                .orElseGet(() -> ResponseEntity.notFound().build());  // 如果用戶不存在，返回404 Not Found
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDto loginDto) {
        RecommendUser user = userService.findByEmail(loginDto.getUsername());
        if (user != null && userService.checkPassword(loginDto.getPassword(), user.getPassword())) {
            // 如果匹配，发送用户ID回前端
            Map<String, Object> response = new HashMap<>();
            response.put("userId", user.getId());
            response.put("userName", user.getName());
            return ResponseEntity.ok().body(response);
        } else {
            // 如果不匹配，发送错误信息
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid credentials"));
        }
    }

    @GetMapping("allGroups/{id}")
    public ResponseEntity<List<RecommendGroupDTO>> getAllGroups(@PathVariable("id") Long id) {
        RecommendUser user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        Set<RecommendGroup> allGroups = user.getGroups();
        List<RecommendGroup> groupList = new ArrayList<>(allGroups);  // Convert Set to List

        List<RecommendGroupDTO> DTOGroups = new ArrayList<RecommendGroupDTO>();
        for(RecommendGroup group:  groupList){
            DTOGroups.add(groupService.convertToDto(group));
        }
        if (DTOGroups.isEmpty()) {
            return ResponseEntity.noContent().build();  // Return 204 No Content if the list is empty
        }
        return ResponseEntity.ok(DTOGroups);  // Return 200 OK with the list of groups
    }

    @PutMapping("/rating/{id}")
    public ResponseEntity<RecommendUser> updateUserRating(@PathVariable("id") Long id, @RequestBody RatingDTO ratingDTO ) {

        RecommendUser user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
//        System.out.println("New expertise ratings:"+ratingDTO.getExpertiseRatings());
        user.setExpertiseRatings(ratingDTO.getExpertiseRatings());
        user.setTrustRatings(ratingDTO.getTrustRatings());
        RecommendUser savedUser = userRepository.save(user);
        return new ResponseEntity<>(savedUser, HttpStatus.OK);
    }

    @PutMapping("/TKIquestions/{id}")
    public ResponseEntity<?> updateUserTKI(@PathVariable("id") Long id, @RequestBody List<Map<String, String>> questions ) {

        RecommendUser user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        ArrayList<String[]> arr = new ArrayList<>();
        for (Map<String,String> question : questions) {
            arr.add(new String[] {question.get("id"), question.get("answer")});
//            arr.add(question.toArray(new String[0]));
        }
        System.out.println("Received questions: " + arr);
//        for(String[] s: arr){
//            System.out.println("test: "+s[1]);
//        }
        user.setTKI(utility.updateTKI(arr));
        RecommendUser savedUser = userRepository.save(user);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/checkEmail/{email}")
    public ResponseEntity<Boolean> getEmailExist(@PathVariable String email){
        boolean exists = userService.checkEmailExistence(email);
        return ResponseEntity.ok(exists);
//        String requestedGroupIds = userService.getUserJoinRequests(userId);
//        return ResponseEntity.ok(requestedGroupIds);
    }

    @GetMapping("progressBar/{id}")
    public ResponseEntity<Map<String, Integer>> getUserProgress(@PathVariable("id") Long id) {
        Map<String, Integer> groupUses = new HashMap<>();
        groupUses.putAll(groupService.getGroupPurposeCounts(id));
        int creatorCount = recommendGroupRepository.findByCreatorId(id).size();
        groupUses.put("建立群组次数", creatorCount);
        return ResponseEntity.ok(groupUses);  // Return 200 OK with the list of groups
    }

//    http://172.20.10.11:8080/api/users/groupCounts/${effectiveUserId}
    @GetMapping("groupCounts/{id}")
    public ResponseEntity<GroupCountDTO> getGroupCount(@PathVariable("id") Long id){
        RecommendUser user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        GroupCountDTO groupCountDTO = new GroupCountDTO();

        int totalGroupCount = user.getGroups().size();
        int creatorCount = recommendGroupRepository.findByCreatorId(id).size();
        int joinCount = totalGroupCount-creatorCount;
        groupCountDTO.setCreateCount(creatorCount);
        groupCountDTO.setJoinCount(joinCount);

        return ResponseEntity.ok(groupCountDTO);
    }
}



