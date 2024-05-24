import React, { useState } from 'react';
import './SignUpPage.css';
import { useNavigate } from 'react-router-dom';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { readAndCompressImage } from 'browser-image-resizer';

// import TextField from '@mui/material/TextField';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const SignUpPage = () => {

  // const [emailExists, setEmailExists] = useState(false);
  // const maxDate = new Date();
  const checkEmailExistence = async (email) => {
    try {
        const response = await fetch(`http://172.20.10.11:8080/api/users/checkEmail/${email}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }   
        });
        const exists = await response.json();
        // setEmailExists(data);
        return exists;
    }catch (error) {
          console.error('Failed to check email:', error);
          // setEmailExists(true); // 出现错误时假定邮件存在使用戶不能按下next
          return true;
    }
  };

  // 创建state来存储表单数据
  const [formData, setFormData] = useState({
    photo: '',
    name: '',
    nickname: '',
    email: '',
    bio: '',
    gender: '',
    birthday: '',
    city: '',
    title: '',
    education: '',
    grade: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  // 处理输入字段变化
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  // 处理文件上传
  const handlePhoto = (e) => {

    const file = e.target.files[0];
    if (!file) return;
  
    if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
      alert('只能上傳JPG或PNG的照片格式!');
      e.target.value = '';
      return;
    }
  
    const config = {
      quality: 0.7,
      maxWidth: 800,
      maxHeight: 600,
      autoRotate: true,
      debug: true,
    };
  
    readAndCompressImage(file, config)
      .then(resizedImage => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData({ ...formData, photo: reader.result });
        };
        reader.readAsDataURL(resizedImage);
      })
      .catch(err => {
        console.error('Error processing image', err);
        alert('Error processing image');
      });
  };

  // 处理表单提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    // 提交表单数据的逻辑
    const { email, password, confirmPassword} = formData;
    const isFormValid = Object.values(formData).every(value => value !=='')  && password && confirmPassword;
    if (!isFormValid) {
      setError('All fields are required!');
      console.log('Error set to:', 'All fields are required!');  // Debugging
      return;
    }else if (password !== confirmPassword) {
        alert('兩次密碼不一致!');
        console.log('Error set to:', 'Passwords do not match!');  // Debugging
        return;
    }else{
        setError('');
        console.log('Form data:',formData);
    }

    const emailExists = await checkEmailExistence(email);
    if (emailExists) {
        alert('此信箱已經被註冊');
        return; 
    }

    const userData = {
        photo: formData.photo,
        name: formData.name,
        nickname: formData.nickname,
        email: formData.email,
        password: formData.password, // 注意：在生產環境中，應該通過HTTPS發送敏感資料，並在後端進行加密
        bio: formData.bio,
        gender: formData.gender,
        starSigns: formData.starSigns,
        birthday: formData.birthday.toISOString(), // 將日期轉換為 ISO 字符串
        city: formData.city,
        title: formData.title,
        education: formData.education,
        grade: formData.grade,
        // 其他字段...
    };
    // 發送 POST 請求到後端
    fetch('http://172.20.10.11:8080/api/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    })
    .then(response => response.json()
    )
    .then(userData => {
        console.log('Success:', userData);
        console.log("User created id:",userData.id);
        localStorage.setItem("userId",userData.id);
        // Redirect or handle response data
        // 例如：如果成功，跳轉到登入頁面
        navigate('/TKItest');
    })
    .catch((error) => {
        console.error('Error:', error);
    });
  };

//   const handleDateChange = (newDate) => {
//     setFormData(prevState => ({ ...prevState, birthday: newDate }));
// };

  return (
    <div className="signup-container">
      <form onSubmit={handleSubmit}>
        <label htmlFor="photo-upload">個人封面照:</label>
        <input type="file" id="photo-upload" onChange={handlePhoto} required/>
        <input type="text" name="name" placeholder="姓名(e.g. 吳承恩)" value={formData.name} onChange={handleChange} required/>
        <input type="text" name="nickname" placeholder="暱稱(e.g. 小吳)" value={formData.nickname} onChange={handleChange} required/>
        <input 
            type="email" name="email" 
            placeholder="登入帳號(個人信箱)" 
            value={formData.email} 
            onChange={handleChange} required
            // onBlur={() => checkEmailExistence(formData.email)}
        />
        <input 
            type="password" 
            name="password" 
            placeholder="密碼" 
            value={formData.password} 
            onChange={handleChange} 
            required 
        />
        <input 
            type="password" 
            name="confirmPassword" 
            placeholder="再次輸入密碼" 
            value={formData.confirmPassword} 
            onChange={handleChange} 
            required 
        />
        <textarea name="bio" placeholder="自我介紹(e.g. 興趣，嗜好，關於你特別的事...)，讓其他實驗者多了解你" value={formData.bio} onChange={handleChange} required/>
        
        <select name="starSigns" value={formData.starSigns} onChange={handleChange} required>
          <option value="">星座</option>
          <option value="水瓶">水瓶</option>
          <option value="雙魚">雙魚</option>
          <option value="牡羊">牡羊</option>
          <option value="金牛">金牛</option>
          <option value="雙子">雙子</option>
          <option value="巨蟹">巨蟹</option>
          <option value="獅子">獅子</option>
          <option value="處女">處女</option>
          <option value="天秤">天秤</option>
          <option value="天蠍">天蠍</option>
          <option value="射手">射手</option>
          <option value="摩羯">摩羯</option>
        </select>

        <select name="gender" value={formData.gender} onChange={handleChange} required>
          <option value="">性別</option>
          <option value="男">男</option>
          <option value="女">女</option>
          <option value="其他">其他</option>
        </select>
        <ReactDatePicker
            selected={formData.birthday}
            onChange={date => setFormData({ ...formData, birthday: date })}
            dateFormat="yyyy/MM/dd"
            placeholderText="生日(年/月/日) 請自行輸入"
            className="custom-datepicker"
            // style={{ width: '250px' }} 
            // showYearDropdown 
            // scrollableYearDropdown 
            // yearDropdownItemNumber={30}
            // maxDate={maxDate} 
        />
        {/* <LocalizationProvider dateAdapter={AdapterDateFns}>
            <div>
                <DatePicker
                    label="Birthday(年/月/日)"
                    value={formData.birthday}
                    onChange={handleDateChange}
                    renderInput={(params) => <TextField {...params} />}
                    inputFormat="yyyy/MM/dd"
                />
            </div>
        </LocalizationProvider> */}
        <input type="text" name="city" placeholder="居住城市(e.g. 台北市）" value={formData.city} onChange={handleChange} required/>
        <input type="text" name="title" placeholder="現在職稱(e.g. 學生）" value={formData.title} onChange={handleChange} required/>
        <input type="text" name="education" placeholder="大學 系所(e.g. NCCU MIS)" value={formData.education} onChange={handleChange} required/>
        <select name="grade" value={formData.grade} onChange={handleChange} required>
          <option value="">年級</option>
          <option value="大一">大一</option>
          <option value="大二">大二</option>
          <option value="大三">大三</option>
          <option value="大四">大四</option>
          <option value="碩一">碩一</option>
          <option value="碩二">碩二</option>
          <option value="已畢業">已畢業</option>
        </select>
        <span className="signupConfirm-text" ><b>下一步即無法更改您的個人資料，請再次確認您資料有無錯誤</b></span>
        <button type="submit" className="signupSubmit">下一步</button> 
        {/* {emailExists && <div className="signup-error">This email has already been registered.</div>} */}
        {error && <div className="signup-error">{error}</div>} 
      </form>
    </div>
  );
}

export default SignUpPage;
