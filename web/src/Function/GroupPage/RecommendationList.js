import React from 'react';
import { Card, Button, InputNumber, Tag } from 'antd';
import { HeartOutlined, HeartFilled, StarFilled } from '@ant-design/icons';
import SectionTitle from './SectionTitle';

function cleanTags(tagsString) {
  if (!tagsString) return [];
  return tagsString
    .replace(/[\]['"]/g, '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export default function RecommendationList({
  listNumber,
  restaurants,
  favoritedIds,
  onToggleFavorite,
  score,
  onScoreChange,
  extra,
}) {
  const numberOffset = listNumber === 2 ? 7 : 0;

  return (
    <Card
      className="group-card recommendation-list-section"
      bordered={false}
      title={<SectionTitle>{`團體推薦清單${listNumber}`}</SectionTitle>}
    >
      <div className="recommendation-list">
        {restaurants.map((restaurant, index) => (
          <Card key={restaurant.id} className="recommendation-card" size="small">
            <div className="recommendation-card-content">
              <h3 className="restaurant-name">{index + 1 + numberOffset}. {restaurant.name}</h3>
              <div className="restaurant-info">
                <StarFilled className="starIcon" style={{ color: '#faad14' }} />
                <span className="restaurant-rating">{restaurant.rating}({restaurant.reviewCount})</span>
                <span> ${restaurant.averageCost}</span>
              </div>
              <p className="restaurant-address">{restaurant.address}</p>
              <div className="restaurant-tags">
                {cleanTags(restaurant.tags).map((tag) => (
                  <Tag key={tag} color="green">{tag}</Tag>
                ))}
              </div>
              <a href={restaurant.link} target="_blank" rel="noopener noreferrer" className="more-info">更多資訊</a>
            </div>
            <Button
              type="text"
              className="favorite-button"
              aria-label={favoritedIds.has(restaurant.id) ? '取消收藏' : '加入收藏'}
              onClick={() => onToggleFavorite(restaurant.id)}
              icon={favoritedIds.has(restaurant.id)
                ? <HeartFilled style={{ color: '#ff4d4f' }} />
                : <HeartOutlined />}
            />
          </Card>
        ))}
      </div>
      <div className="recommendation-inputs">
        <div className="ratingInput">
          <label>推薦滿意度</label>
          <InputNumber min={1} max={10} placeholder="1-10" value={score} onChange={onScoreChange} />
        </div>
        {extra}
      </div>
    </Card>
  );
}
