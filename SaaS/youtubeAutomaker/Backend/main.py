import os
import logging
from typing import List

# Windows 인코딩 설정
import sys
import codecs
os.environ["PYTHONIOENCODING"] = "utf-8"
sys.stdout = codecs.getwriter("utf-8")(sys.stdout.detach())
sys.stderr = codecs.getwriter("utf-8")(sys.stderr.detach())

from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
# import src.app as makeall

from src.database import schemas
from src.utils.config_manager import config_manager
from src.utils.system_tools import system_tools
from src.utils.auto_installer import auto_installer
import src.app as makeall


logging.basicConfig(
    level=logging.WARNING,  # INFO 대신 WARNING 사용
    format='%(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
# uvicorn 로거 설정
uvicorn_logger = logging.getLogger("uvicorn")
uvicorn_logger.setLevel(logging.WARNING)

app = FastAPI(title="YouTube Automaker API", version="1.0.0")

# 서버 시작 시 저장된 설정 로드
def load_saved_settings():
    """서버 시작 시 저장된 설정을 환경변수에 로드"""
    try:
        # Google TTS 설정 확인
        google_credentials = config_manager.get_google_config("credentials_file")
        if google_credentials and os.path.exists(google_credentials):
            os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = google_credentials
            print(f"✅ 저장된 Google TTS 설정 로드: {google_credentials}")
        else:
            print("⚠️ Google TTS 설정 파일이 없습니다.")
        
        # Unsplash API Key 설정 확인  
        unsplash_key = config_manager.get_api_key("unsplash")
        if unsplash_key:
            os.environ["UNSPLASH_API_KEY"] = unsplash_key
            print(f"✅ 저장된 Unsplash API Key 로드 완료")
        else:
            print("⚠️ Unsplash API Key가 설정되지 않았습니다.")
        
    except Exception as e:
        print(f"❌ 설정 로드 실패: {e}")

# 앱 시작 시 설정 로드
load_saved_settings()

# 누락된 시스템 도구들 자동 설치
print("🔧 시스템 도구 확인 및 자동 설치 중...")
try:
    install_results = auto_installer.check_and_install_missing_tools()
    
    # 설치 후 다시 도구 설정
    print("🔧 시스템 도구 설정 적용 중...")
    system_tools.setup_bundled_tools()
    
except Exception as e:
    print(f"⚠️ 자동 설치 중 오류 발생: {e}")
    print("🔧 기존 시스템 도구로 설정 진행...")
    system_tools.setup_bundled_tools()

# CORS 설정
origins = [
    "http://localhost:3000",                # 개발용
    "http://127.0.0.1:3000",               # 로컬 IP
    "https://your-domain.com",              # 도메인 연결 시
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 모든 origin 허용
    allow_credentials=False,  # credentials 비활성화
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.get("/", response_class=HTMLResponse)
def root():
    return """
    <html>
        <head>
            <title>YouTube Automaker API</title>
        </head>
        <body>
            <h1>Welcome to YouTube Automaker API</h1>
            <p><a href="/docs">Go to Swagger Docs</a></p>
        </body>
    </html>
    """


@app.middleware("http")
async def log_requests(request, call_next):
    print(f"🔄 요청 받음: {request.method} {request.url}")
    response = await call_next(request)
    print(f"✅ 응답 완료: {response.status_code}")
    return response

@app.post("/submit")
async def receive_form(
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
                upload_description: str = Form(..., alias="upload.description"),

                # Settings
                googleTtsFile: UploadFile = File(None),
                settings_unsplashApiKey: str = Form("", alias="settings.unsplashApiKey"),
                
                # Music file
                musicFile: UploadFile = File(None)):
    try:
        # Google TTS 설정 파일 검증
        tts_config_path = "./config/tts_service.json"
        if not os.path.exists(tts_config_path):
            raise HTTPException(status_code=400, detail="Google TTS 설정 파일을 올려주세요")
        
        schemas.FullFormData
        voice = {
        "currentVoiceTab": voice_currentVoiceTab,
        "selectedVoice": voice_selectedVoice,
        }
        image = {
            "currentImageTab": image_currentImageTab,
            "inputKeyword": image_inputKeyword,
            "selectedKeyword": image_selectedKeyword,
            "files": files,
        }
        # Music 파일 처리 (필요한 경우)
        music_file_path = None
        if musicFile and musicFile.filename:
            try:
                music_dir = "./music"
                os.makedirs(music_dir, exist_ok=True)
                
                music_file_path = os.path.join(music_dir, musicFile.filename)
                with open(music_file_path, "wb") as f:
                    content = await musicFile.read()
                    f.write(content)
                
                print(f"✅ 음악 파일 저장: {music_file_path}")
                
            except Exception as e:
                print(f"❌ 음악 파일 저장 실패: {e}")
        
        music = {
            "currentMusicTab": music_currentMusicTab,
            "selectedKeyword": music_selectedKeyword,
            "file": music_file_path,  # 저장된 파일 경로 전달
        }
        template = {
            "template_option": template_option,
            "highlightText": template_highlightText
        }
        upload = {
            "currentUploadTab": upload_currentUploadTab,
            "title": upload_title,
            "tags": upload_tags,
            "description": upload_description,
        }
        
        # Settings 처리
        settings = {
            "unsplashApiKey": settings_unsplashApiKey,
        }
        
        # Google TTS 파일 처리
        if googleTtsFile and googleTtsFile.filename:
            try:
                config_dir = "./config"
                os.makedirs(config_dir, exist_ok=True)
                
                file_path = os.path.join(config_dir, "tts_service.json")
                with open(file_path, "wb") as f:
                    content = await googleTtsFile.read()
                    f.write(content)
                
                # 환경변수 설정
                os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = file_path
                print(f"✅ Google TTS 설정 파일 저장: {file_path}")
                
            except Exception as e:
                print(f"❌ Google TTS 파일 저장 실패: {e}")
        
        # Unsplash API Key 파일 저장 및 환경변수 설정
        if settings_unsplashApiKey:
            try:
                config_dir = "./config"
                os.makedirs(config_dir, exist_ok=True)
                
                api_key_path = os.path.join(config_dir, "unsplash_api_key.txt")
                with open(api_key_path, "w", encoding="utf-8") as f:
                    f.write(settings_unsplashApiKey)
                
                os.environ["UNSPLASH_API_KEY"] = settings_unsplashApiKey
                print(f"✅ Unsplash API Key 파일 저장 및 설정 완료: {api_key_path}")
                
            except Exception as e:
                print(f"❌ Unsplash API Key 저장 실패: {e}")
        
        full_form_data = schemas.FullFormData(
            script=script,
            voice=voice,
            image=image,
            music=music,
            template=template,
            upload=upload,
        )

        #print(f"$$$ full_form_data $$$ : {full_form_data}")
        result = makeall.execute(full_form_data)
        return result
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"알 수 없는 서버 오류: {str(e)}")


@app.get("/settings/status")
def get_settings_status():
    """현재 설정 상태를 반환"""
    tts_config_path = "./config/tts_service.json"
    api_key_path = "./config/unsplash_api_key.txt"
    
    # API Key 값 읽기
    api_key_value = ""
    if os.path.exists(api_key_path):
        try:
            with open(api_key_path, "r", encoding="utf-8") as f:
                api_key_value = f.read().strip()
        except Exception as e:
            print(f"API Key 읽기 실패: {e}")
    
    return {
        "googleTts": {
            "configured": os.path.exists(tts_config_path),
            "filename": "tts_service.json" if os.path.exists(tts_config_path) else None
        },
        "unsplashApiKey": {
            "configured": os.path.exists(api_key_path),
            "value": api_key_value if api_key_value else None
        }
    }

@app.post("/settings/save")
async def save_settings(
    googleTtsFile: UploadFile = File(None),
    unsplashApiKey: str = Form("")
):
    """설정을 직접 저장하는 엔드포인트"""
    try:
        config_dir = "./config"
        os.makedirs(config_dir, exist_ok=True)
        
        saved_items = []
        
        # Google TTS 파일 처리
        if googleTtsFile and googleTtsFile.filename:
            try:
                file_path = os.path.join(config_dir, "tts_service.json")
                with open(file_path, "wb") as f:
                    content = await googleTtsFile.read()
                    f.write(content)
                
                # 환경변수 설정
                os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = file_path
                saved_items.append("Google TTS 설정")
                print(f"✅ Google TTS 설정 파일 저장: {file_path}")
                
            except Exception as e:
                print(f"❌ Google TTS 파일 저장 실패: {e}")
                raise HTTPException(status_code=500, detail=f"Google TTS 파일 저장 실패: {str(e)}")
        
        # Unsplash API Key 처리
        if unsplashApiKey:
            try:
                api_key_path = os.path.join(config_dir, "unsplash_api_key.txt")
                with open(api_key_path, "w", encoding="utf-8") as f:
                    f.write(unsplashApiKey)
                
                os.environ["UNSPLASH_API_KEY"] = unsplashApiKey
                saved_items.append("Unsplash API Key")
                print(f"✅ Unsplash API Key 파일 저장: {api_key_path}")
                
            except Exception as e:
                print(f"❌ Unsplash API Key 저장 실패: {e}")
                raise HTTPException(status_code=500, detail=f"Unsplash API Key 저장 실패: {str(e)}")
        
        if not saved_items:
            raise HTTPException(status_code=400, detail="저장할 설정이 없습니다.")
        
        return {
            "success": True,
            "message": f"설정이 성공적으로 저장되었습니다: {', '.join(saved_items)}",
            "saved_items": saved_items
        }
        
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        print(f"❌ 설정 저장 중 오류: {e}")
        raise HTTPException(status_code=500, detail=f"설정 저장 실패: {str(e)}")

# 새로운 설정 관리 API들
@app.get("/api/config/status")
def get_config_status():
    """설정 상태 확인"""
    try:
        status = config_manager.get_setup_status()
        return {"success": True, "data": status}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"설정 상태 확인 실패: {str(e)}")

