import React, { useState } from 'react';
import { 
  Form, Input, Select, Checkbox, Button, DatePicker, 
  Upload, Row, Col, Typography, message, Card 
} from 'antd';
import { UploadOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { readAndCompressImage } from 'browser-image-resizer';
import BottomNav from '../Bottom/BottomNav';
import './CreatePage.css';

const { Title, Text } = Typography;
const { TextArea } = Input;

const CreatePage = () => {
  const [form] = Form.useForm();
  const apiUrl = process.env.REACT_APP_API_URL;
  const userId = localStorage.getItem('userId');
  const [loading, setLoading] = useState(false);
  const [photoBase64, setPhotoBase64] = useState('');

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
      };
      reader.readAsDataURL(resizedImage);
      return false; // 停止自動上傳
    } catch (err) {
      message.error('照片處理錯誤');
      return Upload.LIST_IGNORE;
    }
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
      setPhotoBase64('');
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-page-wrapper">
      <div className="create-page-header">
          <Title level={2}>Gathering</Title>
          {/* <Text type="secondary">填寫資料來創建您的聚餐活動</Text> */}
      </div>
      <Card className="create-card" bordered={false}>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ diningTime: null, districts: [] }}
        >
          <Row gutter={24}>
            {/* 左側欄位 */}
            <Col xs={24} md={12}>
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
                label="群組最大人數"
                name="maxNumber"
                rules={[
                  { required: true, message: '請輸入人數' },
                  { pattern: /^[2-9]|10$/, message: '請輸入 2-10 之間的整數' }
                ]}
              >
                <Input placeholder="e.g. 5" type="number" />
              </Form.Item>

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
            </Col>

            {/* 右側欄位 */}
            <Col xs={24} md={12}>
              <Form.Item
                label="預期聚餐時間"
                name="diningTime"
                rules={[{ required: true, message: '請選擇時間' }]}
              >
                <DatePicker 
                  showTime={{ format: 'HH:mm' }} 
                  format="YYYY-MM-DD HH:mm" 
                  style={{ width: '100%' }} 
                />
              </Form.Item>

              <Form.Item
                label="集合地點"
                name="meetingPlace"
                rules={[{ required: true, message: '請輸入地點' }]}
              >
                <Input placeholder="e.g. 政大商院一樓" />
              </Form.Item>

              <Form.Item label="群組封面照片" required>
                <Upload
                  beforeUpload={handlePhotoUpload}
                  maxCount={1}
                  listType="picture"
                  onRemove={() => setPhotoBase64('')}
                >
                  <Button icon={<UploadOutlined />} block>點擊上傳照片</Button>
                </Upload>
              </Form.Item>

              <Form.Item label="推薦餐廳的區域 (可複選)" name="districts">
                <Checkbox.Group options={districtOptions} className="district-checkboxes" />
              </Form.Item>
            </Col>

            {/* 跨行欄位 */}
            <Col span={24}>
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
            </Col>
          </Row>

          <div className="info-section">
            <InfoCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />
            <Text type="secondary" size="small">
              創建群組可獲得 25 積分，加入群組為 10 積分，這攸關抽獎機率！
            </Text>
          </div>

          <Form.Item>
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
          </Form.Item>
        </Form>
      </Card>
      <div style={{ height: 80 }} /> {/* 底部導覽留白 */}
      <BottomNav />
    </div>
  );
};

export default CreatePage;