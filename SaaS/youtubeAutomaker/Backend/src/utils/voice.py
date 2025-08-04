import os
import logging
import re
import time
import wave

from io import BytesIO
from gtts import gTTS
from pydub import AudioSegment
from dotenv import load_dotenv
from datetime import datetime, timedelta

from google.cloud import texttospeech
from google.cloud import speech

# from src.utils.openAIGenerator import generate_translated_scripts
from src.database import schemas


logging.basicConfig(level=logging.INFO)
load_dotenv()

AudioSegment.converter = os.getenv("AudioSegment.CONVERTER")

DATA_DIR = os.getenv("DATA_DIR")
SCRIPT_DIR = os.getenv("SCRIPT_DIR")
VOICE_DIR = os.getenv("VOICE_DIR")
TODAY_DIR = f"{datetime.today().strftime('%Y%m%d')}"
#TODAY_DIR = (datetime.today() + timedelta(days=3)).strftime('%Y%m%d')

script_save_file_full_path = os.path.join(DATA_DIR, SCRIPT_DIR, TODAY_DIR)
voice_save_file_full_path = os.path.join(DATA_DIR, VOICE_DIR, TODAY_DIR)
os.makedirs(voice_save_file_full_path, exist_ok=True)

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "./config/tts_service.json"


# data/scripts/오늘날짜/original.srt 스크립트 파일을 가져옴.
def get_today_srt_file():

    date_dir = os.path.join(DATA_DIR, SCRIPT_DIR, TODAY_DIR)
    
    if os.path.isdir(date_dir):
        srt_file_path = os.path.join(date_dir, "original.srt")
        if os.path.exists(srt_file_path):
            return srt_file_path
        else:
            logging.error(f"{TODAY_DIR} 폴더에는 'original.srt' 파일이 없습니다.")
            return None
    else:
        logging.error(f"{TODAY_DIR} 날짜의 폴더가 존재하지 않습니다.")
        return None

def clean_for_tts(text: str) -> str:
    """이모티콘 및 특수문자 제거 (쉼표, 마침표는 유지)"""
    return re.sub(r'[^\w\s가-힣.,]', '', text)

# gTTS 기반 음성 생성 함수(무료)
def generate_gtts_tts(original_script, locale='en'):
    subtitles = split_srt_into_chunks(original_script)

    final_audio = AudioSegment.silent(duration=0)  # 0초짜리 빈 오디오

    for idx, (index, timestamp, text) in enumerate(subtitles):
        if not text.strip():
            continue

        # gTTS 객체 생성 (영어 기본)
        try:
            tts = gTTS(text=text, lang=locale)
            # 메모리상에서 MP3 로 저장
            mp3_fp = BytesIO()
            tts.write_to_fp(mp3_fp)
            mp3_fp.seek(0)

            # MP3 → AudioSegment
            temp_audio = AudioSegment.from_file(mp3_fp, format="mp3")
            final_audio += temp_audio

            # 딜레이
            time.sleep(1.5)

        except Exception as e:
            logging.warning(f"gTTS conversion failed.: {e}")
            continue

    # 최종 파일 저장
    base_filename = f"{voice_save_file_full_path}/{TODAY_DIR}.wav"
    final_audio.export(base_filename, format="wav")
    logging.info(f"최종 음성 파일 저장 완료 [gTTS: 영어버전무료]: {base_filename}")

    return base_filename

