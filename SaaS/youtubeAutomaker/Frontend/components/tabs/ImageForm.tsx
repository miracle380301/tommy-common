import React, { useState, useEffect } from "react";
import { FullFormData, ImageFormProps } from "../../types/common";
import axios from "axios";

function ImageComponent({ data, setData } : ImageFormProps) {
  const currentImageTab = data.currentImageTab;
  const inputKeyword = data.inputKeyword;
  const selectedKeyword = data.selectedKeyword;
  const files = data.files;
  
  // Unsplash API Key 상태
  const [hasUnsplashApiKey, setHasUnsplashApiKey] = useState(false);

  const tabCount = 3;
  const selectedTabIndex = ["input", "keyword", "direct"].indexOf(currentImageTab);
  const marginLeftPercent = (100 / tabCount) * selectedTabIndex;

  useEffect(() => {
    console.log('files state updated:', data.files);
  }, [data.files]);

  // 컴포넌트 마운트 시 API Key 상태 확인
  useEffect(() => {
    const checkApiKeyStatus = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/settings/status`);
        const { unsplashApiKey } = response.data;
        setHasUnsplashApiKey(unsplashApiKey.configured);
      } catch (error) {
        console.error('API Key 상태 확인 실패:', error);
        setHasUnsplashApiKey(false);
      }
    };

    checkApiKeyStatus();
  }, []);

  // API Key가 없으면 direct 탭으로 자동 전환
  useEffect(() => {
    if (!hasUnsplashApiKey && (currentImageTab === "input" || currentImageTab === "keyword")) {
      setData({
        ...data,
        currentImageTab: "direct"
      });
    }
  }, [hasUnsplashApiKey]);

  const handleTabChange = (tab: FullFormData["image"]["currentImageTab"]) => {
    // API Key가 없으면 input, keyword 탭 선택 불가
    if (!hasUnsplashApiKey && (tab === "input" || tab === "keyword")) {
      alert("Unsplash API Key가 필요합니다. Settings 탭에서 설정해주세요.");
      return;
    }
    
    setData({
      ...data,
      currentImageTab: tab,
    })
  };
  
  const handleImageSelect = (image: FullFormData["image"]["selectedKeyword"]) => {
    setData({
      ...data,
      selectedKeyword: image,
    })
  };

  const renderImageTabContent = () => {
    switch (currentImageTab) {
      case "input":
        return (
        <div className="space-y-2 mb-4">
          {!hasUnsplashApiKey ? (
            <div className="text-center p-8 text-gray-500">
              <div className="text-4xl mb-4">🔒</div>
              <p className="text-lg font-medium mb-2">API Key가 필요합니다</p>
              <p className="text-sm">Settings 탭에서 Unsplash API Key를 설정해주세요.</p>
            </div>
          ) : (
            <input
              type="text"
              id="inputKeyword"
              name="inputKeyword"
              maxLength={15}
              placeholder="최대 15자 입력"
              value={inputKeyword}
              onChange={(e) =>
                  setData({
                    ...data,
                    inputKeyword: e.target.value, // 🔹 상태 업데이트
                  })
                }            
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          )}
        </div>
      );
      case "direct":
        return (
          <div className="max-h-96 overflow-y-auto pr-2">
            <div className="space-y-3">
              {Array.from({ length: 20 }).map((_, index) => (
                <div className="flex items-center space-x-3 p-2 border border-gray-200 rounded-lg" key={index}>
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      onChange={(e) => {
                        const selectedFile = e.target.files && e.target.files.length > 0 ? e.target.files[0] : null;
                        console.log("selectedFile:", selectedFile);
                        if (!selectedFile) return;

                        // 기존 files 배열을 복사하여 새 파일 적용
                        const newFiles = [...(data.files || [])];
                        newFiles[index] = selectedFile;

                        // 🔹 image 내부의 files만 업데이트
                        setData({
                          ...data,
                          files: newFiles,
                        });
                      }}
                    />
                    {/* 선택된 파일명 표시 */}
                    {files?.[index] && (
                      <p className="text-xs mt-1 text-gray-500 truncate">📁 {files[index].name}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case "keyword":
        return (
          <>
          {!hasUnsplashApiKey ? (
            <div className="text-center p-8 text-gray-500">
              <div className="text-4xl mb-4">🔒</div>
              <p className="text-lg font-medium mb-2">API Key가 필요합니다</p>
              <p className="text-sm">Settings 탭에서 Unsplash API Key를 설정해주세요.</p>
            </div>
          ) : (
            <>
          <input
            type="radio"
            id="nature"
            name="selectedKeyword"
            className="hidden peer"
            checked={selectedKeyword === "nature"}
            onChange={() => handleImageSelect("nature")}
          />
          <label
            htmlFor="nature"
            className="flex items-center cursor-pointer justify-end text-lg"
          >🌳 nature</label>
          <input
            type="radio"
            id="space"
            name="selectedKeyword"
            className="hidden peer"
            checked={selectedKeyword === "space"}
            onChange={() => handleImageSelect("space")}
          />
          <label
            htmlFor="space"
            className="flex items-center cursor-pointer justify-end text-lg"
          >🚀 space</label>
          <input
            type="radio"
            id="seasons"
            name="selectedKeyword"
            className="hidden peer"
            checked={selectedKeyword === "seasons"}
            onChange={() => handleImageSelect("seasons")}
          />
          <label
            htmlFor="seasons"
            className="flex items-center cursor-pointer justify-end text-lg"
          >🍂 seasons</label>        
          <input
            type="radio"
            id="city"
            name="selectedKeyword"
            className="hidden peer"
            checked={selectedKeyword === "city"}
            onChange={() => handleImageSelect("city")}
          />
          <label
            htmlFor="city"
            className="flex items-center cursor-pointer justify-end text-lg"
          >🏢 city</label>    
          <input
            type="radio"
            id="animals"
            name="selectedKeyword"
            className="hidden peer"
            checked={selectedKeyword === "animals"}
            onChange={() => handleImageSelect("animals")}
          />
          <label
            htmlFor="animals"
            className="flex items-center cursor-pointer justify-end text-lg"
          >🐶 animals</label>               
          <input
            type="radio"
            id="emotions"
            name="selectedKeyword"
            className="hidden peer"
            checked={selectedKeyword === "emotions"}
            onChange={() => handleImageSelect("emotions")}
          />
          <label
            htmlFor="emotions"
            className="flex items-center cursor-pointer justify-end text-lg"
          >😄 emotions</label>
          <input
            type="radio"
            id="abstract"
            name="selectedKeyword"
            className="hidden peer"
            checked={selectedKeyword === "abstract"}
            onChange={() => handleImageSelect("abstract")}
          />
          <label
            htmlFor="abstract"
            className="flex items-center cursor-pointer justify-end text-lg"
          >🎨 abstract</label>    
          <input
            type="radio"
            id="activities"
            name="selectedKeyword"
            className="hidden peer"
            checked={selectedKeyword === "activities"}
            onChange={() => handleImageSelect("activities")}
          />
          <label
            htmlFor="activities"
            className="flex items-center cursor-pointer justify-end text-lg"
          >🎸 activities</label>     
          <input
            type="radio"
            id="special"
            name="selectedKeyword"
            className="hidden peer"
            checked={selectedKeyword === "special"}
            onChange={() => handleImageSelect("special")}
          />
          <label
            htmlFor="special"
            className="flex items-center cursor-pointer justify-end text-lg"
          >🎉 special</label>
          <input
            type="radio"
            id="story"
            name="selectedKeyword"
            className="hidden peer"
            checked={selectedKeyword === "story"}
            onChange={() => handleImageSelect("story")}
          />
          <label
            htmlFor="story"
            className="flex items-center cursor-pointer justify-end text-lg"
          >🧙‍♂️ story</label>           
            </>
          )}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full mx-auto">
      <div className="flex border-b border-gray-300">
        <input
          type="radio"
          id="imageTab1"
          name="imageTab"
          className="hidden peer"
          checked={currentImageTab === "input"}
          onChange={() => handleTabChange("input")}
        />
        <label
          htmlFor="imageTab1"
          className={`px-4 py-2 text-center flex-1 border-b-2 border-transparent peer-checked:border-blue-500 peer-checked:text-blue-600 ${
            hasUnsplashApiKey 
              ? 'cursor-pointer' 
              : 'cursor-not-allowed text-gray-400'
          }`}
        >
          키워드 입력
          {!hasUnsplashApiKey && " 🔒"}
        </label>

        <input
          type="radio"
          id="imageTab2"
          name="imageTab"
          className="hidden peer"
          checked={currentImageTab === "keyword"}
          onChange={() => handleTabChange("keyword")}
        />
        <label
          htmlFor="imageTab2"
          className={`px-4 py-2 text-center flex-1 border-b-2 border-transparent peer-checked:border-blue-500 peer-checked:text-blue-600 ${
            hasUnsplashApiKey 
              ? 'cursor-pointer' 
              : 'cursor-not-allowed text-gray-400'
          }`}
        >
          키워드 설정
          {!hasUnsplashApiKey && " 🔒"}
        </label>

        <input
          type="radio"
          id="imageTab3"
          name="imageTab"
          className="hidden peer"
          checked={currentImageTab === "direct"}
          onChange={() => handleTabChange("direct")}
        />
        <label
          htmlFor="imageTab3"
          className="cursor-pointer px-4 py-2 text-center flex-1 border-b-2 border-transparent peer-checked:border-blue-500 peer-checked:text-blue-600"
        >
          직접 설정
        </label>

      </div>

      <div className="pt-4 transition-all duration-300"
           style={{
              marginLeft: `${marginLeftPercent}%`,
              width: `${100 / tabCount}%`,
           }}
      >
            {renderImageTabContent()}
      </div>
    </div>
  );
}

export default ImageComponent;
