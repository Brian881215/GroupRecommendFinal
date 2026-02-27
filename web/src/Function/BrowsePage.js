// import BottomNav from '../Bottom/BottomNav';
// import './BrowsePage.css';
// import React, { useState, useEffect, useCallback } from 'react';
// import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
// import GroupIcon from '@mui/icons-material/Group';
// import GroupAddIcon from '@mui/icons-material/GroupAdd';
// import Dialog from '@mui/material/Dialog';
// import DialogActions from '@mui/material/DialogActions';
// import DialogContent from '@mui/material/DialogContent';
// import DialogContentText from '@mui/material/DialogContentText';
// import DialogTitle from '@mui/material/DialogTitle';
// import Button from '@mui/material/Button';
// import Snackbar from '@mui/material/Snackbar';
// import List from '@mui/material/List';
// import ListItem from '@mui/material/ListItem';
// import { useNavigate } from 'react-router-dom';
// import { Link } from 'react-router-dom';
// import { LazyLoadImage } from 'react-lazy-load-image-component';
// import 'react-lazy-load-image-component/src/effects/blur.css';

// const BrowsePage = () => {

//   const navigate = useNavigate();
//   const [userGroups, setUserGroups] = useState([]);
//   const [allGroups, setAllGroups] = useState([]);
//   const userId = localStorage.getItem("userId");// 你需要有办法获得当前用户的ID;
//   const [snackOpen, setSnackOpen] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);//防止button短時間內雙擊觸發兩次Api
//   const [open, setOpen] = useState(false);
//   const [currentGroupId, setCurrentGroupId] = useState(null);
//   const [joinRequested, setJoinRequested] = useState({});
//   const [userRequested, setUserRequested] = useState([]);
//   const [currentApproveGroupId, setCurrentApproveGroupId] = useState(null); 
//   const [openDialog, setOpenDialog] = useState(false);
//   const [currentGroup, setCurrentGroup] = useState(null);
// //new 
//   const [alertOpen, setAlertOpen] = useState(false);
//   const [alertMessage, setAlertMessage] = useState('');

//   const apiUrl = process.env.REACT_APP_API_URL;

//   const formatDate = (dateString) => {
//     const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
//     return new Date(dateString).toLocaleString('en-US', options).replace(',', '');
//   };

//   const handleSnackClose = () => {
//       setSnackOpen(false);
//   };
//   const handleAlertClose = () => {
//     setAlertOpen(false);
//   };

//   const handleApproval = useCallback((groupId) => {
//     // 处理用户是群组创建者时的逻辑
//     setCurrentApproveGroupId(groupId); // 设置当前正在审批的群组ID
//     // fetch(`${apiUrl}/groups/join-requests/${groupId}`)
//     fetch(`${apiUrl}/groups/join-requests/${groupId}`, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       credentials: 'include' // 如果需要发送凭证信息
//     })
//     .then(response => response.json())
//     .then(data => {
//       if (Array.isArray(data)) {  // Check if data is an array
//         setUserRequested(data);
//         setCurrentGroup(data);
//         console.log("memberGroupDTO:", data);
//       } else {
//         console.error('Data received is not an array:', data);
//         setUserRequested([]);  // Set to empty array if data is not correct
//       }
//       setOpenDialog(true);
//       console.log("Approval for groupId:", groupId);
//     })
//     .catch(error => {
//       console.error('Error fetching join requests:', error);
//       setUserRequested([]);
//     });
//   }, [apiUrl]);

//   const handleClickOpen = (groupId) => {

//     // fetch(`${apiUrl}/groups/${groupId}`)
//     fetch(`${apiUrl}/groups/${groupId}`, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       credentials: 'include' // 如果需要发送凭证信息
//     })
//       .then(response => response.json())
//       .then(group => {
//         if (group.memberCount === group.maxNumber) {
//           setAlertMessage('此群組已滿員無法提出申請');
//           setAlertOpen(true);
//         } else {
//           setOpen(true);
//           setCurrentGroupId(groupId);
//         }
//       })
//       .catch(error => console.error('Error fetching group details:', error));
//   };

//   const handleClose = () => {
//     setOpen(false);
//   };

//   const handleAcceptUser = useCallback((groupId, userId) => {


//     fetch(`${apiUrl}/groups/${groupId}`)
//     .then(response => response.json())
//     .then(group => {
//       if (group.recommendationFlag) {
//         setAlertMessage('此群組已開始推薦，無法再加入新成員');
//         setAlertOpen(true);
//       } else {
//         // 调用 API 将用户加入群组
//         fetch(`${apiUrl}/groups/${groupId}/approve/${userId}`, {
//           method: 'PUT'
//         })
//         .then(response => {
//           if (!response.ok) throw new Error('Failed to add user');
//           return fetch(`${apiUrl}/groups/join-requests/${groupId}`);  // Fetch the updated join requests
//         })
//         .then(response => response.json())
//         .then(updatedRequests => {
//           console.log('Updated join requests after adding user:', updatedRequests);
//           setUserRequested(updatedRequests);
      
