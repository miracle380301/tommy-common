import logging
import os
import shutil

from dotenv import load_dotenv
from datetime import datetime

from fastapi import HTTPException

from src.utils.script import scriptExecute
from src.utils.image import imageExecute
from src.utils.voice import voiceExecute
from src.utils.record import movieExecute
from src.utils.music import musicExecute
from src.database import schemas


logging.basicConfig(level=logging.INFO)
load_dotenv()

DATA_DIR = os.getenv("DATA_DIR")
SCRIPT_DIR = os.getenv("SCRIPT_DIR")
VOICE_DIR = os.getenv("VOICE_DIR")
IMG_DIR = os.getenv("IMG_DIR")
MUSIC_DIR = os.getenv("MUSIC_DIR")
VIDEO_DIR = os.getenv("VIDEO_DIR")

TODAY_DIR = f"{datetime.today().strftime('%Y%m%d')}"

video_save_file_full_path = os.path.join(DATA_DIR, VIDEO_DIR, TODAY_DIR)
os.makedirs(video_save_file_full_path, exist_ok=True)


def delete_today_folder():
    
    delete_folder_paths = [
        os.path.join(DATA_DIR, SCRIPT_DIR, TODAY_DIR),
        os.path.join(DATA_DIR, VOICE_DIR, TODAY_DIR),
        os.path.join(DATA_DIR, IMG_DIR, TODAY_DIR),
        os.path.join(DATA_DIR, MUSIC_DIR, TODAY_DIR),
        os.path.join(DATA_DIR, VIDEO_DIR, TODAY_DIR),
    ]
    
    # 폴더가 존재하면 삭제
    for folder in delete_folder_paths:
        if os.path.exists(folder) and os.path.isdir(folder):
            try:
                shutil.rmtree(folder)
                logging.info(f"🗑️{folder} 폴더가 성공적으로 삭제되었습니다.")
            except Exception as e:
                logging.error(f"폴더 삭제 중 오류가 발생했습니다: {e}")
   
def create_today_folder():
    
    try:
        script_path = os.path.join(DATA_DIR, SCRIPT_DIR, TODAY_DIR)
        voice_path = os.path.join(DATA_DIR, VOICE_DIR, TODAY_DIR)
        img_path = os.path.join(DATA_DIR, IMG_DIR, TODAY_DIR)
        music_path = os.path.join(DATA_DIR, MUSIC_DIR, TODAY_DIR)
        video_path = os.path.join(DATA_DIR, VIDEO_DIR, TODAY_DIR)
        
        os.makedirs(script_path, exist_ok=True)
        os.makedirs(voice_path, exist_ok=True)
        os.makedirs(img_path, exist_ok=True)
        os.makedirs(music_path, exist_ok=True)
        os.makedirs(video_path, exist_ok=True)

    except Exception as e:
        logging.error(f"폴더 생성 중 오류가 발생했습니다: {e}")


def execute(data: schemas.FullFormData):
    try:

        delete_today_folder()  # 실행 전에 오늘 날짜로 만들어진 폴더를 삭제
        create_today_folder()  # 오늘 날짜 폴더 생성

        # # openAIexecute()
        try:
            print("1. script 처리 시작: ", data.script)
            scriptExecute(data.script)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"[스크립트 처리 실패]: {str(e)}")
        
        try:
            print("2. voice 처리 시작", data.voice)
            voiceExecute(data.voice)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"[보이스 처리 실패]: {str(e)}")
        
        try: 
            print("3. image 처리 시작", data.image)
            imageExecute(data.image)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"[배경 이미지 처리 실패]: {str(e)}")
            
        try:
            print("4. music 처리 시작", data.music)
            musicExecute(data.music)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"[배경 음악 처리 실패]: {str(e)}")

        try:
            print("5. movie 생성처리 시작", data.template)
            movieExecute(data.template)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"[비디오 생성 처리 실패]: {str(e)}")

        return {"message": "동영상 생성이 완료되었습니다."}

    except Exception as e:
        print(f"에러 발생! 프로그램 중단: {e}")        
        raise e