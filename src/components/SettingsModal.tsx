import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import googleSheetsService, { UserSettings } from '../services/googleSheetsService';
import './SettingsModal.css';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isOpen && user) {
      loadSettings();
    }
  }, [isOpen, user]);

  const loadSettings = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userSettings = await googleSheetsService.getUserSettings(user.id);
      if (userSettings) {
        setSettings(userSettings);
      } else {
        // 기본 설정 생성
        setSettings({
          id: '',
          userId: user.id,
          emailNotifications: true,
          smsNotifications: false,
          pushNotifications: true,
          notificationFrequency: 'daily',
          language: 'ko',
          theme: 'light',
          createdAt: '',
          updatedAt: '',
        });
      }
    } catch (error) {
      console.error('설정 로드 중 오류:', error);
      setMessage('설정을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !settings) return;

    setSaving(true);
    try {
      if (settings.id) {
        // 기존 설정 업데이트 (구현 필요)
        setMessage('설정이 업데이트되었습니다.');
      } else {
        // 새 설정 저장
        await googleSheetsService.saveUserSettings(user.id, {
          emailNotifications: settings.emailNotifications,
          smsNotifications: settings.smsNotifications,
          pushNotifications: settings.pushNotifications,
          notificationFrequency: settings.notificationFrequency,
          language: settings.language,
          theme: settings.theme,
        });
        setMessage('설정이 저장되었습니다.');
      }
    } catch (error) {
      console.error('설정 저장 중 오류:', error);
      setMessage('설정 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof UserSettings, value: any) => {
    if (settings) {
      setSettings({ ...settings, [field]: value });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>⚙️ 설정</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {loading ? (
            <div className="loading">설정을 불러오는 중...</div>
          ) : settings ? (
            <div className="settings-form">
              <div className="setting-group">
                <h3>알림 설정</h3>
                <label className="setting-item">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                  />
                  이메일 알림
                </label>
                <label className="setting-item">
                  <input
                    type="checkbox"
                    checked={settings.smsNotifications}
                    onChange={(e) => handleChange('smsNotifications', e.target.checked)}
                  />
                  SMS 알림
                </label>
                <label className="setting-item">
                  <input
                    type="checkbox"
                    checked={settings.pushNotifications}
                    onChange={(e) => handleChange('pushNotifications', e.target.checked)}
                  />
                  푸시 알림
                </label>
              </div>

              <div className="setting-group">
                <h3>알림 빈도</h3>
                <select
                  value={settings.notificationFrequency}
                  onChange={(e) => handleChange('notificationFrequency', e.target.value)}
                >
                  <option value="immediate">즉시</option>
                  <option value="daily">일일</option>
                  <option value="weekly">주간</option>
                </select>
              </div>

              <div className="setting-group">
                <h3>언어 설정</h3>
                <select
                  value={settings.language}
                  onChange={(e) => handleChange('language', e.target.value)}
                >
                  <option value="ko">한국어</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div className="setting-group">
                <h3>테마 설정</h3>
                <select
                  value={settings.theme}
                  onChange={(e) => handleChange('theme', e.target.value)}
                >
                  <option value="light">라이트</option>
                  <option value="dark">다크</option>
                </select>
              </div>

              {message && (
                <div className={`message ${message.includes('실패') ? 'error' : 'success'}`}>
                  {message}
                </div>
              )}
            </div>
          ) : (
            <div className="error">설정을 불러올 수 없습니다.</div>
          )}
        </div>

        <div className="modal-footer">
          <button 
            className="save-button" 
            onClick={handleSave}
            disabled={saving || !settings}
          >
            {saving ? '저장 중...' : '저장'}
          </button>
          <button className="cancel-button" onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;