# Google text to Speech 음성 생성(유료)
def generate_google_cloud_tts(original_script, voiceData: schemas.VoiceData):

    subtitles = split_srt_into_chunks(original_script)

    client = texttospeech.TextToSpeechClient()
    final_audio = AudioSegment.silent(duration=0)  # 0초짜리 빈 오디오


    gender = 'man'
    locale = 'ko'
    voice_name = None
    
    if voiceData.selectedVoice == 'sexual-m':
        gender = 'man'
        locale = 'ko'
    elif voiceData.selectedVoice == 'sexual-w':
        gender = 'woman'
        locale = 'ko'
    elif voiceData.selectedVoice == 'sexual-m-en':
        gender = 'man'
        locale = 'en'
    elif voiceData.selectedVoice == 'sexual-w-en':
        gender = 'woman'
        locale = 'en'
    elif voiceData.selectedVoice == 'ko-KR-Chirp3-HD-Achernar':
        gender = 'woman'
        locale = 'ko'
        voice_name = 'ko-KR-Chirp3-HD-Achernar'
    elif voiceData.selectedVoice == 'ko-KR-Chirp3-HD-Zephyr':
        gender = 'woman'
        locale = 'ko'
        voice_name = 'ko-KR-Chirp3-HD-Zephyr'
    elif voiceData.selectedVoice == 'ko-KR-Chirp3-HD-Umbriel':
        gender = 'man'
        locale = 'ko'
        voice_name = 'ko-KR-Chirp3-HD-Umbriel'
    elif voiceData.selectedVoice == 'ko-KR-Chirp3-HD-Rasalgethi':
        gender = 'man'
        locale = 'ko'
        voice_name = 'ko-KR-Chirp3-HD-Rasalgethi'

    # 자막을 하나씩 처리
    for idx, (index, timestamp, text) in enumerate(subtitles):

        # 자막 원문은 그대로 유지
        display_text = text

        # TTS용 텍스트는 전처리
        tts_text = clean_for_tts(display_text)

        if not tts_text.strip():
            continue  # 비어있으면 건너뜀

        # Google Cloud Text-to-Speech를 사용하여 음성 생성
        synthesis_input = texttospeech.SynthesisInput(text=tts_text)    

        if locale == 'ko':
            # 특정 voice_name이 있으면 그것을 사용, 없으면 기본값 사용
            if voice_name:
                voice_sexual = voice_name
            else:
                voice_sexual="ko-KR-Chirp3-HD-Laomedeia" # 여자
                if gender == 'man':
                  voice_sexual="ko-KR-Chirp3-HD-Algieba" #남자

            # 음성 설정 (한국어 여성 목소리 예시)
            voice = texttospeech.VoiceSelectionParams(
                language_code="ko-KR",
                name = voice_sexual,
            )
        elif locale == 'en':
            voice_sexual="en-US-Chirp3-HD-Gacrux" # 여자
            if gender == 'man':
                voice_sexual="en-US-Chirp3-HD-Iapetus" #남자
           
            voice = texttospeech.VoiceSelectionParams(
                    language_code="en-US",
                    name=voice_sexual,
            )
        
        elif locale == 'ja':
            voice_sexual="ja-JP-Chirp3-HD-Laomedeia" # 여자
            if gender == 'man':
                voice_sexual="ja-JP-Chirp3-HD-Sadaltager" #남자
           
            voice = texttospeech.VoiceSelectionParams(
                    language_code="ja-JP",
                    name=voice_sexual
                )
        elif locale == 'es':
            voice_sexual="es-ES-Chirp3-HD-Kore" # 여자
            if gender == 'man':
                voice_sexual="es-ES-Chirp3-HD-Alnilam" #남자
           
            voice = texttospeech.VoiceSelectionParams(
                    language_code="es-ES",
                    name=voice_sexual
                )           
        

        # 오디오 설정 (WAV + 속도 조절)
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.LINEAR16, # WAV 포멧
        )

        # 음성 합성 요청
        response = client.synthesize_speech(
            input=synthesis_input,
            voice=voice,
            audio_config=audio_config
        )

        # 생성된 MP3 파일을 메모리에서 읽어오기
        temp_audio = AudioSegment.from_wav(BytesIO(response.audio_content))

        # 최종 오디오에 합치기
        final_audio += temp_audio

        # 딜레이 추가 (예: 1.5초)
        time.sleep(1.5)  # Adjust the delay as needed


    base_filename = f"{voice_save_file_full_path}\{TODAY_DIR}.wav"
    final_audio.export(base_filename, format="wav")
    logging.info(f"✅ 최종 음성 파일 저장 완료: {base_filename}")
    return base_filename

def ms_to_srt_timestamp(ms):
    hours = ms // (3600 * 1000)
    minutes = (ms % (3600 * 1000)) // (60 * 1000)
    seconds = (ms % (60 * 1000)) // 1000
    milliseconds = ms % 1000
    return f"{hours:02}:{minutes:02}:{seconds:02},{milliseconds:03}"

