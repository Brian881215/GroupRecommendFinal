import React from 'react';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonIcon from '@mui/icons-material/Person';
import './BottomNav.css'; 
import { useLocation, useNavigate  } from 'react-router-dom';

export default function BottomNav() {
    
  const location = useLocation();
  const [value, setValue] = React.useState(location.pathname);
  const navigate = useNavigate();

  React.useEffect(() => {
    // 根據路徑來更新狀態
    setValue(location.pathname);
  }, [location]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    navigate(newValue);
  };

  return (
    <BottomNavigation className="bottom-nav" value={value} onChange={handleChange}>
      <BottomNavigationAction label="Browse" value="/browse" icon={<TravelExploreIcon />} />
      <BottomNavigationAction label="Create" value="/create" icon={<AddCircleOutlineIcon />} />
      <BottomNavigationAction label="Group" value="/groupView" icon={<GroupsIcon />} />
      <BottomNavigationAction label="Profile" value="/profile" icon={<PersonIcon />} />
    </BottomNavigation>
  );
}
