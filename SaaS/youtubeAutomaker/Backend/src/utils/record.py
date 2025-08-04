import logging
import os
from dotenv import load_dotenv

from fastapi import HTTPException

from src.database import schemas
import src.utils.templates.template1.generate_video as template1
import src.utils.templates.template2.generate_video as template2


logging.basicConfig(level=logging.INFO)
load_dotenv()

def movieExecute(template: schemas.TemplateData):
    try:
        if template.template_option == "template1":
            template1.generate_video(template)
        elif template.template_option == "template2":
            template2.generate_video(template)
        else:
            template1.generate_video(template)
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        logging.error(f"비디오 생성 에러 발생: {e}")
        raise

