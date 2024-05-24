package com.example.GroupRecommend.service;

import com.example.GroupRecommend.dto.IndexedValue;
import com.example.GroupRecommend.dto.RecommendGroupDTO;
import com.example.GroupRecommend.dto.RecommendGroupPhotoDTO;
import com.example.GroupRecommend.entity.RecommendGroup;
import com.example.GroupRecommend.entity.RecommendRestaurant;
import com.example.GroupRecommend.entity.RecommendUser;
import com.example.GroupRecommend.exception.ResourceNotFoundException;
import com.example.GroupRecommend.repository.RecommendGroupRepository;
import com.example.GroupRecommend.repository.RecommendRestaurantRepository;
import com.example.GroupRecommend.repository.RecommendUserRepository;
import com.example.GroupRecommend.utility.GroupPurpose;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.*;

@Service
public class GroupService {
    @Autowired
    private RecommendGroupRepository groupRepository;
    @Autowired
    private RecommendUserRepository userRepository;
    @Autowired
    private RecommendRestaurantRepository restaurantRepository;

    @Autowired
    private UserService userService;

    // 添加加入请求
    public void addJoinRequest(Long groupId, Long userId) {
        RecommendGroup group = groupRepository.findById(groupId).orElseThrow(() -> new RuntimeException("Group not found"));
        group.addJoinRequest(userId);
        groupRepository.save(group);
        RecommendUser user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        user.addJoinRequest(group.getId());
        userRepository.save(user);
    }

    // 获取加入请求
    public List<Long> getJoinRequests(Long groupId) {
        RecommendGroup group = groupRepository.findById(groupId).orElseThrow(() -> new RuntimeException("Group not found"));
//        System.out.println("My groupUser id:"+group.getJoinRequestUserIds().size());
        return group.getJoinRequestUserIds();
    }

    // 批准加入请求
    public void approveJoinRequest(Long groupId, Long userId) {

        RecommendUser user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        RecommendGroup group = groupRepository.findById(groupId).orElseThrow(() -> new RuntimeException("Group not found"));
        group.removeJoinRequest(userId);
        group.getUsers().add(user);
        groupRepository.save(group);
    }

    public RecommendGroupDTO convertToDto(RecommendGroup group) {
        RecommendGroupDTO dto = new RecommendGroupDTO();
        dto.setId(group.getId());
        dto.setTitle(group.getTitle());
        dto.setDescription(group.getDescription());
//        dto.setPhoto(group.getPhoto());
        dto.setMeetingPlace(group.getMeetingPlace());
        dto.setMaxNumber(group.getMaxNumber());
        dto.setPrice(group.getPrice());
        dto.setDiningTime(group.getDiningTime());
        dto.setCreatorId(group.getCreator().getId());
        dto.setMessages(Arrays.asList(group.getMessages().split(", "))); // 将字符串分割成列表
        dto.setJoinRequestUserIds(group.getJoinRequestUserIds());
        dto.setMemberCount(group.getUsers().size());
        dto.setPurpose(group.getPurpose());
        RecommendUser user = userRepository.findById(group.getCreator().getId()).orElseThrow(() -> new RuntimeException("User not found"));
        dto.setUserName(user.getName());
        return dto;
    }

    public RecommendGroupPhotoDTO convertToDtoPhoto(RecommendGroup group) {
        RecommendGroupPhotoDTO dto = new RecommendGroupPhotoDTO();
        dto.setId(group.getId());
        dto.setTitle(group.getTitle());
        dto.setDescription(group.getDescription());
        dto.setPhoto(group.getPhoto());
        dto.setMeetingPlace(group.getMeetingPlace());
        dto.setMaxNumber(group.getMaxNumber());
        dto.setPrice(group.getPrice());
        dto.setDiningTime(group.getDiningTime());
        dto.setCreatorId(group.getCreator().getId());
        dto.setMessages(Arrays.asList(group.getMessages().split(", "))); // 将字符串分割成列表
        dto.setJoinRequestUserIds(group.getJoinRequestUserIds());
        dto.setMemberCount(group.getUsers().size());
        dto.setPurpose(group.getPurpose());
        RecommendUser user = userRepository.findById(group.getCreator().getId()).orElseThrow(() -> new RuntimeException("User not found"));
        dto.setUserName(user.getName());
        dto.setDistricts(group.getDistricts());
        dto.setSubmitFlag(group.isSubmitFlag());
        dto.setRecommendationFlag(group.isRecommendationFlag());
        return dto;
    }

