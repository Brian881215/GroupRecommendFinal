import React, { useCallback, useEffect, useState } from 'react';
import GroupIcon from '@mui/icons-material/Group';
import { useNavigate } from 'react-router-dom';
import "./GroupView.css";
import BottomNav from '../Bottom/BottomNav';
// Import other necessary components and utilities

const GroupView = () => {
  const [userGroups, setUserGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  const apiUrl = process.env.REACT_APP_API_URL;

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleString('en-US', options).replace(',', '');
  };

  const fetchUserGroups = useCallback(async (userId)=> {
    const url = `${apiUrl}/users/allGroups/${userId}`;
    const response = await fetch(url, {
      method: 'GET', // or 'POST', depending on your API setup
      headers: {
        'Content-Type': 'application/json',
      }
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const text = await response.text(); // 先获取响应文本
    if (!text) {
        console.log('Response is empty');
        return []; // 如果响应为空，返回空数组
    }
    return JSON.parse(text); // 如果响应不为空，尝试解析 JSON
  }, [apiUrl]);

  useEffect(() => {
    // Fetch user's groups from API or state store
    fetchUserGroups(userId).then(groups => {
      setUserGroups(groups);
      setIsLoading(false);
    }).catch(error => {
        console.error('Failed to fetch groups', error);
        setIsLoading(false);
      });
  }, [userId, fetchUserGroups]);

  if (isLoading) {
    return <p>Loading...</p>; // Or any loading spinner
  }

  if (userGroups.length === 0) {
    return (
        <div>
            <p>您目前尚未有任何群組。</p>
            <BottomNav />
        </div>
    );
  }

  const handleViewNavigate = (groupId) => {
    navigate(`/group/${groupId}`);
  };

  return (
    <div className="group-view">
      <h2>Your Groups</h2>
      <div className="groups-container">
        {userGroups.map(group => (
          <div className="group-card" key={group.id}>
            <h3 className="viewGroupTitle">{group.title}</h3>
            <p className="viewDiningTime"> {formatDate(group.diningTime)}</p>
            <p className="viewGroupDescription">{group.description}</p>
            <p className="browseGroupPurpose">目的：{group.purpose}</p>
            <span><GroupIcon className="groupIcon" />{group.memberCount}/{group.maxNumber}  創建者: {group.userName}</span>
            <button onClick={() => handleViewNavigate(group.id)} className="view-group-button">
              進入群組
            </button>
          </div>
        ))}
      </div>
      <BottomNav />
    </div>
  );
};

export default GroupView;

