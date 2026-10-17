import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Typography, Button, Tag, Spin, Empty } from 'antd';
import {
  UserOutlined,
  ClockCircleOutlined,
  ArrowRightOutlined,
  TeamOutlined
} from '@ant-design/icons';
import BottomNav from '../Bottom/BottomNav';
import GroupCover from './GroupCover';
import "./GroupView.css";

const { Title, Text, Paragraph } = Typography;

const formatDate = (dateString) => {
  const options = {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false
  };
  return new Date(dateString).toLocaleString('zh-TW', options);
};

const GroupView = () => {
  const [userGroups, setUserGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  const fetchUserGroups = useCallback(async (userId) => {
    try {
      const url = `${apiUrl}/users/allGroups/${userId}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Network response was not ok');

      const text = await response.text();
      return text ? JSON.parse(text) : [];
    } catch (error) {
      console.error('Failed to fetch groups', error);
      return [];
    }
  }, [apiUrl]);

  useEffect(() => {
    if (!userId) return;
    fetchUserGroups(userId).then(groups => {
      setUserGroups(groups);
      setIsLoading(false);
    });
  }, [userId, fetchUserGroups]);

  const handleViewNavigate = (groupId) => {
    navigate(`/group/${groupId}`);
  };

  if (isLoading) {
    return (
      <div className="group-view-loading">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="group-view-page">
      <div className="group-view-content">
        <Title level={2}>我的聚餐群組</Title>

        {userGroups.length === 0 ? (
          <Empty
            description="您目前尚未加入任何群組"
            className="group-view-empty"
          >
            <Button
              type="primary"
              className="group-view-gold-btn"
              onClick={() => navigate('/browse')}
            >
              去瀏覽群組
            </Button>
          </Empty>
        ) : (
          <div className="group-view-grid">
            {userGroups.map(group => {
              const isOwner = Number(group.creatorId) === Number(userId);
              return (
                <Card
                  key={group.id}
                  hoverable
                  className="group-view-card"
                  cover={<GroupCover photo={group.photo} title={group.title} />}
                  onClick={() => handleViewNavigate(group.id)}
                >
                  <div className="group-view-card-body">
                    <div className="group-view-tags">
                      <Tag className="group-view-tag">{group.purpose}</Tag>
                      {isOwner && <Tag className="group-view-tag group-view-tag-owner">我是主揪</Tag>}
                    </div>
                    <Title level={4} className="group-view-card-title" ellipsis={{ tooltip: group.title }}>
                      {group.title}
                    </Title>
                    <Text type="secondary">
                      <ClockCircleOutlined /> {formatDate(group.diningTime)}
                    </Text>
                    <Paragraph
                      className="group-view-card-desc"
                      ellipsis={{ rows: 2, symbol: '...' }}
                    >
                      {group.description}
                    </Paragraph>

                    <div className="group-view-card-footer">
                      <Text type="secondary">
                        <UserOutlined /> 主揪:{group.userName}
                      </Text>
                      <Text type="secondary">
                        <TeamOutlined /> {group.memberCount}/{group.maxNumber}
                      </Text>
                    </div>

                    <Button
                      type="primary"
                      block
                      icon={<ArrowRightOutlined />}
                      className="group-view-gold-btn"
                    >
                      進入群組
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default GroupView;