//           // 如果 updatedRequests 是空数组，则获取当前群组详细信息
//           if (updatedRequests.length === 0) {
//             return fetch(`${apiUrl}/groups/${groupId}`)
//               .then(response => response.json())
//               .then(groupDetails => {
//                 console.log('Fetched group details:', groupDetails);
//                 setCurrentGroup([groupDetails]); // Update the current group with the latest details
//                 return groupDetails; // 返回 groupDetails 以便后续使用
//               });
//           } else {
//             // 否则使用 join-requests 的第一项更新当前群组
//             setCurrentGroup(updatedRequests);
//             return updatedRequests[0]; // 返回 updatedRequests 的第一项以便后续使用
//           }
//         })
//         .then(groupDetails => {
//           // 使用返回的群组详细信息更新 isFull 状态
//           setUserRequested(prev => prev.map(user => ({
//             ...user,
//             isFull: groupDetails.memberCount >= groupDetails.maxNumber
//           })));
//         })
//         .catch(error => console.error('Error accepting user:', error));
//       }
//     })
//     .catch(error => console.error('Error fetching group details:', error));
//   }, [apiUrl]);

//   const handleConfirm = async () => {
//     try {
//         await sendJoinRequest(currentGroupId,userId);
//         setJoinRequested(prev => ({...prev, [currentGroupId]: true}));
//         setSnackOpen(true);
//         handleClose(); // Close the dialog
//     } catch (error) {
//         console.error('Error approving join request:', error);
//     }
//   };

//   const sendJoinRequest = async (groupId, userId) => {
//     if(isSubmitting) return;
//     setIsSubmitting(true);
//     try{
//       const response = await fetch(`${apiUrl}/groups/${groupId}/request/${userId}`, {
//           method: 'PUT'
//       });
//       if (!response.ok) {
//           throw new Error('Failed to send join request');
//       }
//     }catch (error){
//       console.error("Failed to send join request:",error);
//     }finally{
//       setIsSubmitting(false);
//     }
//   };

//   const renderDialog = () => (
//     <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
//       <DialogTitle><b>申請加入者列表</b></DialogTitle>
//       <DialogContent>
//         {userRequested.length > 0 ? (
//           <List>
//             {userRequested.map(user => (
//               <ListItem key={user.userId}>
//                 {/* {user.userName} */}
//                 <Link to={`/profile/${user.userId}`} className="user-name-link">
//                   {user.userName}
//                 </Link>
//                 <Button 
//                   onClick={() => handleAcceptUser(currentApproveGroupId, user.userId)}
//                   disabled={!currentGroup || user.isFull|| currentGroup[0].memberCount >= currentGroup[0].maxNumber}
//                 >
//                   {/* 因為我透過http://172.20.10.11:8080/api/users/user-requests/${userId}會回傳array到setCurrentGroup，所以要取得變數得透過array[0].屬性 */}
//                   {currentGroup && currentGroup[0].memberCount >= currentGroup[0].maxNumber ? '已滿員' : '加入'}
//                 </Button>
//               </ListItem>
//             ))}
//            </List>
//         ): (
//           <p className="applicantRequest">目前尚無申請者</p>
//         )}
//       </DialogContent>
//     </Dialog>
//   );

//   const redirectToUserProfile = (userId) => {
   
//     navigate(`/profile/${userId}`);
//   };

//   const fetchWithAuth = async (url) => {
//     const response = await fetch(url, {
//       method: 'GET',
//       headers: { 'Content-Type': 'application/json' },
//       credentials: 'include',
//     });
//     if (!response.ok) {
//       throw new Error(`Failed to fetch: ${url}`);
//     }
//     return response;
//   };

//   // 1. 取得用戶提出的加入請求
//   useEffect(() => {
//     const fetchUserJoinRequests = async () => {
//       try {
//         const response = await fetchWithAuth(`${apiUrl}/users/user-requests/${userId}`);
//         const groupIdsString = await response.text();
//         const groupIdsArray = groupIdsString.split(',');
//         const joinRequestsMap = groupIdsArray.reduce((acc, groupId) => {
//           acc[groupId.trim()] = true;
//           return acc;
//         }, {});
//         setJoinRequested(joinRequestsMap);
//       } catch (error) {
//         console.error('Error fetching user join requests:', error);
//       }
//     };

