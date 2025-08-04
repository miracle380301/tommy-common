import logging
import os
import random
import time
import uuid
import requests

from fastapi import UploadFile
from dotenv import load_dotenv
from datetime import datetime, timedelta

from src.database import schemas

logging.basicConfig(level=logging.INFO)
load_dotenv()

PEXELS_API_KEY = os.getenv("PEXELS_API_KEY")
PIXABAY_API_KEY = os.getenv("PIXABAY_API_KEY")
UNSPLASH_API_KEY = os.getenv("UNSPLASH_API_KEY")

DATA_DIR = os.getenv("DATA_DIR")
IMG_DIR = os.getenv("IMG_DIR")
TODAY_DIR = f"{datetime.today().strftime('%Y%m%d')}"
#TODAY_DIR = (datetime.today() + timedelta(days=1)).strftime('%Y%m%d')

img_save_file_full_path = os.path.join(DATA_DIR, IMG_DIR, TODAY_DIR)
os.makedirs(img_save_file_full_path, exist_ok=True)

IMAGE_APIS = [
    # 'https://api.pexels.com/v1/search',
    # 'https://pixabay.com/api/',
    'https://api.unsplash.com/'
]

def get_images(image: schemas.ImageData):

    if (image.currentImageTab == 'direct'):
        save_uploaded_images(image.files)

    elif (image.currentImageTab == 'input'):
        selected_keyword = [image.inputKeyword]

        #print(f"🗝️ 사용된 키워드: {selected_keyword}")
        get_unsplash_image(selected_keyword, cnt=4)
    else:
        selected_keyword = get_keyword(image)

        # 이미지 API를 랜덤으로 추출
        api_url = random.choice(IMAGE_APIS)

        if 'pexels' in api_url:
            get_pexels_image(selected_keyword)
        elif 'pixabay' in api_url:
            get_pixabay_image(selected_keyword)
        elif 'unsplash' in api_url:
            get_unsplash_image(selected_keyword)
    

def get_keyword(image: schemas.ImageData):
    keywords = {
            "nature": ["nature", "mountain", "forest", "ocean", "sunset", "sunrise", "river", "valley", "meadow", "countryside", "desert", "island", "beach", "waterfall", "field", "bamboo forest", "cave", "fog", "rain", "snow", "clouds", "waves", "calm lake", "skyline"],
            "space": ["space", "night sky", "stars", "northern lights", "horizon"],
            "seasons": ["spring", "summer", "autumn", "winter"],
            "city": ["city", "bridge", "street", "skyscraper", "alley", "village"],
            "animals": ["animals", "birds", "flowers", "tree", "butterfly", "deer", "cat", "dog", "forest animals"],
            "emotions": ["hope", "peace", "freedom", "loneliness", "joy", "sadness", "wonder", "dream", "serenity", "mystery", "love"],
            "abstract": ["abstract", "light", "shadow", "reflection", "color splash", "geometry", "pattern"],
            "activities": ["meditation", "travel", "reading", "walking", "camping", "yoga", "traditional", "festival", "lanterns"],
            "special": ["fairy tale", "fantasy", "magic", "zen", "minimalism", "vintage", "retro", "surreal"],
            "story": ["dark silhouette","blurred silhouette","shadowy figure","sad cityscape","dark city at night","rainy city night","dark room interior","moody room lighting","lonely room"],
        }

    # 자동 설정(랜덤)
    if image.currentImageTab == "input":
        # 같은 그룹에서 4개의 이미지를 가져옴
        selected_group_name = random.choice(list(keywords.keys()))

        selected_group_keywords = keywords[selected_group_name]
        logging.info(f"선택된 그룹: {selected_group_name}")

        # 선택된 그룹에서 4개 키워드 랜덤으로 선택
        selected_keywords = random.sample(selected_group_keywords, k=1)
        logging.info(f"사용된 키워드: {', '.join(selected_keywords)}")

    elif image.currentImageTab == "keyword":

        selected_group_name = image.selectedKeyword
        selected_group_keywords = keywords[selected_group_name]
        logging.info(f"선택된 그룹: {selected_group_name}")

        # 선택된 그룹에서 4개 키워드 랜덤으로 선택
        selected_keywords = random.sample(selected_group_keywords, k=4)
        logging.info(f"사용된 키워드: {', '.join(selected_keywords)}")
        

    elif image.currentImageTab == "input":
        selected_keywords = image.inputKeyword
        logging.info(f"사용된 키워드: {', '.join(selected_keywords)}")
        

    return selected_keywords

