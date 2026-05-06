import React from 'react';
import { Layout, Tree, Button, Typography, Tooltip, Dropdown } from 'antd';
import { 
  MenuUnfoldOutlined, 
  MenuFoldOutlined, 
  DeleteOutlined,
  PlusOutlined,
  FolderOutlined,
  AppstoreOutlined,
  SettingOutlined,
  EditOutlined
} from '@ant-design/icons';
import TrafficLights from './TrafficLights';

const { Sider } = Layout;
const { Title } = Typography;

const Sidebar = ({ 
  collapsed, 
  setCollapsed, 
  categories, 
  currentCategory, 
  setCurrentCategory, 
  handleDeleteCategory, 
  setIsCategoryModalOpen,
  openSettings,
  onRenameCategory
}) => {
  
  const renderTitle = (node) => {
    const isRoot = node.key === 'root';
    const isSelected = currentCategory === node.key;
    
    const items = [
      {
        key: 'add',
        label: '添加子分类',
        icon: <PlusOutlined />,
        onClick: () => {
          setCurrentCategory(node.key);
          setIsCategoryModalOpen(true);
        }
      },
      !isRoot && {
        key: 'rename',
        label: '重命名',
        icon: <EditOutlined />,
        onClick: () => onRenameCategory(node)
      },
      !isRoot && {
        key: 'delete',
        label: '删除',
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => handleDeleteCategory(node.key)
      }
    ].filter(Boolean);

    return (
      <Dropdown menu={{ items }} trigger={['contextMenu']}>
        <div 
          className={`
            flex items-center group w-full pr-2 overflow-hidden py-1 px-1.5 rounded-lg
            transition-all duration-200
            ${isSelected 
              ? 'bg-blue-50 text-blue-600 font-semibold' 
              : 'hover:bg-gray-50 text-gray-700'
            }
          `}
        >
          <span className={`mr-2 shrink-0 flex items-center text-sm ${isSelected ? 'text-blue-500' : 'text-gray-400'}`}>
              {isRoot ? <AppstoreOutlined /> : <FolderOutlined />}
          </span>
          <span 
            className={`truncate flex-1 text-[13px] transition-colors ${isSelected ? 'text-blue-700' : 'text-gray-700'}`} 
            title={node.title}
          >
            {node.title}
          </span>
          {/* Hover show add button */}
          {!isSelected && (
            <span 
              className="opacity-0 group-hover:opacity-100 transition-opacity ml-1"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentCategory(node.key);
                setIsCategoryModalOpen(true);
              }}
            >
              <PlusOutlined className="text-[10px] text-gray-300 hover:text-blue-400" />
            </span>
          )}
        </div>
      </Dropdown>
    );
  };

  return (
    <Sider 
      trigger={null} 
      collapsible 
      collapsed={collapsed} 
      theme="light"
      width={240}
      collapsedWidth={64}
      className="border-r border-gray-100 bg-white/80 backdrop-blur-sm"
      style={{ transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)' }}
    >
      <div className="h-full flex flex-col">
        <TrafficLights />

        <div className="flex items-center justify-between px-4 pb-3 pt-1 border-b border-gray-50 shrink-0">
          {!collapsed && (
            <Title level={5} style={{ margin: 0 }} className="!text-gray-700 !font-semibold">
              分类
            </Title>
          )}
          <div className="flex items-center gap-1 ml-auto">
            {!collapsed && (
              <Tooltip title="添加分类" placement="bottom">
                <Button
                  type="text"
                  size="small"
                  icon={<PlusOutlined className="text-xs" />}
                  className="text-gray-400 hover:!text-blue-500 hover:!bg-blue-50"
                  onClick={() => {
                    setIsCategoryModalOpen(true);
                  }}
                />
              </Tooltip>
            )}
            <Button
              type="text"
              size="small"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="text-gray-400 hover:!text-gray-600"
            />
          </div>
        </div>
      
        <div className="flex-1 overflow-y-auto py-2 px-1.5">
          <Tree
            blockNode
            showIcon={false}
            defaultExpandAll
            selectedKeys={[currentCategory]}
            onSelect={(keys) => {
                if (keys.length > 0) {
                    setCurrentCategory(keys[0]);
                }
            }}
            treeData={categories}
            titleRender={renderTitle}
            className="bg-transparent"
            switcherIcon={null}
          />
        </div>

        <div className="p-3 border-t border-gray-50 shrink-0">
          <Button 
            type="text" 
            icon={<SettingOutlined />} 
            className="w-full flex items-center justify-start text-gray-400 hover:!text-gray-700 hover:!bg-gray-50 rounded-lg"
            onClick={openSettings}
          >
            {!collapsed && <span className="text-[13px] ml-1">设置</span>}
          </Button>
        </div>
      </div>
    </Sider>
  );
};

export default Sidebar;
