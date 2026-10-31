package com.example.GroupRecommend.service;

import com.example.GroupRecommend.dto.CreateGroupRequest;
import com.example.GroupRecommend.entity.RecommendGroup;
import com.example.GroupRecommend.entity.RecommendUser;
import com.example.GroupRecommend.exception.ResourceNotFoundException;
import com.example.GroupRecommend.repository.RecommendGroupRepository;
import com.example.GroupRecommend.repository.RecommendRestaurantRepository;
import com.example.GroupRecommend.repository.RecommendUserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.Date;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GroupServiceCreateGroupTest {

    @Mock
    private RecommendGroupRepository groupRepository;
    @Mock
    private RecommendUserRepository userRepository;
    @Mock
    private RecommendRestaurantRepository restaurantRepository;
    @Mock
    private UserService userService;

    @InjectMocks
    private GroupService groupService;

    private CreateGroupRequest buildRequest() {
        CreateGroupRequest request = new CreateGroupRequest();
        request.setTitle("找人一起吃飯");
        request.setDescription("期末考壓力大，想找人聊聊");
        request.setPurpose("找一般朋友或新朋友");
        request.setMeetingPlace("政大商院一樓");
        request.setMaxNumber(5);
        request.setDistricts(Arrays.asList("大安區", "文山區"));
        request.setPrice(500.0);
        request.setDiningTime(new Date());
        return request;
    }

    @Test
    void createGroup_savesGroupWithCreatorAsMember() {
        Long creatorId = 1L;
        RecommendUser creator = new RecommendUser();
        creator.setId(creatorId);
        creator.setName("Brian");
        when(userService.findUserByUserId(creatorId)).thenReturn(creator);
        when(groupRepository.save(any(RecommendGroup.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RecommendGroup result = groupService.createGroup(creatorId, buildRequest());

        assertThat(result.getTitle()).isEqualTo("找人一起吃飯");
        assertThat(result.getMaxNumber()).isEqualTo(5);
        assertThat(result.getDistricts()).isEqualTo("大安區, 文山區");
        assertThat(result.getCreator()).isEqualTo(creator);
        assertThat(result.getUsers()).containsExactly(creator);
        verify(groupRepository).save(any(RecommendGroup.class));
    }

    @Test
    void createGroup_creatorNotFound_throwsAndNeverSaves() {
        Long missingCreatorId = 999L;
        when(userService.findUserByUserId(missingCreatorId))
                .thenThrow(new ResourceNotFoundException("User not found"));

        assertThatThrownBy(() -> groupService.createGroup(missingCreatorId, buildRequest()))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(groupRepository, never()).save(any());
    }
}