    public Set<RecommendUser> getGroupMembers(Long groupId) {
        return groupRepository.findById(groupId).map(RecommendGroup::getUsers).orElseThrow(
                () -> new ResourceNotFoundException("Group not found with id " + groupId)
        );
    }

    public Map<String, Integer> getGroupPurposeCounts(Long userId) {
        // 假设已经有方法获取用户相关的所有群组ID
        RecommendUser user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Set<RecommendGroup> groupIds = user.getGroups();

        Map<String, Integer> purposeCounts = new HashMap<>();
        for (GroupPurpose purpose : GroupPurpose.values()) {
            purposeCounts.put(purpose.getDescription(), 0);
        }

        for (RecommendGroup recommendGroup : groupIds) {
            // 假设有方法根据groupId获取群组目的
            String groupPurpose = recommendGroup.getPurpose();

            // 累加对应目的的计数
            if (purposeCounts.containsKey(groupPurpose)) {
                purposeCounts.put(groupPurpose, purposeCounts.get(groupPurpose) + 1);
            }
        }

        return purposeCounts;
    }

    @Transactional(readOnly = true)
    public Set<RecommendUser> getUsersByGroupId(Long groupId) {
        // 使用Optional来处理可能的null值
        RecommendGroup recommendGroup = groupRepository.findById(groupId).orElse(null);

        if (recommendGroup != null) {
            return recommendGroup.getUsers();  // 直接返回用户集合
        } else {
            // 如果找不到RecommendGroup，返回一个空的集合，而非null
            return Collections.emptySet();
        }
    }

    public String getEngPurpose(Long groupId){
        RecommendGroup recommendGroup = groupRepository.findById(groupId).orElse(null);

        String purpose="";
        if(recommendGroup != null) {
            purpose = recommendGroup.getPurpose();
//            System.out.println("purpose:"+purpose);
        }
        if("找一般朋友或新朋友".equals(purpose)){
            purpose="EqualMatching";
        }else if("為了互相解決特定問題".equals(purpose)){
            purpose="AuthorityRanking";
        }else if("學長姐學弟妹或是上對下關係的人".equals(purpose)){
            purpose="CommunalSharing";
        }else if("與好朋友，家人，或是伴侶".equals(purpose)){
            purpose="MarketPricing";
        }
        return purpose;
    }

