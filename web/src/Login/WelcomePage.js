// WelcomePage.js
import React from 'react';
import './WelcomePage.css'; // Make sure to create a corresponding CSS file
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { message, Button, Input} from 'antd';

const WelcomePage = () => {
    const navigate = useNavigate();
    // const [username, setUsername] = useState('');
    // const [password, setPassword] = useState('');

    const [formData, setFormData] = useState({username: '', password: ''})
    // const [error, setError] = useState('');

    const handleChange = (e) => {
        // setFormData({...formData, [e.target.value]: e.target.value })
        setFormData((prevFormData) => ({
            ...prevFormData, // 保留其他欄位
            [e.target.name]: e.target.value // 更新當前輸入框的值
        }));
    }
    
    const apiUrl = process.env.REACT_APP_API_URL;
   
    // handleLoginSignup would be the function that handles the click event
    const handleLoginSignup = () => {
        // Logic to handle login or sign up
        console.log('Login/Signup button clicked');
        const { username, password } = formData
        if (!username && !password) {
            navigate('/signup');
        } else if (!username || !password){
            if (!username) {
                message.error('請輸入你的註冊信箱');
            } else {
                message.error('請輸入你的密碼');
            }
            // if (!username || !password) {
            //     setError(!username ? '請輸入你的註冊信箱' : '請輸入你的密碼');
            //     return;
            // }
        } else {
            login(username, password);
        }  
      
        
    };

    //可以寫成async/await寫法 讓程式碼更簡潔 如果不需要多個promise去並行處理 可以用async代替.then
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
            message.success('登入成功！');
            // Redirect to the browse page
            navigate('/browse');
        })
        .catch((error) => {
            console.error('Login failed:', error);
            //抓出你的error資訊顯示在介面上
            // setError(error.message);
            message.error(error.message);
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
                {/* {error && <div className="welcome-error">{error}</div>} */}
                <Input
                    name="username"
                    type="text"
                    placeholder="Email"
                    value={formData.username}
                    onChange={handleChange}
                    // size="large"
                    style={{ marginBottom: '10px' }} // 保持原本的間距
                />
                <Input.Password
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    // size="medium"
                    style={{ marginBottom: '10px' }}
                />
                {/* <input
                name = "username"
                type="text"
                placeholder="Email"
                value={formData.username}
                onChange={handleChange}
                />
                <input
                name = "password"
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                /> */}
            </div>
            <div className="login-signup">
                {/* 之後再全部改不用另寫css樣式，且拆成sign up & login Button */}
                <Button type="primary" size="large" onClick={handleLoginSignup} style={{ width: '100%' }}>
                    Login/Sign up
                </Button>
            </div>
        </div>
    );
  };
  
  export default WelcomePage;
  