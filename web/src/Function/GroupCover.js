import React, { useState } from 'react';
import './GroupCover.css';

// 群組封面:16:10,沒有照片或圖片載入失敗時顯示金色漸層。
// 漸層上預設放群組標題;頁面上標題已另外顯示時,用 fallback 換成別的內容。
// 破圖狀態放在這個獨立元件裡,父元件重繪時不會被重置。
export default function GroupCover({ photo, title, fallback, children }) {
  const [failedPhoto, setFailedPhoto] = useState(null);
  const showFallback = !photo || failedPhoto === photo;

  return (
    <div className="group-cover-box">
      {showFallback ? (
        <div className="group-cover-box-fallback">
          {fallback || <span className="group-cover-box-fallback-title">{title}</span>}
        </div>
      ) : (
        <img
          src={photo}
          alt={title}
          className="group-cover-box-img"
          onError={() => setFailedPhoto(photo)}
        />
      )}
      {children}
    </div>
  );
}