    public double[][] getInfluenceMatrix(List<Double> avgExpertises,List<RecommendUser> users,List<Double> tkiValues, List<Double> trustValues) {
        //這裏trustValues還沒有算彼此之間的相對數值，理論上正規劃後加總起來要等於1，而目前的也只是針對某個人對群組整體的分數來當作參數去儲存
//        for(Double tkiValue: tkiValues){
//             System.out.println("GroupTKIValue:"+tkiValue+" ");
//        }
//        for(Double trustValue: trustValues){
//            System.out.println("GroupTrustValue:"+trustValue+" ");
//        }
//        StringBuilder userOutput = new StringBuilder("GroupUserIds: ");
//        for (RecommendUser user : users) {
//            userOutput.append(user.getId()).append(" ");
//        }
//        System.out.println(userOutput.toString());
//        StringBuilder avgExpertiseOutput = new StringBuilder("AvgExpertises: ");
//        for (Double avgExpertise : avgExpertises) {
//            avgExpertiseOutput.append(avgExpertise).append(" ");
//        }
//        System.out.println(avgExpertiseOutput.toString());
//        StringBuilder tkiOutput = new StringBuilder("GroupTKIValues: ");
//        for (Double tkiValue : tkiValues) {
//            tkiOutput.append(tkiValue).append(" ");
//        }
//        System.out.println(tkiOutput.toString());

//        StringBuilder trustOutput = new StringBuilder("GroupTrustValues: ");
//        for (Double trustValue : trustValues) {
//            trustOutput.append(trustValue).append(" ");
//        }
//        System.out.println(trustOutput.toString());

        int n = tkiValues.size();
//        double totalTrust = trustValues.stream().mapToDouble(Double::doubleValue).sum();
//        System.out.println("My total trust:"+totalTrust);
        double[][] W = new double[n][n];

//        for (int i = 0; i < n; i++) {
//            for (int j = 0; j < n; j++) {
//                if (i == j) {
//                    W[i][j] = tkiValues.get(i);
//                } else {
//                    W[i][j] = (1 - tkiValues.get(i)) * 1 / (trustValues.size()-1) ;
//                }
//            }
//        }
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                if (i == j) {
                    W[i][j] = tkiValues.get(i);
                } else {
                    double totalTrust = 0;
                    for(int k=0; k<n;k++){
                        if(k != i){
                            totalTrust += avgExpertises.get(k);
                        }
                    }
                    totalTrust += trustValues.get(i) * (trustValues.size()-1);
//                    System.out.println("totalTrustValue:"+totalTrust);
                    W[i][j] = (1 - tkiValues.get(i)) * (trustValues.get(i)+avgExpertises.get(j))/totalTrust;
//                    System.out.println("My matrix:"+W[i][j]);
                }
            }
        }