@app.post("/api/config/api-keys")
def save_api_keys(request: dict):
    """API 키들 저장"""
    try:
        saved_keys = []
        api_keys = request.get("api_keys", {})
        
        for service, key in api_keys.items():
            if key and key.strip():
                config_manager.set_api_key(service, key.strip())
                saved_keys.append(service)
                # 즉시 환경변수에도 설정
                os.environ[f"{service.upper()}_API_KEY"] = key.strip()
        
        return {
            "success": True,
            "message": f"API 키 저장 완료: {', '.join(saved_keys)}",
            "saved_keys": saved_keys
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"API 키 저장 실패: {str(e)}")

@app.post("/api/config/paths")
def save_system_paths(request: dict):
    """시스템 경로들 저장"""
    try:
        saved_paths = []
        paths = request.get("paths", {})
        
        for tool, path in paths.items():
            if path and path.strip():
                config_manager.set_path(tool, path.strip())
                saved_paths.append(tool)
                
                # 특별 처리가 필요한 경로들
                if tool == "ffmpeg":
                    from pydub import AudioSegment
                    AudioSegment.converter = path.strip()
                elif tool == "imagemagick":
                    os.environ["IMAGEMAGICK_BINARY"] = path.strip()
        
        return {
            "success": True,
            "message": f"경로 설정 완료: {', '.join(saved_paths)}",
            "saved_paths": saved_paths
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"경로 설정 실패: {str(e)}")

