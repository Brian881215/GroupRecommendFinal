// import React, { useCallback, useEffect, useState } from 'react';
// import GroupIcon from '@mui/icons-material/Group';
// import { useNavigate } from 'react-router-dom';
// import "./GroupView.css";
// import BottomNav from '../Bottom/BottomNav';
// // Import other necessary components and utilities

// const GroupView = () => {
//   const [userGroups, setUserGroups] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const userId = localStorage.getItem("userId");
//   const navigate = useNavigate();

//   const apiUrl = process.env.REACT_APP_API_URL;

//   const formatDate = (dateString) => {
//     const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
//     return new Date(dateString).toLocaleString('en-US', options).replace(',', '');
//   };

//   const fetchUserGroups = useCallback(async (userId)=> {
//     const url = `${apiUrl}/users/allGroups/${userId}`;
//     const response = await fetch(url, {
//       method: 'GET', // or 'POST', depending on your API setup
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       credentials: 'include'
//     });
//     if (!response.ok) {
//         throw new Error('Network response was not ok');
//     }
//     const text = await response.text(); // 先获取响应文本
//     if (!text) {
//         console.log('Response is empty');
//         return []; // 如果响应为空，返回空数组
//     }
//     return JSON.parse(text); // 如果响应不为空，尝试解析 JSON
//   }, [apiUrl]);

//   useEffect(() => {
//     // Fetch user's groups from API or state store
//     fetchUserGroups(userId).then(groups => {
//       setUserGroups(groups);
//       setIsLoading(false);
//     }).catch(error => {
//         console.error('Failed to fetch groups', error);
//         setIsLoading(false);
//       });
//   }, [userId, fetchUserGroups]);

//   if (isLoading) {
//     return <p>Loading...</p>; // Or any loading spinner
//   }

//   if (userGroups.length === 0) {
//     return (
//         <div>
//             <p>您目前尚未有任何群組。</p>
//             <BottomNav />
//         </div>
//     );
//   }

//   const handleViewNavigate = (groupId) => {
//     navigate(`/group/${groupId}`);
//   };

//   return (
//     <div className="group-view">
//       <h2>Your Groups</h2>
//       <div className="groups-container">
//         {userGroups.map(group => (
//           <div className="group-card" key={group.id}>
//             <h3 className="viewGroupTitle">{group.title}</h3>
//             <p className="viewDiningTime"> {formatDate(group.diningTime)}</p>
//             <p className="viewGroupDescription">{group.description}</p>
//             <p className="browseGroupPurpose">目的：{group.purpose}</p>
//             <span><GroupIcon className="groupIcon" />{group.memberCount}/{group.maxNumber}  創建者: {group.userName}</span>
//             <button onClick={() => handleViewNavigate(group.id)} className="view-group-button">
//               進入群組
//             </button>
//           </div>
//         ))}
//       </div>
//       <BottomNav />
//     </div>
//   );
// };

// export default GroupView;
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, Row, Col, Typography, Button, Tag, 
  Spin, Empty, Space, Divider 
} from 'antd';
import { 
  UserOutlined, 
  ClockCircleOutlined, 
  ArrowRightOutlined,
  TeamOutlined 
} from '@ant-design/icons';
import BottomNav from '../Bottom/BottomNav';
import "./GroupView.css";

const { Title, Text, Paragraph } = Typography;

const GroupView = () => {
  const [userGroups, setUserGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  // --- UI Helpers ---
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', month: '2-digit', day: '2-digit', 
      hour: '2-digit', minute: '2-digit', hour12: false 
    };
    return new Date(dateString).toLocaleString('zh-TW', options);
  };

  const fetchUserGroups = useCallback(async (userId) => {
    try {
      const url = `${apiUrl}/users/allGroups/${userId}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Network response was not ok');
      
      const text = await response.text();
      return text ? JSON.parse(text) : [];
    } catch (error) {
      console.error('Failed to fetch groups', error);
      return [];
    }
  }, [apiUrl]);

  useEffect(() => {
    if (!userId) return;
    fetchUserGroups(userId).then(groups => {
      setUserGroups(groups);
      setIsLoading(false);
    });
  }, [userId, fetchUserGroups]);

  // --- Handlers ---
  const handleViewNavigate = (groupId) => {
    navigate(`/group/${groupId}`);
  };

  // --- Loading State ---
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Spin size="large" tip="讀取群組中..." />
      </div>
    );
  }

  return (
    <div className="group-view-container">
      <div className="content-wrapper" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '30px' }}>
          我的聚餐群組
        </Title>

        {userGroups.length === 0 ? (
          <Empty 
            description="您目前尚未加入任何群組" 
            style={{ marginTop: '100px' }}
          >
            <Button type="primary" onClick={() => navigate('/browse')}>去瀏覽群組</Button>
          </Empty>
        ) : (
          <Row gutter={[20, 20]}>
            {userGroups.map(group => (
              <Col xs={24} sm={12} md={8} lg={8} key={group.id}>
                <Card 
                  hoverable 
                  className="group-view-card"
                  actions={[
                    <Button 
                      type="link" 
                      key="enter" 
                      icon={<ArrowRightOutlined />} 
                      onClick={() => handleViewNavigate(group.id)}
                    >
                      進入群組
                    </Button>
                  ]}
                >
                  <Tag color="blue" style={{ marginBottom: '8px' }}>{group.purpose}</Tag>
                  <Title level={4} ellipsis={{ tooltip: group.title }}>
                    {group.title}
                  </Title>
                  
                  <Space direction="vertical" style={{ width: '100%', marginTop: '10px' }}>
                    <Text type="secondary">
                      <ClockCircleOutlined /> {formatDate(group.diningTime)}
                    </Text>
                    
                    <Paragraph ellipsis={{ rows: 2, symbol: '...' }} style={{ color: '#666', height: '44px' }}>
                      {group.description}
                    </Paragraph>
                  </Space>

                  <Divider style={{ margin: '12px 0' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space>
                      <UserOutlined />
                      <Text size="small">{group.userName}</Text>
                    </Space>
                    <Space>
                      <TeamOutlined />
                      <Text>{group.memberCount}/{group.maxNumber}</Text>
                    </Space>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>
      
      {/* 底部導覽留白 */}
      <div style={{ height: '80px' }} />
      <BottomNav />
    </div>
  );
};

export default GroupView;