def get_pexels_image(selected_keywords):
    img_save_path = ""
    try:
        headers = {
            "Authorization": PEXELS_API_KEY,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
        }

        
        for keyword in selected_keywords:
            url = "https://api.pexels.com/v1/search"
            params = {"query": keyword, "per_page": 1}  # 한 번에 1장만 가져오기
            response = requests.get(url, headers=headers, params=params)
            data = response.json()

            if data['photos']:
                for idx, photo in enumerate(data['photos']):
                    imgUrl =photo['src']['large2x']  # 또는 'original', 'large' 등 선택
                    img_data = requests.get(imgUrl).content
                    img_save_path = os.path.join(img_save_file_full_path, str(int(time.time())) + '.jpg')

                    with open(img_save_path, 'wb') as f:
                        f.write(img_data)
                        logging.info(f"저장 완료: {img_save_path}")
            else:
                logging.error("[pexels] 이미지를 찾을 수 없습니다.")
    except Exception as e:
        logging.error(f"이미지 검색 및 다운로드 에러 발생: {e}")            

    return img_save_path

def get_pixabay_image(selected_keywords):
    img_save_path = ""
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
        }

        
        for keyword in selected_keywords:
            url = f"https://pixabay.com/api/?key={PIXABAY_API_KEY}&q={keyword}&image_type=photo&pretty=true"
            response = requests.get(url, headers=headers)
            data = response.json()
            if data['hits']:
                for idx, photo in enumerate(data['hits']):
                    if idx == 0:
                        imgUrl =photo['largeImageURL']
                        img_data = requests.get(imgUrl).content
                        img_save_path = os.path.join(img_save_file_full_path, str(int(time.time())) + '.jpg')

                        with open(img_save_path, 'wb') as f:
                            f.write(img_data)
                            logging.info(f"저장 완료: {img_save_path}")
                        break
            else:
                logging.error("[pixabay] 이미지를 찾을 수 없습니다.")
    except Exception as e:
        logging.error(f"이미지 검색 및 다운로드 에러 발생: {e}")            

    return img_save_path

def get_unsplash_image(selected_keywords, cnt=1):
    img_save_path = ""
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
        }

        for keyword in selected_keywords:
            url = f"https://api.unsplash.com/photos/random/?client_id={UNSPLASH_API_KEY}&query={keyword}&count={cnt}"
            response = requests.get(url, headers=headers)
            data = response.json()
            if cnt > 1:
                for i in range(cnt):
                    if data[i]['urls']:
                        imgUrl = data[i]['urls']['full']
                        img_data = requests.get(imgUrl).content
                        img_save_path = os.path.join(img_save_file_full_path, str(int(time.time())) + f'_{i}.jpg')

                        with open(img_save_path, 'wb') as f:
                            f.write(img_data)
                            logging.info(f"저장 완료: {img_save_path}")
                    else:
                        logging.error("[unsplash]  이미지를 찾을 수 없습니다.")                            
            else:
                if data[0]['urls']:
                    imgUrl = data[0]['urls']['full']
                    img_data = requests.get(imgUrl).content
                    img_save_path = os.path.join(img_save_file_full_path, str(int(time.time())) + '.jpg')

                    with open(img_save_path, 'wb') as f:
                        f.write(img_data)
                        logging.info(f"저장 완료: {img_save_path}")
                else:
                    logging.error("[unsplash]  이미지를 찾을 수 없습니다.")
    except Exception as e:
        logging.error(f"이미지 검색 및 다운로드 에러 발생: {e}")            

    return img_save_path
    
def save_uploaded_images(files: list[UploadFile]):
    for file in files:
        if file is None:
            continue
        try:
            # 파일 저장 경로 설정 (유닉스 타임 기반 파일명)
            timestamp = str(int(time.time()))
            extension = os.path.splitext(file.filename)[-1] or ".jpg"
            unique_name = f"{int(time.time())}_{uuid.uuid4().hex[:8]}{extension}"
            img_save_path = os.path.join(img_save_file_full_path, unique_name)

            # 실제 파일 저장
            with open(img_save_path, 'wb') as f:
                contents = file.file.read()  # 파일 내용을 읽어옴
                f.write(contents)

            logging.info(f"저장 완료: {img_save_path}")
        except Exception as e:
            logging.error(f"파일 저장 실패: {file.filename} - {str(e)}")
            
def imageExecute(image: schemas.ImageData):

    # 키워드 설정 or 자동 설정
    get_images(image)


    

