from datetime import datetime, timedelta
import logging
import os
import random
import re
import requests
import shutil

from dotenv import load_dotenv

from src.database import schemas

logging.basicConfig(level=logging.INFO)
load_dotenv()

JAMENDO_API_KEY = os.getenv("JAMENDO_API_KEY")
DATA_DIR = os.getenv("DATA_DIR")
MUSIC_DIR = os.getenv("MUSIC_DIR")
TODAY_DIR = f"{datetime.today().strftime('%Y%m%d')}"
#TODAY_DIR = (datetime.today() + timedelta(days=3)).strftime('%Y%m%d')

music_save_file_full_path = os.path.join(DATA_DIR, MUSIC_DIR, TODAY_DIR)
os.makedirs(music_save_file_full_path, exist_ok=True)

ASSETS_MUSIC_DIR = os.getenv("ASSETS_MUSIC_DIR")

track_map = {
    "guitar": "guitar_Acoustica_Titania.mp3",
    "relaxing": "relaxing_Arcs.mp3",
    "house": "house_docteur_live__GUIZMOLIVESET.mp3",
    "ambient": "ambient_Ambient_Chill_Music_1.mp3",
    "peaceful": "peaceful_Elegant_Neutral_Music.mp3",
    "piano": "piano_P_Tchaikovsky__Serenade_for_Strings_Op_48_transcription_for_piano__Segundo_G_Yogore.mp3",
    "acoustic": "acoustic_Guitar_Beautiful_Sad.mp3",
    "instrumental": "instrumental_Etude_in_C_Minor.mp3",
    "passionate": "passionate_quotIn_angerquot.mp3",
    "zen": "zen_Garnet.mp3",
    "dream": "dream_02_Like_a_waking_dream.mp3",
    "meditative": "meditative_Infinite_Cosmos_Meditative_Relaxing.mp3",
    "hypnotic": "hypnotic_River.mp3",
    "nature": "nature_Early_Morning_Serenity_Nature_Ambience.mp3"
}

def musicExecute(music: schemas.MusicData):
    music_save_file = None  # 기본값 설정

    if music.currentMusicTab == 'keyword':
        if music.selectedKeyword in track_map:
            src = track_map[music.selectedKeyword]
            src_path = os.path.join(ASSETS_MUSIC_DIR, src)
            music_save_file = os.path.join(music_save_file_full_path, clean_filename(music.selectedKeyword) + ".mp3")

            try:
                shutil.copyfile(src_path, music_save_file)
                logging.info(f"배경 음악 복사 완료: {music_save_file}")
            except Exception as e:
                error_msg = f"배경 음악 복사 실패: {e}"
                logging.error(error_msg)
                raise Exception(error_msg)
        else:
            error_msg = f"유효하지 않은 track id: {music.selectedKeyword}"
            logging.error(error_msg)
            raise Exception(error_msg)

    elif music.currentMusicTab == 'auto':
        # 조용하고 평화로운 음악을 위한 태그 목록
        tag_keywords = [
            "calm", "relaxing", "soft", "ambient", "peaceful", "piano", "acoustic",
            "instrumental", "slow", "zen", "dream", "meditative", "soothing", "nature"
        ]

        selected_tag = random.choice(tag_keywords)
        logging.info(f"🎵 선택된 태그: {selected_tag}")

        try:
            # Jamendo의 API로 클래식 장르의 음악을 가져오는 예시
            url = "https://api.jamendo.com/v3.0/tracks"
            params = {
                'client_id': JAMENDO_API_KEY,
                "tags": selected_tag,
                'limit': 1,
                'format': 'json',
                'audioformat': 'mp31',  # 고음질 MP3 스트림
                "include": "musicinfo"
            }
            response = requests.get(url, params=params)
            data = response.json()

            # 다운로드
            music_save_file = ''
            for i, track in enumerate(data['results']):
                name = track['name']
                artist = track['artist_name']
                audio_url = track['audiodownload']
                genre = track.get('musicinfo', {}).get('tags', [])
                logging.info(f"🎵 {i+1}. '{name}' by {artist}")
                logging.info(f"   🎧 Audio: {audio_url}")
                logging.info(f"   🏷️ Tags: {', '.join(genre)}\n")
                    
                if audio_url:
                    music_save_file = os.path.join(music_save_file_full_path, clean_filename(track['name']) + '.mp3')
                    audio_response = requests.get(audio_url)
                    with open(music_save_file, 'wb') as f:
                        f.write(audio_response.content)
                    logging.info(f"배경 음악 저장 완료: {music_save_file}")
                else:
                    error_msg = "배경 음악을 찾을 수 없습니다."
                    logging.error(error_msg)
                    raise Exception(error_msg)
        except Exception as e:
            logging.error(f"배경 음악 생성 에러 발생: {e}")
            raise

    elif music.currentMusicTab == 'direct':
        # 직접 업로드된 파일 처리
        if music.file and os.path.exists(music.file):
            try:
                # 업로드된 파일을 data/music/오늘날짜 폴더로 복사
                filename = os.path.basename(music.file)
                music_save_file = os.path.join(music_save_file_full_path, filename)
                
                shutil.copyfile(music.file, music_save_file)
                logging.info(f"직접 업로드 음악 파일 복사 완료: {music.file} -> {music_save_file}")
                    
            except Exception as e:
                error_msg = f"직접 업로드 음악 처리 실패: {e}"
                logging.error(error_msg)
                raise Exception(error_msg)
        else:
            error_msg = f"직접 업로드 모드이지만 음악 파일이 없거나 존재하지 않습니다. file: {music.file}"
            logging.error(error_msg)
            raise Exception(error_msg)
    
    else:
        error_msg = f"유효하지 않은 음악 탭: {music.currentMusicTab}"
        logging.error(error_msg)
        raise Exception(error_msg)

    return music_save_file

def clean_filename(name: str) -> str:
    """
    공백은 '_'로 바꾸고, 특수문자는 제거한 문자열을 반환한다.
    영어, 숫자, 한글만 허용.
    """
    name = name.strip().replace(' ', '_')                   # 공백을 언더바로
    name = re.sub(r'[^가-힣a-zA-Z0-9_]', '', name)          # 한글, 영어, 숫자, _ 외 제거
    return name