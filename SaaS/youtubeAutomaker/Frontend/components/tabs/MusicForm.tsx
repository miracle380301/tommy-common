import { FullFormData, MusicFormProps } from "../../types/common";
import { useState } from "react";

function MusicComponent({ data, setData } : MusicFormProps) {
  const currentMusicTab = data.currentMusicTab;
  const selectedKeyword = data.selectedKeyword;
  const [dragOver, setDragOver] = useState(false);

  const tabCount = 2;
  const selectedTabIndex = ["keyword", "direct"].indexOf(currentMusicTab);
  const marginLeftPercent = (100 / tabCount) * selectedTabIndex;

  const handleTabChange = (tab: FullFormData["music"]["currentMusicTab"]) => {
    setData({
      ...data,
      currentMusicTab: tab,
    })
  };


  const handleVoiceSelect = (music: FullFormData["music"]["selectedKeyword"]) => {
    setData({
      ...data,
      selectedKeyword: music,
    })
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'audio/mp3' || file.type === 'audio/wav' || file.type === 'audio/mpeg')) {
      setData({
        ...data,
        file: file
      });
    } else {
      alert('MP3 또는 WAV 파일만 업로드 가능합니다.');
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file && (file.type === 'audio/mp3' || file.type === 'audio/wav' || file.type === 'audio/mpeg')) {
      setData({
        ...data,
        file: file
      });
    } else {
      alert('MP3 또는 WAV 파일만 업로드 가능합니다.');
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const renderMusicTabContent = () => {
    switch (currentMusicTab) {
      case "direct":
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              배경 음악으로 사용할 MP3 또는 WAV 파일을 업로드하세요.
            </p>
            
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                dragOver 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => document.getElementById('music-file-input')?.click()}
            >
              <input
                id="music-file-input"
                type="file"
                accept=".mp3,.wav"
                onChange={handleFileUpload}
                className="hidden"
              />
              {data.file ? (
                <div className="text-green-600">
                  <div className="text-2xl mb-3">🎵</div>
                  <p className="font-medium text-lg mb-2">{data.file.name}</p>
                  <p className="text-sm text-gray-500 mb-3">
                    크기: {(data.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <audio 
                    controls 
                    className="mx-auto mb-3"
                    style={{ maxWidth: '300px' }}
                  >
                    <source src={URL.createObjectURL(data.file)} />
                    브라우저가 오디오를 지원하지 않습니다.
                  </audio>
                  <p className="text-sm text-gray-500">클릭하여 다른 파일 선택</p>
                </div>
              ) : (
                <div className="text-gray-500">
                  <div className="text-4xl mb-4">🎵</div>
                  <p className="font-medium text-lg mb-2">음악 파일을 드래그하거나 클릭하여 선택</p>
                  <p className="text-sm">MP3, WAV 형식 지원</p>
                </div>
              )}
            </div>
            
            {data.file && (
              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                <strong>참고:</strong> 업로드된 음악이 배경 음악으로 사용됩니다. 저작권에 주의하세요.
              </div>
            )}
          </div>
        );
      case "keyword":
        return (
          <div className="max-h-96 overflow-y-auto pr-2">
            <div className="space-y-3">
              {[
                { id: "guitar", emoji: "🎵", label: "guitar", src: "guitar_Acoustica_Titania.mp3" },
                { id: "relaxing", emoji: "🛀", label: "relaxing", src: "relaxing_Arcs.mp3" },
                { id: "house", emoji: "☁️", label: "soft", src: "house_docteur_live__GUIZMOLIVESET.mp3" },
                { id: "ambient", emoji: "🌌", label: "ambient", src: "ambient_Ambient_Chill_Music_1.mp3" },
                { id: "peaceful", emoji: "🕊️", label: "peaceful", src: "peaceful_Elegant_Neutral_Music.mp3" },
                { id: "piano", emoji: "🎹", label: "piano", src: "piano_P_Tchaikovsky__Serenade_for_Strings_Op_48_transcription_for_piano__Segundo_G_Yogore.mp3" },
                { id: "acoustic", emoji: "🎸", label: "acoustic", src: "acoustic_Guitar_Beautiful_Sad.mp3" },
                { id: "instrumental", emoji: "🎼", label: "Inst.", src: "instrumental_Etude_in_C_Minor.mp3" },
                { id: "passionate", emoji: "🔥", label: "passion", src: "passionate_quotIn_angerquot.mp3" },
                { id: "zen", emoji: "🧘", label: "zen", src: "zen_Garnet.mp3" },
                { id: "dream", emoji: "💭", label: "dream", src: "dream_02_Like_a_waking_dream.mp3" },
                { id: "meditative", emoji: "🧘‍♂️", label: "meditate", src: "meditative_Infinite_Cosmos_Meditative_Relaxing.mp3" },
                { id: "hypnotic", emoji: "🛸", label: "hypnotic", src: "hypnotic_River.mp3" },
                { id: "nature", emoji: "🌲", label: "nature", src: "nature_Early_Morning_Serenity_Nature_Ambience.mp3" }
              ].map(({ id, emoji, label, src }, index) => (
                <div className="flex items-center space-x-3 p-2 border border-gray-200 rounded-lg" key={id}>
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <input
                      type="radio"
                      id={id}
                      name="selectedKeyword"
                      className="hidden peer"
                      checked={selectedKeyword === id}
                      onChange={() => handleVoiceSelect(id as FullFormData["music"]["selectedKeyword"])}
                    />
                    <label
                      htmlFor={id}
                      className="flex items-center justify-between cursor-pointer w-full"
                    >
                      <div className="flex items-center">
                        <span className="text-xl mr-3">{emoji}</span>
                        <span className="text-lg">{label}</span>
                      </div>
                      <audio
                        controls
                        controlsList="nodownload"
                        className="ml-4 h-6"
                        style={{ width: "180px", minWidth: "180px" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <source src={`/assets/music/${src}`} type="audio/mp3" />
                        Your browser does not support the audio element.
                      </audio>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
          id="musicTab1"
          name="musicTab"
          className="hidden peer"
          checked={currentMusicTab === "keyword"}
          onChange={() => handleTabChange("keyword")}
        />
        <label
          htmlFor="musicTab1"
          className="cursor-pointer px-4 py-2 text-center flex-1 border-b-2 border-transparent peer-checked:border-blue-500 peer-checked:text-blue-600"
        >
          키워드 설정
        </label>

        <input
          type="radio"
          id="musicTab2"
          name="musicTab"
          className="hidden peer"
          checked={currentMusicTab === "direct"}
          onChange={() => handleTabChange("direct")}
        />
        <label
          htmlFor="musicTab2"
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
            {renderMusicTabContent()}
      </div>
    </div>
  );
}

export default MusicComponent;
