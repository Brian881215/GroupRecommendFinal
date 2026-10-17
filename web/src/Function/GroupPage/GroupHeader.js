import React from 'react';
import { Typography, Button, Card } from 'antd';
import {
  TeamOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  CompassOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import GroupCover from '../GroupCover';

const { Title, Paragraph } = Typography;

function formatDate(dateString) {
  const options = {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  };
  return new Date(dateString).toLocaleString('zh-TW', options);
}

const InfoItem = ({ icon, label, children }) => (
  <li className="group-info-item">
    <span className="group-info-icon">{icon}</span>
    <span className="group-info-label">{label}</span>
    <span className="group-info-value">{children}</span>
  </li>
);

export default function GroupHeader({ groupInfo, memberCount, onViewMembers, isCreator, onStartRecommend }) {
  return (
    <Card
      className="group-card"
      bordered={false}
      cover={
        <GroupCover
          photo={groupInfo.photo}
          title={groupInfo.title}
          fallback={<TeamOutlined className="group-cover-icon" />}
        />
      }
    >
      <Title level={3} className="group-title">{groupInfo.title}</Title>
      <Paragraph className="group-description">{groupInfo.description}</Paragraph>

      <ul className="group-info-list">
        <InfoItem icon={<ClockCircleOutlined />} label="聚餐時間">
          {formatDate(groupInfo.diningTime)}
        </InfoItem>
        <InfoItem icon={<EnvironmentOutlined />} label="集合地點">
          {groupInfo.meetingPlace}
        </InfoItem>
        <InfoItem icon={<CompassOutlined />} label="推薦餐廳的區域">
          {groupInfo.districts || '無偏好'}
        </InfoItem>
        <InfoItem icon={<DollarOutlined />} label="餐廳平均價格">
          &lt;${groupInfo.price}
        </InfoItem>
      </ul>

      <div className="group-actions">
        <Button block onClick={onViewMembers} icon={<TeamOutlined />}>
          瀏覽群組人員 {memberCount}/{groupInfo.maxNumber}
        </Button>
        {isCreator && (
          <Button
            type="primary"
            block
            onClick={onStartRecommend}
            disabled={groupInfo.recommendationFlag}
            className="recommend-submit"
          >
            立即推薦
          </Button>
        )}
      </div>
    </Card>
  );
}
