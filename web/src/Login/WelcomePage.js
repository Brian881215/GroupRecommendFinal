// WelcomePage.js
import React from 'react';
import './WelcomePage.css'; // Make sure to create a corresponding CSS file
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const WelcomePage = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const apiUrl = process.env.REACT_APP_API_URL;
    // console.log('API URL:', apiUrl);
    // handleLoginSignup would be the function that handles the click event
    const handleLoginSignup = () => {
        // Logic to handle login or sign up
        console.log('Login/Signup button clicked');
   
        if (!username && !password) {
            // 用户没有输入用户名或密码
            console.log('Redirect to signup');
            navigate('/signup');
            // 实际操作中可以是路由跳转或更新状态来显示注册表单
            // 例如: navigate('/signup') 使用 react-router
        } else if(!username || !password){
            if(!username){
                setError('請輸入你的註冊信箱');
            }else{
                setError('請輸入你的密碼');
            }
            
        }else{
            // 进行登录验证
            login(username, password);
        }
        
    };
    const login = (username, password) => {
        // 模拟登录过程
        fetch(`${apiUrl}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username,
                password,
            }),
        })
        .then(response => {
            if (!response.ok) {
                if(response.status === 401){
                    throw new Error('無此帳號或是密碼輸入錯誤!');
                }
                throw new Error('An error occurred');
            }
            return response.json();
        })
        .then(data => {
            console.log('Received data:', data);
            // If backend validation is successful, store the user ID in localStorage
            //每次登入的userId都不同，因為user資料是對照你登入時驗證的資料所抓取的id
            //如果你註冊帳號與登入帳號不一樣，就要用data的userId 來蓋過去，表示這時是該人登入
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('userName', data.userName);
            console.log('my userId:', data.userId);
            console.log('Login successful!');
            // Redirect to the browse page
            navigate('/browse');
        })
        .catch((error) => {
            console.error('Login failed:', error);
            setError(error.message);
        });
      };
    
  
    return (
        <div className="welcome-container">
            <div className="images-container">
            <div className="image-left">
                <img src="/images/loginleft.png" alt="Cafe exterior" />
            </div>
            <div className="images-right">
                <div className="image-top">
                <img src="/images/loginrightup.png" alt="Dining in top" />
                </div>
                <div className="image-bottom">
                <img src="/images/loginrightdown.png" alt="Dining in bottom" />
                </div>
            </div>
            </div>
            <div className="welcome-text">
            <h1>DineTogether</h1>
            <p>Discover the best food around you</p>
            </div>
            <div className="form-container">
                {error && <div className="welcome-error">{error}</div>}
                <input
                type="text"
                placeholder="Email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                />
                <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <div className="login-signup">
            <button onClick={handleLoginSignup}>
                Login/Sign up
            </button>
            </div>
        </div>
    );
  };
  
  export default WelcomePage;
  