const DATE_TIME_OPTIONS = {
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', hour12: false,
};

// 聚餐時間等日期時間的顯示格式,例如 2024/05/23 23:00
export default function formatDateTime(dateString) {
  return new Date(dateString).toLocaleString('zh-TW', DATE_TIME_OPTIONS);
}
