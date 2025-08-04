import React, { useState, useEffect } from "react";
import { User } from "../../types/common";
import { FullFormData, UploadFromProps } from "../../types/common";

function UploadComponent({ data, setData } : UploadFromProps) {
  const currentUploadTab = data.currentUploadTab;
  const [authUrl, setAuthUrl] = useState("");
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    // 이 코드는 컴포넌트가 처음 렌더링될 때 한 번 실행됨
    const userStr = localStorage.getItem("user");
    setUser(userStr ? JSON.parse(userStr) : null);
  }, []);

    const handleTabChange = (tab: FullFormData["upload"]["currentUploadTab"]) => {
    setData({
      ...data,
      currentUploadTab: tab,
    })
  };


  const renderUploadTabContent = () => {
    switch (currentUploadTab) {
      case "download":
        return "영상 다운로드";
      case "reserve":
        return (
          !user?.google_access_token ? (
            <button
              disabled={!authUrl}
              onClick={() => window.location.href = authUrl}
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              구글로 로그인
            </button>
          ) : (
            <div className="flex flex-col gap-4 w-full max-w-2xl">
              <div className="flex flex-col">
                <textarea
                  maxLength={100}
                  rows={2}
                  className="p-2 border rounded resize-none"
                  placeholder="제목을 입력하세요(최대 100자)"
                  value={data.title}
                  onChange={(e) =>
                   setData({ ...data, title: e.target.value })  
                  }
                />
              </div>
              <div className="flex flex-col">
                <textarea
                  maxLength={100}
                  rows={1}
                  className="p-2 border rounded resize-y overflow-auto max-h-64"
                  placeholder="해쉬태그를 입력하세요. ex) 동기부여, 인생조언"
                  value={data.tags}
                  onChange={(e) =>
                    setData({ ...data, tags: e.target.value })
                  }                  
                />
              </div>              
              <div className="flex flex-col">
                <textarea
                  maxLength={5000}
                  rows={10}
                  className="p-2 border rounded resize-y overflow-auto max-h-64"
                  placeholder="설명을 입력하세요(최대 5000자)"
                  value={data.description}
                  onChange={(e) =>
                    setData({ ...data, description: e.target.value })
                  }                  
                />
              </div>
            </div>
          )
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    setData({
      ...data,
      currentUploadTab
    });
  }, [currentUploadTab]);

  return (
    <div className="flex">
      {/* 왼쪽: 탭 목록 */}
      <div className="w-1/3">
        <div className="flex flex-col items-start space-y-2 p-4">
          <input
            type="radio"
            id="uploadTab1"
            name="uploadTab"
            className="hidden peer"
            checked={currentUploadTab === "download"}
            onChange={() => handleTabChange("download")}
          />
          <label
            htmlFor="uploadTab1"
            className="cursor-pointer px-4 py-2 text-left border-transparent peer-checked:border-blue-500 peer-checked:text-blue-600"
          >
            영상 다운로드
          </label>

          <input
            type="radio"
            id="uploadTab2"
            name="uploadTab"
            className="hidden peer"
            checked={currentUploadTab === "reserve"}
            onChange={() => handleTabChange("reserve")}
          />
          <label
            htmlFor="uploadTab2"
            className="cursor-pointer px-4 py-2 text-left border-transparent peer-checked:border-blue-500 peer-checked:text-blue-600"
          >
            예약 업로드
          </label>
        </div>
      </div>

      {/* 오른쪽: 콘텐츠 */}
      <div className="w-3/4 px-4 pt-0">
        {renderUploadTabContent()}
      </div>
    </div>
  );
}

export default UploadComponent;
