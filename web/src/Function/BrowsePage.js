// export default BrowsePage;
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Card, Row, Col, Typography, Button, Modal, List, 
  Avatar, Tag, message, Empty, Spin, Space , Divider
} from 'antd';
import { 
  CheckCircleOutlined, 
  UserAddOutlined, 
  UserOutlined, 
  DollarOutlined, 
  ClockCircleOutlined 
} from '@ant-design/icons';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import BottomNav from '../Bottom/BottomNav';
import './BrowsePage.css'; // 確保裡面沒有衝突的寬度設定

const { Title, Text, Paragraph } = Typography;

const BrowsePage = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const apiUrl = process.env.REACT_APP_API_URL;

  // --- States ---
  const [loading, setLoading] = useState(true);
  const [userGroups, setUserGroups] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [joinRequested, setJoinRequested] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [applicants, setApplicants] = useState([]);

  // --- API Wrappers ---
  const fetchData = useCallback(async (endpoint) => {
    const res = await fetch(`${apiUrl}${endpoint}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Network error');
    return res.json();
  }, [apiUrl]);

  // --- Initial Load ---
  useEffect(() => {
    const initPage = async () => {
      setLoading(true);
      try {
        // 並行請求提高效率
        const [created, others, requestedText] = await Promise.all([
          fetchData(`/groups/created-by/${userId}`),
          fetchData(`/groups/not-created-by/${userId}`),
          fetch(`${apiUrl}/users/user-requests/${userId}`, { credentials: 'include' }).then(r => r.text())
        ]);

        setUserGroups(created);
        setAllGroups(others);
        
        const reqMap = {};
        requestedText.split(',').forEach(id => { if(id) reqMap[id.trim()] = true; });
        setJoinRequested(reqMap);
      } catch (err) {
        message.error("資料載入失敗");
      } finally {
        setLoading(false);
      }
    };
    if (userId) initPage();
  }, [userId, fetchData, apiUrl]);

  // --- Handlers ---
  const handleOpenApplicants = async (groupId) => {
    try {
      const data = await fetchData(`/groups/join-requests/${groupId}`);
      setApplicants(data);
      // 同步取得該群組最新資訊以判斷是否滿員
      const groupDetail = await fetchData(`/groups/${groupId}`);
      setCurrentGroup(groupDetail);
      setIsModalOpen(true);
    } catch (err) {
      message.error("無法取得申請者列表");
    }
  };

  const handleJoinRequest = async (groupId) => {
    try {
      const res = await fetch(`${apiUrl}/groups/${groupId}/request/${userId}`, { method: 'PUT' });
      if (res.ok) {
        setJoinRequested(prev => ({ ...prev, [groupId]: true }));
        message.success("申請已送出");
        setIsRequestModalOpen(false);
      }
    } catch (err) {
      message.error("申請失敗");
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false // 使用 24 小時制，如果想用 12 小時制可改為 true
    };
    return new Date(dateString).toLocaleString('zh-TW', options);
  };

  // --- Render Components ---
  // const GroupCard = ({ group, isOwner }) => (
  //   <Card
  //     hoverable
  //     className="group-antd-card"
  //     cover={
  //       <div style={{ position: 'relative' }}>
  //         <LazyLoadImage
  //           src={group.photo}
  //           effect="blur"
  //           wrapperProps={{
  //             style: { display: 'block', width: '100%', height: '100%' }
  //           }}
  //           style={{ width: '100%', height: '180px', objectFit: 'cover' }}
  //         />
  //         <div className="card-action-overlay">
  //           {isOwner ? (
  //             <Button 
  //               type="primary" 
  //               shape="circle" 
  //               icon={<CheckCircleOutlined />} 
  //               onClick={() => handleOpenApplicants(group.id)} 
  //             />
  //           ) : (
  //             <Button 
  //               type="primary" 
  //               shape="circle" 
  //               disabled={joinRequested[group.id]}
  //               icon={<UserAddOutlined />} 
  //               onClick={() => {
  //                  setCurrentGroup(group);
  //                  setIsRequestModalOpen(true);
  //               }} 
  //             />
  //           ) }
  //         </div>
  //       </div>
  //     }
  //   >
  //     <Tag color="gold">{group.purpose}</Tag>
  //     <Title level={5} ellipsis>{group.title}</Title>
  //     <Space direction="vertical" size={0} style={{ width: '100%' }}>
  //       <Text type="secondary"><ClockCircleOutlined /> {formatDate(group.diningTime)}</Text>
  //       <Text strong><DollarOutlined /> 預算: ${group.price}</Text>
  //       <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
  //         <Text size="small"><UserOutlined /> {group.userName}</Text>
  //         <Text type="secondary">{group.memberCount}/{group.maxNumber}</Text>
  //       </div>
  //     </Space>
  //   </Card>
  // );
  // const GroupCard = ({ group, isOwner }) => {
  //   const isRequested = joinRequested[group.id];
  
  //   return (
  //     <Card
  //       hoverable
  //       className="group-antd-card"
  //       cover={
  //         <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
  //           <LazyLoadImage
  //             src={group.photo}
  //             effect="blur"
  //             wrapperProps={{ style: { display: 'block', width: '100%', height: '100%' } }}
  //             style={{ width: '100%', height: '180px', objectFit: 'cover' }}
  //           />
            
  //           {/* 右上角動作按鈕區 */}
  //           <div className="card-action-overlay">
  //             {isOwner ? (
  //               <Button 
  //                 type="primary" 
  //                 shape="round" 
  //                 icon={<CheckCircleOutlined />} 
  //                 onClick={() => handleOpenApplicants(group.id)}
  //               >
  //                 管理申請
  //               </Button>
  //             ) : (
  //               <Button 
  //                 // 根據狀態切換顏色：已申請用綠色(success)，未申請用主色(primary)
  //                 type={isRequested ? "default" : "primary"}
  //                 shape="round"
  //                 icon={isRequested ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : <UserAddOutlined />} 
  //                 disabled={isRequested}
  //                 style={{ 
  //                   backgroundColor: isRequested ? '#f6ffed' : '', 
  //                   borderColor: isRequested ? '#b7eb8f' : '',
  //                   opacity: 1, // 強制讓禁用狀態不那麼透明
  //                   color: isRequested ? '#52c41a' : ''
  //                 }}
  //                 onClick={() => {
  //                    setCurrentGroup(group);
  //                    setIsRequestModalOpen(true);
  //                 }} 
  //               >
  //                 {isRequested ? "已申請" : "加入"}
  //               </Button>
  //             ) }
  //           </div>
  
  //           {/* 如果已申請，增加一個明顯的緞帶標籤 (可選) */}
  //           {!isOwner && isRequested && (
  //             <div className="requested-ribbon">已提出申請</div>
  //           )}
  //         </div>
  //       }
  //     >
  //       <Tag color="gold">{group.purpose}</Tag>
  //       <Title level={5} ellipsis={{ tooltip: group.title }}>{group.title}</Title>
  //       {/* ...其餘內容保持不變... */}
  //     </Card>
  //   );
  // };
  const GroupCard = ({ group, isOwner }) => {
    const isRequested = joinRequested[group.id];
  
    return (
      <Card
        hoverable
        className="group-antd-card"
        cover={
          <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
            <LazyLoadImage
              src={group.photo}
              effect="blur"
              wrapperProps={{ style: { display: 'block', width: '100%', height: '100%' } }}
              style={{ width: '100%', height: '180px', objectFit: 'cover' }}
            />
            
          
  
            {/* 左上角顯眼的「已申請」緞帶標籤 */}
            {!isOwner && isRequested && (
              <div className="requested-status-tag">
                已提出申請
              </div>
            )}
          </div>
        }
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          {/* 所有的原始資訊欄位，完全保留 */}
          <Title level={4} className="browseGroupTitle" style={{ marginBottom: '8px' }}>
            {group.title}
          </Title>
            {/* 右上角動作按鈕 */}
            <div className="card-action-inline">
              {isOwner ? (
                <Button 
                  type="primary" 
                  shape="circle" 
                  icon={<CheckCircleOutlined />} 
                  style={{ fontSize: '20px', width: '30px', height: '30px' }}
                  onClick={() => handleOpenApplicants(group.id)} 
                />
              ) : (
                <Button 
                  // 如果已申請，顯示明顯的綠色打勾樣式
                  type={isRequested ? "default" : "primary"}
                  shape="circle" 
                  disabled={isRequested}
                  icon={isRequested ? <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '20px' }} /> : <UserAddOutlined style={{ fontSize: '20px' }} />} 
                  style={{ 
                    width: '30px', 
                    height: '30px',
                    backgroundColor: isRequested ? '#f6ffed' : '#f8c146', // 未申請用你原本的黃色系
                    borderColor: isRequested ? '#b7eb8f' : '#f8c146',
                    opacity: 1,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}
                  onClick={() => {
                     if (!isRequested) {
                       setCurrentGroup(group);
                       setIsRequestModalOpen(true);
                     }
                  }} 
                />
              ) }
            </div>
        </div>
        <div className="browseDiningTime" style={{ marginBottom: '8px', color: '#666' }}>
          <ClockCircleOutlined /> {formatDate(group.diningTime)}
        </div>
  
        <Paragraph className="browseGroupDescription" ellipsis={{ rows: 2 }}>
          {group.description}
        </Paragraph>
  
        <Paragraph className="browseGroupPurpose">
          <Text strong>聚餐情境: </Text>
          <Tag color="gold">{group.purpose}</Tag>
        </Paragraph>
  
        <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>
            <Text strong>創建者: </Text>
            <Text 
              className="browseUsername" 
              style={{ cursor: 'pointer', color: '#1890ff', fontWeight: 'bold' }}
              onClick={() => !isOwner && navigate(`/profile/${group.creatorId || group.userId}`)}
            >
              {group.userName}
            </Text>
          </span>
          
          <Space>
            <UserOutlined />
            <Text>{group.memberCount}/{group.maxNumber}</Text>
            <Divider type="vertical" />
            <DollarOutlined />
            <Text strong>${group.price}</Text>
          </Space>
        </div>
      </Card>
    );
  };

  const handleApproveUser = async (groupId, applicantId) => {
    try {
      const res = await fetch(`${apiUrl}/groups/${groupId}/approve/${applicantId}`, {
        method: 'PUT',
        credentials: 'include'
      });
  
      if (res.ok) {
        message.success("已核准成員加入！");
        
        // 重新整理「申請者列表」Modal
        const updatedApplicants = await fetchData(`/groups/join-requests/${groupId}`);
        setApplicants(updatedApplicants);
        
        // 重要：重新整理「我創建的群組」，因為人數 (memberCount) 更新了
        const updatedCreated = await fetchData(`/groups/created-by/${userId}`);
        setUserGroups(updatedCreated);
        
        // 更新當前 Modal 內的群組詳情（判斷是否滿員）
        const groupDetail = await fetchData(`/groups/${groupId}`);
        setCurrentGroup(groupDetail);
      } else {
        message.error("核准動作失敗");
      }
    } catch (err) {
      message.error("伺服器異常");
    }
  };

  if (loading) return <div className="loading-container"><Spin size="large" /></div>;

  return (
    <div className="browse-page-container">
      <div className="content-wrapper">
        <Title level={2}>瀏覽聚餐群組</Title>

        <section>
          <Title level={4}>你創建的群組</Title>
          <Row gutter={[16, 16]}>
            {userGroups.length > 0 ? userGroups.map(g => (
              <Col xs={24} sm={12} md={8} lg={6} key={g.id}>
                <GroupCard group={g} isOwner={true} />
              </Col>
            )) : <Empty description="尚無創建群組" />}
          </Row>
        </section>

        <section style={{ marginTop: 40 }}>
          <Title level={4}>可加入的群組</Title>
          <Row gutter={[16, 16]}>
            {allGroups.map(g => (
              <Col xs={24} sm={12} md={8} lg={6} key={g.id}>
                <GroupCard group={g} isOwner={false} />
              </Col>
            ))}
          </Row>
        </section>
      </div>

      {/* 申請者列表 Modal */}
      <Modal
        title="申請加入者列表"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <List
          dataSource={applicants}
          renderItem={item => (
            <List.Item actions={[
              <Button 
                type="link" 
                disabled={currentGroup?.memberCount >= currentGroup?.maxNumber}
                onClick={()=>{handleApproveUser(currentGroup.id, item.userId)}}
              >
                {currentGroup?.memberCount >= currentGroup?.maxNumber ? '已滿員' : '核准'}
              </Button>
            ]}>
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} />}
                title={<Link to={`/profile/${item.userId}`}>{item.userName}</Link>}
              />
            </List.Item>
          )}
        />
      </Modal>

      {/* 確認加入 Modal */}
      <Modal
        title="確認申請"
        open={isRequestModalOpen}
        onOk={() => handleJoinRequest(currentGroup?.id)}
        onCancel={() => setIsRequestModalOpen(false)}
      >
        <p>您確定要申請加入「{currentGroup?.title}」嗎？</p>
      </Modal>

      <BottomNav />
    </div>
  );
};

export default BrowsePage;