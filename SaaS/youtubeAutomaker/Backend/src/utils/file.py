from datetime import datetime
import os


def load_used_quotes(file):
    try:
        with open(file, "r", encoding="utf-8") as f:
            return set(
                line.strip().split(":", 1)[1].strip().lower()
                for line in f if line.strip() and ":" in line
            )
    except FileNotFoundError:
        return set()
    
# 새로운 명언 저장하기
def save_quote(file, quote):
    with open(file, "a", encoding="utf-8") as f:
        f.write(f"{datetime.today().strftime('%Y%m%d')} : {quote} \n")
    print(f"'{quote}' has been saved.")

# 프롬프트 파일들 불러오기
def load_all_prompts(prompt_dir):
    prompt_list = []
    for filename in os.listdir(prompt_dir):
        if filename.endswith(".txt"):
            with open(os.path.join(prompt_dir, filename), 'r', encoding='utf-8') as file:
                prompt_list.append(file.read())
    return prompt_list

# 스크립트 저장하기
def save_script(directory, subtitles, save_file_name):
    file_path = os.path.join(directory, save_file_name)
    try:
        with open(file_path, "w", encoding="utf-8", newline='') as f:
            f.write(subtitles)
        print(f"✅ 파일 저장 성공: {file_path}")
        return file_path
    except UnicodeEncodeError as e:
        print(f"❌ 인코딩 에러: {e}")
        # 문제가 되는 문자 제거하고 다시 시도
        cleaned_subtitles = subtitles.encode('utf-8', errors='ignore').decode('utf-8')
        with open(file_path, "w", encoding="utf-8", newline='') as f:
            f.write(cleaned_subtitles)
        print(f"✅ 인코딩 에러 해결 후 파일 저장 성공: {file_path}")
        return file_path
    except Exception as e:
        print(f"❌ 파일 저장 실패: {e}")
        raise e
    
