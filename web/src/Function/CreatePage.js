// CreatePage.js
import React , { useState, useRef} from 'react';
import BottomNav from '../Bottom/BottomNav';
import './CreatePage.css';
import '../Bottom/BottomNav.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { readAndCompressImage } from 'browser-image-resizer';

const CreatePage = () => {

    const apiUrl = process.env.REACT_APP_API_URL;

    const userId = localStorage.getItem('userId'); 
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        groupTitle: '',
        description: '',
        purpose: '',
        photo: '',
        meetingPlace: '',
        maxNumber: '',
        districts: [],
        price: '',
        diningTime: new Date()
    });
    const initialFormData = {
        groupTitle: '',
        description: '',
        purpose: '',
        photo: '',
        meetingPlace: '',
        maxNumber: '',
        districts: [],
        price: '',
        diningTime: new Date()
      };
    const fileInputRef = useRef();  // 創建一個ref

    const handleChange = (e) => {

        const { name, value } = e.target;

        if (name === 'maxNumber' || name === 'price') {
            if (!/^\d*$/.test(value)) {
                return; // 如果不是数字，则不更新状态
            }
        }
        setFormData(prevFormData => ({
            ...prevFormData,
            [name]: value,
        }));


    };

    const handlePhoto = (e) => {
        
        const file = e.target.files[0];
        if (!file) return;
      
        if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
          alert('只能上傳JPG或是PNG格式的照片!');
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
            alert('照片處理錯誤');
          });
      };

    const handleCheckboxChange = (event) => {
        const { name } = event.target;
        const isChecked = event.target.checked;
        
        // 更新 districts 列表
        let updatedDistricts = isChecked
            ? [...formData.districts, name]
            : formData.districts.filter((district) => district !== name);

        // 更新表單數據
        setFormData((prevFormData) => ({
            ...prevFormData,
            districts: updatedDistricts,
        }));
    };
    // Function to handle the change in dining time
    const handleDiningTimeChange = (date) => {
        setFormData(prevFormData => ({
            ...prevFormData,
            diningTime: date,
        }));
    };
    const validateForm = () => {
        const maxNumber = parseInt(formData.maxNumber, 10);
        if (isNaN(maxNumber) || maxNumber < 2 || maxNumber > 10) {
            setError('群組最大人數只能輸入2-10之間的任意整數');
            return false;
        }

        const price = parseInt(formData.price, 10);
        if (isNaN(price) || price < 100) {
            setError('每人平均價格上限必須是100以上的整數');
            return false;
        }

        setError('');
        return true;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }
        // 在這裡構造一個對象來匹配後端預期的格式
        const groupData = {
            title: formData.groupTitle,
            description: formData.description, 
            purpose: formData.purpose,
            // 確保您將圖片轉換為 Base64 字符串或處理圖片上傳的邏輯
            photo: formData.photo,
            meetingPlace: formData.meetingPlace,
            maxNumber: formData.maxNumber,
            districts: formData.districts.join(', '),
            price: formData.price,
            diningTime: formData.diningTime.toISOString(), // 確保將日期轉換為 ISO 字符串
        };
    
        // 發送 POST 請求到後端
        fetch(`${apiUrl}/groups/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(groupData),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('創建群組錯誤');
            }
            return response.json();
        })
        .then(data => {
            // console.log('Group created successfully:', data);
            // localStorage.setItem('groupId', data.id);
            // 重置檔案輸入
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            // 重置建立群組資料
            setFormData(initialFormData);
        })
        .catch(error => {
            console.error('Error:', error);
            setError(error.message);
        });
    };
    
   return (
    
    <div className="create-group-container-outer">
      <div className="create-group-container">
        <h1>Gathering</h1>
        <form onSubmit={handleSubmit}>
            <label>群組標題:</label>
            <input
                type="text"
                name="groupTitle"
                placeholder="e.g. 找政大學生吃飯"
                value={formData.groupTitle}
                onChange={handleChange}
                required
            />
           
            <label>群組聚餐描述:</label>
            <textarea
                name="description"
                placeholder="e.g. 最近期末考壓力好大，希望可以找幾個朋友聊聊，一起探索文山美食"
                value={formData.description}
                onChange={handleChange}
                required
            />
            <select name="purpose" value={formData.purpose} onChange={handleChange} required>
                <option value="">聚餐情境</option>
                <option value="找一般朋友或新朋友">找一般朋友或新朋友</option>
                <option value="為了互相解決特定問題">為了互相解決特定問題</option>
                <option value="學長姐學弟妹或是上對下關係的人">學長姐學弟妹或是上對下關係的人</option>
                <option value="與好朋友，家人，或是伴侶">與好朋友，家人，或是伴侶</option>
            </select>
            <label htmlFor="photo-upload">群組封面照片:</label>
            <input type="file" id="photo-upload" ref={fileInputRef} onChange={handlePhoto} required/>
            <div>
                <label>推薦餐廳的區域(可複選/不選):</label>
                <div className="checkbox-group">
                    <div className="checkbox-row">
                        {['大同區', '中山區', '中正區'].map((districtName) => (
                            <label key={districtName}>
                                <input
                                    type="checkbox"
                                    name={districtName}
                                    checked={formData.districts.includes(districtName)}
                                    onChange={handleCheckboxChange}  
                                />
                                {districtName}
                            </label>
                        ))}
                    </div>
                    <div className="checkbox-row">
                        {['信義區', '大安區'].map((districtName) => (
                            <label key={districtName}>
                                <input
                                    type="checkbox"
                                    name={districtName}
                                    checked={formData.districts.includes(districtName)}
                                    onChange={handleCheckboxChange}
                                />
                                {districtName}
                            </label>
                        ))}
                    </div>
                    <div className="checkbox-row">
                        {['松山區', '文山區'].map((districtName) => (
                            <label key={districtName}>
                                <input
                                    type="checkbox"
                                    name={districtName}
                                    checked={formData.districts.includes(districtName)}
                                    onChange={handleCheckboxChange}
                                />
                                {districtName}
                            </label>
                        ))}
                    </div>
                </div>
            </div>
            <div>
                <label htmlFor="maxNumber">群組最大人數:</label>
                <input
                    type="text"
                    id="maxNumber"
                    name="maxNumber"
                    placeholder="e.g. 5"
                    value={formData.maxNumber}
                    onChange={handleChange}
                    required
                />
            </div>
            {/* Price section */}
            <div>
                <label htmlFor="price">每人平均價格上限:</label>
                <input
                    type="text"
                    id="price"
                    name="price"
                    placeholder="e.g. 500"
                    value={formData.price}
                    onChange={handleChange}
                    required
                />
            </div>
            {/* Dining Time section */}
            <div>
                <label>預期聚餐時間:</label>
                <DatePicker
                    selected={formData.diningTime}
                    onChange={handleDiningTimeChange}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    timeCaption="time"
                    dateFormat="MMMM d, yyyy h:mm aa"
                    required
                />
            </div>
            <div>
                <label htmlFor="meetingPlace">集合地點:</label>
                <input
                    type="text"
                    id="meetingPlace"
                    name="meetingPlace"
                    placeholder="e.g. 政大商願一樓集合"
                    value={formData.meetingPlace}
                    onChange={handleChange}
                    required
                />
            </div>
{/* 注意是要用外層容器的 button來當做css特效，順便控制button的大小 */}
            <h6>如果創建群組可獲得25積分，而加入群組為10積分，
                此攸關最後抽獎機率!!
            </h6>
            <button type="submit" className="create-submit"><b>創建您的群組</b></button>
            {error && <div className="error-message">{error}</div>}
        </form>
      </div>
      <BottomNav />
    </div>
  );
};
export default CreatePage;