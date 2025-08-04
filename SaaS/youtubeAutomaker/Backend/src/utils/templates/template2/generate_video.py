import logging
import re
import os
import numpy as np
from PIL import Image
import traceback

from moviepy.editor import ImageClip, AudioFileClip, concatenate_videoclips, CompositeVideoClip, CompositeAudioClip, ColorClip
from moviepy.config import change_settings

from dotenv import load_dotenv
from datetime import datetime

from fastapi import HTTPException

from src.utils.templates.template2.template import create_subtitle_clip_by_template2, create_top_fixed_banner
from src.database import schemas

logging.basicConfig(level=logging.INFO)
load_dotenv()

KOREAN_FONT = os.getenv("KOREAN_FONT")
change_settings({"IMAGEMAGICK_BINARY": os.getenv("IMAGEMAGICK_BINARY")})

DATA_DIR = os.getenv("DATA_DIR")
SCRIPT_DIR = os.getenv("SCRIPT_DIR")
VOICE_DIR = os.getenv("VOICE_DIR")
IMG_DIR = os.getenv("IMG_DIR")
MUSIC_DIR = os.getenv("MUSIC_DIR")
VIDEO_DIR = os.getenv("VIDEO_DIR")

TODAY_DIR = f"{datetime.today().strftime('%Y%m%d')}"
#TODAY_DIR = (datetime.today() + timedelta(days=3)).strftime('%Y%m%d')

video_save_file_full_path = os.path.join(DATA_DIR, VIDEO_DIR, TODAY_DIR)
os.makedirs(video_save_file_full_path, exist_ok=True)


def create_video_with_multiple_images(template: schemas.TemplateData):

    try:
        image_paths = get_image_paths(os.path.join(DATA_DIR, IMG_DIR, TODAY_DIR))
        audio_path = get_file_path(os.path.join(DATA_DIR, VOICE_DIR, TODAY_DIR), ".wav")
        srt_file_path = get_file_path(os.path.join(DATA_DIR, SCRIPT_DIR, TODAY_DIR), ".srt", f"{TODAY_DIR}.srt")
        music_path = get_file_path(os.path.join(DATA_DIR, MUSIC_DIR, TODAY_DIR), ".mp3")

        print(f"@1 num_images : {len(image_paths)}")
        audio_clip = AudioFileClip(audio_path)
        total_duration = audio_clip.duration
        num_images = len(image_paths)
        duration_per_image = total_duration / num_images

        print("@2 ")
        # 1. 이미지 클립들을 동일한 시간으로 생성 & 연결 (Shorts 용)
        image_clips = []
        top_banner = 144
        total_height = 1280
        canvas_size = (720, total_height)
        usable_height = 620

        for i, path in enumerate(image_paths):
            # 1. Pillow로 이미지 리사이즈
            im = Image.open(path).resize((720, usable_height))
            #im.save(f"check_resized_{i}.png")
            im_array = np.array(im)

            # 2. MoviePy ImageClip 생성
            clip = ImageClip(im_array).set_duration(duration_per_image)

            # 3. 전체 캔버스 배경(검정) 생성
            background = ColorClip(size=canvas_size, color=(0, 0, 0)).set_duration(duration_per_image)

            # 4. 이미지 위치를 top_banner(144)부터 시작하도록 배치
            final = CompositeVideoClip(
                [background, clip.set_position(("center", top_banner))],  # x=center, y=144
                size=canvas_size
            ).set_duration(duration_per_image)

            image_clips.append(final)

        # 연결
        video_clip = concatenate_videoclips(image_clips, method="compose")
        logging.info("🖼️ 1. 이미지 클립들을 동일한 시간으로 생성 후 영상에 연결 완료")

        # 2. 오디오 클립들 & 합치기
        voice_audio = AudioFileClip(audio_path)
        bg_music = AudioFileClip(music_path).volumex(0.07).set_duration(voice_audio.duration) # 🔉 10% 볼륨
        combined_audio = CompositeAudioClip([voice_audio, bg_music])

        # 3. 영상에 오디오 붙이기
        video_clip = video_clip.set_audio(combined_audio)
        video_width, video_height = video_clip.size
        logging.info("🎧 2. 오디오 클립 영상에 연결 완료")

        # 4. 자막 클립 만들기
        captions = read_srt(srt_file_path)

        # 자막 TextClip 리스트
        subtitle_clips = []
        # 1) 상단 고정 배너 만들기 (템플릿2일 때만)
        top_banner_clips = []
        top_banner_height = 0

        top_banner_clips, top_banner_height = create_top_fixed_banner(
            video_width, video_height, KOREAN_FONT, video_clip.duration, text=template.highlightText
        )
        #print("## top_banner_height = ", top_banner_height)

        # 2) 하단 자막 클립들 생성
        subtitle_clips = []
        bottom_bg_height = 0  # 나중에 중간 이미지 위치 조절용

        for start, end, text in captions:
            clips, bg_height = create_subtitle_clip_by_template2(
                start, end, text,
                video_width, video_height,
                KOREAN_FONT,
                buffer=0.3,
                video_duration=video_clip.duration
            )
            subtitle_clips.extend(clips)
            bottom_bg_height = max(bottom_bg_height, bg_height)  # 가장 큰 bg_height 기억

            #print("@@ bottom_bg_height = ", bottom_bg_height)
        # 5. 영상에 자막 넣기

        # 4) 최종 합성
        final_clips = [video_clip] + top_banner_clips + subtitle_clips
        final = CompositeVideoClip(final_clips)
        logging.info("🏷️ 3. 자막 클립 생성 후 영상에 연결 완료")

        # 6. 비디오 저장
        music_save_file = os.path.join(video_save_file_full_path, f"{TODAY_DIR}.mp4")
        final.write_videofile(music_save_file, fps=24, codec="libx264")
        logging.info(f"✅ 4. 영상 파일 저장 완료: {music_save_file}")
    except Exception as e:
        logging.error(traceback.format_exc())
        error_msg = "Video 생성 중에 에러가 발생하였습니다."
        logging.error(f"{error_msg} : {e}")
        raise Exception(error_msg)
        
