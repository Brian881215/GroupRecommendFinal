import React, { useEffect, useState, useRef, useCallback } from 'react';
import BottomNav from '../Bottom/BottomNav';
import './GroupPage.css'; // 自己创建一个 CSS 文件以便于定制样式
import {useParams, useNavigate } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import List from '@mui/material/List';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';

import DialogActions from '@mui/material/DialogActions';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import StarRateIcon from '@mui/icons-material/StarRate';
import {Snackbar, Alert } from '@mui/material';

const GroupPage = () => {
  const [groupInfo, setGroupInfo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // 新增狀態來存儲錯誤信息
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleString('en-US', options).replace(',', '');
  };

  const { groupId } = useParams();
  const userId = localStorage.getItem('userId'); 
  const userName = localStorage.getItem('userName');
  const navigate = useNavigate();
  const [groupMembers, setGroupMembers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);

  const [open, setOpen] = useState(false);
  // const [isRecommendDisabled, setIsRecommendDisabled] = useState(false);
  // const [isRecommendDisabled2, setIsRecommendDisabled2] = useState(false);

  const [recommendations, setRecommendations] = useState([]);
  const [recommendations2, setRecommendations2] = useState([]);
  const [recommendationScore1, setRecommendationScore1] = useState("");
  const [recommendationScore2, setRecommendationScore2] = useState("");
  const [groupDecision, setGroupDecision] = useState("");
  const [loveCount1, setLoveCount1] = useState(0);
  const [loveCount2, setLoveCount2] = useState(0);

  const [favorites, setFavorites] = useState(new Array(recommendations.length).fill(false));
  const [favorites2, setFavorites2] = useState(new Array(recommendations2.length).fill(false));
  const [recommendationFlagUpdated, setRecommendationFlagUpdated] = useState(false);

  const webSocketRef = useRef(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [error, setError] = useState('');

  const [isRecommendDisabled2, setIsRecommendDisabled2] = useState(JSON.parse(localStorage.getItem(`isRecommendDisabled2-${userId}-${groupId}`)) || false);

  const apiUrl = process.env.REACT_APP_API_URL;
  const apiUrlNoHttp = process.env.REACT_APP_API_NO_HTTP;

  const fetchRecommendationsFromDB = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/groups/recommendDB/${groupId}`);
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data);
        setFavorites(new Array(data.length).fill(false));
      } else {
        throw new Error('Failed to fetch recommendations from DB');
      }

      const response2 = await fetch(`${apiUrl}/groups/recommend2DB/${groupId}`);
      if (response2.ok) {
        const data2 = await response2.json();
        setRecommendations2(data2);
        setFavorites2(new Array(data2.length).fill(false));
      } else {
        throw new Error('Failed to fetch recommendations from DB');
      }
    } catch (error) {
      console.error('Error fetching recommendations from DB:', error);
    }
  }, [groupId, apiUrl]);

  const fetchRecommendations = useCallback(async () => {
    // 假设您有一个获取推荐的API endpoint
    try {

      const response = await fetch(`${apiUrl}/groups/recommend/${groupId}`);
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data); // 存储推荐数据
      } else {
        throw new Error('Failed to fetch recommendations');
      }

      const response2 = await fetch(`${apiUrl}/groups/recommend2/${groupId}`);
      if (response2.ok) {
        const data2 = await response2.json();
        setRecommendations2(data2); // 存储推荐数据
      } else {
        throw new Error('Failed to fetch recommendations');
      }

    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  }, [groupId, apiUrl]);

  const fetchGroupInfo = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/groups/${groupId}`);
      const data = await response.json();
      setGroupInfo(data);

      if (data.recommendationFlag) {
        await fetchRecommendationsFromDB();
      }
    } catch (error) {
      console.error("Error loading group info:", error);
      setErrorMessage(error.message);
    }
  }, [groupId, fetchRecommendationsFromDB, apiUrl]);

  // 获取群组信息
  useEffect(() => {
    fetchGroupInfo();
  }, [groupId,recommendationFlagUpdated,fetchGroupInfo]);
  //[navigate, userId]);//添加userID依賴確保 for dependency problem 

  const handleViewGroup = () => {
    // 实现发送推荐的逻辑
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
  // 关闭对话窗
    setOpenDialog(false);
  };
  const redirectToUserProfile = (userId) => {
   
    navigate(`/profile/${userId}`);
  };
  // 获取群组消息
  useEffect(() => {
    fetch(`${apiUrl}/groups/messages/${groupId}`)
      .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch messages');
        }
        return response.text();
      })
      .then(text =>{
        // console.log('Received text:', text);
        const jsonArrayString = "[" + text +"]";
        return JSON.parse(jsonArrayString);
      })
      .then(data => {
        setMessages(data); // 直接設置為解析後的 JSON 數據
      })
      .catch(error => {
        console.error('Error fetching messages:', error);
        setErrorMessage(error.message);
      });
