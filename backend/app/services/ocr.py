from app.core.config import Settings


class OCRService:
    def __init__(self, settings: Settings):
        self.settings = settings

    def extract_image_text(self, content: bytes) -> tuple[str, list[str]]:
        if not self.settings.enable_image_ocr:
            return "", ["Image OCR is disabled by configuration."]

        try:
            from io import BytesIO

            from PIL import Image
            import pytesseract

            if self.settings.tesseract_cmd:
                pytesseract.pytesseract.tesseract_cmd = self.settings.tesseract_cmd

            image = Image.open(BytesIO(content))
            return pytesseract.image_to_string(image).strip(), []
        except Exception as exc:
            return "", [
                "Image OCR could not run locally. Install Tesseract OCR and set TESSERACT_CMD if needed.",
                f"OCR error: {exc}",
            ]
