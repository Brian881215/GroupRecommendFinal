import React, { useState, useRef } from 'react';
import './FoodRatingPage.css';
import { useNavigate } from 'react-router-dom';

const foodTypes = {
  "中式料理": ["鼎泰豐", "湘八老", "點點心", "杭州小籠湯包", "品鱻生猛海鮮熱炒"],
  "日本料理": ["屋馬燒肉","金鮨日式料理", "Adachi 足立壽司", "稲町家香料咖哩 中山本舖",  "井上禾食｜海鮮丼 · 熟成豬排"],
  "義式料理": ["solo pasta", "義麵坊 中山店", "翡冷翠義式餐廳", "Lazy Pasta 慵懶義式廚房", "Cin Cin Osteria 請請義大利餐廳 慶城店"],
  "美式料理": ["M One Cafe", "TGI Friday's", "Big Al’s Burgers", "Butcher by Lanpengyou 屠夫漢堡","Everywhere burger club 漢堡俱樂部"],
  "韓式料理": ["韓大佬", "起家雞", "涓豆腐", "燒桶子韓食烤肉", "東大門韓國特色料理"],
  "火鍋": ["這一鍋 台北信義殿","辛殿麻辣鍋｜信義店", "和牛涮台北忠孝東店", "詹記麻辣火鍋 敦南店", "青花驕麻辣鍋台北中山北店"],
  "小吃": ["阜杭豆漿", "政大小吃部", "巧之味手工水餃", "深坑 古早厝 臭豆腐","饒河/寧夏/士林夜市"],
  "咖啡廳": ["北風社", "未央咖啡", "羊毛與花 ‧ 光點", "小青苑 Cyan Cafe", "角公園咖啡 Triangle Garden Cafe"],
  "餐酒館": ["品都串燒攤 忠孝","路邊烤肉wildbbq", "渣男 Taiwan Bistro", "新串 New Trend-忠孝店", "吳留手串燒居酒屋-麗水店"],
  "拉麵": ["一蘭拉麵","真劍拉麵", "隱家拉麵", "長生塩人", "鷹流東京醬油拉麵中山店"]
};

function FoodRatingPage() {

const userId = localStorage.getItem('userId');
  const [ratings, setRatings] = useState(() => {
    const initialRatings = {};
    Object.keys(foodTypes).forEach(foodType => {
      initialRatings[foodType] = { value: '', error: '' };
    });
    return initialRatings;
  });
  const navigate = useNavigate();
  const dialog = useRef(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // 新增的狀態

  const [trustLevel, setTrustLevel] = useState({
    EqualMatching: {
        question: '1. 與一般朋友或新認識的朋友聚餐情境下，你願意相信群組他人代替你做決定的程度為何？',
        value: ''
      },
      AuthorityRanking: {
        question: '2. 在學長姐學弟妹或是上對下關係的聚餐情境下，你願意相信群組他人代替你做決定的程度為何？',
        value: ''
      },
      CommunalSharing: {
        question: '3. 與好朋友,親人或伴侶聚餐的情境下，你願意相信群組他人代替你做決定的程度為何？',
        value: ''
      },
      MarketPricing: {
        question: '4. 如果聚餐目的是來解決彼此遇到的問題，你願意相信群組他人代替你做決定的程度為何？',
        value: ''
      }
  });

  const handleRatingChange = (foodType, newValue) => {
        const numValue = parseFloat(newValue);
        if (numValue >= 1 && numValue <= 10) {
        setRatings(prev => ({
            ...prev,
            [foodType]: { ...prev[foodType], value: numValue, error: '' }
        }));
        } else {
        setRatings(prev => ({
            ...prev,
            [foodType]: { ...prev[foodType], value: newValue, error: '請輸入 1 到 10 之間的任意數字' }
        }));
        }
  };

  const handleTrustLevelChange = (key, newValue) => {
    const numValue = parseFloat(newValue);
    if (numValue >= 1 && numValue <= 10){
        setTrustLevel(prev => ({
            ...prev,
            [key]: {
              ...prev[key],
              value: numValue,  // 存儲數值
              error: ''         // 清除錯誤信息
            }
        }));
    }else {
        setTrustLevel(prev => ({
            ...prev,
            [key]: {
              ...prev[key],
              value: newValue,
              error: '請輸入 1 到 10 之間的任意數字'
            }
        }));
    }
  };

  const handleSubmit = async () => {
    // 確保所有問題都已填寫且介在1-10
    const allRated = Object.values(ratings).every(rating => rating.value >= 1 && rating.value <= 10 && !rating.error);
    const allTrustFilled = Object.values(trustLevel).every(level => level.value >= 1 && level.value <= 10 && !level.error);

    console.log("Submit checked", allRated, allTrustFilled); 
    if (!allRated || !allTrustFilled) {
        setIsDialogOpen(true);
        console.log("error handle submit");
        return; 
    }

  const expertiseRatings = {};
    Object.keys(ratings).forEach(type => {
      expertiseRatings[type] = ratings[type].value;
  });
  
  const trustRatings = {};
    Object.keys(trustLevel).forEach(key => {
      trustRatings[key] = trustLevel[key].value;
    });

  const payload = {
    userId: userId,
    expertiseRatings, // 专业度评分
    trustRatings // 信任度评分
  };

  try {
        const response = await fetch(`http://172.20.10.11:8080/api/users/rating/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });
        console.log("my payload of rating:",payload);
    
        if (response.ok) {
          console.log("Ratings saved successfully.");
          navigate('/'); // 跳转回首页或其他页面
        } else {
          throw new Error('Failed to submit ratings');
        }
      } catch (error) {
        console.error("Error submitting ratings: ", error);
      }
  };  

  const handleCloseDialog = () => {
    setIsDialogOpen(false); // 關閉對話框
  };

  return (
    <div className="food-rating-page">
        <div className="rating-container">
            <h2>餐廳種類專業度衡量</h2>
            <p>以下有針對每個種類的5間代表餐廳，請依照自身主觀認爲在此種類的<b>喜愛/專業程度</b><b>(1-10分任意值)</b></p>
        </div>
      {Object.keys(foodTypes).map(foodType => (
        <div key={foodType} className="food-type-card">
            <h3>{foodType}</h3>
            {foodTypes[foodType].map(restaurant => (
            <p key={restaurant}>{restaurant}</p>
            ))}
            <input
            type="number"
            min="1"
            max="10"
            value={ratings[foodType].value}
            placeholder="1-10"
            onChange={(e) => handleRatingChange(foodType, e.target.value)}
            required
            />
            {ratings[foodType].error && <div className="error-message">{ratings[foodType].error}</div>}
        </div>
        ))}
      <div className="trust-level-section">
        <h2>餐廳偏好信任度衡量</h2>
        {Object.entries(trustLevel).map(([key, { question, value, error }]) => (
          <div key={key} className="trustInput">
            <label>{question}</label>
            <input
              type="number"
              min="1"
              max="10"
              value={value}
              placeholder=" 1-10" 
              className= "trustInputText"
              onChange={(e) => handleTrustLevelChange(key, e.target.value)}
              required
            />
            {error && <div className="error-message">{error}</div>}  
          </div>
        ))}
      </div>
      <div className='foodRatingDialog'>
        <dialog ref={dialog} className="my-dialog" open={isDialogOpen}>
              <p>請確保有無缺漏或異常值！</p>
              <button onClick={handleCloseDialog}>Close</button>
        </dialog>
      </div>
      <button className="foodRatingSubmit" onClick={handleSubmit}><b>完成註冊</b></button>
    </div>
  );
}

export default FoodRatingPage;