//  取得已確定加入group的團體名單
      fetch(`${apiUrl}/groups/members/${groupId}`)
      .then(response => response.json())
      .then(memberDTOs => {
        setGroupMembers(memberDTOs);
      })
      .catch(error => console.error('Error fetching group members:', error));
  }, [groupId, apiUrl]);

//webSocket
  useEffect(() => {
    // 建立 WebSocket 连接
    const ws = new WebSocket(`ws://${apiUrlNoHttp}/groups/ws/messages/${groupId}`);

    ws.onmessage = (event) => {
      const newMessage = JSON.parse(event.data);
      setMessages(prevMessages => [...prevMessages, newMessage]);
//new
      if (newMessage.type === 'RECOMMENDATION_UPDATE') {
        fetchRecommendations(); // Fetch recommendations when recommendation update is received
        setRecommendationFlagUpdated(prev => !prev); 
      }
    };

    ws.onclose = () => console.log('WebSocket disconnected');
    ws.onerror = (error) => console.error('WebSocket error', error);

    webSocketRef.current = ws;

    return () => {
      // ws.close();
      if (webSocketRef.current) {
        webSocketRef.current.close();
      }
    };
  }, [groupId, fetchRecommendations,apiUrlNoHttp]);

  const toggleFavorite = (index, groupId, list) => {
    const recommendOrder = groupId % 2;

    // 你说得对，else if 和 else 是互斥的，所以在一个执行流中它们不会同时执行。那为什么上面的代码会有问题呢？让我们仔细检查一下。
    // 确实，在逻辑上，两个代码块应该是等价的，都是根据 list 和 recommendOrder 来更新状态。
    // 但是，React 的状态更新是异步的，这意味着在一次渲染中多次调用 setState 可能不会立即反映最新的状态，导致在复杂条件判断下状态可能没有预期那样更新。
    // if (list === 1  && recommendOrder === 1) { //表示groupId是奇數
    //   const newFavorites = [...favorites];
    //   newFavorites[index] = !newFavorites[index];
    //   setFavorites(newFavorites);
    //   setLoveCount1(newFavorites.filter(fav => fav).length);
    //   console.log("Favorites (list 1, odd groupId):", newFavorites);
    // } else if(list === 2  && recommendOrder === 1){ //表示groupId是奇數
    //   const newFavorites2 = [...favorites2];
    //   newFavorites2[index] = !newFavorites2[index];
    //   setFavorites2(newFavorites2);
    //   setLoveCount2(newFavorites2.filter(fav => fav).length);
    //   console.log("Favorites2 (list 2, odd groupId):", newFavorites2);
    // } else if(list === 1  && recommendOrder === 0){ //表示groupId是偶數
      
    //   const newFavorites2 = [...favorites2];
    //   newFavorites2[index] = !newFavorites2[index];
    //   setFavorites2(newFavorites2);
    //   setLoveCount2(newFavorites2.filter(fav => fav).length);
    //   console.log("Favorites2 (list 1, even groupId):", newFavorites2);
    // }else{ //表示groupId是偶數
    //   const newFavorites = [...favorites];
    //   newFavorites[index] = !newFavorites[index];
    //   setFavorites(newFavorites);
    //   console.log("Favorites (list 2, even groupId):", newFavorites);
    // }
    if (recommendOrder === 1) { // 如果 groupId 是奇数
      if (list === 1) {
        const newFavorites = [...favorites];
        newFavorites[index] = !newFavorites[index];
        setFavorites(newFavorites);
        setLoveCount1(newFavorites.filter(fav => fav).length);
        console.log("Favorites (list 1, odd groupId):", newFavorites);
      } else if (list === 2) {
        const newFavorites2 = [...favorites2];
        newFavorites2[index] = !newFavorites2[index];
        setFavorites2(newFavorites2);
        setLoveCount2(newFavorites2.filter(fav => fav).length);
        console.log("Favorites2 (list 2, odd groupId):", newFavorites2);
      }
    } else { // 如果 groupId 是偶数
      if (list === 1) {
        const newFavorites2 = [...favorites2];
        newFavorites2[index] = !newFavorites2[index];
        setFavorites2(newFavorites2);
        setLoveCount2(newFavorites2.filter(fav => fav).length);
        console.log("Favorites2 (list 1, even groupId):", newFavorites2);
      } else if (list === 2) {
        const newFavorites = [...favorites];
        newFavorites[index] = !newFavorites[index];
        setFavorites(newFavorites);
        setLoveCount1(newFavorites.filter(fav => fav).length);
        console.log("Favorites (list 2, even groupId):", newFavorites);
      }
    }
  };

  // 发送消息
  const handleSendMessage = () => {
    const trimmedMessage = newMessage.trim();
    if (!trimmedMessage) {
      console.log(trimmedMessage);
      setError('訊息不可為空');
      setOpenSnackbar(true);
      // alert("訊息不可為空");
      return;
    }
    
    const messageData = { userId, userName, text: trimmedMessage };

    if (webSocketRef.current.readyState === WebSocket.OPEN) {
      webSocketRef.current.send(JSON.stringify(messageData));
      setNewMessage("");
      setErrorMessage("");
    } else {
      // setErrorMessage("請刷新頁面再輸入訊息!");
      setError('請刷新頁面再輸入訊息');
      setOpenSnackbar(true);
      // alert("請刷新頁面再輸入訊息!")
    }
  };

  if (!groupInfo) {
    return <div>Loading group information...</div>;
  }

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
        return;
    }
    setOpenSnackbar(false);
  };

  const handleConfirm = (async () => {
    if (groupMembers.length < 2) {
      setError('團體推薦至少要兩個人');
      setOpenSnackbar(true);
      return;
    }
    // 在这里添加加入群组的逻辑
    setOpen(false);
    // setIsRecommendDisabled(true); 

    try {
      // 先设置 recommendationFlag 为 true
      setGroupInfo(prevGroupInfo => ({
        ...prevGroupInfo,
        recommendationFlag: true
      }));
      const response = await fetch(`${apiUrl}/groups/recommendationFlag/${groupId}`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to update recommendation flag');
      }
      await fetchRecommendations();
      // 更新recommendationFlagUpdated 以觸發 useEffect
      setRecommendationFlagUpdated(true);
//新加入
      if (webSocketRef.current.readyState === WebSocket.OPEN) {
        // webSocketRef.current.send(JSON.stringify({ type: 'RECOMMENDATION_UPDATE' }));
        const systemMessage = {
          type: 'RECOMMENDATION_UPDATE',
          userName,
          text: '我已進行推薦，現在我們要決定一間想去的餐廳，我需要提交一個餐廳編號(系統訊息)',
        };
        webSocketRef.current.send(JSON.stringify(systemMessage));
      }

    }catch (error) {
      console.error('Error updating recommendation flag', error);
    }
  },[apiUrl]);

  const handleRatingChange1 = (e) => {
      setRecommendationScore1(e);
      // console.log("RecommendationScore1:", e);
  };

  const handleRatingChange2 = (e) => {
      setRecommendationScore2(e);
      // console.log("RecommendationScore2:", e);
  };

  const handleSubmit = async () => {

    // console.log('recommendationScore1:', recommendationScore1);
    // console.log('recommendationScore2:', recommendationScore2);
    // console.log('groupDecision:', groupDecision);
    // console.log('loveCount1:', loveCount1);
    // console.log('loveCount2:', loveCount2);

    if (Number(userId) === Number(groupInfo.creatorId)) {
      if (!recommendationScore1 || !recommendationScore2 || !groupDecision || loveCount1 < 1 || loveCount2 < 1) {
        setError('請填寫兩個推薦清單評分與最終決定的餐廳編號並各選擇一到多個餐廳到最愛');
        setOpenSnackbar(true);
        return;
      }
      const value1 = parseInt(groupDecision, 10);
      if (value1 < 1 || value1 > 14) {
        setError('餐廳編號必須是1-14之間的數字');
        setOpenSnackbar(true);
        return;
      } 
    } else {
      if (!recommendationScore1 || !recommendationScore2 || loveCount1 < 1 || loveCount2 < 1) {
        setError('請填寫兩個推薦清單評分並各選擇一到多個餐廳到最愛');
        setOpenSnackbar(true);
        return;
      }
    }
    const value1 = parseInt(recommendationScore1, 10);
    if (value1 < 1 || value1 > 10) {
      setError('推薦滿意度必須是1-10之間的數字');
      setOpenSnackbar(true);
      return;
    } 
  
    const value2 = parseInt(recommendationScore2, 10);
      if (value2 < 1 || value2 > 10) {
        setError('推薦滿意度必須是1-10之間的數字');
        setOpenSnackbar(true);
        return;
    } 

    setIsRecommendDisabled2(true);
   
    localStorage.setItem(`isRecommendDisabled2-${userId}-${groupId}`, JSON.stringify(true));
    try {
      const recommendationData = {
        groupId,
        userId,
        recommendationScore1,
        recommendationScore2,
        groupDecision,
        loveCount1,
        loveCount2
      };

      const response = await fetch(`http://172.20.10.11:8080/api/groups/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recommendationData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit recommendations');
      }

      // const data = await response.json();
      // console.log('Recommendation saved:', data);
      setIsRecommendDisabled2(true);
    } catch (error) {
      console.error('Error submitting recommendations:', error);
    }
  };

  function cleanTags(tagsString) {
    // 尝试去除可能的外围方括号和单引号
    const cleaned = tagsString.replace(/[\]['"]/g, '');
    // 分割清洗后的字符串并连接
    return cleaned.split(',').join(' | ');
  }
  // console.log('Current User ID:', userId);
  // console.log('Creator ID from groupInfo:', groupInfo.creatorId);
  // console.log('Type of userId:', typeof userId);
  // console.log('Type of groupInfo.creatorId:', typeof groupInfo.creatorId);

  const renderRecommendationList = (recommendations, score, handleRatingChange, favorites, toggleFavorite, listNumber) => (
    <div>
      <h3 className="recommendList10"><b>團體推薦清單{listNumber}</b></h3>
      <div className="recommendation-list">
        {recommendations.map((restaurant, index) => (
          <div key={index} className="recommendation-card">
            <div className='recommendation-card-content'>
              <h3 className="restaurant-name">{index + 1 + (listNumber === 2 ? 7 : 0)}. {restaurant.name}</h3>
              <div className="restaurant-info">
                <span><StarRateIcon color="error" className='starIcon'></StarRateIcon></span>
                <span className='restaurant-rating'>{restaurant.rating}({restaurant.reviewCount})</span>
                <span> ${restaurant.averageCost}</span>
              </div>
              <p className="restaurant-address">{restaurant.address}</p>
              <p className="restaurant-tags">{cleanTags(restaurant.tags)}</p>
              <a href={restaurant.link} target="_blank" rel="noopener noreferrer" className='more-info'>更多資訊</a>
            </div>
            <Button onClick={() => toggleFavorite(index, Number(groupId), listNumber)} className="favorite-button">
              {favorites[index] ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon color="error" />}
            </Button>
          </div>
        ))}
        <div className="ratingInput">
          <label>推薦滿意度</label>
          <input
            type="number"
            min="1"
            max="10"
            placeholder=" 1-10"
            className="ratingInputText"
            value={score}
            // onChange={handleRatingChange}
            onChange={(e) =>handleRatingChange(e.target.value)}
            required
          />
        </div>
        {Number(userId) === Number(groupInfo.creatorId) && listNumber === 2 && (
          <div className="ratingInput">
            <label>最終選擇餐廳</label>
            <input
              type="number"
              min="1"
              max="14"
              step="1"
              placeholder=" 1-14"
              className="ratingInputText"
              value={groupDecision}
              onChange={(e) => setGroupDecision(e.target.value)}
              required
              onKeyPress={(e) => {
                if (!/^[0-9]*$/.test(e.key) || e.target.value.length >= 2) {
                  e.preventDefault();
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="group-container">
      {/* 要限制傳照片的格式，不可以是heic檔案 */}
      <div className ="group-photo-container">
        <img src={groupInfo?.photo} alt="groupPhoto" className="group-image"/>
      </div>
      <Dialog open={openDialog} onClose={handleCloseDialog} style={{ textAlign: 'center' }}>
        <DialogTitle>群組成員</DialogTitle>
        <DialogContent>
          <DialogContentText>
            點擊查看個人相關資訊
          </DialogContentText>
          <List>
            {groupMembers.map((member, index) => (
              <Button onClick={() => redirectToUserProfile(member.userId)} 
                key={member.userId ? member.userId : index} 
                variant="contained" color="primary"
                style={{
                  margin: '5px',  // 增加间隔
                
                  borderRadius: '10px'  // 圆角
              }}>
                {member.userName}
              </Button>
            
            ))}
          </List>
        </DialogContent>
      </Dialog>
      <div className="group-details">
        {/* Display group details here */}
        <div className="title-with-time">
          <h2 className="group-title">{groupInfo.title}</h2>
          <p className="dining-time"> {formatDate(groupInfo.diningTime)}</p>
        </div>
        <p className="group-description">{groupInfo.description}</p>
        <p className="meeting-place"><b>集合地點:</b> {groupInfo.meetingPlace}</p>
        <p>
          <b>推薦餐廳的區域:</b> {groupInfo.districts || '無偏好'}
        </p>
        <p>
          <button onClick={handleViewGroup} className="viewGroup-submit">瀏覽群組人員</button>  {groupMembers.length}/{groupInfo.maxNumber} 已加入
        </p>
        <p><b>餐廳平均價格:</b> &lt;${groupInfo.price}</p>
      </div>       
      {Number(userId) === Number(groupInfo.creatorId) && (
        <div className="group-button">
          <button  onClick={handleClickOpen} disabled={groupInfo.recommendationFlag} className={`recommend-submit ${groupInfo.recommendationFlag ? 'disabled' : ''}`}><b>立即推薦</b></button>
        </div>
      )}
       <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" style={{ textAlign: 'center' }}>{"開始推薦"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description" style={{ textAlign: 'center' }}>
            你確定要立即推薦? <br></br>
            (推薦後即無法再加人)
          </DialogContentText>
        </DialogContent>
        <DialogActions style={{ justifyContent: 'center' }}>
          <Button onClick={handleConfirm} color="primary" autoFocus>
            確定
          </Button>
          <Button onClick={handleClose} color="primary">
            取消
          </Button>
        </DialogActions>
      </Dialog>
   
    {groupInfo.recommendationFlag && (
            
            <div className="groupPageOuter">
              <div className="recommendListDesc">請填寫兩個推薦清單評分並各選擇一到多個餐廳到最愛，創建群組者需填寫你們最終討論出來的餐廳</div>
              {Number(groupId) % 2 !== 0 ? (
                <>
                  {renderRecommendationList(recommendations, recommendationScore1, handleRatingChange1, favorites, toggleFavorite, 1)}
                  {renderRecommendationList(recommendations2, recommendationScore2, handleRatingChange2, favorites2, toggleFavorite, 2)}
                </>
              ) : (
                <>
                  {renderRecommendationList(recommendations2, recommendationScore2, handleRatingChange2, favorites2, toggleFavorite, 1)}
                  {renderRecommendationList(recommendations, recommendationScore1, handleRatingChange1, favorites, toggleFavorite, 2)}
                </>
              )}
               <div className="group-button">
                  <button type="submit"  disabled={isRecommendDisabled2} className={`recommend-submit2 ${isRecommendDisabled2 ? 'disabled' : ''}`} onClick={handleSubmit} ><b>提交</b></button>
              </div>
            </div>
    )}
     

      <div className="group-messages">
        {messages.map((message, index) => (
          <div key={message.id || index}>
            <p>{message.userName || 'Unknown User'}: {message.text}</p>
          </div>
        ))}
      </div>
      <div className="message-input">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="請輸入聊天訊息"
        />
        <IconButton onClick={handleSendMessage} color="default"  className="mesSend-icon-button" sx={{ fontSize: 30 }}>
          <SendIcon />
        </IconButton>
      </div>
      {errorMessage && <div className="error-message" style={{ color: 'red', marginTop: '10px'  }}>{errorMessage}</div>}
      <BottomNav />
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="error">
            {error}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default GroupPage;

