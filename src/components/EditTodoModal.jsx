import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, DatePicker, Select, Tag, Button, Space } from 'antd';
import { PlusOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

const PRIORITY_OPTIONS = [
  { value: 'high', label: '高', color: 'red' },
  { value: 'medium', label: '中', color: 'blue' },
  { value: 'low', label: '低', color: 'default' },
];

// Helper to flatten tree into flat list with depth
const flattenCategories = (nodes, depth = 0) => {
  let result = [];
  for (const node of nodes) {
    result.push({ key: node.key, title: node.title, depth });
    if (node.children) {
      result = result.concat(flattenCategories(node.children, depth + 1));
    }
  }
  return result;
};

const EditTodoModal = ({ open, onClose, todo, onSave, categories }) => {
  const [form] = Form.useForm();
  const [tags, setTags] = useState([]);
  const [inputTag, setInputTag] = useState('');

  useEffect(() => {
    if (todo && open) {
      form.setFieldsValue({
        text: todo.text,
        deadline: todo.deadline ? dayjs(todo.deadline) : null,
        priority: todo.priority || 'medium',
        notes: todo.notes || '',
        categoryId: todo.categoryId,
      });
      setTags(todo.tags || []);
    }
  }, [todo, open, form]);

  const handleAddTag = () => {
    const tag = inputTag.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setInputTag('');
    }
  };

  const handleRemoveTag = (tag) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSubmit = () => {
    form.validateFields().then(values => {
      onSave(todo.id, {
        text: values.text.trim(),
        deadline: values.deadline ? values.deadline.toDate() : null,
        priority: values.priority,
        notes: values.notes || '',
        tags,
        categoryId: values.categoryId,
      });
      onClose();
    });
  };

  const flatCategories = flattenCategories(categories);

  return (
    <Modal
      title="编辑待办"
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      okText="保存"
      cancelText="取消"
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="text"
          label="内容"
          rules={[{ required: true, message: '请输入待办内容' }]}
        >
          <Input placeholder="输入待办事项" />
        </Form.Item>

        <Form.Item
          name="categoryId"
          label="所属分类"
        >
          <Select placeholder="选择分类">
            {flatCategories.map(cat => (
              <Option key={cat.key} value={cat.key}>
                {'　'.repeat(cat.depth)}{cat.title}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="priority"
          label="优先级"
        >
          <Select>
            {PRIORITY_OPTIONS.map(opt => (
              <Option key={opt.value} value={opt.value}>
                <Tag color={opt.color}>{opt.label}</Tag>
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="deadline"
          label="截止日期"
        >
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm"
            style={{ width: '100%' }}
            placeholder="选择截止日期"
          />
        </Form.Item>

        <Form.Item
          name="notes"
          label="备注"
        >
          <TextArea rows={3} placeholder="添加备注..." />
        </Form.Item>

        <Form.Item label="标签">
          <Space wrap>
            {tags.map(tag => (
              <Tag
                key={tag}
                closable
                onClose={() => handleRemoveTag(tag)}
                className="cursor-pointer"
              >
                {tag}
              </Tag>
            ))}
          </Space>
          <div className="flex gap-2 mt-2">
            <Input
              size="small"
              value={inputTag}
              onChange={e => setInputTag(e.target.value)}
              onPressEnter={handleAddTag}
              placeholder="新标签"
              className="w-32"
            />
            <Button
              size="small"
              icon={<PlusOutlined />}
              onClick={handleAddTag}
              disabled={!inputTag.trim()}
            />
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditTodoModal;
