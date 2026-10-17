import React from 'react';
import { List, Input, Button } from 'antd';
import { SendOutlined } from '@ant-design/icons';

export default function GroupChatBox({ messages, newMessage, onChangeMessage, onSend }) {
  return (
    <div className="group-chat-box">
      <List
        className="group-messages"
        dataSource={messages}
        renderItem={(item, index) => (
          <List.Item key={item.id || index} className="message">
            <span>{item.userName || 'Unknown User'}: {item.text}</span>
          </List.Item>
        )}
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
    </div>
  );
}