def split_srt_into_chunks(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read().strip()

    blocks = content.split("\n\n")
    subtitles = []

    for block in blocks:
        lines = block.strip().split("\n")
        if len(lines) >= 3:
            index = lines[0]
            timestamp = lines[1]
            text = " ".join(lines[2:])
            subtitles.append((index, timestamp, text))

    return subtitles


    

def parse_timestamp(timestamp):
    start_time, end_time = timestamp.split(" --> ")
    
    start_ms = int(start_time[:2]) * 3600000 + int(start_time[3:5]) * 60000 + int(start_time[6:8]) * 1000 + int(start_time[9:])
    end_ms = int(end_time[:2]) * 3600000 + int(end_time[3:5]) * 60000 + int(end_time[6:8]) * 1000 + int(end_time[9:])
    end_ms += 2500  # 문장 끝에 1.5초 쉬기
    
    return start_ms, end_ms


def get_sample_rate(file_path):
    with wave.open(file_path, 'rb') as f:
        return f.getframerate()


def transcribe_audio(speech_file):
    """음성 파일을 텍스트로 변환"""
    client = speech.SpeechClient()

    with open(speech_file, "rb") as f:
        audio = speech.RecognitionAudio(content=f.read())

    config = speech.RecognitionConfig(
        encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
        sample_rate_hertz=get_sample_rate(speech_file),
        language_code="ko-KR",
        enable_word_time_offsets=True,
    )

    response = client.recognize(config=config, audio=audio)
    
    # 디버깅용 출력
    for result in response.results:
        for alternative in result.alternatives:
            for word_info in alternative.words:
                # Use total_seconds() to handle datetime.timedelta
                start_time_ms = int(word_info.start_time.total_seconds() * 1000)
                end_time_ms = int(word_info.end_time.total_seconds() * 1000)
                #print(f"Word: {word_info.word}, Start: {start_time_ms}ms, End: {end_time_ms}ms")

    return response

def generate_srt(segments, srt_filename):
    """자막을 SRT 형식으로 변환"""
    with open(srt_filename, "w", encoding="utf-8") as srt_file:
        for idx, segment in enumerate(segments, 1):
            start_time = segment[0] / 1000  # 밀리초 -> 초
            end_time = segment[1] / 1000    # 밀리초 -> 초

            # 시간 형식 변환
            start_time_str = "{:02}:{:02}:{:02},{:03}".format(int(start_time // 3600), int((start_time % 3600) // 60), int(start_time % 60), int((start_time * 1000) % 1000))
            end_time_str = "{:02}:{:02}:{:02},{:03}".format(int(end_time // 3600), int((end_time % 3600) // 60), int(end_time % 60), int((end_time * 1000) % 1000))

            # 텍스트 자막
            text = segment[2]

            # SRT 형식으로 저장
            srt_file.write(f"{idx}\n{start_time_str} --> {end_time_str}\n{text}\n\n")

# 음성 기반으로 자막을 재생성
def create_srt_from_audio(audio_file, original_script, new_script_filename, locale):
    """음성 파일에서 자막을 추출하여 SRT 파일로 저장 (문장 길이에 따라 시간 조정)"""
    response = transcribe_audio(audio_file)

    # 음성 파일의 전체 길이 계산 (마지막 단어의 종료 시간 사용)
    total_duration_ms = 0
    for result in response.results:
        for alternative in result.alternatives:
            for word_info in alternative.words:
                end_time_ms = int(word_info.end_time.total_seconds() * 1000)
                total_duration_ms = max(total_duration_ms, end_time_ms)

    logging.info(f"음성 파일의 총 길이: {total_duration_ms}ms")

    # 기존 자막 텍스트 추출
    subtitles = split_srt_into_chunks(original_script)
    texts = [text.strip() for _, _, text in subtitles if text.strip()]

    # 각 문장의 길이를 기반으로 비율 계산
    total_text_length = sum(len(text) for text in texts)
    logging.info(f"전체 텍스트 길이: {total_text_length} 문자")

    # 새 자막 생성
    srt_lines = []
    current_start_ms = 0
    offset_ms = 200  # 쉬는 시간 0.2초 (500ms)

    for idx, text in enumerate(texts):
        # 문장 길이에 따른 비율로 시간 계산
        text_length = len(text)
        duration_for_text = (text_length / total_text_length) * total_duration_ms
        duration_for_text = int(duration_for_text)  # 밀리초 단위로 변환

        start_ms = current_start_ms
        end_ms = start_ms + duration_for_text

        # 마지막 자막이 아닌 경우, 종료 시간에 쉬는 시간 추가
        if idx < len(texts) - 1:
            end_ms += offset_ms

        # 시간 형식 변환
        start_time = ms_to_srt_timestamp(start_ms)
        end_time = ms_to_srt_timestamp(end_ms)

        # SRT 형식으로 저장
        srt_lines.append(f"{idx+1}\n{start_time} --> {end_time}\n{text}\n\n")
        current_start_ms = end_ms  # 다음 문장의 시작 시간 업데이트

    # SRT 파일 저장
    with open(new_script_filename, "w", encoding="utf-8") as f:
        f.writelines(srt_lines)

    # 재성성 된 버전의 영어, 일본어, 스페인, 한국어 자막 생성 (번역한 언어 지정)
    # selected_lang_code = ''
    # if locale == 'en':
    #     selected_lang_code = 'ko'
    # generate_translated_scripts(new_script_filename, selected_lang_code, script_save_file_full_path)

    logging.info(f"새로운 자막 파일이 재생성되었습니다: {new_script_filename}")


def voiceExecute(voice: schemas.VoiceData):
    original_script = get_today_srt_file()

    locale = 'ko'
    # 영어 목소리인 경우 gTTS 사용, 나머지는 Google Cloud TTS 사용
    if voice.selectedVoice == 'sexual-m-en' or voice.selectedVoice == 'sexual-w-en':
        locale = 'en'
        base_filename = generate_gtts_tts(original_script, locale)
        print(f"base file====== {base_filename}")
    else:
        # 한국어 목소리들 (기존 + 새로운 HD 목소리들) 모두 Google Cloud TTS 사용
        base_filename = generate_google_cloud_tts(original_script, voice)
    
    if os.path.exists(base_filename):
        # 음성 기반 자막 재생성
        new_script_filename = f"{script_save_file_full_path}\{TODAY_DIR}.srt"
        return create_srt_from_audio(base_filename, original_script, new_script_filename, locale)

    else:
        logging.error(f"파일이 존재하지 않습니다: {base_filename}")