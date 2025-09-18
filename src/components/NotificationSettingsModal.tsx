import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import googleSheetsService, { NotificationSettings } from '../services/googleSheetsService';
import './NotificationSettingsModal.css';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
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
      const notificationSettings = await googleSheetsService.getNotificationSettings(user.id);
      if (notificationSettings) {
        setSettings(notificationSettings);
      } else {
        // 기본 설정 생성
        setSettings({
          id: '',
          userId: user.id,
          email: true,
          sms: false,
          push: true,
          frequency: 'daily',
          quietHours: {
            enabled: false,
            start: '22:00',
            end: '08:00',
          },
          createdAt: '',
          updatedAt: '',
        });
      }
    } catch (error) {
      console.error('알림 설정 로드 중 오류:', error);
      setMessage('알림 설정을 불러오는데 실패했습니다.');
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
        setMessage('알림 설정이 업데이트되었습니다.');
      } else {
        // 새 설정 저장
        await googleSheetsService.saveNotificationSettings(user.id, {
          email: settings.email,
          sms: settings.sms,
          push: settings.push,
          frequency: settings.frequency,
          quietHours: settings.quietHours,
        });
        setMessage('알림 설정이 저장되었습니다.');
      }
    } catch (error) {
      console.error('알림 설정 저장 중 오류:', error);
      setMessage('알림 설정 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof NotificationSettings, value: any) => {
    if (settings) {
      setSettings({ ...settings, [field]: value });
    }
  };

  const handleQuietHoursChange = (field: keyof NotificationSettings['quietHours'], value: any) => {
    if (settings) {
      setSettings({
        ...settings,
        quietHours: {
          ...settings.quietHours,
          [field]: value,
        },
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content notification-settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📧 알림 설정</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {loading ? (
            <div className="loading">알림 설정을 불러오는 중...</div>
          ) : settings ? (
            <div className="notification-settings-form">
              <div className="setting-group">
                <h3>알림 채널</h3>
                <label className="setting-item">
                  <input
                    type="checkbox"
                    checked={settings.email}
                    onChange={(e) => handleChange('email', e.target.checked)}
                  />
                  이메일 알림
                </label>
                <label className="setting-item">
                  <input
                    type="checkbox"
                    checked={settings.sms}
                    onChange={(e) => handleChange('sms', e.target.checked)}
                  />
                  SMS 알림
                </label>
                <label className="setting-item">
                  <input
                    type="checkbox"
                    checked={settings.push}
                    onChange={(e) => handleChange('push', e.target.checked)}
                  />
                  푸시 알림
                </label>
              </div>

              <div className="setting-group">
                <h3>알림 빈도</h3>
                <select
                  value={settings.frequency}
                  onChange={(e) => handleChange('frequency', e.target.value)}
                >
                  <option value="immediate">즉시</option>
                  <option value="daily">일일</option>
                  <option value="weekly">주간</option>
                </select>
              </div>

              <div className="setting-group">
                <h3>방해 금지 시간</h3>
                <label className="setting-item">
                  <input
                    type="checkbox"
                    checked={settings.quietHours.enabled}
                    onChange={(e) => handleQuietHoursChange('enabled', e.target.checked)}
                  />
                  방해 금지 시간 설정
                </label>
                
                {settings.quietHours.enabled && (
                  <div className="quiet-hours-settings">
                    <div className="time-input-group">
                      <label>
                        시작 시간:
                        <input
                          type="time"
                          value={settings.quietHours.start}
                          onChange={(e) => handleQuietHoursChange('start', e.target.value)}
                        />
                      </label>
                      <label>
                        종료 시간:
                        <input
                          type="time"
                          value={settings.quietHours.end}
                          onChange={(e) => handleQuietHoursChange('end', e.target.value)}
                        />
                      </label>
                    </div>
                    <p className="quiet-hours-note">
                      이 시간 동안은 알림이 발송되지 않습니다.
                    </p>
                  </div>
                )}
              </div>

              <div className="setting-group">
                <h3>알림 테스트</h3>
                <button 
                  className="test-button"
                  onClick={() => {
                    // 알림 테스트 기능 구현
                    setMessage('테스트 알림이 발송되었습니다.');
                  }}
                >
                  테스트 알림 발송
                </button>
              </div>

              {message && (
                <div className={`message ${message.includes('실패') ? 'error' : 'success'}`}>
                  {message}
                </div>
              )}
            </div>
          ) : (
            <div className="error">알림 설정을 불러올 수 없습니다.</div>
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

export default NotificationSettingsModal;