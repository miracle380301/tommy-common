import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface SettingsData {
  googleTtsFile: File | null;
  unsplashApiKey: string;
}

interface SettingsFormProps {
  data: SettingsData;
  setData: (data: SettingsData) => void;
}

interface ConfigStatus {
  ready: boolean;
  issues: {
    missing_api_keys: string[];
    missing_paths: string[];
    invalid_paths: string[];
  };
  configured_apis: string[];
  configured_paths: Record<string, string>;
}

interface CurrentConfig {
  api_keys: Record<string, boolean>;
  paths: Record<string, string>;
  directories: Record<string, string>;
  ready: boolean;
}

export default function SettingsForm({ data, setData }: SettingsFormProps) {
  const [dragOver, setDragOver] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [settingsStatus, setSettingsStatus] = useState<any>(null);
  
  // 시스템 도구 상태
  const [systemToolsStatus, setSystemToolsStatus] = useState<any>(null);
  const [toolsLoading, setToolsLoading] = useState(true);
  const [installing, setInstalling] = useState(false);

  // 컴포넌트 마운트 시 설정 상태 확인
  useEffect(() => {
    checkSettingsStatus();
    loadSystemToolsStatus();
  }, []);

  const loadSystemToolsStatus = async () => {
    try {
      setToolsLoading(true);
      const response = await axios.get("http://localhost:8000/api/system/tools");
      
      if (response.data.success) {
        setSystemToolsStatus(response.data.data);
      }
    } catch (error) {
      console.error("시스템 도구 상태 로드 실패:", error);
    } finally {
      setToolsLoading(false);
    }
  };

  const installMissingTools = async () => {
    try {
      setInstalling(true);
      const response = await axios.post("http://localhost:8000/api/system/install");
      
      if (response.data.success) {
        alert("필요한 도구들이 성공적으로 설치되었습니다!");
        setSystemToolsStatus(response.data.tools_status);
      }
    } catch (error) {
      console.error("도구 설치 실패:", error);
      alert("도구 설치에 실패했습니다. 수동으로 설치해주세요.");
    } finally {
      setInstalling(false);
    }
  };

  const checkSettingsStatus = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/settings/status`);
      setSettingsStatus(response.data);
      
      // 저장된 API Key가 있으면 입력 필드에 자동 설정
      if (response.data.unsplashApiKey.value && !data.unsplashApiKey) {
        setData({
          ...data,
          unsplashApiKey: response.data.unsplashApiKey.value
        });
      }
    } catch (error) {
      console.error('설정 상태 확인 실패:', error);
    }
  };

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      
      // Google TTS 파일 추가
      if (data.googleTtsFile) {
        formData.append('googleTtsFile', data.googleTtsFile);
      }
      
      // Unsplash API Key 추가
      if (data.unsplashApiKey) {
        formData.append('unsplashApiKey', data.unsplashApiKey);
      }
      
      // 저장할 내용이 없으면 경고
      if (!data.googleTtsFile && !data.unsplashApiKey) {
        alert('저장할 설정이 없습니다.');
        return;
      }
      
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/settings/save`, formData);
      
      if (response.data.success) {
        setIsSaved(true);
        alert(response.data.message);
        
        // 설정 상태 다시 확인하여 UI 업데이트
        await checkSettingsStatus();
        
        // 성공 메시지 3초 후 숨기기
        setTimeout(() => {
          setIsSaved(false);
        }, 3000);
      }
      
    } catch (error: any) {
      console.error('설정 저장 실패:', error);
      const errorMessage = error.response?.data?.detail || '설정 저장에 실패했습니다.';
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };


  const clearSettings = async () => {
    if (confirm('저장된 모든 설정을 삭제하시겠습니까?')) {
      try {
        // 백엔드에서 설정 파일들 삭제하는 API 필요
        alert('설정 삭제 기능은 백엔드에서 구현이 필요합니다.');
      } catch (error) {
        console.error('설정 삭제 실패:', error);
        alert('설정 삭제에 실패했습니다.');
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/json') {
      setData({
        ...data,
        googleTtsFile: file
      });
    } else {
      alert('JSON 파일만 업로드 가능합니다.');
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file && file.type === 'application/json') {
      setData({
        ...data,
        googleTtsFile: file
      });
    } else {
      alert('JSON 파일만 업로드 가능합니다.');
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleApiKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setData({
      ...data,
      unsplashApiKey: event.target.value
    });
  };

  // 백엔드에서 가져온 설정 상태 사용

  return (
    <div className="h-full overflow-y-auto pr-2">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">⚙️ Settings</h2>

        {/* 시스템 도구 상태 표시 */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🔧 시스템 도구 상태</h3>
          
          {toolsLoading ? (
            <div className="text-center py-4">
              <div className="text-gray-600">시스템 도구 확인 중...</div>
            </div>
          ) : systemToolsStatus ? (
            <div className="space-y-3">
              {/* FFmpeg 상태 */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    systemToolsStatus.ffmpeg?.available ? "bg-green-500" : "bg-red-500"
                  }`}></div>
                  <div>
                    <span className="font-medium">FFmpeg</span>
                    <span className="text-sm text-gray-500 ml-2">(비디오 처리)</span>
                  </div>
                </div>
                <div className="text-sm">
                  {systemToolsStatus.ffmpeg?.available ? (
                    <div className="text-green-700">
                      ✅ 사용 가능
                      {systemToolsStatus.ffmpeg.bundled && (
                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded text-xs">번들됨</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-red-700">❌ 사용 불가</span>
                  )}
                </div>
              </div>

              {/* ImageMagick 상태 */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    systemToolsStatus.imagemagick?.available ? "bg-green-500" : "bg-red-500"
                  }`}></div>
                  <div>
                    <span className="font-medium">ImageMagick</span>
                    <span className="text-sm text-gray-500 ml-2">(이미지 처리)</span>
                  </div>
                </div>
                <div className="text-sm">
                  {systemToolsStatus.imagemagick?.available ? (
                    <div className="text-green-700">
                      ✅ 사용 가능
                      {systemToolsStatus.imagemagick.bundled && (
                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded text-xs">번들됨</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-red-700">❌ 사용 불가</span>
                  )}
                </div>
              </div>

              {/* 한글 폰트 상태 */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    systemToolsStatus.korean_font?.available ? "bg-green-500" : "bg-yellow-500"
                  }`}></div>
                  <div>
                    <span className="font-medium">한글 폰트</span>
                    <span className="text-sm text-gray-500 ml-2">(텍스트 렌더링)</span>
                  </div>
                </div>
                <div className="text-sm">
                  {systemToolsStatus.korean_font?.available ? (
                    <div className="text-green-700">
                      ✅ 사용 가능
                      {systemToolsStatus.korean_font.bundled && (
                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded text-xs">번들됨</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-yellow-700">⚠️ 기본 폰트 사용</span>
                  )}
                </div>
              </div>

              {/* 누락된 도구가 있을 경우 자동 설치 버튼 표시 */}
              {(!systemToolsStatus.ffmpeg?.available || !systemToolsStatus.imagemagick?.available) && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-yellow-800">⚠️ 일부 도구가 누락되었습니다</div>
                      <div className="text-sm text-yellow-700 mt-1">
                        누락된 도구들을 자동으로 다운로드하고 설치할 수 있습니다.
                      </div>
                    </div>
                    <button
                      onClick={installMissingTools}
                      disabled={installing}
                      className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 disabled:bg-gray-400 text-sm"
                    >
                      {installing ? "설치 중..." : "자동 설치"}
                    </button>
                  </div>
                  
                  {installing && (
                    <div className="mt-3 text-sm text-yellow-700">
                      📥 필요한 파일들을 다운로드하고 있습니다. 잠시만 기다려주세요...
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm text-blue-700">
                  <strong>🚀 자동 설치:</strong> 누락된 도구들은 서버 시작 시 자동으로 설치됩니다. 
                  수동 설치도 위 버튼으로 가능합니다.
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              시스템 도구 상태를 확인할 수 없습니다.
            </div>
          )}
        </div>

      {/* 현재 설정 상태 요약 */}
      {settingsStatus && (settingsStatus.googleTts.configured || settingsStatus.unsplashApiKey.configured) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">현재 설정 상태</h3>
          <div className="space-y-1 text-sm">
            {settingsStatus.googleTts.configured && (
              <p className="text-blue-700">✅ Google TTS: {settingsStatus.googleTts.filename}</p>
            )}
            {settingsStatus.unsplashApiKey.configured && (
              <p className="text-blue-700">✅ Unsplash API: 설정됨</p>
            )}
          </div>
        </div>
      )}

      {/* Google TTS 설정 */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
          🎙️ Google TTS 설정
        </h3>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Google Cloud TTS 서비스 계정 JSON 파일을 업로드하세요.
            <a 
              href="https://console.cloud.google.com/apis/credentials" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline ml-1"
            >
              여기서 발급받을 수 있습니다.
            </a>
          </p>
          
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              dragOver 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => document.getElementById('tts-file-input')?.click()}
          >
            <input
              id="tts-file-input"
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
            {data.googleTtsFile ? (
              <div className="text-green-600">
                <div className="text-lg mb-2">✅</div>
                <p className="font-medium">{data.googleTtsFile.name}</p>
                <p className="text-sm text-gray-500">클릭하여 다른 파일 선택</p>
              </div>
            ) : (settingsStatus?.googleTts.configured) ? (
              <div className="text-blue-600">
                <div className="text-lg mb-2">💾</div>
                <p className="font-medium">저장된 설정: {settingsStatus.googleTts.filename}</p>
                <p className="text-xs text-gray-400">클릭하여 새 파일 선택</p>
              </div>
            ) : (
              <div className="text-gray-500">
                <div className="text-2xl mb-2">📁</div>
                <p className="font-medium">JSON 파일을 드래그하거나 클릭하여 선택</p>
                <p className="text-sm">Google Cloud 서비스 계정 키 파일</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Unsplash API 설정 */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
          🖼️ Unsplash API 설정
        </h3>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Unsplash API 키를 입력하세요. 
            <a 
              href="https://unsplash.com/developers" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline ml-1"
            >
              여기서 발급받을 수 있습니다.
            </a>
          </p>
          
          <div className="relative">
            <input
              type={showApiKey ? "text" : "password"}
              value={data.unsplashApiKey}
              onChange={handleApiKeyChange}
              placeholder="Unsplash API Key를 입력하세요"
              className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute right-3 top-3 flex items-center gap-2">
              {data.unsplashApiKey && (
                <div className="text-green-500">✅</div>
              )}
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                title={showApiKey ? "API Key 숨기기" : "API Key 보기"}
              >
                {showApiKey ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464a10.05 10.05 0 00-1.464 2.414M9.878 9.878L12 12m4.242 4.242L19.536 19.536a10.05 10.05 0 001.464-2.414M16.242 16.242L12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            <strong>주의:</strong> API 키는 안전하게 보관되며, 이미지 검색에만 사용됩니다.
          </div>
        </div>
      </div>

      {/* 설정 저장/관리 버튼 */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">설정 관리</h3>
        
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={saveSettings}
            disabled={isLoading || (!data.googleTtsFile && !data.unsplashApiKey)}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              isLoading || (!data.googleTtsFile && !data.unsplashApiKey)
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isLoading ? '저장 중...' : '💾 바로 저장'}
          </button>
          
          <button
            onClick={clearSettings}
            className="px-6 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors"
          >
            🗑️ 설정 삭제
          </button>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          <p>• <strong>바로 저장:</strong> 현재 설정을 저장합니다.</p>
          <p>• <strong>설정 삭제:</strong> 저장된 모든 설정을 삭제합니다.</p>
          <p>• 저장된 설정은 앱 재시작 시 자동으로 불러옵니다.</p>
        </div>
      </div>

      {/* 저장 완료 메시지 */}
      {isSaved && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-green-500 mr-2">✅</div>
            <div className="text-sm text-green-700 font-medium">
              설정이 성공적으로 저장되었습니다!
            </div>
          </div>
        </div>
      )}

      {/* 변경사항 알림 */}
      {(data.googleTtsFile || data.unsplashApiKey) && !isSaved && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-yellow-500 mr-2">⚠️</div>
            <div className="text-sm text-yellow-700">
              설정이 변경되었습니다. '바로 저장' 버튼을 클릭하여 즉시 저장하세요.
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}