//     if (userId) fetchUserJoinRequests();
//   }, [userId, apiUrl]);
//   // 2. 取得用戶建立的群組
//   useEffect(() => {
//     if (!userId) return;
//     fetchWithAuth(`${apiUrl}/groups/created-by/${userId}`)
//       .then(res => res.json())
//       .then(setUserGroups)
//       .catch(error => console.error('Error fetching user groups:', error));
//   }, [userId, apiUrl]);
//   // 3. 取得非用戶建立的群組
//   useEffect(() => {
//     if (!userId) return;
//     fetchWithAuth(`${apiUrl}/groups/not-created-by/${userId}`)
//       .then(res => res.json())
//       .then(setAllGroups)
//       .catch(error => console.error('Error fetching all groups:', error));
//   }, [userId, apiUrl]);

//   // 4. 監聽 currentGroup 是否滿員
//   useEffect(() => {
//     if (currentGroup && userRequested.length > 0) {
//       const isFull = currentGroup.memberCount >= currentGroup.maxNumber;
//       if (isFull && !userRequested.some(user => user.isFull)) {
//         setUserRequested(userRequested.map(user => ({
//           ...user,
//           isFull: true,
//         })));
//       }
//       console.log('Current group memberCount:', currentGroup?.memberCount);
//       console.log('Current group maxNumber:', currentGroup?.maxNumber);
//     }
//   }, [currentGroup, userRequested]);
  
//   // useEffect(() => {
//   //   const fetchUserJoinRequests = async() => {
//   //     try{
//   //       //單個非創建群組的user有提出聲請的groupId有哪些
//   //       // const response = await fetch(`${apiUrl}/users/user-requests/${userId}`);
//   //       const response = await fetch(`${apiUrl}/users/user-requests/${userId}`, {
//   //         method: 'GET',
//   //         headers: {
//   //             'Content-Type': 'application/json'
//   //         },
//   //         credentials: 'include' // 如果需要发送凭证信息
//   //       });
//   //       if(!response.ok) throw new Error('Failed to fetch user join requests');
//   //       // const data = await response.json();
//   //       const groupIdsString = await response.text();
//   //       const groupIdsArray = groupIdsString.split(',');
//   //       const joinRequestsMap = groupIdsArray.reduce((acc, groupId)=> {
//   //         acc[groupId.trim()]= true;
//   //         return acc;
//   //       }, {});
//   //       setJoinRequested(joinRequestsMap);
//   //     }catch (error){
//   //       console.error('Error fetching user join requests:',error);
//   //     }
//   //   };

//   //   fetchUserJoinRequests();

//   //   // 获取用户创建的所有群组
//   //   // fetch(`${apiUrl}/groups/created-by/${userId}`)
//   //   fetch(`${apiUrl}/groups/created-by/${userId}`, {
//   //     method: 'GET',
//   //     headers: {
//   //       'Content-Type': 'application/json'
//   //     },
//   //     credentials: 'include' // 如果需要发送凭证信息
//   //   })
//   //     .then(response => response.json())
//   //     .then(data => {
//   //       setUserGroups(data);
//   //     })
//   //     .catch(error => {
//   //       console.error('Error fetching user groups:', error);
//   //     });

//   //   // 获取不是用戶建立的所有群组
//   //   // fetch(`${apiUrl}/groups/not-created-by/${userId}`)
//   //   fetch(`${apiUrl}/groups/not-created-by/${userId}`, {
//   //     method: 'GET',
//   //     headers: {
//   //       'Content-Type': 'application/json'
//   //     },
//   //     credentials: 'include' // 如果需要发送凭证信息
//   //   })
//   //     .then(response => response.json())
//   //     .then(data => {
//   //       setAllGroups(data);
//   //     })
//   //     .catch(error => {
//   //       console.error('Error fetching all groups:', error);
//   //     });

//   //     if (currentGroup && userRequested.length > 0) {
//   //       const isFull = currentGroup.memberCount >= currentGroup.maxNumber;
//   //       if (isFull && !userRequested.some(user => user.isFull)) {
//   //         // 更新界面上的按鈕顯示為已滿員
//   //         setUserRequested(userRequested.map(user => ({
//   //           ...user,
//   //           isFull: true
//   //         })));
//   //         // setUserRequested((prev) => [...prev]); 
//   //       }
//   //       console.log('Current group memberCount:', currentGroup[0].memberCount);
//   //       console.log('Current group maxNumber:', currentGroup[0].maxNumber);
//   //     }
//   // }, [userId,currentGroup, userRequested,apiUrl]);