def read_srt(srt_file_path):
    """
    표준 SRT 파일(항목 사이에 빈 줄 포함)을 읽어
    (시작 시간(초), 종료 시간(초), 텍스트) 튜플의 리스트를 반환합니다.
    """
    if not os.path.exists(srt_file_path):
        print(f"Error: SRT file not found at {srt_file_path}")
        return []

    try:
        with open(srt_file_path, 'r', encoding='utf-8') as f:
            srt_text = f.read()
    except Exception as e:
        print(f"Error reading SRT file {srt_file_path}: {e}")
        return []

    # 줄바꿈 통일
    srt_text = srt_text.replace('\r\n', '\n').replace('\r', '\n')
    # 빈 줄(더블 엔터)을 기준으로 자막 항목 분리
    # strip()으로 시작/끝 공백 제거 후 분리, filter로 빈 문자열 제거
    entries = list(filter(None, srt_text.strip().split('\n\n')))

    print(f"SRT 파일을 {len(entries)}개의 항목으로 분리했습니다.")

    captions = []
    entry_count_for_debug = 0

    for entry in entries:
        entry_count_for_debug += 1
        lines = entry.strip().split('\n')

        # 각 항목은 최소 2줄(시간정보, 텍스트) 또는 3줄(인덱스, 시간정보, 텍스트) 이상
        if len(lines) < 2:
            print(f"Warning: Skipping malformed entry #{entry_count_for_debug} (less than 2 lines): {lines}")
            continue

        try:
            # 시간 정보 라인 찾기 (보통 두 번째 줄, 인덱스 1)
            timestamp_line_index = -1
            if len(lines) >= 2 and '-->' in lines[1]:
                timestamp_line_index = 1
            # 혹시 인덱스 없이 바로 시간 정보가 오는 경우 (표준은 아님)
            elif '-->' in lines[0]:
                 timestamp_line_index = 0

            if timestamp_line_index == -1:
                print(f"Warning: Skipping entry #{entry_count_for_debug} (timestamp line not found): {lines}")
                continue

            start_str, end_str = lines[timestamp_line_index].split(' --> ')
            start = time_to_seconds(start_str.strip())
            end = time_to_seconds(end_str.strip())

            # 텍스트 추출 (시간 정보 라인 다음부터 끝까지)
            text_lines = lines[timestamp_line_index + 1:]
            if not text_lines:
                 print(f"Warning: Skipping entry #{entry_count_for_debug} (no text lines found): {lines}")
                 continue

            text = ' '.join(line.strip() for line in text_lines)

            OFFSET = 0.7  # 앞당김
            captions.append((start - OFFSET, end - OFFSET, text))

        except ValueError as ve:
            print(f"Warning: Skipping entry #{entry_count_for_debug} due to ValueError: {ve}. Entry: {lines}")
            continue
        except IndexError:
            print(f"Warning: Skipping entry #{entry_count_for_debug} due to unexpected format (IndexError). Entry: {lines}")
            continue
        except Exception as e:
            print(f"Warning: Skipping entry #{entry_count_for_debug} due to unexpected error: {e}. Entry: {lines}")
            continue

    print(f"최종 파싱된 자막 개수: {len(captions)}")
    return captions

def time_to_seconds(t):
    """SRT 시간 형식(HH:MM:SS,mmm)을 초 단위(float)로 변환합니다."""
    try:
        time_parts = re.split('[:,]', t)
        if len(time_parts) != 4:
            raise ValueError("Timestamp does not have 4 parts")
        h, m, s, ms = map(int, time_parts)
        total_seconds = h * 3600 + m * 60 + s + ms / 1000.0
        return total_seconds
    except Exception as e:
        raise ValueError(f"Error parsing time string '{t}': {e}") from e

def get_image_paths(directory):
    image_paths = []
    
    for filename in os.listdir(directory):  
        if filename.endswith((".jpg", ".png", ".gif")):
            image_paths.append(os.path.join(directory, filename))
    
    return image_paths

def get_file_path(directory, extension, diffFilename="default.txt"):
    file_path = ""
    
    for filename in os.listdir(directory):  
        if filename.endswith(extension):
            if diffFilename != "default.txt":
                if filename == diffFilename:
                    file_path = os.path.join(directory, filename)
            else:
                file_path = os.path.join(directory, filename)
    
    return file_path
    
def generate_video(template: schemas.TemplateData):
    try:
        create_video_with_multiple_images(template)
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        logging.error(f"비디오 생성: Template2 에러 발생: {e}")
        raise
