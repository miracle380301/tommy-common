import os
import sys
import zipfile
import requests
import platform
from pathlib import Path
from typing import Optional, Callable
import shutil
import logging

logger = logging.getLogger(__name__)

class AutoInstaller:
    """필요한 시스템 도구들을 자동으로 다운로드하고 설치하는 클래스"""
    
    def __init__(self):
        self.app_root = Path(__file__).parent.parent.parent  # Backend 폴더
        self.tools_dir = self.app_root / "tools"
        self.system = platform.system().lower()
        self.downloads_dir = self.tools_dir / "downloads"
        
        # 디렉토리 생성
        self.tools_dir.mkdir(exist_ok=True)
        self.downloads_dir.mkdir(exist_ok=True)
        
        # 다운로드 URLs (Windows용)
        self.download_urls = {
            "ffmpeg": {
                "url": "https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip",
                "filename": "ffmpeg-master-latest-win64-gpl.zip",
                "extract_folder": "ffmpeg-master-latest-win64-gpl"
            },
            "imagemagick": {
                "url": "https://imagemagick.org/archive/binaries/ImageMagick-7.1.1-39-portable-Q16-HDRI-x64.zip",
                "filename": "ImageMagick-portable-Q16-HDRI-x64.zip",
                "extract_folder": "ImageMagick-portable"
            }
        }
    
    def download_file(self, url: str, filename: str, progress_callback: Optional[Callable] = None) -> bool:
        """파일 다운로드 (진행률 콜백 지원)"""
        try:
            file_path = self.downloads_dir / filename
            
            print(f"📥 다운로드 시작: {filename}")
            
            response = requests.get(url, stream=True)
            response.raise_for_status()
            
            total_size = int(response.headers.get('content-length', 0))
            downloaded_size = 0
            
            with open(file_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
                        downloaded_size += len(chunk)
                        
                        if progress_callback and total_size > 0:
                            progress = (downloaded_size / total_size) * 100
                            progress_callback(progress, filename)
            
            print(f"✅ 다운로드 완료: {filename}")
            return True
            
        except Exception as e:
            print(f"❌ 다운로드 실패 {filename}: {e}")
            return False
    
    def extract_archive(self, archive_path: Path, extract_to: Path) -> bool:
        """압축 파일 해제"""
        try:
            print(f"📦 압축 해제 중: {archive_path.name}")
            
            if archive_path.suffix.lower() == '.zip':
                with zipfile.ZipFile(archive_path, 'r') as zip_ref:
                    zip_ref.extractall(extract_to)
            else:
                print(f"❌ 지원하지 않는 압축 형식: {archive_path.suffix}")
                return False
            
            print(f"✅ 압축 해제 완료: {archive_path.name}")
            return True
            
        except Exception as e:
            print(f"❌ 압축 해제 실패 {archive_path.name}: {e}")
            return False
    
    def install_ffmpeg(self, progress_callback: Optional[Callable] = None) -> bool:
        """FFmpeg 자동 설치"""
        if self.system != "windows":
            print("⚠️ 자동 설치는 Windows에서만 지원됩니다.")
            return False
        
        try:
            config = self.download_urls["ffmpeg"]
            
            # 이미 설치되어 있는지 확인
            ffmpeg_dir = self.tools_dir / "ffmpeg"
            if (ffmpeg_dir / "bin" / "ffmpeg.exe").exists():
                print("✅ FFmpeg 이미 설치됨")
                return True
            
            # 다운로드
            if not self.download_file(config["url"], config["filename"], progress_callback):
                return False
            
            # 압축 해제
            archive_path = self.downloads_dir / config["filename"]
            temp_extract = self.downloads_dir / "temp_ffmpeg"
            
            if not self.extract_archive(archive_path, temp_extract):
                return False
            
            # 파일 이동 (압축 해제된 폴더에서 tools/ffmpeg로)
            extracted_folder = temp_extract / config["extract_folder"]
            if extracted_folder.exists():
                if ffmpeg_dir.exists():
                    shutil.rmtree(ffmpeg_dir)
                shutil.move(str(extracted_folder), str(ffmpeg_dir))
            
            # 임시 폴더 정리
            if temp_extract.exists():
                shutil.rmtree(temp_extract)
            
            # 다운로드 파일 정리
            archive_path.unlink()
            
            print("✅ FFmpeg 설치 완료")
            return True
            
        except Exception as e:
            print(f"❌ FFmpeg 설치 실패: {e}")
            return False
    
    def install_imagemagick(self, progress_callback: Optional[Callable] = None) -> bool:
        """ImageMagick 자동 설치"""
        if self.system != "windows":
            print("⚠️ 자동 설치는 Windows에서만 지원됩니다.")
            return False
        
        try:
            config = self.download_urls["imagemagick"]
            
            # 이미 설치되어 있는지 확인
            imagemagick_dir = self.tools_dir / "imagemagick"
            if (imagemagick_dir / "magick.exe").exists():
                print("✅ ImageMagick 이미 설치됨")
                return True
            
            # 다운로드
            if not self.download_file(config["url"], config["filename"], progress_callback):
                return False
            
            # 압축 해제
            archive_path = self.downloads_dir / config["filename"]
            
            if not self.extract_archive(archive_path, imagemagick_dir):
                return False
            
            # 다운로드 파일 정리
            archive_path.unlink()
            
            print("✅ ImageMagick 설치 완료")
            return True
            
        except Exception as e:
            print(f"❌ ImageMagick 설치 실패: {e}")
            return False
    
    def install_korean_fonts(self) -> bool:
        """한글 폰트 설치 (나눔고딕)"""
        try:
            fonts_dir = self.tools_dir / "fonts"
            fonts_dir.mkdir(exist_ok=True)
            
            font_path = fonts_dir / "NanumGothic.ttf"
            if font_path.exists():
                print("✅ 한글 폰트 이미 설치됨")
                return True
            
            print("📥 한글 폰트 다운로드 시작...")
            
            # 여러 다운로드 소스 시도
            font_sources = [
                {
                    "name": "네이버 나눔폰트 (GitHub)",
                    "url": "https://github.com/naver/nanumfont/releases/download/VER2.6/NanumFont_TTF_ALL.zip",
                    "filename": "NanumFont_TTF_ALL.zip",
                    "search_pattern": "NanumGothic*.ttf"
                },
                {
                    "name": "구글 폰트 나눔고딕",
                    "url": "https://fonts.google.com/download?family=Nanum%20Gothic",
                    "filename": "Nanum_Gothic.zip", 
                    "search_pattern": "*Gothic*.ttf"
                }
            ]
            
            for source in font_sources:
                try:
                    print(f"📥 {source['name']}에서 다운로드 시도...")
                    
                    if not self.download_file(source["url"], source["filename"]):
                        print(f"⚠️ {source['name']} 다운로드 실패")
                        continue
                    
                    # 압축 해제
                    archive_path = self.downloads_dir / source["filename"]
                    temp_extract = self.downloads_dir / "temp_fonts"
                    
                    if temp_extract.exists():
                        shutil.rmtree(temp_extract)
                    
                    if not self.extract_archive(archive_path, temp_extract):
                        print(f"⚠️ {source['name']} 압축 해제 실패")
                        archive_path.unlink(missing_ok=True)
                        continue
                    
                    # 폰트 파일 찾기
                    font_found = False
                    for font_file in temp_extract.rglob(source["search_pattern"]):
                        # 나눔고딕 관련 파일 찾기
                        if any(keyword in font_file.name.lower() for keyword in ["nanumgothic", "nanum_gothic", "gothic"]):
                            shutil.copy2(font_file, font_path)
                            font_found = True
                            print(f"✅ 폰트 파일 복사: {font_file.name}")
                            break
                    
                    # 정리
                    shutil.rmtree(temp_extract, ignore_errors=True)
                    archive_path.unlink(missing_ok=True)
                    
                    if font_found and font_path.exists():
                        print("✅ 한글 폰트 설치 완료")
                        return True
                        
                except Exception as e:
                    print(f"⚠️ {source['name']} 설치 실패: {e}")
                    continue
            
            # 모든 소스 실패 시 직접 TTF 파일 다운로드 시도
            print("📥 직접 TTF 파일 다운로드 시도...")
            try:
                # 공개 CDN에서 나눔고딕 직접 다운로드
                direct_url = "https://fonts.gstatic.com/s/nanumgothic/v17/PN_3Rfi-oW3hYwmKDpxS7F_D-dqzpQ.ttf"
                
                response = requests.get(direct_url)
                if response.status_code == 200:
                    with open(font_path, 'wb') as f:
                        f.write(response.content)
                    print("✅ 한글 폰트 직접 다운로드 완료")
                    return True
            except Exception as e:
                print(f"⚠️ 직접 다운로드 실패: {e}")
            
            print("⚠️ 모든 한글 폰트 설치 방법 실패 - 시스템 폰트 사용")
            return False
                
        except Exception as e:
            print(f"❌ 한글 폰트 설치 중 오류: {e}")
            return False
    
    def install_all_tools(self, progress_callback: Optional[Callable] = None) -> dict:
        """모든 필요한 도구들 자동 설치"""
        results = {}
        
        print("🚀 필요한 도구들 자동 설치 시작...")
        
        # FFmpeg 설치
        print("\n1️⃣ FFmpeg 설치 중...")
        results["ffmpeg"] = self.install_ffmpeg(progress_callback)
        
        # ImageMagick 설치
        print("\n2️⃣ ImageMagick 설치 중...")
        results["imagemagick"] = self.install_imagemagick(progress_callback)
        
        # 한글 폰트 설치
        print("\n3️⃣ 한글 폰트 설치 중...")
        results["korean_fonts"] = self.install_korean_fonts()
        
        # 결과 요약
        print("\n📋 설치 결과:")
        for tool, success in results.items():
            status = "✅ 성공" if success else "❌ 실패"
            print(f"  {tool}: {status}")
        
        return results
    
    def check_and_install_missing_tools(self, progress_callback: Optional[Callable] = None) -> dict:
        """누락된 도구들만 확인하고 설치"""
        from .system_tools import system_tools
        
        tools_status = system_tools.get_tools_status()
        results = {}
        
        print("🔍 시스템 도구 상태 확인 중...")
        
        # FFmpeg 확인 및 설치
        if not tools_status["ffmpeg"]["available"]:
            print("❌ FFmpeg 없음 - 자동 설치 시작")
            results["ffmpeg"] = self.install_ffmpeg(progress_callback)
        else:
            print("✅ FFmpeg 사용 가능")
            results["ffmpeg"] = True
        
        # ImageMagick 확인 및 설치
        if not tools_status["imagemagick"]["available"]:
            print("❌ ImageMagick 없음 - 자동 설치 시작")
            results["imagemagick"] = self.install_imagemagick(progress_callback)
        else:
            print("✅ ImageMagick 사용 가능")
            results["imagemagick"] = True
        
        # 한글 폰트 확인 및 설치
        if not tools_status["korean_font"]["available"]:
            print("❌ 한글 폰트 없음 - 자동 설치 시작")
            results["korean_fonts"] = self.install_korean_fonts()
        else:
            print("✅ 한글 폰트 사용 가능")
            results["korean_fonts"] = True
        
        return results

# 전역 자동 설치 관리자
auto_installer = AutoInstaller()