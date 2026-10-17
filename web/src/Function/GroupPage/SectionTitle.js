import React from 'react';

// 卡片標題:左側金色色條 + 標題(與 CreatePage 的區塊標題一致)
export default function SectionTitle({ children }) {
  return (
    <span className="group-section-title">
      <span className="group-section-accent" />
      {children}
    </span>
  );
}
