import React from 'react';
import { Modal } from 'antd';

export default function StartRecommendModal({ open, onConfirm, onCancel }) {
  return (
    <Modal
      title="開始推薦"
      open={open}
      onOk={onConfirm}
      onCancel={onCancel}
      okText="確定"
      cancelText="取消"
      centered
    >
      <p style={{ textAlign: 'center' }}>
        你確定要立即推薦?<br />
        (推薦後即無法再加人)
      </p>
    </Modal>
  );
}
