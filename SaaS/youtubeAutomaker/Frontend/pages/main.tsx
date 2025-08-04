import axios, {AxiosError} from "axios";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout"
import ScriptForm from "../components/tabs/ScriptForm";
import VoiceForm from "../components/tabs/VoiceForm";
import ImageForm from "../components/tabs/ImageForm";
import MusicForm from "../components/tabs/MusicForm";
import TemplateForm from "../components/tabs/TemplateForm";
import UploadForm from "../components/tabs/UploadForm";
import SettingsForm from "../components/tabs/SettingsForm";
import type { FullFormData } from "../types/common";


const initialFormData: FullFormData = {
  script: "",
  voice: {
    currentVoiceTab: "single",
    selectedVoice: "sexual-w",
  },
  image: {
    currentImageTab: "direct", // API Key 없을 때를 대비해 기본값을 direct로 설정
    inputKeyword: "",
    selectedKeyword: "nature",
    files: [],
  },
  music: {
    currentMusicTab: "keyword",
    selectedKeyword: "piano",
    file: null,
  },
  template: {
    template_option: "template1",
    highlightText: ""
  },
  upload: {
    currentUploadTab: "reserve",
    title: "",
    tags: "",
    description: "",
  },
  settings: {
    googleTtsFile: null,
    unsplashApiKey: "",
  },
};

export default function Home() {

  const router = useRouter(); // Next.js의 useRouter를 사용해서 페이지 전환
  const [currentTab, setCurrentTab] = useState("settings");
  const [formData, setFormData] = useState<FullFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);

  // 컴포넌트 마운트 시 백엔드에서 설정 상태 확인
  useEffect(() => {
    const loadSettingsStatus = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/settings/status`);
        const { googleTts, unsplashApiKey } = response.data;
        
        // Image 탭 초기화 (API Key가 있으면 keyword, 없으면 direct)
        setFormData(prev => ({
          ...prev,
          image: {
            ...prev.image,
            currentImageTab: unsplashApiKey.configured ? "keyword" : "direct"
          }
        }));
        
      } catch (error) {
        console.error('설정 상태 확인 실패:', error);
        // 오류 시 기본값으로 direct 사용
        setFormData(prev => ({
          ...prev,
          image: {
            ...prev.image,
            currentImageTab: "direct"
          }
        }));
      }
    };

    loadSettingsStatus();
  }, []);

  const renderTabContent = () => {
    switch (currentTab) {
      case "script":
        return (
          <ScriptForm
            data={{ script: formData.script }}
            setData={(val) => setFormData((prev) => ({
              ...prev,
              script: val.script,
            }))}
          />
        );
      case "voice":
        return (
          <VoiceForm 
            data={formData.voice} 
            setData={(val) => 
              setFormData((prev) => ({
                ...prev,
                voice: val,
            }))
          }
         />
        );
      case "image":
        return (
          <ImageForm 
            data={formData.image} 
            setData={(val) =>
              setFormData((prev) => ({
                ...prev,
                image: val,
              }))
             }
          />
        );
      case "music":
        return (
          <MusicForm 
            data={formData.music} 
            setData={(val) =>
              setFormData((prev) => ({
                ...prev,
                music: val,
              }))
            } 
          />
        )
      case "template":
        return (
          <TemplateForm 
            data={formData.template}
            setData={(val) =>
              setFormData((prev) => ({
                ...prev,
                template: val,
              }))
             }
          />
        );
      case "upload":
        return (
          <UploadForm 
            data={formData.upload} 
            setData={(val) =>
              setFormData((prev) => ({
                ...prev,
                upload: val,
              }))
            }
          />
        );
      case "settings":
        return (
          <SettingsForm 
            data={formData.settings} 
            setData={(val) =>
              setFormData((prev) => ({
                ...prev,
                settings: val,
              }))
            }
          />
        );
      default:
        return null;
    }
  };

  const handleSubmit = async () => {
  try {
    setIsLoading(true);
    console.log("submit formData:", formData);

    const formSubmitData = new FormData();
    formSubmitData.append("script", formData.script);
    formSubmitData.append("voice.currentVoiceTab", formData.voice.currentVoiceTab);
    formSubmitData.append("voice.selectedVoice", formData.voice.selectedVoice);
    formSubmitData.append("image.currentImageTab", formData.image.currentImageTab);
    formSubmitData.append("image.inputKeyword", formData.image.inputKeyword);
    formSubmitData.append("image.selectedKeyword", formData.image.selectedKeyword);
    // files는 따로 append (for each file)
    formData.image.files
    .filter((file): file is File => file !== null)
    .forEach(file => formSubmitData.append("files", file));
    // 나머지 필드도 같은 식으로
    formSubmitData.append("music.currentMusicTab", formData.music.currentMusicTab);
    formSubmitData.append("music.selectedKeyword", formData.music.selectedKeyword);
    
    // Music file 추가
    if (formData.music.file) {
      formSubmitData.append("musicFile", formData.music.file);
    }
    formSubmitData.append("template.template_option", formData.template.template_option);
    formSubmitData.append("template.highlightText", formData.template.highlightText);
    formSubmitData.append("upload.currentUploadTab", formData.upload.currentUploadTab);
    formSubmitData.append("upload.title", formData.upload.title);
    formSubmitData.append("upload.tags", formData.upload.tags);
    formSubmitData.append("upload.description", formData.upload.description);
    
    // Settings data
    if (formData.settings.googleTtsFile) {
      formSubmitData.append("googleTtsFile", formData.settings.googleTtsFile);
    }
    formSubmitData.append("settings.unsplashApiKey", formData.settings.unsplashApiKey);

    console.log("payload : ", JSON.stringify(formData));
    
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/submit`,
      formSubmitData,
      {
        // FormData 사용 시 Content-Type 헤더 제거 (브라우저가 자동 설정)
        withCredentials: false,
      }
    );

    console.log(res.status)
    if (res.status == 200) {
      alert(res.data.message);
    }
    
  } catch (err) {
    const axiosError = err as AxiosError;
    
    console.error("Error:", axiosError);

    const detail = (axiosError.response?.data as { detail?: string })?.detail;
    alert(detail || "서버 오류가 발생했습니다.");
  } finally {
    setIsLoading(false);
  }
};

