import logging
import os
import re

from fastapi import HTTPException

from dotenv import load_dotenv
from datetime import datetime

from src.database import schemas
from src.utils.file import save_script


logging.basicConfig(level=logging.INFO)
load_dotenv()

# 자막 관련
DATA_DIR = os.getenv("DATA_DIR")
SCRIPT_DIR = os.getenv("SCRIPT_DIR")
TODAY_DIR = f"{datetime.today().strftime('%Y%m%d')}"

script_save_file_full_path = os.path.join(DATA_DIR, SCRIPT_DIR, TODAY_DIR)
os.makedirs(script_save_file_full_path, exist_ok=True)

def save_subtitles(script_str):
    
    try:
        save_file_name = "original.srt"
        file_path = save_script(script_save_file_full_path, script_str, save_file_name)
        logging.info(f"✅ 스크립트가 작성되었습니다. : {script_save_file_full_path}/{save_file_name}")
        
        # 파일 크기 체크
        if os.path.getsize(file_path) == 0:
            raise Exception("SRT 파일이 생성되었지만, 내용이 없습니다. (파일 크기 0)")

    except Exception as e:
        error_msg = "스크립트 생성 중에 에러가 발생하였습니다."
        logging.error(f"{error_msg} : {e}")
        raise Exception(error_msg)

def scriptExecute(script_str: str):

    try:
        save_subtitles(script_str)

    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        logging.error(f"스크립트 작성 에러 발생: {e}")
        raise



