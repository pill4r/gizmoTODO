import React, { useState } from 'react';
import { Card, Checkbox, Button, Typography, Tag } from 'antd';
import { DeleteOutlined, CalendarOutlined, PlayCircleOutlined, FieldTimeOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;

const PRIORITY_MAP = {
  high:  { color: '#ff4d4f', bg: '#fff2f0', label: '高' },
  medium:{ color: '#1677ff', bg: '#e6f4ff', label: '中' },
  low:   { color: '#8c8c8c', bg: '#f5f5f5', label: '低' },
};

const TodoItem = ({ item, toggleTodoCompletion, handleDeleteTodo, handleStartPomodoro, onEdit }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleToggle = (e) => {
    e?.stopPropagation();

    if (!item.completed && !isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        toggleTodoCompletion(item.id);
        setIsAnimating(false);
      }, 500);
    } else {
      toggleTodoCompletion(item.id);
      setIsAnimating(false);
    }
  };

  const formatDeadline = (date) => {
    if (!date) return '';
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const dateStr = dayjs(date).format('MM月DD日 HH:mm');

    if (diffDays === 0) return `${dateStr} (今天)`;
    if (diffDays === 1) return `${dateStr} (明天)`;
    if (diffDays > 1 && diffDays < 7) return `${dateStr} (${diffDays}天后)`;
    return dateStr;
  };

  const getUrgencyTag = (deadline, completed) => {
    if (completed || !deadline) return null;
    const now = new Date();
    const diffTime = deadline - now;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffTime < 0) return <Tag color="error" className="!text-[11px] !px-1.5 !py-0 !leading-5 !rounded-full">已过期</Tag>;
    if (diffDays < 1) return <Tag color="warning" className="!text-[11px] !px-1.5 !py-0 !leading-5 !rounded-full">紧急</Tag>;
    if (diffDays < 3) return <Tag color="gold" className="!text-[11px] !px-1.5 !py-0 !leading-5 !rounded-full">即将到期</Tag>;
    return null;
  };

  const getCardStyle = (deadline, completed) => {
    if (completed) return {};
    if (!deadline) return {};

    const now = new Date();
    const diffTime = deadline - now;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffTime < 0) return { borderLeft: '4px solid #ff4d4f' };
    if (diffDays < 1) return { borderLeft: '4px solid #fa8c16' };
    if (diffDays < 3) return { borderLeft: '4px solid #faad14' };
    return { borderLeft: '4px solid #e8e8e8' };
  };

  const priority = item.priority && PRIORITY_MAP[item.priority];

  return (
    <Card
      hoverable
      bodyStyle={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      className={`
        w-full transition-all duration-300 cursor-pointer
        ${item.completed ? 'bg-gray-50/60' : 'bg-white'}
        hover:shadow-md hover:-translate-y-0.5
      `}
      style={{
        ...getCardStyle(item.deadline, item.completed),
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
      onClick={handleToggle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center flex-1 gap-4 min-w-0">
        <Checkbox
          checked={item.completed || isAnimating}
          onChange={handleToggle}
          onClick={(e) => e.stopPropagation()}
          className="shrink-0"
        />
        <div className={`flex flex-col min-w-0 transition-opacity duration-300 ${item.completed ? 'opacity-40' : 'opacity-100'}`}>
          <div className="relative inline-block w-fit max-w-full">
            <div className="flex items-center gap-2 flex-wrap">
              <Text
                strong={!item.completed && !isAnimating}
                className="text-[15px] leading-snug"
                style={{
                  textDecoration: item.completed ? 'line-through' : 'none',
                  textDecorationColor: '#9ca3af',
                  textDecorationThickness: '1.5px',
                  transition: 'text-decoration 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {item.text}
              </Text>
              {priority && (
                <span
                  className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium shrink-0"
                  style={{ color: priority.color, backgroundColor: priority.bg }}
                >
                  {priority.label}
                </span>
              )}
            </div>
          </div>

          {item.tags && item.tags.length > 0 && (
            <div className="flex items-center gap-1.5 mt-1.5">
              {item.tags.map(tag => (
                <Tag key={tag} className="!text-[10px] !px-1.5 !py-0 !leading-4 !rounded-md !border-none !bg-gray-100 !text-gray-500 m-0">
                  {tag}
                </Tag>
              ))}
            </div>
          )}

          {item.deadline && (
            <div className={`flex items-center mt-1.5 text-xs ${
              item.deadline < new Date() && !item.completed ? 'text-red-400' : 'text-gray-400'
            }`}>
              <CalendarOutlined className="mr-1 text-[10px]" />
              {formatDeadline(item.deadline)}
            </div>
          )}

          {item.notes && (
            <div className="mt-1 text-xs text-gray-400 line-clamp-1">
              {item.notes}
            </div>
          )}

          {item.totalFocusTime > 0 && (
            <div className="flex items-center mt-1 text-xs text-blue-400">
              <FieldTimeOutlined className="mr-1 text-[10px]" />
              已专注 {item.totalFocusTime} 分钟
            </div>
          )}
        </div>
      </div>

      <div className={`
        flex items-center gap-1 shrink-0 ml-3
        transition-all duration-200 ease-out
        ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 pointer-events-none'}
      `}>
        {getUrgencyTag(item.deadline, item.completed)}
        {!item.completed && (
          <Button
            type="text"
            icon={<PlayCircleOutlined />}
            className="text-gray-400 hover:!text-blue-500 flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              handleStartPomodoro(item);
            }}
          />
        )}
        <Button
          type="text"
          icon={<EditOutlined />}
          className="text-gray-400 hover:!text-blue-500 flex items-center justify-center"
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.();
          }}
        />
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          className="flex items-center justify-center"
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteTodo(item.id);
          }}
        />
      </div>
    </Card>
  );
};

export default TodoItem;
