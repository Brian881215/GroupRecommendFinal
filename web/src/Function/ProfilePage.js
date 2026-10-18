// ProfilePage.js
import React, { useEffect, useState } from 'react';
import BottomNav from '../Bottom/BottomNav';
import './ProfilePage.css'; // 記得創建一個對應的CSS檔案
import { useParams,useNavigate } from 'react-router-dom';
import { Badge, Button, Card, Descriptions, Modal, Tag, Progress, Spin, Typography, message } from 'antd';
import { TrophyOutlined, CalendarOutlined, CheckCircleFilled, LogoutOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

// 聚餐情境任務:固定照建立群組時的選單順序(後端用 HashMap 回傳,順序不固定)
const DINING_CONTEXT_TASKS = [
    "找一般朋友或新朋友",
    "為了互相解決特定問題",
    "學長姐學弟妹或是上對下關係的人",
    "與好朋友，家人，或是伴侶",
];
// 主揪任務:後端回傳的 key 是簡體的「建立群组次数」,這裡只能照用
const HOST_TASK_KEY = "建立群组次数";

const TaskProgress = ({ label, currentCount, targetCount }) => {
    const achieved = currentCount >= targetCount;
    const percentage = Math.min(Math.round((currentCount / targetCount) * 100), 100);

    return (
        <div className="task-progress">
            <div className="task-progress-header">
                <Text>{label}</Text>
                <span className="task-progress-count">
                    {achieved && (
                        <Tag color="success" icon={<CheckCircleFilled />} className="task-achieved-tag">已達成</Tag>
                    )}
                    <Text type="secondary">{currentCount}/{targetCount} 次</Text>
                </span>
            </div>
            <Progress
                percent={percentage}
                showInfo={false}
                strokeColor={achieved ? '#52c41a' : '#e5a634'}
            />
        </div>
    );
};

const PointsDisplay = ({ joinCount, createCount }) => {
    const joinPoints = 10; // 每加入一个群组的积分
    const createPoints = 25; // 每创建一个群组的积分
    const totalPoints = joinCount * joinPoints + createCount * createPoints;

    return (
        <div className="points-display">
            <TrophyOutlined className="points-icon" /> {totalPoints}
        </div>
    );
};

// 放在 ProfilePage 外面,元件身分穩定,破圖狀態才不會在重繪時被洗掉
const ProfilePhoto = ({ photo, name }) => {
    const [failedPhoto, setFailedPhoto] = useState(null);
    const showFallback = !photo || failedPhoto === photo;

    return (
        <div className="profile-photo-container">
            {showFallback ? (
                <div className="profile-photo-fallback">
                    <span className="profile-photo-fallback-name">{name}</span>
                </div>
            ) : (
                <img
                    src={photo}
                    alt={name}
                    className="profile-photo"
                    onError={() => setFailedPhoto(photo)}
                />
            )}
        </div>
    );
};

const ProfilePage = () => {
    const { userId: urlUserId } = useParams();  // 从 URL 获取 userId
    const [profile, setProfile] = useState(null);
    // const userId = localStorage.getItem('userId'); 
    const navigate = useNavigate();
   
    const [favoriteCuisines, setFavoriteCuisines] = useState([]);

    // 使用 URL 中的 userId 或从 localStorage 获取的 userId
    const effectiveUserId = urlUserId || localStorage.getItem('userId');
    const isOwnProfile = String(effectiveUserId) === String(localStorage.getItem('userId'));

    const [joinCount, setJoinCount] = useState(0);
    const [createCount, setCreateCount] = useState(0);

    const [groupUses, setGroupUses] = useState({
        "找一般朋友或新朋友": 0,
        "為了互相解決特定問題": 0,
        "學長姐學弟妹或是上對下關係的人": 0,
        "與好朋友，家人，或是伴侶": 0,
        "建立群组次数": 0
    });

    // const [groupUses, setGroupUses] = useState([
    //     { key: "找一般朋友或新朋友聚餐", value: 0, target: 1 },
    //     { key: "為了互相解決問題而聚餐", value: 0, target: 1 },
    //     { key: "找學長姐，老師或是有影響力的人聚餐", value: 0, target: 1 },
    //     { key: "與好朋友，家人，或是伴侶一起聚餐", value: 0, target: 1 },
    //     { key: "建立群组次数", value: 0, target: 2 }
    // ]);

    const targets = {
        "找一般朋友或新朋友": 1,
        "為了互相解決特定問題": 1,
        "學長姐學弟妹或是上對下關係的人": 1,
        "與好朋友，家人，或是伴侶": 1,
        "建立群组次数": 2
      };

    const apiUrl = process.env.REACT_APP_API_URL;
    
    // const joinCount = 5; 
    // const createCount = 3; 

    useEffect(() => {
        // fetch(`${apiUrl}/users/groupCounts/${effectiveUserId}`)
        fetch(`${apiUrl}/users/groupCounts/${effectiveUserId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include' // 如果需要发送凭证信息
        })
            .then(response => response.json())
            .then(data => {
                setJoinCount(data.joinCount);
                setCreateCount(data.createCount);
                // console.log('Group counts updated:', data);
            })
            .catch(error => {
                console.error('Error fetching group counts:', error);
            });
    }, [effectiveUserId, apiUrl]);

    useEffect(() => {
        // fetch(`${apiUrl}/users/progressBar/${effectiveUserId}`)
        fetch(`${apiUrl}/users/progressBar/${effectiveUserId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include' // 如果需要发送凭证信息
        })
            .then(response => response.json())
            .then(data => {
                setGroupUses(data);
            })
            .catch(console.error);
    }, [effectiveUserId, apiUrl]);


    useEffect(() => {
        if (!effectiveUserId) {
            // 沒有登入(例如已登出):回首頁重新登入
            navigate('/', { replace: true });
            return;
        }
      // 這裡假設你有一個後端的API端點 '/api/profile/{userId}'
      // 你需要用實際的用戶ID來取代 '{userId}'
    //   fetch(`${apiUrl}/users/${effectiveUserId}`,{
    //         headers: {
    //             'Content-Type': 'application/json',
    //         }
    //     })
    fetch(`${apiUrl}/users/${effectiveUserId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include' // 如果需要发送凭证信息
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            setProfile(data);
            if (data.expertiseRatingsJson) {
                const ratings = JSON.parse(data.expertiseRatingsJson);
                const sortedCuisines = Object.entries(ratings)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 4)
                    .map(item => item[0]);
                setFavoriteCuisines(sortedCuisines);
            }
            // console.log(data);
        })
        .catch(error => {
            console.error('Error fetching profile:', error);
            // navigate('/');  
        });
    }, [navigate, effectiveUserId, apiUrl]);//添加userID依賴確保

    // 登出:只清掉登入資訊(其他 localStorage 記錄保留),回首頁重新登入
    const handleLogout = () => {
        Modal.confirm({
            title: '確定要登出嗎?',
            okText: '登出',
            cancelText: '取消',
            okButtonProps: { danger: true },
            centered: true,
            onOk: () => {
                localStorage.removeItem('userId');
                localStorage.removeItem('userName');
                message.success('已登出');
                navigate('/');
            },
        });
    };

    // 如果數據還沒加載，顯示加載提示
    if (!profile) {
      return (
        <div className="profile-loading">
          <Spin size="large" />
        </div>
      );
    }

  return (
    <div className="profile-page">
      <div className="profile-layout">
        <header className="profile-header">
          <div>
            <Title level={2} className="profile-header-title">
              {isOwnProfile ? '我的個人資料' : '個人資料'}
            </Title>
            {isOwnProfile && (
              <Badge
                status="success"
                text={`已登入:${localStorage.getItem('userName') || profile.name}`}
                className="profile-login-status"
              />
            )}
          </div>
          {isOwnProfile && (
            <Button danger icon={<LogoutOutlined />} onClick={handleLogout}>
              登出
            </Button>
          )}
        </header>
        {/* 左欄:個人卡(電腦版捲動時固定) */}
        <aside className="profile-side">
          <Card className="profile-card" cover={<ProfilePhoto photo={profile.photo} name={profile.name} />}>
            <div className="name-and-point">
              <div className="profile-details">
                <Title level={3} className="profile-name">
                  {profile.name}
                  {profile.nickname && <Text type="secondary" className="profile-nickname">({profile.nickname})</Text>}
                </Title>
                <Text type="secondary" className="profile-age">
                  <CalendarOutlined /> {profile.birthday} {profile.gender}
                </Text>
              </div>
              <PointsDisplay joinCount={joinCount} createCount={createCount} />
            </div>
            <div className="profile-about">
              <Text strong>關於我</Text>
              <Paragraph className="profile-bio">{profile.bio}</Paragraph>
            </div>
          </Card>
        </aside>

        {/* 右欄:個人資訊、最愛的料理類型、任務進度 */}
        <main className="profile-main">
          <Card title="個人資訊" className="profile-section-card">
            <Descriptions column={{ xs: 1, sm: 2 }} size="small" colon>
              <Descriptions.Item label="居住城市">{profile.city}</Descriptions.Item>
              <Descriptions.Item label="大學系所">{profile.education}</Descriptions.Item>
              <Descriptions.Item label="年級">{profile.grade}</Descriptions.Item>
              <Descriptions.Item label="職稱">{profile.title}</Descriptions.Item>
              <Descriptions.Item label="星座">{profile.starSigns ? `${profile.starSigns}座` : ''}</Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="最愛的料理類型" className="profile-section-card">
            {favoriteCuisines.length > 0 ? (
              <div className="cuisine-tags">
                {favoriteCuisines.map(cuisine => (
                  <Tag key={cuisine} color="gold" className="cuisine-tag">{cuisine}</Tag>
                ))}
              </div>
            ) : (
              <Text type="secondary">尚未填寫</Text>
            )}
          </Card>

          <Card title="任務進度" className="profile-section-card">
            <div className="task-group">
              <Text strong className="task-group-title">聚餐情境任務</Text>
              {DINING_CONTEXT_TASKS.map(context => (
                <TaskProgress
                  key={context}
                  label={context}
                  currentCount={groupUses[context] ?? 0}
                  targetCount={targets[context]}
                />
              ))}
            </div>
            <div className="task-group">
              <Text strong className="task-group-title">主揪任務</Text>
              <TaskProgress
                label="建立群組"
                currentCount={groupUses[HOST_TASK_KEY] ?? 0}
                targetCount={targets[HOST_TASK_KEY]}
              />
            </div>
          </Card>
        </main>
      </div>

      <BottomNav />
    </div>
  );
};

export default ProfilePage;