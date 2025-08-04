from moviepy.editor import TextClip, CompositeVideoClip, ColorClip

def create_subtitle_clip_by_template1(start, end, text, video_width, video_height, font_path):
    """하단 자막(노란 배경 + 텍스트)을 생성하는 템플릿 함수"""
    # 텍스트 클립 생성
    txt_clip = TextClip(
        text,
        fontsize=60, # 글씨 크기
        font=font_path, # 폰트 경로
        color='black', # 글씨 색상: 검은색
        stroke_color='black', # 테두리 색상
        stroke_width=1, # 테두리 두께
        method='caption',
        size=(video_width * 0.9, None), # 텍스트 크기 조정
        align='center'
    ).set_start(start).set_duration(end - start)

    # 디버깅: 텍스트 클립 크기 확인
    #print(f"텍스트 클립 크기: {txt_clip.w}x{txt_clip.h}")

    # 노란색 배경 추가 (텍스트 크기에 맞게)
    background = ColorClip(
        size=(txt_clip.w + 40, txt_clip.h + 20),  # 배경 크기 (텍스트 크기보다 약간 크게)
        color=(255, 255, 0)  # 노란색 (RGB)
    ).set_start(start).set_duration(end - start)\
    .set_position(("center", video_height // 2 - (txt_clip.h + 20) // 2))  # 배경 위치를 중앙으로 설정

    # 디버깅: 배경 크기 확인
    #print(f"배경 크기: {background.size}")

    # 배경과 텍스트를 합쳐서 최종 클립 생성
    composite = CompositeVideoClip([
        background,
        txt_clip.set_position(("center", video_height // 2 - txt_clip.h // 2))
    ], size=(video_width, video_height))  # 영상 크기와 동일하게 설정

    return composite

