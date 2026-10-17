import React, { useState } from 'react';
import {
  Form, Input, Select, Checkbox, Button, DatePicker,
  Upload, Row, Col, Typography, message, Card
} from 'antd';
import { CameraOutlined, DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { readAndCompressImage } from 'browser-image-resizer';
import BottomNav from '../Bottom/BottomNav';
import './CreatePage.css';

const { Title, Text } = Typography;
const { TextArea } = Input;

// 卡片標題:左側金色色條 + 標題
const SectionTitle = ({ children }) => (
  <span className="create-section-title">
    <span className="create-section-accent" />
    {children}
  </span>
);

// 封面預覽:16:10,沒有照片時顯示金色漸層 + 群組標題(與 BrowsePage 的預設封面一致)
// 標題在這裡 watch,打字時只重繪預覽,不重繪整個表單
const CoverPreview = ({ photo }) => {
  const form = Form.useFormInstance();
  const title = Form.useWatch('groupTitle', form);

  return (
    <div className="create-cover">
      {photo ? (
        <img src={photo} alt="群組封面預覽" className="create-cover-img" />
      ) : (
        <div className="create-cover-fallback">
          <span className="create-cover-fallback-title">{title || '你的聚餐群組'}</span>
        </div>
      )}
      <div className="create-cover-hint">
        <CameraOutlined /> {photo ? '更換照片' : '點擊上傳封面照片'}
      </div>
    </div>
  );
};

const CreatePage = () => {
  const [form] = Form.useForm();
  const apiUrl = process.env.REACT_APP_API_URL;
  const userId = localStorage.getItem('userId');
  const [loading, setLoading] = useState(false);
  const [photoBase64, setPhotoBase64] = useState('');
  const [photoName, setPhotoName] = useState('');

  // 區域選項資料
  const districtOptions = ['大同區', '中山區', '中正區', '信義區', '大安區', '松山區', '文山區'];

  // 處理照片壓縮與轉 Base64
  const handlePhotoUpload = async (file) => {
    if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
      message.error('只能上傳 JPG 或 PNG 格式的照片！');
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
      reader.onloadend = () => {
        setPhotoBase64(reader.result);
        setPhotoName(file.name);
      };
      reader.readAsDataURL(resizedImage);
      return false; // 停止自動上傳
    } catch (err) {
      message.error('照片處理錯誤');
      return Upload.LIST_IGNORE;
    }
  };

  const removePhoto = () => {
    setPhotoBase64('');
    setPhotoName('');
  };

  const onFinish = async (values) => {
    if (!photoBase64) {
      message.warning('請上傳封面照片');
      return;
    }

    setLoading(true);
    const groupData = {
      title: values.groupTitle,
      description: values.description,
      purpose: values.purpose,
      photo: photoBase64,
      meetingPlace: values.meetingPlace,
      maxNumber: values.maxNumber,
      districts: values.districts ? values.districts.join(', ') : '',
      price: values.price,
      diningTime: values.diningTime.toISOString(),
    };

    try {
      const response = await fetch(`${apiUrl}/groups/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupData),
      });

      if (!response.ok) throw new Error('創建群組錯誤');

      message.success('群組創建成功！已獲得 25 積分');
      form.resetFields();
      removePhoto();
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-page">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ diningTime: null, districts: [] }}
        className="create-layout"
      >
        <header className="create-header">
          <Title level={2} className="create-header-title">建立聚餐群組</Title>
          <Text type="secondary">填寫聚餐資訊，建立你的群組</Text>
        </header>

        {/* 左欄(電腦版 sticky):封面與積分說明 */}
        <aside className="create-side">
          <Card className="create-card" bordered={false} title={<SectionTitle>群組封面</SectionTitle>}>
            <Form.Item label="群組封面照片" required className="create-cover-item">
              <Upload
                beforeUpload={handlePhotoUpload}
                maxCount={1}
                showUploadList={false}
                accept="image/jpeg,image/png"
                className="create-cover-upload"
              >
                <CoverPreview photo={photoBase64} />
              </Upload>
            </Form.Item>
            {photoName && (
              <div className="create-cover-file">
                <Text ellipsis className="create-cover-file-name">{photoName}</Text>
                <Button type="text" size="small" icon={<DeleteOutlined />} onClick={removePhoto}>
                  移除
                </Button>
              </div>
            )}
          </Card>

          <div className="info-section">
            <InfoCircleOutlined className="info-icon" />
            <Text type="secondary">
              創建群組可獲得 25 積分，加入群組為 10 積分，這攸關抽獎機率！
            </Text>
          </div>
        </aside>

        {/* 右欄:分成三張卡的表單 */}
        <div className="create-main">
          <Card className="create-card" bordered={false} title={<SectionTitle>基本資訊</SectionTitle>}>
            <Form.Item
              label="群組標題"
              name="groupTitle"
              rules={[{ required: true, message: '請輸入標題' }]}
            >
              <Input placeholder="e.g. 找政大學生吃飯..." />
            </Form.Item>

            <Form.Item
              label="聚餐情境"
              name="purpose"
              rules={[{ required: true, message: '請選擇情境' }]}
            >
              <Select placeholder="請選擇聚餐情境">
                <Select.Option value="找一般朋友或新朋友">找一般朋友或新朋友</Select.Option>
                <Select.Option value="為了互相解決特定問題">為了互相解決特定問題</Select.Option>
                <Select.Option value="學長姐學弟妹或是上對下關係的人">學長姐學弟妹或是上對下關係的人</Select.Option>
                <Select.Option value="與好朋友，家人，或是伴侶">與好朋友，家人，或是伴侶</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="群組聚餐描述"
              name="description"
              rules={[{ required: true, message: '請輸入描述' }]}
            >
              <TextArea
                rows={4}
                placeholder="e.g. 最近期末考壓力好大，希望可以找幾個朋友聊聊..."
              />
            </Form.Item>
          </Card>

          <Card className="create-card" bordered={false} title={<SectionTitle>時間與地點</SectionTitle>}>
            <Row gutter={16}>
              <Col xs={24} sm={14}>
                <Form.Item
                  label="預期聚餐時間"
                  name="diningTime"
                  rules={[{ required: true, message: '請選擇時間' }]}
                >
                  <DatePicker
                    showTime={{ format: 'HH:mm' }}
                    format="YYYY-MM-DD HH:mm"
                    placeholder="選擇日期與時間"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={10}>
                <Form.Item
                  label="群組最大人數"
                  name="maxNumber"
                  rules={[
                    { required: true, message: '請輸入人數' },
                    { pattern: /^[2-9]|10$/, message: '請輸入 2-10 之間的整數' }
                  ]}
                >
                  <Input placeholder="e.g. 5" type="number" suffix="人" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="集合地點"
              name="meetingPlace"
              rules={[{ required: true, message: '請輸入地點' }]}
            >
              <Input placeholder="e.g. 政大商院一樓" />
            </Form.Item>
          </Card>

          <Card className="create-card" bordered={false} title={<SectionTitle>餐廳偏好</SectionTitle>}>
            <Form.Item
              label="每人平均價格上限"
              name="price"
              rules={[
                { required: true, message: '請輸入價格' },
                { pattern: /^[1-9][0-9]{2,}$/, message: '價格必須是 100 以上的整數' }
              ]}
            >
              <Input prefix="$" placeholder="e.g. 500" type="number" />
            </Form.Item>

            <Form.Item label="推薦餐廳的區域 (可複選)" name="districts">
              <Checkbox.Group options={districtOptions} className="district-checkboxes" />
            </Form.Item>
          </Card>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={loading}
            className="submit-btn"
          >
            創建您的群組
          </Button>
        </div>
      </Form>
      <BottomNav />
    </div>
  );
};

export default CreatePage;