const handleReset = () => {
  setFormData(initialFormData);
};

  return (
  <Layout>
    {/* 로딩 오버레이 */}
    {isLoading && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">처리 중입니다...</p>
          <p className="text-sm text-gray-500 mt-2">잠시만 기다려 주세요</p>
        </div>
      </div>
    )}
    
    <div className="popup flex items-start gap-4 p-4">
      <div className="tabs">
        <input type="radio" id="tab1" name="tab" checked={currentTab === "script"} onChange={() => setCurrentTab("script")} />
        <label htmlFor="tab1">📜 Script</label>

        <input type="radio" id="tab2" name="tab" checked={currentTab === "voice"} onChange={() => setCurrentTab("voice")} />
        <label htmlFor="tab2">🎙️ Voice</label>

        <input type="radio" id="tab3" name="tab" checked={currentTab === "image"} onChange={() => setCurrentTab("image")} />
        <label htmlFor="tab3">🖼️ Image</label>

        <input type="radio" id="tab4" name="tab" checked={currentTab === "music"} onChange={() => setCurrentTab("music")} />
        <label htmlFor="tab4">🎵 Music</label>

        <input type="radio" id="tab5" name="tab" checked={currentTab === "template"} onChange={() => setCurrentTab("template")} />
        <label htmlFor="tab5">Template</label>

        <input type="radio" id="tab6" name="tab" checked={currentTab === "settings"} onChange={() => setCurrentTab("settings")} />
        <label htmlFor="tab6">⚙️ Settings</label>

        {/* Upload 탭 숨김 - 로직은 유지 */}
        {/* <input type="radio" id="tab8" name="tab" checked={currentTab === "upload"} onChange={() => setCurrentTab("upload")} />
        <label htmlFor="tab8">📤 Upload</label> */}

        <div className="marker">
          <div id="top"></div>
          <div id="bottom"></div>
        </div>
      </div>
      <div className="tab-content flex-1 h-full p-4 overflow-y-auto" style={{ marginLeft: 20, marginRight: 20 }}>
          {renderTabContent()}
      </div>
    </div>
    
  <div className="w-[80%] mt-4">
    <div className="flex justify-end">
      <button
        className="bg-gray-200 text-gray-800 px-6 py-3 rounded-xl shadow hover:bg-gray-300 transition"
        onClick={handleReset}
      >
        Reset
      </button>      
      <button
        className={`px-6 py-3 rounded-xl shadow transition ml-4 ${
          isLoading 
            ? "bg-gray-400 text-gray-700 cursor-not-allowed" 
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
        onClick={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? "처리 중..." : "Submit"}
      </button>
    </div>
    <div className="text-center mt-3 text-xs text-gray-400">
      Miracle Copy • Aug 2025
    </div>
  </div>
  
  </Layout>
  );
}