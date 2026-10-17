import React from 'react';
import { Typography, Button, Space } from 'antd';
import { TeamOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

function formatDate(dateString) {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleString('en-US', options).replace(',', '');
}

export default function GroupHeader({ groupInfo, memberCount, onViewMembers, isCreator, onStartRecommend }) {
  return (
    <div className="group-header">
      <div className="group-photo-container">
        <img src={groupInfo.photo} alt="groupPhoto" className="group-image" />
      </div>
      <div className="group-details">
        <div className="title-with-time">
          <Title level={3} className="group-title">{groupInfo.title}</Title>
          <Text className="dining-time">
            <ClockCircleOutlined /> {formatDate(groupInfo.diningTime)}
          </Text>
        </div>
        <Paragraph className="group-description">{groupInfo.description}</Paragraph>
        <Paragraph><Text strong>集合地點:</Text> {groupInfo.meetingPlace}</Paragraph>
        <Paragraph><Text strong>推薦餐廳的區域:</Text> {groupInfo.districts || '無偏好'}</Paragraph>
        <Paragraph><Text strong>餐廳平均價格:</Text> &lt;${groupInfo.price}</Paragraph>
        <Space>
          <Button onClick={onViewMembers} icon={<TeamOutlined />}>
            瀏覽群組人員 {memberCount}/{groupInfo.maxNumber}
          </Button>
        </Space>
      </div>
      {isCreator && (
        <div className="group-button">
          <Button
            type="primary"
            onClick={onStartRecommend}
            disabled={groupInfo.recommendationFlag}
            className="recommend-submit"
          >
            立即推薦
          </Button>
        </div>
      )}
    </div>
  );
}
