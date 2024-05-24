import './App.css';
import React from 'react';
import WelcomePage from './Login/WelcomePage';
import './Login/WelcomePage.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignUpPage from './SignUp/SignUpPage';
import TKITest from './SignUp/TKITest';
import BrowsePage from './Function/BrowsePage';
import CreatePage from './Function/CreatePage';
import GroupPage from './Function/GroupPage';
import ProfilePage from './Function/ProfilePage';
import BottomNav from './Bottom/BottomNav';
// import ClickProfile from './Function/ClickProfile';
import FoodRatingPage from './SignUp/FoodRatingPage';
import GroupView from './Function/GroupView';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/TKItest" element={<TKITest />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/group" element={<GroupPage />} />
        <Route path="/group/:groupId" element={<GroupPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/:userId" element={<ProfilePage />} />
        <Route path="/BottomNav" element={<BottomNav />} />
        <Route path="/rating" element={<FoodRatingPage />} />
        <Route path="/groupView" element={<GroupView />} />
      </Routes>
      
    </Router>
  );
}

export default App;
