import React, { useState, useEffect, useRef } from 'react';
import { Button, Progress, Typography, Space, Tooltip } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, CloseOutlined, SwapOutlined, StopOutlined } from '@ant-design/icons';

const { Title } = Typography;

const PomodoroView = ({ todoItem, onClose, settings, onUpdateFocusTime }) => {
  console.log('PomodoroView rendered with settings:', settings);
  const focusTime = settings?.pomodoro?.focusTime;
  const breakTime = settings?.pomodoro?.breakTime;
  
  const focusTimeVal = Number(focusTime);
  const breakTimeVal = Number(breakTime);
  
  const focusTimeSeconds = (Number.isFinite(focusTimeVal) && focusTimeVal > 0 ? focusTimeVal : 25) * 60;
  const breakTimeSeconds = (Number.isFinite(breakTimeVal) && breakTimeVal > 0 ? breakTimeVal : 5) * 60;

  const [timeLeft, setTimeLeft] = useState(focusTimeSeconds);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('focus'); // 'focus' or 'break'
  const timerRef = useRef(null);

  useEffect(() => {
    if (!isActive) {
      setTimeLeft(mode === 'focus' ? focusTimeSeconds : breakTimeSeconds);
    }
  }, [settings, mode, isActive, focusTimeSeconds, breakTimeSeconds]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      clearInterval(timerRef.current);
      setIsActive(false);
      
      if (mode === 'focus' && todoItem && onUpdateFocusTime) {
         onUpdateFocusTime(todoItem.id, settings?.pomodoro?.focusTime || 25);
         new Notification("专注完成", { body: `你完成了 ${settings?.pomodoro?.focusTime || 25} 分钟的专注！` });
      } else if (mode === 'break') {
         new Notification("休息结束", { body: "休息结束，准备开始新的专注吧！" });
      }
    }

    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft, mode, todoItem, onUpdateFocusTime, settings, focusTimeSeconds]);

  const startTimer = () => setIsActive(true);

  const stopTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? focusTimeSeconds : breakTimeSeconds);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? focusTimeSeconds : breakTimeSeconds);
  };

  const switchMode = () => {
    const newMode = mode === 'focus' ? 'break' : 'focus';
    setMode(newMode);
    setTimeLeft(newMode === 'focus' ? focusTimeSeconds : breakTimeSeconds);
    setIsActive(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentTotalTime = mode === 'focus' ? focusTimeSeconds : breakTimeSeconds;
  const progressPercent = Math.round(
    (currentTotalTime - timeLeft) / currentTotalTime * 100
  );

  // Gradient colors
  const strokeColor = mode === 'focus' 
    ? { '0%': '#ff7875', '100%': '#ff4d4f' }
    : { '0%': '#95de64', '100%': '#52c41a' };

  return (
    <div className="h-full w-full flex items-center justify-center bg-transparent">
      <div 
        className="relative w-[180px] h-[180px] rounded-full bg-white/95 backdrop-blur-sm overflow-hidden group border-2 border-gray-100 shadow-lg"
        style={{ WebkitAppRegion: 'drag' }}
      >
      
        {/* Traffic Lights - Top Left */}
        <div className="absolute top-4 left-6 flex gap-1.5 z-20 no-drag opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ WebkitAppRegion: 'no-drag' }}>
          <div 
              className="w-3 h-3 rounded-full bg-red-400 hover:bg-red-500 cursor-pointer shadow-sm flex items-center justify-center group/close transition-colors"
              onClick={onClose}
          >
              <CloseOutlined className="text-[8px] text-red-900 opacity-0 group-hover/close:opacity-100" />
          </div>
          <div 
              className="w-3 h-3 rounded-full bg-yellow-400 hover:bg-yellow-500 cursor-pointer shadow-sm flex items-center justify-center group/min transition-colors"
              onClick={() => window.api?.windowMinimize?.()}
          >
              <div className="w-2 h-0.5 bg-yellow-900 opacity-0 group-hover/min:opacity-100"></div>
          </div>
        </div>
        
        <div className="relative flex items-center justify-center w-full h-full">
          <Progress 
            type="circle" 
            percent={progressPercent} 
            showInfo={false}
            width={160}
            strokeLinecap="round"
            strokeColor={strokeColor}
            strokeWidth={8}
            trailColor="#f0f0f0"
          />
          
          <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
            {/* Mode badge */}
            <div 
              className={`
                px-2 py-0.5 rounded-full text-[9px] font-medium mb-1
                ${mode === 'focus' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}
              `}
            >
              {mode === 'focus' ? '专注' : '休息'}
            </div>

            {/* Timer - Click to Start Only */}
            <div 
              className={`
                text-3xl font-mono font-bold text-gray-800 select-none no-drag tracking-tight
                ${!isActive ? 'cursor-pointer hover:scale-105' : ''} transition-transform duration-200
              `}
              onClick={!isActive ? startTimer : undefined}
              title={!isActive ? "点击开始" : ""}
              style={{ WebkitAppRegion: 'no-drag' }}
            >
              {formatTime(timeLeft)}
            </div>
            
            {/* Task Name */}
            <div 
              className="mt-1 px-3 max-w-[140px] truncate text-center text-[10px] text-gray-400"
              title={todoItem?.text}
            >
              {todoItem?.text || '专注任务'}
            </div>
            
            {/* Controls */}
            <div 
              className={`
                flex items-center gap-2 mt-2 no-drag
                transition-all duration-300
                ${isActive ? 'opacity-0 group-hover:opacity-100 translate-y-1' : 'opacity-100 translate-y-0'}
              `}
              style={{ WebkitAppRegion: 'no-drag' }}
            >
              <Tooltip title={isActive ? "放弃" : "开始"}>
                <button 
                  onClick={isActive ? stopTimer : startTimer}
                  className={`
                    w-7 h-7 rounded-full flex items-center justify-center text-sm
                    transition-all duration-200 shadow-sm
                    ${isActive 
                      ? 'bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-500' 
                      : 'bg-blue-50 text-blue-500 hover:bg-blue-100 hover:text-blue-600'
                    }
                  `}
                >
                  {isActive ? <StopOutlined /> : <PlayCircleOutlined />}
                </button>
              </Tooltip>
              
              <Tooltip title={mode === 'focus' ? "切换到休息" : "切换到专注"}>
                <button 
                  onClick={switchMode}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-sm bg-gray-50 text-gray-400 hover:bg-green-50 hover:text-green-500 transition-all duration-200 shadow-sm"
                >
                  <SwapOutlined />
                </button>
              </Tooltip>

              <Tooltip title="重置">
                <button 
                  onClick={resetTimer}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-sm bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all duration-200 shadow-sm"
                >
                  <PauseCircleOutlined />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PomodoroView;
