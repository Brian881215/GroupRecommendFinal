import React from 'react';
import './SectionTitle.css';

// 卡片區塊標題:左側金色色條 + 標題。其餘 props(className、style 等)透傳到外層 span。
export default function SectionTitle({ children, className, ...rest }) {
  return (
    <span className={['section-title', className].filter(Boolean).join(' ')} {...rest}>
      <span className="section-title-accent" />
      {children}
    </span>
  );
}
