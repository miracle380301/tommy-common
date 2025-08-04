from pydantic import BaseModel
from typing import Optional, List

class VoiceData(BaseModel):
    currentVoiceTab: str
    selectedVoice: str

class ImageData(BaseModel):
    currentImageTab: str
    inputKeyword: Optional[str] = ""
    selectedKeyword: Optional[str] = ""
    files: Optional[List] = []

class MusicData(BaseModel):
    currentMusicTab: str
    selectedKeyword: Optional[str] = ""
    file: Optional[str] = None  # 업로드된 파일 경로

class TemplateData(BaseModel):
    template_option: str
    highlightText: Optional[str] = ""

class UploadData(BaseModel):
    currentUploadTab: str
    title: Optional[str] = ""
    tags: Optional[str] = ""
    description: Optional[str] = ""

class FullFormData(BaseModel):
    script: str
    voice: VoiceData
    image: ImageData
    music: MusicData
    template: TemplateData
    upload: UploadData