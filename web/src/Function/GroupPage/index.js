import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Spin, message, Button, InputNumber } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import BottomNav from '../../Bottom/BottomNav';
import './GroupPage.css';
import {
  fetchGroup,
  fetchGroupMembers,
  fetchGroupMessages,
  fetchRecommendations,
  fetchRecommendationsFromDB,
  postRecommendationFlag,
} from './groupApi';
import useGroupSocket from './useGroupSocket';
import useRecommendationVoting from './useRecommendationVoting';
import GroupHeader from './GroupHeader';
import GroupMembersModal from './GroupMembersModal';
import StartRecommendModal from './StartRecommendModal';
import RecommendationList from './RecommendationList';
import GroupChatBox from './GroupChatBox';

const EMPTY_RECOMMENDATIONS = { list1: [], list2: [] };

const GroupPage = () => {
  const { groupId } = useParams();
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName');

  const [groupInfo, setGroupInfo] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [recommendations, setRecommendations] = useState(EMPTY_RECOMMENDATIONS);
  const [membersModalOpen, setMembersModalOpen] = useState(false);
  const [startRecommendModalOpen, setStartRecommendModalOpen] = useState(false);

  const isCreator = Boolean(groupInfo) && Number(userId) === Number(groupInfo.creatorId);

  useEffect(() => {
    fetchGroup(groupId)
      .then((data) => {
        setGroupInfo(data);
        if (data.recommendationFlag) {
          return fetchRecommendationsFromDB(groupId).then(setRecommendations);
        }
        return undefined;
      })
      .catch((error) => {
        console.error('Error loading group info:', error);
        message.error('無法載入群組資訊');
      });
  }, [groupId]);

  useEffect(() => {
    fetchGroupMembers(groupId)
      .then(setGroupMembers)
      .catch((error) => console.error('Error fetching group members:', error));

    fetchGroupMessages(groupId)
      .then(setMessages)
      .catch((error) => console.error('Error fetching messages:', error));
  }, [groupId]);

  const handleSocketMessage = useCallback((data) => {
    setMessages((prev) => [...prev, data]);
    if (data.type === 'RECOMMENDATION_UPDATE') {
      fetchGroup(groupId).then(setGroupInfo).catch(() => {});
      fetchRecommendations(groupId).then(setRecommendations).catch(() => {});
    }
  }, [groupId]);

  const { sendMessage } = useGroupSocket(groupId, handleSocketMessage);

  const voting = useRecommendationVoting({ groupId, userId, isCreator });

  const handleSendMessage = () => {
    const trimmed = newMessage.trim();
    if (!trimmed) {
      message.error('訊息不可為空');
      return;
    }
    const sent = sendMessage({ userId, userName, text: trimmed });
    if (!sent) {
      message.error('請刷新頁面再輸入訊息');
      return;
    }
    setNewMessage('');
  };

  const handleConfirmStartRecommend = async () => {
    if (groupMembers.length < 2) {
      message.error('團體推薦至少要兩個人');
      return;
    }
    setStartRecommendModalOpen(false);
    setGroupInfo((prev) => ({ ...prev, recommendationFlag: true }));

    try {
      await postRecommendationFlag(groupId);
      const liveRecommendations = await fetchRecommendations(groupId);
      setRecommendations(liveRecommendations);
      sendMessage({
        type: 'RECOMMENDATION_UPDATE',
        userName,
        text: '我已進行推薦，現在我們要決定一間想去的餐廳，我需要提交一個餐廳編號(系統訊息)',
      });
    } catch (error) {
      console.error('Error updating recommendation flag', error);
      message.error('更新推薦狀態失敗');
    }
  };

  if (!groupInfo) {
    return (
      <div className="group-loading">
        <Spin size="large" />
      </div>
    );
  }

  // Which underlying data source ("recommend" vs "recommend2" algorithm) is
  // shown as list 1 vs list 2 alternates by groupId parity, so the same
  // algorithm doesn't always end up displayed first. Each source keeps its
  // own score/favorites regardless of which slot it's currently displayed in.
  const isOddGroup = Number(groupId) % 2 !== 0;
  const orderedSources = isOddGroup ? ['A', 'B'] : ['B', 'A'];
  const sourceData = { A: recommendations.list1, B: recommendations.list2 };
  const sourceScore = { A: voting.scoreA, B: voting.scoreB };
  const setSourceScore = { A: voting.setScoreA, B: voting.setScoreB };
  const sourceFavorites = { A: voting.favoritedA, B: voting.favoritedB };

  return (
    <div className="group-page">
      <div className="group-layout">
        <aside className="group-side">
          <GroupHeader
            groupInfo={groupInfo}
            memberCount={groupMembers.length}
            onViewMembers={() => setMembersModalOpen(true)}
            isCreator={isCreator}
            onStartRecommend={() => setStartRecommendModalOpen(true)}
          />
        </aside>

        <div className="group-main">
          {groupInfo.recommendationFlag && (
            <div className="groupPageOuter">
              <div className="recommendListDesc">
                <InfoCircleOutlined className="recommendListDescIcon" />
                <span>
                  請填寫兩個推薦清單評分並各選擇一到多個餐廳到最愛,創建群組者需填寫你們最終討論出來的餐廳
                </span>
              </div>
              {orderedSources.map((source, index) => {
                const listNumber = index + 1;
                return (
                  <RecommendationList
                    key={source}
                    listNumber={listNumber}
                    restaurants={sourceData[source] || []}
                    favoritedIds={sourceFavorites[source]}
                    onToggleFavorite={(restaurantId) => voting.toggleFavorite(source, restaurantId)}
                    score={sourceScore[source]}
                    onScoreChange={setSourceScore[source]}
                    extra={isCreator && listNumber === 2 && (
                      <div className="ratingInput">
                        <label>最終選擇餐廳</label>
                        <InputNumber
                          min={1}
                          max={14}
                          placeholder="1-14"
                          value={voting.groupDecision}
                          onChange={voting.setGroupDecision}
                        />
                      </div>
                    )}
                  />
                );
              })}
              <Button
                type="primary"
                block
                size="large"
                disabled={voting.submitted}
                className="recommend-submit2"
                onClick={voting.submit}
              >
                提交
              </Button>
            </div>
          )}

          <GroupChatBox
            messages={messages}
            newMessage={newMessage}
            onChangeMessage={setNewMessage}
            onSend={handleSendMessage}
            currentUserId={userId}
          />
        </div>
      </div>

      <GroupMembersModal
        open={membersModalOpen}
        onClose={() => setMembersModalOpen(false)}
        members={groupMembers}
      />

      <StartRecommendModal
        open={startRecommendModalOpen}
        onConfirm={handleConfirmStartRecommend}
        onCancel={() => setStartRecommendModalOpen(false)}
      />

      <BottomNav />
    </div>
  );
};

export default GroupPage;
