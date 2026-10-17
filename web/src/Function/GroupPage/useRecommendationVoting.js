import { useState } from 'react';
import { message } from 'antd';
import { postGroupRecommendation } from './groupApi';

// Favorites are tracked per underlying recommendation source (A = "recommend"
// algorithm, B = "recommend2" algorithm) by restaurant id, not by whichever
// screen position currently displays that list. Which source renders as
// "list 1" vs "list 2" is purely a display decision (based on groupId parity)
// made once by the caller — this hook never needs to know about it, which is
// what removes the old duplicated odd/even swap logic.
export default function useRecommendationVoting({ groupId, userId, isCreator }) {
  const [scoreA, setScoreA] = useState('');
  const [scoreB, setScoreB] = useState('');
  const [groupDecision, setGroupDecision] = useState('');
  const [favoritedA, setFavoritedA] = useState(new Set());
  const [favoritedB, setFavoritedB] = useState(new Set());
  const storageKey = `isRecommendDisabled2-${userId}-${groupId}`;
  const [submitted, setSubmitted] = useState(
    () => JSON.parse(localStorage.getItem(storageKey)) || false
  );

  const toggleFavorite = (source, restaurantId) => {
    const setFavorites = source === 'A' ? setFavoritedA : setFavoritedB;
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(restaurantId)) {
        next.delete(restaurantId);
      } else {
        next.add(restaurantId);
      }
      return next;
    });
  };

  const submit = async () => {
    if (!scoreA || !scoreB || favoritedA.size < 1 || favoritedB.size < 1 || (isCreator && !groupDecision)) {
      message.error(
        isCreator
          ? '請填寫兩個推薦清單評分與最終決定的餐廳編號並各選擇一到多個餐廳到最愛'
          : '請填寫兩個推薦清單評分並各選擇一到多個餐廳到最愛'
      );
      return;
    }

    const numericScoreA = parseInt(scoreA, 10);
    const numericScoreB = parseInt(scoreB, 10);
    if (numericScoreA < 1 || numericScoreA > 10 || numericScoreB < 1 || numericScoreB > 10) {
      message.error('推薦滿意度必須是1-10之間的數字');
      return;
    }

    if (isCreator) {
      const decisionValue = parseInt(groupDecision, 10);
      if (decisionValue < 1 || decisionValue > 14) {
        message.error('餐廳編號必須是1-14之間的數字');
        return;
      }
    }

    // This can't survive a device/browser switch, so it's only a UI nicety;
    // the server-persisted submission is the real guard against resubmitting.
    setSubmitted(true);
    localStorage.setItem(storageKey, JSON.stringify(true));

    try {
      await postGroupRecommendation({
        groupId,
        userId,
        recommendationScore1: scoreA,
        recommendationScore2: scoreB,
        groupDecision,
        loveCount1: favoritedA.size,
        loveCount2: favoritedB.size,
      });
    } catch (error) {
      console.error('Error submitting recommendations:', error);
      message.error('提交評分失敗,請稍後再試');
    }
  };

  return {
    scoreA,
    setScoreA,
    scoreB,
    setScoreB,
    groupDecision,
    setGroupDecision,
    favoritedA,
    favoritedB,
    toggleFavorite,
    submitted,
    submit,
  };
}
