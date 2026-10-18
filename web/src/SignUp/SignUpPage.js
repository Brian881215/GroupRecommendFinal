import React, { useState } from 'react';
import './SignUpPage.css';
import { Link, useNavigate } from 'react-router-dom';
import {
  Form, Input, Select, DatePicker, Upload, Button, Card, Typography, message,
} from 'antd';
import { CameraOutlined, InfoCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { readAndCompressImage } from 'browser-image-resizer';
import SectionTitle from '../components/common/SectionTitle';

const { Title, Text } = Typography;
const { TextArea } = Input;

const STAR_SIGNS = ['水瓶', '雙魚', '牡羊', '金牛', '雙子', '巨蟹', '獅子', '處女', '天秤', '天蠍', '射手', '摩羯'];
const GENDERS = ['男', '女', '其他'];
const GRADES = ['大一', '大二', '大三', '大四', '碩一', '碩二', '已畢業'];

const toOptions = (values) => values.map((value) => ({ value, label: value }));

// 個人封面照:4:5 預覽框(與 ProfilePage 的個人照同比例),點擊上傳。
// 放在 Form.Item 裡,value/onChange 由表單注入,驗證「必填」也走表單。
const PhotoUpload = ({ value, onChange }) => {
  const handleBeforeUpload = async (file) => {
    if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
      message.error('只能上傳JPG或PNG的照片格式!');
      return Upload.LIST_IGNORE;
    }

    const config = {
      quality: 0.7,
      maxWidth: 800,
      maxHeight: 600,
      autoRotate: true,
    };

    try {
      const resizedImage = await readAndCompressImage(file, config);
      const reader = new FileReader();
      reader.onloadend = () => onChange(reader.result);
      reader.readAsDataURL(resizedImage);
    } catch (err) {
      console.error('Error processing image', err);
      message.error('照片處理錯誤');
    }
    return false; // 停止自動上傳
  };

  return (
    <Upload
      beforeUpload={handleBeforeUpload}
      showUploadList={false}
      maxCount={1}
      accept="image/jpeg,image/png"
      className="signup-photo-upload"
    >
      <div className="signup-photo">
        {value ? (
          <img src={value} alt="個人封面照預覽" className="signup-photo-img" />
        ) : (
          <div className="signup-photo-fallback">
            <CameraOutlined className="signup-photo-fallback-icon" />
            <span>點擊上傳個人封面照</span>
          </div>
        )}
        {value && (
          <div className="signup-photo-hint">
            <CameraOutlined /> 更換照片
          </div>
        )}
      </div>
    </Upload>
  );
};

