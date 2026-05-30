from io import BytesIO

from fastapi import UploadFile

from app.models.schemas import ParsedDocument
from app.services.ocr import OCRService


class DocumentParser:
    def __init__(self, ocr_service: OCRService):
        self.ocr_service = ocr_service

    async def parse_upload(self, upload: UploadFile) -> ParsedDocument:
        content = await upload.read()
        content_type = upload.content_type or "application/octet-stream"
        filename = upload.filename or "uploaded-document"

        if content_type.startswith("text/") or filename.lower().endswith(".txt"):
            text = content.decode("utf-8", errors="ignore")
            return ParsedDocument(source_type="text", text=text)

        if content_type == "application/pdf" or filename.lower().endswith(".pdf"):
            return self._parse_pdf(content)

        if content_type.startswith("image/"):
            text, warnings = self.ocr_service.extract_image_text(content)
            return ParsedDocument(source_type="image", text=text, warnings=warnings)

        text = content.decode("utf-8", errors="ignore")
        warning = "Unknown file type; attempted plain text decoding."
        return ParsedDocument(source_type="unknown", text=text, warnings=[warning])

    def parse_text(self, text: str) -> ParsedDocument:
        return ParsedDocument(source_type="text", text=text)

    def _parse_pdf(self, content: bytes) -> ParsedDocument:
        warnings: list[str] = []
        text_parts: list[str] = []
        page_count = 0

        try:
            from pypdf import PdfReader

            reader = PdfReader(BytesIO(content))
            page_count = len(reader.pages)
            for page in reader.pages:
                text_parts.append(page.extract_text() or "")
        except Exception as exc:  # pragma: no cover - defensive for malformed PDFs
            warnings.append(f"PDF text extraction failed: {exc}")

        text = "\n".join(part.strip() for part in text_parts if part.strip())
        if not text:
            warnings.append(
                "No embedded PDF text found. Enable PDF OCR or upload images/text for scanned documents."
            )
        return ParsedDocument(
            source_type="pdf",
            text=text,
            page_count=page_count or None,
            warnings=warnings,
        )
