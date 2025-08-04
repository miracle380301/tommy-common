import os
import sys
import platform
from pathlib import Path
from typing import Optional

class SystemTools:
    """시스템 도구들의 경로를 자동으로 관리하는 클래스"""
    
    def __init__(self):
        self.app_root = Path(__file__).parent.parent.parent  # Backend 폴더
        self.tools_dir = self.app_root / "tools"
        self.system = platform.system().lower()
        
    def get_ffmpeg_path(self) -> str:
        """FFmpeg 실행 파일 경로 반환"""
        if self.system == "windows":
            # 번들된 FFmpeg 확인
            bundled_ffmpeg = self.tools_dir / "ffmpeg" / "bin" / "ffmpeg.exe"
            if bundled_ffmpeg.exists():
                return str(bundled_ffmpeg)
            
            # 시스템 PATH에서 찾기
            system_ffmpeg = self._find_in_path("ffmpeg.exe")
            if system_ffmpeg:
                return system_ffmpeg
                
            # 일반적인 설치 경로들 확인
            common_paths = [
                "C:/ffmpeg/bin/ffmpeg.exe",
                "C:/Program Files/ffmpeg/bin/ffmpeg.exe",
                "C:/Program Files (x86)/ffmpeg/bin/ffmpeg.exe"
            ]
            for path in common_paths:
                if Path(path).exists():
                    return path
        
        elif self.system in ["linux", "darwin"]:  # Linux or macOS
            # 번들된 FFmpeg 확인
            bundled_ffmpeg = self.tools_dir / "ffmpeg" / "ffmpeg"
            if bundled_ffmpeg.exists():
                return str(bundled_ffmpeg)
            
            # 시스템에서 찾기
            system_ffmpeg = self._find_in_path("ffmpeg")
            if system_ffmpeg:
                return system_ffmpeg
        
        return ""
    
    def get_imagemagick_path(self) -> str:
        """ImageMagick 실행 파일 경로 반환"""
        if self.system == "windows":
            # 번들된 ImageMagick 확인
            bundled_magick = self.tools_dir / "imagemagick" / "magick.exe"
            if bundled_magick.exists():
                return str(bundled_magick)
            
            # 시스템 PATH에서 찾기
            system_magick = self._find_in_path("magick.exe")
            if system_magick:
                return system_magick
            
            # 일반적인 설치 경로들 확인
            common_paths = [
                "C:/Program Files/ImageMagick-7.1.1-Q16/magick.exe",
                "C:/Program Files (x86)/ImageMagick-7.1.1-Q16/magick.exe",
                "C:/ImageMagick/magick.exe"
            ]
            for path_pattern in ["C:/Program Files/ImageMagick*/magick.exe", 
                                "C:/Program Files (x86)/ImageMagick*/magick.exe"]:
                import glob
                matches = glob.glob(path_pattern)
                if matches:
                    return matches[0]
                    
        elif self.system in ["linux", "darwin"]:
            # 번들된 ImageMagick 확인
            bundled_magick = self.tools_dir / "imagemagick" / "magick"
            if bundled_magick.exists():
                return str(bundled_magick)
            
            # 시스템에서 찾기
            system_magick = self._find_in_path("magick")
            if system_magick:
                return system_magick
        
        return ""
    
    def get_korean_font_path(self) -> str:
        """한글 폰트 파일 경로 반환"""
        # 번들된 폰트 확인
        bundled_font = self.tools_dir / "fonts" / "NanumGothic.ttf"
        if bundled_font.exists():
            return str(bundled_font)
        
        if self.system == "windows":
            # Windows 기본 한글 폰트들
            windows_fonts = [
                "C:/Windows/Fonts/malgun.ttf",        # 맑은 고딕
                "C:/Windows/Fonts/gulim.ttc",         # 굴림
                "C:/Windows/Fonts/dotum.ttc",         # 돋움
                "C:/Windows/Fonts/batang.ttc",        # 바탕
                "C:/Windows/Fonts/HMFMMUEX.TTC",      # 함초롬돋움
            ]
            for font_path in windows_fonts:
                if Path(font_path).exists():
                    return font_path
                    
        elif self.system == "darwin":  # macOS
            macos_fonts = [
                "/System/Library/Fonts/AppleSDGothicNeo.ttc",
                "/Library/Fonts/AppleGothic.ttf"
            ]
            for font_path in macos_fonts:
                if Path(font_path).exists():
                    return font_path
                    
        elif self.system == "linux":
            linux_fonts = [
                "/usr/share/fonts/truetype/nanum/NanumGothic.ttf",
                "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
            ]
            for font_path in linux_fonts:
                if Path(font_path).exists():
                    return font_path
        
        return ""
    
    def _find_in_path(self, executable: str) -> Optional[str]:
        """PATH 환경변수에서 실행파일 찾기"""
        import shutil
        path = shutil.which(executable)
        return path if path else None
    
    def setup_bundled_tools(self):
        """번들된 도구들을 환경변수에 설정"""
        ffmpeg_path = self.get_ffmpeg_path()
        imagemagick_path = self.get_imagemagick_path()
        korean_font_path = self.get_korean_font_path()
        
        if ffmpeg_path:
            # pydub을 위한 FFmpeg 설정
            try:
                from pydub import AudioSegment
                AudioSegment.converter = ffmpeg_path
                AudioSegment.ffmpeg = ffmpeg_path
                AudioSegment.ffprobe = ffmpeg_path.replace("ffmpeg", "ffprobe")
                print(f"✅ FFmpeg 설정: {ffmpeg_path}")
            except ImportError:
                pass
        
        if imagemagick_path:
            os.environ["IMAGEMAGICK_BINARY"] = imagemagick_path
            print(f"✅ ImageMagick 설정: {imagemagick_path}")
        
        if korean_font_path:
            os.environ["KOREAN_FONT"] = korean_font_path
            print(f"✅ 한글 폰트 설정: {korean_font_path}")
        
        return {
            "ffmpeg": ffmpeg_path,
            "imagemagick": imagemagick_path,
            "korean_font": korean_font_path
        }
    
    def get_tools_status(self) -> dict:
        """도구들의 사용 가능 상태 반환"""
        ffmpeg_path = self.get_ffmpeg_path()
        imagemagick_path = self.get_imagemagick_path()
        korean_font_path = self.get_korean_font_path()
        
        return {
            "ffmpeg": {
                "available": bool(ffmpeg_path),
                "path": ffmpeg_path,
                "bundled": str(self.tools_dir) in ffmpeg_path if ffmpeg_path else False
            },
            "imagemagick": {
                "available": bool(imagemagick_path),
                "path": imagemagick_path,
                "bundled": str(self.tools_dir) in imagemagick_path if imagemagick_path else False
            },
            "korean_font": {
                "available": bool(korean_font_path),
                "path": korean_font_path,
                "bundled": str(self.tools_dir) in korean_font_path if korean_font_path else False
            }
        }

# 전역 시스템 도구 관리자
system_tools = SystemTools()