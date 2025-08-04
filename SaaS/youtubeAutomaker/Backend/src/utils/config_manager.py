import json
import os
from pathlib import Path
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class ConfigManager:
    def __init__(self, config_dir: str = "config"):
        self.config_dir = Path(config_dir)
        self.config_dir.mkdir(exist_ok=True)
        
        # Default configuration file paths
        self.settings_file = self.config_dir / "settings.json"
        self.api_keys_file = self.config_dir / "api_keys.json"
        self.paths_file = self.config_dir / "paths.json"
        
        # Initialize with default values
        self._settings = self._load_default_settings()
        self._api_keys = {}
        self._paths = self._load_default_paths()
        
        # Load existing configurations
        self.load_all()
    
    def _load_default_settings(self) -> Dict[str, Any]:
        """기본 설정값들"""
        return {
            "directories": {
                "data": "data",
                "scripts": "scripts", 
                "voice": "voice",
                "images": "img",
                "music": "music",
                "video": "video",
                "assets_music": "assets/music",
                "assets_templates": "assets/templates"
            },
            "google": {
                "client_secret_file": "config/client_secret.json",
                "credentials_file": "config/token.json"
            }
        }
    
    def _load_default_paths(self) -> Dict[str, str]:
        """기본 시스템 경로들 (사용자가 설정해야 함)"""
        return {
            "ffmpeg": "",  # 사용자가 설정
            "imagemagick": "",  # 사용자가 설정  
            "korean_font": "C:/Windows/Fonts/malgun.ttf"  # 기본값
        }
    
    def load_all(self):
        """모든 설정 파일 로드"""
        try:
            self.load_settings()
            self.load_api_keys()
            self.load_paths()
        except Exception as e:
            logger.error(f"설정 로드 중 오류: {e}")
    
    def load_settings(self):
        """일반 설정 로드"""
        if self.settings_file.exists():
            try:
                with open(self.settings_file, 'r', encoding='utf-8') as f:
                    loaded_settings = json.load(f)
                    self._settings.update(loaded_settings)
            except Exception as e:
                logger.error(f"설정 파일 로드 실패: {e}")
    
    def load_api_keys(self):
        """API 키 로드"""
        if self.api_keys_file.exists():
            try:
                with open(self.api_keys_file, 'r', encoding='utf-8') as f:
                    self._api_keys = json.load(f)
            except Exception as e:
                logger.error(f"API 키 파일 로드 실패: {e}")
    
    def load_paths(self):
        """시스템 경로 로드"""
        if self.paths_file.exists():
            try:
                with open(self.paths_file, 'r', encoding='utf-8') as f:
                    loaded_paths = json.load(f)
                    self._paths.update(loaded_paths)
            except Exception as e:
                logger.error(f"경로 파일 로드 실패: {e}")
    
    def save_settings(self):
        """일반 설정 저장"""
        try:
            with open(self.settings_file, 'w', encoding='utf-8') as f:
                json.dump(self._settings, f, indent=2, ensure_ascii=False)
        except Exception as e:
            logger.error(f"설정 저장 실패: {e}")
    
    def save_api_keys(self):
        """API 키 저장"""
        try:
            with open(self.api_keys_file, 'w', encoding='utf-8') as f:
                json.dump(self._api_keys, f, indent=2)
        except Exception as e:
            logger.error(f"API 키 저장 실패: {e}")
    
    def save_paths(self):
        """시스템 경로 저장"""
        try:
            with open(self.paths_file, 'w', encoding='utf-8') as f:
                json.dump(self._paths, f, indent=2, ensure_ascii=False)
        except Exception as e:
            logger.error(f"경로 저장 실패: {e}")
    
    # Getter methods
    def get_directory(self, name: str) -> str:
        """디렉토리 경로 반환"""
        return self._settings.get("directories", {}).get(name, "")
    
    def get_api_key(self, service: str) -> Optional[str]:
        """API 키 반환"""
        return self._api_keys.get(service)
    
    def get_path(self, tool: str) -> str:
        """시스템 도구 경로 반환"""
        return self._paths.get(tool, "")
    
    def get_google_config(self, key: str) -> str:
        """Google 설정 반환"""
        return self._settings.get("google", {}).get(key, "")
    
    # Setter methods
    def set_api_key(self, service: str, key: str):
        """API 키 설정"""
        self._api_keys[service] = key
        self.save_api_keys()
    
    def set_path(self, tool: str, path: str):
        """시스템 도구 경로 설정"""
        self._paths[tool] = path
        self.save_paths()
    
    def set_google_config(self, key: str, value: str):
        """Google 설정"""
        if "google" not in self._settings:
            self._settings["google"] = {}
        self._settings["google"][key] = value
        self.save_settings()
    
    # Validation methods
    def validate_configuration(self) -> Dict[str, list]:
        """설정 유효성 검사"""
        issues = {
            "missing_api_keys": [],
            "missing_paths": [],
            "invalid_paths": []
        }
        
        # 필수 API 키 확인 (Unsplash만 필요)
        required_apis = ["unsplash"]
        for api in required_apis:
            if not self.get_api_key(api):
                issues["missing_api_keys"].append(api)
        
        # 시스템 경로는 자동으로 관리되므로 검증하지 않음
        
        return issues
    
    def is_ready(self) -> bool:
        """앱 실행 준비 상태 확인"""
        issues = self.validate_configuration()
        return not any(issues.values())
    
    def get_setup_status(self) -> Dict[str, Any]:
        """설정 상태 반환"""
        issues = self.validate_configuration()
        return {
            "ready": self.is_ready(),
            "issues": issues,
            "configured_apis": list(self._api_keys.keys()),
            "configured_paths": {k: v for k, v in self._paths.items() if v}
        }

# 전역 설정 관리자 인스턴스
config_manager = ConfigManager()