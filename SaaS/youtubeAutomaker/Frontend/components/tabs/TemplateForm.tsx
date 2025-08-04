import { useState, useEffect } from "react";
import { FullFormData, TemplateFromProps } from "../../types/common";

const ImageRadioGroup = ({ data, setData } : TemplateFromProps) => {
  const template_option = data.template_option
  const highlightText = data.highlightText

  console.log("template_option:", data.template_option);
  
  const options = [
    { id: "template1", src: "/assets/images/template1.png", alt: "Template1" },
    { id: "template2", src: "/assets/images/template2.png", alt: "Template2" },
  ];

  const handleTemplateSelect = (template_option: FullFormData["template"]["template_option"]) => {
    setData({
      ...data,
      template_option: template_option,
    })
  };

  return (
    <div className="flex gap-4">
      {options.map((opt) => (
        <div key={opt.id} className="relative">
          <input
            type="radio"
            id={opt.id}
            name="imageOption"
            value={opt.id}
            checked={template_option === opt.id}
            onChange={() => handleTemplateSelect(opt.id)}
            className="hidden"
          />
          <label htmlFor={opt.id} className="cursor-pointer">
            <img
              src={opt.src}
              alt={opt.alt}
              className={`w-60 h-80 rounded-lg border-2 transition-all
                ${template_option === opt.id ? "border-purple-600 scale-105" : "border-transparent"}`}
            />
            <span className="absolute bottom-1 left-1 bg-white bg-opacity-80 text-sm px-1 rounded">
              {opt.alt}
            </span>
          </label>
        </div>
      ))}

    {/* 선택된 옵션이 template2 일때만 input 박스를 옵션 목록 바깥에 보여주기 */}
      {template_option === "template2" && (
        <div className="mt-4 w-60">
          <span className="bg-opacity-80 text-base px-1 rounded mb-2 block">
            <strong>highlight text</strong>
          </span>
          <input
            type="text"
            placeholder="[월요병]이란 말, 언제부터 생긴 걸까?"
            maxLength={20}
            value={highlightText}
            onChange={(e) => setData({ ...data, highlightText: e.target.value })}
            className="w-96 border rounded px-2 py-1 text-sm"
          />
          <p className="mt-1 text-xs text-gray-500 mt-4">
            Maximum input length is 20 characters (including spaces and special characters).  
            To highlight a specific word with a different color, enclose it in square brackets [ ].
          </p>          
        </div>
      )}
    </div>
  );
};

export default ImageRadioGroup;