const SignUpPage = () => {
  const [form] = Form.useForm();
  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const checkEmailExistence = async (email) => {
    try {
      const response = await fetch(`${apiUrl}/users/checkEmail/${email}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to check email:', error);
      return true; // 出錯時視為信箱已存在,避免重複註冊
    }
  };

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      const emailExists = await checkEmailExistence(values.email);
      if (emailExists) {
        form.setFields([{ name: 'email', errors: ['此信箱已經被註冊'] }]);
        message.error('此信箱已經被註冊');
        return;
      }

      const userData = {
        photo: values.photo,
        name: values.name,
        nickname: values.nickname,
        email: values.email,
        password: values.password, // 注意：在生產環境中，應該通過HTTPS發送敏感資料，並在後端進行加密
        bio: values.bio,
        gender: values.gender,
        starSigns: values.starSigns,
        birthday: values.birthday.startOf('day').toDate().toISOString(),
        city: values.city,
        title: values.title,
        education: values.education,
        grade: values.grade,
      };

      const response = await fetch(`${apiUrl}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const createdUser = await response.json();
      localStorage.setItem('userId', createdUser.id);
      navigate('/TKItest');
    } catch (error) {
      console.error('Error:', error);
      message.error('註冊失敗，請稍後再試');
    } finally {
      setSubmitting(false);
    }
  };

  const required = (msg) => ({ required: true, message: msg });

  return (
    <div className="signup-page">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className="signup-layout"
        requiredMark={false}
      >
        <header className="signup-header">
          <Title level={2} className="signup-header-title">建立帳號</Title>
          <Text type="secondary">填寫基本資料，開始找飯友</Text>
          <div className="signup-header-login">
            已有帳號？<Link to="/">回登入</Link>
          </div>
        </header>

        {/* 左欄(電腦版 sticky):個人封面照 */}
        <aside className="signup-side">
          <Card className="signup-card" bordered={false} title={<SectionTitle>個人封面照</SectionTitle>}>
            <Form.Item
              name="photo"
              rules={[required('請上傳個人封面照')]}
              className="signup-photo-item"
            >
              <PhotoUpload />
            </Form.Item>
          </Card>
        </aside>

        {/* 右欄:三張表單卡 */}
        <div className="signup-main">
          <Card className="signup-card" bordered={false} title={<SectionTitle>帳號資訊</SectionTitle>}>
            <Form.Item
              label="登入帳號(個人信箱)"
              name="email"
              rules={[
                required('請輸入信箱'),
                { type: 'email', message: '信箱格式不正確' },
              ]}
            >
              <Input placeholder="e.g. name@example.com" autoComplete="email" />
            </Form.Item>
            <div className="signup-row">
              <Form.Item label="密碼" name="password" rules={[required('請輸入密碼')]}>
                <Input.Password placeholder="密碼" autoComplete="new-password" />
              </Form.Item>
              <Form.Item
                label="再次輸入密碼"
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  required('請再次輸入密碼'),
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) return Promise.resolve();
                      return Promise.reject(new Error('兩次密碼不一致!'));
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="再次輸入密碼" autoComplete="new-password" />
              </Form.Item>
            </div>
          </Card>

          <Card className="signup-card" bordered={false} title={<SectionTitle>基本資料</SectionTitle>}>
            <div className="signup-row">
              <Form.Item label="姓名" name="name" rules={[required('請輸入姓名')]}>
                <Input placeholder="e.g. 吳承恩" />
              </Form.Item>
              <Form.Item label="暱稱" name="nickname" rules={[required('請輸入暱稱')]}>
                <Input placeholder="e.g. 小吳" />
              </Form.Item>
            </div>
            <div className="signup-row">
              <Form.Item label="性別" name="gender" rules={[required('請選擇性別')]}>
                <Select placeholder="請選擇性別" options={toOptions(GENDERS)} />
              </Form.Item>
              <Form.Item label="生日" name="birthday" rules={[required('請選擇生日')]}>
                <DatePicker
                  placeholder="選擇生日"
                  format="YYYY/MM/DD"
                  defaultPickerValue={dayjs().subtract(20, 'year')}
                  disabledDate={(date) => date.isAfter(dayjs(), 'day')}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </div>
            <div className="signup-row">
              <Form.Item label="星座" name="starSigns" rules={[required('請選擇星座')]}>
                <Select placeholder="請選擇星座" options={toOptions(STAR_SIGNS)} />
              </Form.Item>
              <Form.Item label="居住城市" name="city" rules={[required('請輸入居住城市')]}>
                <Input placeholder="e.g. 台北市" />
              </Form.Item>
            </div>
          </Card>

          <Card className="signup-card" bordered={false} title={<SectionTitle>學經歷與自我介紹</SectionTitle>}>
            <div className="signup-row">
              <Form.Item label="現在職稱" name="title" rules={[required('請輸入現在職稱')]}>
                <Input placeholder="e.g. 學生" />
              </Form.Item>
              <Form.Item label="年級" name="grade" rules={[required('請選擇年級')]}>
                <Select placeholder="請選擇年級" options={toOptions(GRADES)} />
              </Form.Item>
            </div>
            <Form.Item label="大學 系所" name="education" rules={[required('請輸入大學系所')]}>
              <Input placeholder="e.g. NCCU MIS" />
            </Form.Item>
            <Form.Item label="自我介紹" name="bio" rules={[required('請輸入自我介紹')]}>
              <TextArea
                rows={4}
                placeholder="e.g. 興趣，嗜好，關於你特別的事...，讓其他實驗者多了解你"
              />
            </Form.Item>
          </Card>

          <div className="signup-notice">
            <InfoCircleOutlined className="signup-notice-icon" />
            <Text type="secondary">下一步即無法更改您的個人資料，請再次確認您資料有無錯誤</Text>
          </div>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={submitting}
            className="signup-submit"
          >
            下一步
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default SignUpPage;
