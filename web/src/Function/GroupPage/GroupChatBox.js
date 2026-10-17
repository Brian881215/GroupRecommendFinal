import React from 'react';
import { List, Input, Button, Card } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import SectionTitle from './SectionTitle';

export default function GroupChatBox({ messages, newMessage, onChangeMessage, onSend, currentUserId }) {
  return (
    <Card
      className="group-card group-chat-box"
      bordered={false}
      title={<SectionTitle>群組聊天室</SectionTitle>}
    >
      <List
        className="group-messages"
        split={false}
        dataSource={messages}
        renderItem={(item, index) => {
          const isMine = item.userId != null && String(item.userId) === String(currentUserId);
          return (
            <List.Item key={item.id || index} className={`message ${isMine ? 'message-mine' : 'message-other'}`}>
              {!isMine && <span className="message-name">{item.userName || 'Unknown User'}</span>}
              <span className="message-bubble">{item.text}</span>
            </List.Item>
          );
        }}
      />
      <div className="message-input">
        <Input
          value={newMessage}
          onChange={(e) => onChangeMessage(e.target.value)}
          onPressEnter={onSend}
          placeholder="請輸入聊天訊息"
        />
        <Button
          type="text"
          icon={<SendOutlined />}
          onClick={onSend}
          className="mesSend-icon-button"
          aria-label="送出訊息"
        />
      </div>
    </Card>
  );
}