//   return (
//     <div className="browse-page-outer">
//     <div className="browse-page">
//       {renderDialog()}
//       <h1 className="browseGroup_h1">Browse the dining group</h1>
//       <section className="user-dining-journey">
//         <h2 className="browseGroup_h2">你所創建的群組</h2>
//         <div className="browseGroup-container">
//         {userGroups.length > 0 ? (
//           userGroups.map(group => (
//             <div className="group-card" key={group.id}>
//                <LazyLoadImage
//                 src={group.photo} // 使用实际的图像 URL
//                 alt={group.name}
//                 effect="blur" // 应用模糊效果作为加载占位符
//                 className="browseGroup-image"
//               />
//               {/* <img src={group.photo} alt={group.name} className="browseGroup-image"/> */}
//               <Snackbar open={snackOpen} autoHideDuration={6000} onClose={handleSnackClose} message="您已成功向創建者提出申請！" />
//               <div className="browse-group-card-top-right">
//                 <CheckCircleOutline style={{ color: 'green', cursor: 'pointer', fontSize: '2.8rem' }} onClick={() => handleApproval(group.id)} />
//               </div>
//               <h3 className="browseGroupTitle">{group.title}</h3>
//               <p className="browseDiningTime"> {formatDate(group.diningTime)}</p>
//               <p className="browseGroupDescription">{group.description}</p>
//               <p className="browseGroupPurpose"><b>聚餐情境:</b> {group.purpose}</p>
//               <span><b>創建者:</b> <span className="browseUsername"><b>{group.userName}</b></span> <GroupIcon className="groupIcon" />{group.memberCount}/{group.maxNumber} $&lt;{group.price} </span>
//             </div> 
//           ))
//         ) : (
//             <p className="no-createdGroups">尚未有你創建的群組。</p>
//         )}
//         </div>
//         <h2 className="browseGroup_h2">你可申請加入的群組</h2>
//         <div className="browseGroup-container">
//           {allGroups.map(group => (
//             <div className="group-card-browse" key={group.id}>
//               {/* <img src={group.photo} alt={group.name} className="browseGroup-image"/> */}
              
//               <LazyLoadImage
//                 src={group.photo} // 使用实际的图像 URL
//                 alt={group.name}
//                 effect="blur" // 应用模糊效果作为加载占位符
//                 className="browseGroup-image"
//               />
//               <div className="browse-group-card-top-right">
//                 <GroupAddIcon 
//                   style={{ 
//                     color: joinRequested[group.id] ? '#ccc' : '#f8c146',// 如果已请求加入，颜色改为灰色
//                     cursor: joinRequested[group.id] ? 'not-allowed' : 'pointer', // 如果已请求加入，光标改为不允许
//                     fontSize: '2.5rem'
//                   }}
//                   className={joinRequested[group.id] ? "addDisabled" : ""} 
//                   onClick={() => {
//                     if (!joinRequested[group.id]) {
//                       //裡面可以setCurrentGroupId讓group有資訊
//                       handleClickOpen(group.id);
//                     }
//                   }}
//                 />
//               </div>
//               <Dialog
//                 open={open && Number(currentGroupId) === Number(group.id)}
//                 onClose={handleClose}
//                 aria-labelledby="alert-dialog-title"
//                 aria-describedby="alert-dialog-description"
//                 style={{ textAlign: 'center' }}
//               >
//                 <DialogTitle id="alert-dialog-title">{"請求加入"}</DialogTitle>
//                 <DialogContent>
//                   <DialogContentText id="alert-dialog-description">
//                     你確定想加入此群組?
//                   </DialogContentText>
//                 </DialogContent>
//                 <DialogActions style={{ justifyContent: 'center' }}>
//                   <Button onClick={handleConfirm} color="primary" autoFocus >
//                     確定
//                   </Button>
//                   <Button onClick={handleClose} color="primary" >
//                     取消
//                   </Button>
//                 </DialogActions>
//               </Dialog>
//               <h3 className="browseGroupTitle">{group.title}</h3>
//               <p className="browseDiningTime"> {formatDate(group.diningTime)}</p>
//               <p className="browseGroupDescription">{group.description}</p>
//               <p className="browseGroupPurpose"><b>聚餐情境:</b> {group.purpose}</p>
//               <span> <b>創建者:</b> <span onClick={() => redirectToUserProfile(group.creatorId)} className="browseUsername" style={{ cursor: 'pointer' }}><b>{group.userName}</b></span> <GroupIcon className="groupIcon" />{group.memberCount}/{group.maxNumber} $&lt;{group.price} </span>
//             </div>
//           ))}
//         </div>
//       </section>
//     </div>
//   {/* new */}
//     <Snackbar open={alertOpen} autoHideDuration={6000} onClose={handleAlertClose} message={alertMessage} />
//     <BottomNav />
//     </div>
//   );
// };

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