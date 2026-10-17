import React from 'react';
import { Modal, List, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

export default function GroupMembersModal({ open, onClose, members }) {
  const navigate = useNavigate();

  return (
    <Modal title="群組成員" open={open} onCancel={onClose} footer={null} centered>
      <List
        dataSource={members}
        renderItem={(member) => (
          <List.Item
            className="group-member-item"
            onClick={() => navigate(`/profile/${member.userId}`)}
          >
            <List.Item.Meta
              avatar={<Avatar icon={<UserOutlined />} />}
              title={member.userName}
            />
          </List.Item>
        )}
      />
    </Modal>
  );
}
