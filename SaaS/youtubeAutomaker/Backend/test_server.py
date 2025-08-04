import os
from typing import List
from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware

# Windows 인코딩 설정
os.environ["PYTHONIOENCODING"] = "utf-8"

app = FastAPI(title="Test API", version="1.0.0")

# CORS 설정
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Test API is running"}

@app.post("/submit")
def receive_form(
    script: str = Form(...),
    voice_currentVoiceTab: str = Form(..., alias="voice.currentVoiceTab"),
    voice_selectedVoice: str = Form(..., alias="voice.selectedVoice"),
    image_currentImageTab: str = Form(..., alias="image.currentImageTab"),
    image_inputKeyword: str = Form(..., alias="image.inputKeyword"),
    image_selectedKeyword: str = Form(..., alias="image.selectedKeyword"),
    files: List[UploadFile] = File([]),
    music_currentMusicTab: str = Form(..., alias="music.currentMusicTab"),
    music_selectedKeyword: str = Form(..., alias="music.selectedKeyword"),
    template_option: str = Form(..., alias="template.template_option"),
    template_highlightText: str = Form(..., alias="template.highlightText"),
    upload_currentUploadTab: str = Form(..., alias="upload.currentUploadTab"),
    upload_title: str = Form(..., alias="upload.title"),
    upload_tags: str = Form(..., alias="upload.tags"),
    upload_description: str = Form(..., alias="upload.description")
):
    print(f"폼 데이터 수신됨! 스크립트 길이: {len(script)}, 음성: {voice_selectedVoice}")
    return {
        "message": "쇼츠 영상 제작을 시작합니다...",
        "script_length": len(script),
        "voice_tab": voice_currentVoiceTab,
        "voice_selected": voice_selectedVoice,
        "image_tab": image_currentImageTab,
        "files_count": len(files)
    }

if __name__ == "__main__":
    import uvicorn
    print("Starting test server on http://localhost:8000")
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=False)