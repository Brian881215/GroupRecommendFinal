// ProfilePage.js
import React, { useEffect, useState } from 'react';
import BottomNav from '../Bottom/BottomNav';
import './ProfilePage.css'; // 記得創建一個對應的CSS檔案
import { useParams,useNavigate } from 'react-router-dom';
import {FaBirthdayCake } from 'react-icons/fa'; 
// import { FaStar } from 'react-icons/fa';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';

const ProfilePage = () => {
    const { userId: urlUserId } = useParams();  // 从 URL 获取 userId
    const [profile, setProfile] = useState(null);
    // const userId = localStorage.getItem('userId'); 
    const navigate = useNavigate();
   
    const [favoriteCuisines, setFavoriteCuisines] = useState([]);

    // 使用 URL 中的 userId 或从 localStorage 获取的 userId
    const effectiveUserId = urlUserId || localStorage.getItem('userId');

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

    const ProgressBar = ({ progress, label, currentCount, targetCount }) => {
        const percentage = Math.min(progress * 100, 100).toFixed(0); // 计算百分比，保留到整数
    
        return (
          <div className="progress-container">
            <label>{label}</label>
            <div className="progress-bar-wrapper">
                <div className="progress-bar">
                    <div className="progress" style={{ width: `${percentage}%` }}></div> 
                </div>

                <span className="progress-info">{percentage}% ({currentCount}/{targetCount}次)</span>
            </div>
          </div>
        );
    };

    const PointsDisplay = ({ joinCount, createCount }) => {
        // console.log("testing count:",joinCount,createCount);
        const joinPoints = 10; // 每加入一个群组的积分
        const createPoints = 25; // 每创建一个群组的积分
        const totalPoints = joinCount * joinPoints + createCount * createPoints;
    
        return (
            <div className="points-display">
                <MilitaryTechIcon className="points-icon" /> {totalPoints}
            </div>
        );
    };

    const apiUrl = process.env.REACT_APP_API_URL;
    
    // const joinCount = 5; 
    // const createCount = 3; 

    useEffect(() => {
        fetch(`${apiUrl}/users/groupCounts/${effectiveUserId}`)
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
        fetch(`${apiUrl}/users/progressBar/${effectiveUserId}`)
            .then(response => response.json())
            .then(data => {
                setGroupUses(data);
            })
            .catch(console.error);
    }, [effectiveUserId, apiUrl]);


    useEffect(() => {
        if (!effectiveUserId) {
            console.error('No user ID found in localStorage.');
            //此邏輯設計很好這樣才可以透過重新登入來渲染畫面
            navigate('/');  // 如果沒有找到userID，重定向到登錄頁面
            return;
        }
      // 這裡假設你有一個後端的API端點 '/api/profile/{userId}'
      // 你需要用實際的用戶ID來取代 '{userId}'
      fetch(`${apiUrl}/users/${effectiveUserId}`,{
            headers: {
                'Content-Type': 'application/json',
            }
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
            navigate('/');  // 處理錯誤，例如API調用失敗後重定向到登錄頁面
        });
    }, [navigate, effectiveUserId, apiUrl]);//添加userID依賴確保

    // 如果數據還沒加載，顯示加載提示
    if (!profile) {
      return <div> Loading...</div>;
    }

  return (
    <div className="profile-container">
        <div className="profile-photo-container">
            <img src={profile?.photo} alt="ProfilePhoto" className="profile-photo"/>
        </div>
        <div className='name-and-point'>
            <div className="profile-details">
                {/* User details are now below the photo */}
                <h1 className="profile-name">{profile?.name}({profile?.nickname})</h1>
                <p className="profile-age"><FaBirthdayCake /> {profile?.birthday} {profile?.gender}</p>
            </div>
            <div className="ProfilePoints">
                <PointsDisplay joinCount={joinCount} createCount={createCount} />
            </div>
        </div>
        <div className="profile-about">
            <h2>關於我:</h2>
            <p>{profile?.bio}</p>
        </div>
        <div className="profile-info">
            <h2>個人資訊:</h2>
            <p><strong>居住城市: </strong> {profile?.city}</p>
            <p><strong>大學系所: </strong> {profile?.education}</p>
            <p><strong>年級: </strong> {profile?.grade}</p>
            <p><strong>職稱: </strong> {profile?.title}</p>
            <p><strong>星座:</strong>{profile?.starSigns}座</p>
        </div>
        <div className="profile-cuisines">
            <h2>最愛的食物類型:</h2>
            {favoriteCuisines.map(cuisine => (
                <button key={cuisine} className="cuisine-button">
                    {cuisine}
                </button>
            ))}
        </div>

        <div className="profile-bar">
            <h2>聚餐情境任務進度:</h2>
            {Object.entries(groupUses).map(([purpose, count]) => (
                <ProgressBar key={purpose} progress={count / targets[purpose]} label={purpose} currentCount={count} targetCount = {targets[purpose]} />
            ))}
        </div>

        <BottomNav />
    </div>
  );
};

export default ProfilePage;