//        System.out.println(Arrays.deepToString(W));
        return W;
    }

    public List<RecommendRestaurant> influenceRecommend(double[][] influenceMatrix, List<RecommendUser> recommendUserList, Long groupId){
        RecommendGroup group = groupRepository.findById(groupId).orElseThrow(() -> new RuntimeException("Group not found"));
        String districts = group.getDistricts();
        double maxPrice = group.getPrice();
        List<String> districtList = Arrays.asList(districts.split(",\\s*"));
        List<RecommendRestaurant> recommendRestaurantList = restaurantRepository.findByDistrictsAndMaxCost(districtList, maxPrice);
//        System.out.println(recommendRestaurantList.size());
        double[][] ratingArray = new double[recommendUserList.size()][recommendRestaurantList.size()];
//        double[][] ratingArray = new double[recommendRestaurantList.size()][recommendUserList.size()];
        int temp = 0;
        for(RecommendRestaurant recommendRestaurant: recommendRestaurantList){
            int count = 0;
            for(RecommendUser recommendUser: recommendUserList){
                Map<String, Double> ratingMap = recommendUser.getExpertiseRatings();
//                System.out.println("User ID: " + recommendUser.getId());
//                System.out.println("Expertise Ratings: " + ratingMap);
                double rating = ratingMap.get(recommendRestaurant.getClassification());
//                System.out.println(rating);
                double weightedScore = recommendRestaurant.getRating()* rating/10; //讓迭代次數可以變少
//                ratingArray[temp][count] = weightedScore;
                ratingArray[count][temp] = weightedScore;
                count++;
            }
            temp++;
        }
        double epsilon = 0.001;
        double[][] result = multiplyAndCheck(influenceMatrix, ratingArray, epsilon);
        printMatrix(result);
//        System.out.println("我rating最後的餐廳分數們："+Arrays.deepToString(result));

        List<Integer> topTenIndexes = getTopTenIndexes(result, 0);
//        System.out.println("Top ten indexes: " + topTenIndexes);

        return getRestaurantsByIndexes(recommendRestaurantList, topTenIndexes);
    }

    public static double[][] multiplyAndCheck(double[][] A, double[][] B, double epsilon) {
        double[][] current = B;
        int iteration = 0;
        while (!allRowsAreEqual(current, epsilon) && iteration < 15) {
            current = multiplyMatrices(A, current);
            iteration++;
        }
        return current;
    }

    public static double[][] multiplyMatrices(double[][] A, double[][] B) {
        int n = A.length;
        int m = B[0].length;

        double[][] C = new double[n][m];

        for (int i = 0; i < n; i++) {
            for (int j = 0; j < m; j++) {
                for (int k = 0; k < A[0].length; k++) { // A[0].length or B.length
                    C[i][j] += A[i][k] * B[k][j];
                }
            }
        }
        return C;
    }

    public static boolean allRowsAreEqual(double[][] matrix, double epsilon) {
        for (double[] row : matrix) {
            double first = row[0];
            for (double val : row) {
                if (Math.abs(val - first) > epsilon) {
                    return false;
                }
            }
        }
        return true;
    }

    public static void printMatrix(double[][] matrix) {
//        for (double[] row : matrix) {
//            for (double val : row) {
//                System.out.print(val + " ");
//            }
//            System.out.println();
//        }
    }

    public static List<Integer> getTopTenIndexes(double[][] matrix, int row) {
        List<IndexedValue> indexedValues = new ArrayList<>();

        // 填充数据，假设我们关注第一行，row = 0
        for (int i = 0; i < matrix[row].length; i++) {
            indexedValues.add(new IndexedValue(matrix[row][i], i));
        }

        // 排序
        Collections.sort(indexedValues);

        // 获取前七大元素的索引
        List<Integer> topTenIndexes = new ArrayList<>();
        for (int i = 0; i < 7 && i < indexedValues.size(); i++) {
            topTenIndexes.add(indexedValues.get(i).getIndex());
        }

        return topTenIndexes;
    }
    public static List<Integer> getTopTenIndexes2(double[] array) {
        List<IndexedValue> indexedValues = new ArrayList<>();

        // 填充数据
        for (int i = 0; i < array.length; i++) {
            indexedValues.add(new IndexedValue(array[i], i));
        }

        // 排序
        Collections.sort(indexedValues);

        // 获取前七大元素的索引
        List<Integer> topTenIndexes = new ArrayList<>();
        for (int i = 0; i < 7 && i < indexedValues.size(); i++) {
            topTenIndexes.add(indexedValues.get(i).getIndex());
        }

        return topTenIndexes;
    }

    public static double[] avgNewArray(double[][] ratingOrgArray,String purpose) {

        //traditional aggregation methods之採用
        double[] finalArray = new double[ratingOrgArray[0].length];

        if(purpose.equals("EqualMatching") || purpose.equals("MarketPricing")){
            for (int k = 0; k < ratingOrgArray[0].length; k++) {
                finalArray[k] = Double.MAX_VALUE;
            }
        }else{
            for (int k = 0; k < ratingOrgArray[0].length; k++) {
                finalArray[k] = Double.MIN_VALUE;
            }
        }

        for(int i=0; i< ratingOrgArray[0].length;i++){
            if(purpose.equals("EqualMatching") || purpose.equals("MarketPricing")){
                for (double[] doubles : ratingOrgArray) {
                    if (doubles[i] > finalArray[i]) {
                        finalArray[i] = doubles[i]; // 更新為最大評分
                    }
                }
            }else{
                for (double[] doubles : ratingOrgArray) {
                    if (doubles[i] < finalArray[i]) {
                        finalArray[i] = doubles[i]; // 更新為最小評分
                    }
                }
            }
        }
        return finalArray;
    }


    public List<RecommendRestaurant> getRestaurantsByIndexes(List<RecommendRestaurant> restaurants, List<Integer> indexes) {
        List<RecommendRestaurant> selectedRestaurants = new ArrayList<>();
        for (Integer index : indexes) {
            if (index < restaurants.size()) {
                selectedRestaurants.add(restaurants.get(index));
            }
        }
        return selectedRestaurants;
    }

    public static double[][] predictRatings(double[][] ratingOrgArray, List<Double> TKIs, List<Double> avgExpertiseList, List<Double> trustList) {
        int numUsers = ratingOrgArray.length;
        int numRestaurants = ratingOrgArray[0].length;
        double[][] newRatings = new double[numUsers][numRestaurants];

        for (int j = 0; j < numRestaurants; j++) {
            // 對於每位用戶
            for (int i = 0; i < numUsers; i++) {
                double sumOfOtherRatings = 0;
                // 計算其他用戶評分的總和
                double totalTrust = 0;
                for (int k = 0; k < numUsers; k++) {
                    if (k != i) {
                        totalTrust += avgExpertiseList.get(k);
                    }
                }
                totalTrust += trustList.get(i) * (trustList.size()-1);
//                System.out.println("totalTrustValue:"+totalTrust);
                // 計算當前用戶對當前餐廳的預測評分
                double otherTotalRating=0;
                for(int m=0 ; m<numUsers ; m++){
                    if(m != i){
                        otherTotalRating += (trustList.get(i)+avgExpertiseList.get(m)) / totalTrust * ratingOrgArray[m][j];
                    }
                }
                newRatings[i][j] = TKIs.get(i) * ratingOrgArray[i][j] + (1 - TKIs.get(i)) * otherTotalRating;
            }
        }
        // 對於每家餐廳
//        for (int j = 0; j < numRestaurants; j++) {
//            // 對於每位用戶
//            for (int i = 0; i < numUsers; i++) {
//                double sumOfOtherRatings = 0;
//                // 計算其他用戶評分的總和
//                for (int k = 0; k < numUsers; k++) {
//                    if (k != i) {
//                        //這是信任當作平均的時候所去計算的
//                        sumOfOtherRatings += ratingOrgArray[k][j];
//                    }
//                }
//                // 計算當前用戶對當前餐廳的預測評分
//                newRatings[i][j] = TKIs.get(i) * ratingOrgArray[i][j] + (1 - TKIs.get(i)) * (sumOfOtherRatings / (numUsers - 1));
//            }
//        }

        return newRatings;
    }

    public List<RecommendRestaurant> traditionalRecommend(List<Double> TKIs, List<Double> trusts, List<RecommendUser> recommendUserList, Long groupId) throws IOException {

        List<Double> extertiseList = new ArrayList<>();
        for( RecommendUser recommendUser: recommendUserList){
            extertiseList.add(userService.getAverageExpertise(recommendUser.getExpertiseRatingsJson()));
        }

        RecommendGroup group = groupRepository.findById(groupId).orElseThrow(() -> new RuntimeException("Group not found"));
        String districts = group.getDistricts();
        double maxPrice = group.getPrice();
        List<String> districtList = Arrays.asList(districts.split(",\\s*"));
        List<RecommendRestaurant> recommendRestaurantList = restaurantRepository.findByDistrictsAndMaxCost(districtList, maxPrice);
//        System.out.println(recommendRestaurantList.size());
        double[][] ratingOrgArray = new double[recommendUserList.size()][recommendRestaurantList.size()];
        int temp = 0;
        for(RecommendRestaurant recommendRestaurant: recommendRestaurantList){
            int count = 0;
            for(RecommendUser recommendUser: recommendUserList){
                Map<String, Double> ratingMap = recommendUser.getExpertiseRatings();
                double rating = ratingMap.get(recommendRestaurant.getClassification());
                double weightedScore = recommendRestaurant.getRating() * rating/10; //本身餐廳分數呈上某個人對於該種類的專業百分比
                ratingOrgArray[count][temp] = weightedScore;
                count++;
            }
            temp++;
        }
        //新的空陣列
        double[][] ratingNewArray = new double[recommendUserList.size()][recommendRestaurantList.size()];

        ratingNewArray = predictRatings(ratingOrgArray,TKIs,extertiseList, trusts);
//        System.out.println(Arrays.deepToString(ratingOrgArray));
//        System.out.println(Arrays.deepToString(ratingNewArray));

//參數要放ratingNewArray
        double[] result2 = avgNewArray(ratingNewArray,getEngPurpose(groupId));
//        System.out.println("團體rating最後的餐廳分數："+Arrays.toString(result2));

        List<Integer> topTenIndexes = getTopTenIndexes2(result2);
//        System.out.println("Top ten indexes: " + topTenIndexes);

        return getRestaurantsByIndexes(recommendRestaurantList, topTenIndexes);
    }
}