@app.get("/api/config/current")
def get_current_config():
    """현재 설정 조회"""
    try:
        return {
            "success": True,
            "data": {
                "api_keys": {service: bool(config_manager.get_api_key(service)) for service in ["unsplash"]},
                "paths": {tool: config_manager.get_path(tool) for tool in ["ffmpeg", "imagemagick", "korean_font"]},
                "directories": config_manager._settings.get("directories", {}),
                "ready": config_manager.is_ready()
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"설정 조회 실패: {str(e)}")

@app.get("/api/system/tools")
def get_system_tools_status():
    """시스템 도구 상태 조회"""
    try:
        tools_status = system_tools.get_tools_status()
        return {
            "success": True,
            "data": tools_status
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"시스템 도구 상태 조회 실패: {str(e)}")

@app.post("/api/system/install")
def install_missing_tools():
    """누락된 시스템 도구들 설치"""
    try:
        print("🚀 사용자 요청으로 도구 설치 시작")
        install_results = auto_installer.check_and_install_missing_tools()
        
        # 설치 후 시스템 도구 재설정
        system_tools.setup_bundled_tools()
        
        # 최신 상태 조회
        tools_status = system_tools.get_tools_status()
        
        return {
            "success": True,
            "message": "도구 설치 완료",
            "install_results": install_results,
            "tools_status": tools_status
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"도구 설치 실패: {str(e)}")

@app.get("/download")
def download_video(filename: str):
    file_path = f"./videos/{filename}"
    if os.path.exists(file_path):
        return FileResponse(path=file_path, filename=filename, media_type="video/mp4")
    else:
        return {"error": "파일을 찾을 수 없습니다."}

if __name__ == "__main__":
    import uvicorn
    print("Starting server on http://localhost:8000")
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=False)