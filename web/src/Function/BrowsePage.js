// BrowsePage.js
import BottomNav from '../Bottom/BottomNav';
import './BrowsePage.css';
import React, { useState, useEffect, useCallback } from 'react';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import GroupIcon from '@mui/icons-material/Group';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

const BrowsePage = () => {

  const navigate = useNavigate();
  const [userGroups, setUserGroups] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const userId = localStorage.getItem("userId");// 你需要有办法获得当前用户的ID;
  const [snackOpen, setSnackOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);//防止button短時間內雙擊觸發兩次Api
  const [open, setOpen] = useState(false);
  const [currentGroupId, setCurrentGroupId] = useState(null);
  const [joinRequested, setJoinRequested] = useState({});
  const [userRequested, setUserRequested] = useState([]);
  const [currentApproveGroupId, setCurrentApproveGroupId] = useState(null); 
  const [openDialog, setOpenDialog] = useState(false);
  const [currentGroup, setCurrentGroup] = useState(null);
//new 
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

const apiUrl = process.env.REACT_APP_API_URL;

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleString('en-US', options).replace(',', '');
  };

  const handleSnackClose = () => {
      setSnackOpen(false);
  };
  const handleAlertClose = () => {
    setAlertOpen(false);
  };

  const handleApproval = useCallback((groupId) => {
    // 处理用户是群组创建者时的逻辑
    setCurrentApproveGroupId(groupId); // 设置当前正在审批的群组ID
    fetch(`${apiUrl}/groups/join-requests/${groupId}`)
    .then(response => response.json())
    .then(data => {
      if (Array.isArray(data)) {  // Check if data is an array
        setUserRequested(data);
        setCurrentGroup(data);
        console.log("memberGroupDTO:", data);
      } else {
        console.error('Data received is not an array:', data);
        setUserRequested([]);  // Set to empty array if data is not correct
      }
      setOpenDialog(true);
      console.log("Approval for groupId:", groupId);
    })
    .catch(error => {
      console.error('Error fetching join requests:', error);
      setUserRequested([]);
    });
  }, [apiUrl]);

  const handleClickOpen = (groupId) => {

    fetch(`${apiUrl}/groups/${groupId}`)
      .then(response => response.json())
      .then(group => {
        if (group.memberCount === group.maxNumber) {
          setAlertMessage('此群組已滿員無法提出申請');
          setAlertOpen(true);
        } else {
          setOpen(true);
          setCurrentGroupId(groupId);
        }
      })
      .catch(error => console.error('Error fetching group details:', error));
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleAcceptUser = useCallback((groupId, userId) => {


    fetch(`${apiUrl}/groups/${groupId}`)
    .then(response => response.json())
    .then(group => {
      if (group.recommendationFlag) {
        setAlertMessage('此群組已開始推薦，無法再加入新成員');
        setAlertOpen(true);
      } else {
        // 调用 API 将用户加入群组
        fetch(`${apiUrl}/groups/${groupId}/approve/${userId}`, {
          method: 'POST'
        })
        .then(response => {
          if (!response.ok) throw new Error('Failed to add user');
          return fetch(`${apiUrl}/groups/join-requests/${groupId}`);  // Fetch the updated join requests
        })
        .then(response => response.json())
        .then(updatedRequests => {
          console.log('Updated join requests after adding user:', updatedRequests);
          setUserRequested(updatedRequests);
      
          // 如果 updatedRequests 是空数组，则获取当前群组详细信息
          if (updatedRequests.length === 0) {
            return fetch(`${apiUrl}/groups/${groupId}`)
              .then(response => response.json())
              .then(groupDetails => {
                console.log('Fetched group details:', groupDetails);
                setCurrentGroup([groupDetails]); // Update the current group with the latest details
                return groupDetails; // 返回 groupDetails 以便后续使用
              });
          } else {
            // 否则使用 join-requests 的第一项更新当前群组
            setCurrentGroup(updatedRequests);
            return updatedRequests[0]; // 返回 updatedRequests 的第一项以便后续使用
          }
        })
        .then(groupDetails => {
          // 使用返回的群组详细信息更新 isFull 状态
          setUserRequested(prev => prev.map(user => ({
            ...user,
            isFull: groupDetails.memberCount >= groupDetails.maxNumber
          })));
        })
        .catch(error => console.error('Error accepting user:', error));
      }
    })
    .catch(error => console.error('Error fetching group details:', error));
}, [apiUrl]);

  const handleConfirm = async () => {
    try {
        await sendJoinRequest(currentGroupId,userId);
        setJoinRequested(prev => ({...prev, [currentGroupId]: true}));
        setSnackOpen(true);
        handleClose(); // Close the dialog
    } catch (error) {
        console.error('Error approving join request:', error);
    }
  };

  useEffect(() => {
    const fetchUserJoinRequests = async() => {
      try{
        //單個非創建群組的user有提出聲請的groupId有哪些
        const response = await fetch(`${apiUrl}/users/user-requests/${userId}`);
        if(!response.ok) throw new Error('Failed to fetch user join requests');
        // const data = await response.json();
        const groupIdsString = await response.text();
        const groupIdsArray = groupIdsString.split(',');
        const joinRequestsMap = groupIdsArray.reduce((acc, groupId)=> {
          acc[groupId.trim()]= true;
          return acc;
        }, {});
        setJoinRequested(joinRequestsMap);
      }catch (error){
        console.error('Error fetching user join requests:',error);
      }
    };

    fetchUserJoinRequests();

    // 获取用户创建的所有群组
    fetch(`${apiUrl}/groups/created-by/${userId}`)
      .then(response => response.json())
      .then(data => {
        setUserGroups(data);
      })
      .catch(error => {
        console.error('Error fetching user groups:', error);
      });

    // 获取不是用戶建立的所有群组
    fetch(`${apiUrl}/groups/not-created-by/${userId}`)
      .then(response => response.json())
      .then(data => {
        setAllGroups(data);
      })
      .catch(error => {
        console.error('Error fetching all groups:', error);
      });

      if (currentGroup && userRequested.length > 0) {
        const isFull = currentGroup.memberCount >= currentGroup.maxNumber;
        if (isFull && !userRequested.some(user => user.isFull)) {
          // 更新界面上的按鈕顯示為已滿員
          setUserRequested(userRequested.map(user => ({
            ...user,
            isFull: true
          })));
          // setUserRequested((prev) => [...prev]); 
        }
        console.log('Current group memberCount:', currentGroup[0].memberCount);
        console.log('Current group maxNumber:', currentGroup[0].maxNumber);
      }
  }, [userId,currentGroup, userRequested,apiUrl]);

  const sendJoinRequest = async (groupId, userId) => {
    if(isSubmitting) return;
    setIsSubmitting(true);
    try{
      const response = await fetch(`${apiUrl}/groups/${groupId}/request/${userId}`, {
          method: 'POST'
      });
      if (!response.ok) {
          throw new Error('Failed to send join request');
      }
    }catch (error){
      console.error("Failed to send join request:",error);
    }finally{
      setIsSubmitting(false);
    }
  };

  const renderDialog = () => (
    <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
      <DialogTitle><b>申請加入者列表</b></DialogTitle>
      <DialogContent>
        {userRequested.length > 0 ? (
          <List>
            {userRequested.map(user => (
              <ListItem key={user.userId}>
                {/* {user.userName} */}
                <Link to={`/profile/${user.userId}`} className="user-name-link">
                  {user.userName}
                </Link>
                <Button 
                  onClick={() => handleAcceptUser(currentApproveGroupId, user.userId)}
                  disabled={!currentGroup || user.isFull|| currentGroup[0].memberCount >= currentGroup[0].maxNumber}
                >
                  {/* 因為我透過http://172.20.10.11:8080/api/users/user-requests/${userId}會回傳array到setCurrentGroup，所以要取得變數得透過array[0].屬性 */}
                  {currentGroup && currentGroup[0].memberCount >= currentGroup[0].maxNumber ? '已滿員' : '加入'}
                </Button>
              </ListItem>
            ))}
           </List>
        ): (
          <p className="applicantRequest">目前尚無申請者</p>
        )}
      </DialogContent>
    </Dialog>
  );

  const redirectToUserProfile = (userId) => {
   
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="browse-page-outer">
    <div className="browse-page">
      {renderDialog()}
      <h1 className="browseGroup_h1">Browse the dining group</h1>
      <section className="user-dining-journey">
        <h2 className="browseGroup_h2">你所創建的群組</h2>
        <div className="browseGroup-container">
        {userGroups.length > 0 ? (
          userGroups.map(group => (
            <div className="group-card" key={group.id}>
               <LazyLoadImage
                src={group.photo} // 使用实际的图像 URL
                alt={group.name}
                effect="blur" // 应用模糊效果作为加载占位符
                className="browseGroup-image"
              />
              {/* <img src={group.photo} alt={group.name} className="browseGroup-image"/> */}
              <Snackbar open={snackOpen} autoHideDuration={6000} onClose={handleSnackClose} message="您已成功向創建者提出申請！" />
              <div className="browse-group-card-top-right">
                <CheckCircleOutline style={{ color: 'green', cursor: 'pointer', fontSize: '2.8rem' }} onClick={() => handleApproval(group.id)} />
              </div>
              <h3 className="browseGroupTitle">{group.title}</h3>
              <p className="browseDiningTime"> {formatDate(group.diningTime)}</p>
              <p className="browseGroupDescription">{group.description}</p>
              <p className="browseGroupPurpose"><b>聚餐情境:</b> {group.purpose}</p>
              <span><b>創建者:</b> <span className="browseUsername"><b>{group.userName}</b></span> <GroupIcon className="groupIcon" />{group.memberCount}/{group.maxNumber} $&lt;{group.price} </span>
            </div> 
          ))
        ) : (
            <p className="no-createdGroups">尚未有你創建的群組。</p>
        )}
        </div>
        <h2 className="browseGroup_h2">你可申請加入的群組</h2>
        <div className="browseGroup-container">
          {allGroups.map(group => (
            <div className="group-card-browse" key={group.id}>
              {/* <img src={group.photo} alt={group.name} className="browseGroup-image"/> */}
              <LazyLoadImage
                src={group.photo} // 使用实际的图像 URL
                alt={group.name}
                effect="blur" // 应用模糊效果作为加载占位符
                className="browseGroup-image"
              />
              <div className="browse-group-card-top-right">
                <GroupAddIcon 
                  style={{ 
                    color: joinRequested[group.id] ? '#ccc' : '#f8c146',// 如果已请求加入，颜色改为灰色
                    cursor: joinRequested[group.id] ? 'not-allowed' : 'pointer', // 如果已请求加入，光标改为不允许
                    fontSize: '2.5rem'
                  }}
                  className={joinRequested[group.id] ? "addDisabled" : ""} 
                  onClick={() => {
                    if (!joinRequested[group.id]) {
                      //裡面可以setCurrentGroupId讓group有資訊
                      handleClickOpen(group.id);
                    }
                  }}
                />
              </div>
              <Dialog
                open={open && Number(currentGroupId) === Number(group.id)}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                style={{ textAlign: 'center' }}
              >
                <DialogTitle id="alert-dialog-title">{"請求加入"}</DialogTitle>
                <DialogContent>
                  <DialogContentText id="alert-dialog-description">
                    你確定想加入此群組?
                  </DialogContentText>
                </DialogContent>
                <DialogActions style={{ justifyContent: 'center' }}>
                  <Button onClick={handleConfirm} color="primary" autoFocus >
                    確定
                  </Button>
                  <Button onClick={handleClose} color="primary" >
                    取消
                  </Button>
                </DialogActions>
              </Dialog>
              <h3 className="browseGroupTitle">{group.title}</h3>
              <p className="browseDiningTime"> {formatDate(group.diningTime)}</p>
              <p className="browseGroupDescription">{group.description}</p>
              <p className="browseGroupPurpose"><b>聚餐情境:</b> {group.purpose}</p>
              <span> <b>創建者:</b> <span onClick={() => redirectToUserProfile(group.creatorId)} className="browseUsername" style={{ cursor: 'pointer' }}><b>{group.userName}</b></span> <GroupIcon className="groupIcon" />{group.memberCount}/{group.maxNumber} $&lt;{group.price} </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  {/* new */}
    <Snackbar open={alertOpen} autoHideDuration={6000} onClose={handleAlertClose} message={alertMessage} />
    <BottomNav />
    </div>
  );
};

export default BrowsePage;