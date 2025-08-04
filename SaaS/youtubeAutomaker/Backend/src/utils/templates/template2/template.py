import random
import re
from moviepy.editor import ImageClip, AudioFileClip, concatenate_videoclips, TextClip, CompositeVideoClip, CompositeAudioClip, ColorClip
from moviepy.config import change_settings

def safe_text_clip(txt, fontsize=40, font=None, color='white', method='caption', **kwargs):
    txt = txt.strip() if txt else " "  # None 또는 공백이면 " "으로 처리
    try:
        return TextClip(txt, fontsize=fontsize, font=font, color=color, method=method, **kwargs)
    except Exception as e:
        print(f"[safe_text_clip ERROR] '{txt}' -> {e}")
        return TextClip(" ", fontsize=fontsize, font=font, color=color, method=method, **kwargs)

def create_top_fixed_banner(video_width, video_height, font_path, duration, text):
    font_size = 45
    padding = 5

    fluorescent_colors = ['#39FF14', '#FFFF33', '#FFAA1D', '#FF44CC']

    # 패턴에 따라 분할: '[기각] [각하] [집행유예] 헷갈려' → 텍스트 조각 리스트로 분해
    parts = re.split(r"(\[.*?\])", text)

    clips = []
    total_width = 0

    for part in parts:
        if not part:
            continue
        if part.startswith('[') and part.endswith(']'):
            # 강조 텍스트
            word = part[1:-1]  # 대괄호 제거
            color = random.choice(fluorescent_colors)
            clip = safe_text_clip(word, font_size, font_path, color=color, method='label')
        else:
            # 일반 텍스트
            clip = safe_text_clip(part, font_size, font_path, method='label')
        clips.append(clip)
        total_width += clip.w + padding

    total_width -= padding  # 마지막 여분 제거
    y_pos = 20
    positioned_clips = []

    x_pos = (video_width - total_width) // 2
    for clip in clips:
        clip = clip.set_position((x_pos, y_pos)).set_duration(duration)
        positioned_clips.append(clip)
        x_pos += clip.w + padding

    top_bg_height = max(clip.h for clip in clips) + 40
    top_bg = ColorClip(size=(video_width, top_bg_height), color=(0, 0, 0)).set_position(("center", 0)).set_duration(duration)

    return [top_bg] + positioned_clips, top_bg_height

def create_top_fixed_banner1(video_width, video_height, font_path, duration, text):
    font_size = 45
    padding = 5

    # 강조 부분 추출
    match = re.search(r"\[(.*?)\]", text)
    highlight = match.group(1) if match else ""
    before = text.split('[')[0] if '[' in text else text
    after = text.split(']')[-1] if ']' in text else ""

    fluorescent_colors = ['#39FF14', '#FFFF33', '#FFAA1D', '#FF44CC']
    random_color = random.choice(fluorescent_colors)

    before_clip = safe_text_clip(before, font_size, font_path, method='caption')
    highlight_clip = safe_text_clip(highlight, font_size, font_path, color=random_color, method='label')
    after_clip = safe_text_clip(after, font_size, font_path, method='label')

    total_width = before_clip.w + highlight_clip.w + after_clip.w + 2 * padding
    y_pos = 20

    before_clip = before_clip.set_position(((video_width - total_width) // 2, y_pos)).set_duration(duration)
    highlight_clip = highlight_clip.set_position(((video_width - total_width) // 2 + before_clip.w + padding, y_pos)).set_duration(duration)
    after_clip = after_clip.set_position(((video_width - total_width) // 2 + before_clip.w + highlight_clip.w + 2 * padding, y_pos)).set_duration(duration)

    top_bg_height = max(before_clip.h, highlight_clip.h, after_clip.h) + 40
    top_bg = ColorClip(size=(video_width, top_bg_height), color=(0, 0, 0)).set_position(("center", 0)).set_duration(duration)

    return [top_bg, before_clip, highlight_clip, after_clip], top_bg_height

def create_subtitle_clip_by_template2(start, end, text, video_width, video_height, font_path, buffer=0.7, video_duration=None, middle_image_height=0):
    font_size = 45

    duration = min((end - start) + buffer, video_duration - start if video_duration else end - start + buffer)

    bottom_txt = safe_text_clip(
        text, font_size, font_path,
        method='caption',
        size=(video_width * 0.9, None),
        align='center'
    ).set_start(start).set_duration(duration)

    padding = 40  # 기존 20 -> 40으로 키워서 배경 좀 더 굵게
    text_height = bottom_txt.h
    
    # 이미지 높이도 포함해서 배경 높이 조절
    bg_height = text_height + padding * 2 + middle_image_height

    raise_ratio = 0.25  # 하단에서 띄우는 정도

    bottom_txt_y = int(video_height - text_height - padding - (video_height * raise_ratio))
    
    # 이미지 높이만큼 더 위로 올림 (배경이 이미지 하단까지 덮도록)
    bottom_bg_height = video_height - bottom_txt_y + padding  # 텍스트 기준으로 아래 공간 다 덮기
    bottom_bg_y = video_height - bottom_bg_height  # 아래에서부터 시작

    bottom_bg = ColorClip(
        size=(video_width, bottom_bg_height),
        color=(0, 0, 0)
    ).set_position(("center", bottom_bg_y)).set_start(start).set_duration(duration).set_opacity(0.85)

    bottom_txt = bottom_txt.set_position(("center", bottom_txt_y))

    return [bottom_bg, bottom_txt], bg_height

