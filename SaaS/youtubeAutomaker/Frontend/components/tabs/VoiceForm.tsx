import React, { useState, useEffect } from "react";
import { FullFormData, VoiceFormProps } from "../../types/common";

function VoiceComponent({ data, setData } : VoiceFormProps) {
  const currentVoiceTab = data.currentVoiceTab;
  const selectedVoice = data.selectedVoice;

  const handleTabChange = (tab: FullFormData["voice"]["currentVoiceTab"]) => {
    setData({
      ...data,
      currentVoiceTab: tab,
    })
  };

  const handleVoiceSelect = (voice: FullFormData["voice"]["selectedVoice"]) => {
    setData({
      ...data,
      selectedVoice: voice,
    })
  };

  return (
    <div className="w-full mx-auto h-full">
      <div className="px-4 pt-4 pr-0 h-full">
        <div className="h-full overflow-y-auto pr-2">
          <div className="space-y-3">
            {[
              { id: "sexual-w", emoji: "👩‍🦰", label: "KO: Female-Laomedeia", src: "Female-Laomedeia_ko.wav", category: "Korean" },
              { id: "ko-KR-Chirp3-HD-Achernar", emoji: "👩‍🦰", label: "KO: Female-Achernar", src: "Female-Achernar-ko.wav", category: "Korean HD" },
              { id: "ko-KR-Chirp3-HD-Zephyr", emoji: "👩‍🦰", label: "KO: Female-Zephyr", src: "Female-Zephyr-ko.wav", category: "Korean HD" },
              { id: "sexual-m", emoji: "👨‍🦱", label: "KO: Male-Algieba", src: "Male-Algieba_ko.wav", category: "Korean" },
              { id: "ko-KR-Chirp3-HD-Umbriel", emoji: "👨‍🦱", label: "KO: Male-Umbriel", src: "Male-Umbriel-ko.wav", category: "Korean HD" },
              { id: "ko-KR-Chirp3-HD-Rasalgethi", emoji: "👨‍🦱", label: "KO: Male-Rasalgethi", src: "Male-Rasalgethi-ko.wav", category: "Korean HD" },
              { id: "sexual-w-en", emoji: "👩‍🦰", label: "EN: Female", src: "sample-woman1-eng.wav", category: "English" }
            ].map(({ id, emoji, label, src }, index) => (
              <div className="flex items-center space-x-3 p-2 border border-gray-200 rounded-lg" key={id}>
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <input
                    type="radio"
                    id={id}
                    name="selectedVoice"
                    className="hidden peer"
                    checked={selectedVoice === id}
                    onChange={() => handleVoiceSelect(id as FullFormData["voice"]["selectedVoice"])}
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
                      <source src={`/assets/voices/${src}`} type="audio/wav" />
                      Your browser does not support the audio element.
                    </audio>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VoiceComponent;
