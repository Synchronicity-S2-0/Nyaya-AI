import httpx
from app.core.config import get_settings
from app.models.schemas import TranslationResult


class TranslationAgent:
    LANGUAGE_NAMES = {
        "en": "English",
        "hi": "Hindi",
        "bn": "Bengali",
        "ta": "Tamil",
    }

    PHRASEBOOK = {
        "hi": {
            "This appears to be": "यह दस्तावेज़ संभवतः है",
            "Save a clean copy of the document and note the date/time of receipt.": "दस्तावेज़ की साफ प्रति सुरक्षित रखें और प्राप्ति की तारीख/समय नोट करें।",
            "Verify names, dates, deadlines, addresses, and legal sections from the original.": "मूल दस्तावेज़ से नाम, तारीख, समयसीमा, पता और कानूनी धाराएँ जांचें।",
        },
        "bn": {
            "This appears to be": "এই নথিটি সম্ভবত",
            "Save a clean copy of the document and note the date/time of receipt.": "নথির একটি পরিষ্কার কপি সংরক্ষণ করুন এবং প্রাপ্তির তারিখ/সময় লিখে রাখুন।",
            "Verify names, dates, deadlines, addresses, and legal sections from the original.": "মূল নথি থেকে নাম, তারিখ, সময়সীমা, ঠিকানা এবং আইনি ধারা যাচাই করুন।",
        },
        "ta": {
            "This appears to be": "இந்த ஆவணம் இருக்கக்கூடும்",
            "Save a clean copy of the document and note the date/time of receipt.": "ஆவணத்தின் தெளிவான நகலை சேமித்து, பெற்ற தேதி/நேரத்தை பதிவு செய்யவும்.",
            "Verify names, dates, deadlines, addresses, and legal sections from the original.": "அசல் ஆவணத்தில் இருந்து பெயர்கள், தேதிகள், காலக்கெடு, முகவரி மற்றும் சட்டப் பிரிவுகளை சரிபார்க்கவும்.",
        },
    }

    def translate(self, language: str, summary: str, next_steps: list[str]) -> TranslationResult | None:
        normalized = language.lower()
        if normalized == "en":
            return None

        settings = get_settings()
        api_key = settings.sarvam_api_key

        if api_key:
            try:
                sarvam_lang_map = {
                    "hi": "hi-IN",
                    "bn": "bn-IN",
                    "ta": "ta-IN",
                }
                target_code = sarvam_lang_map.get(normalized)
                if target_code:
                    translated_summary = self._call_sarvam_api(summary, "en-IN", target_code, api_key)
                    translated_steps = []
                    for step in next_steps:
                        translated_steps.append(self._call_sarvam_api(step, "en-IN", target_code, api_key))
                    
                    return TranslationResult(
                        language=self.LANGUAGE_NAMES.get(normalized, language),
                        mode="sarvam_api",
                        translated_summary=translated_summary,
                        translated_next_steps=translated_steps,
                    )
            except Exception as e:
                # Log the error internally and continue to the fallback phrasebook
                import logging
                logging.getLogger("uvicorn.error").warning(
                    f"Sarvam API translation failed, falling back to local phrasebook: {e}"
                )

        # Fallback to local phrasebook
        phrasebook = self.PHRASEBOOK.get(normalized)
        if not phrasebook:
            return TranslationResult(
                language=language,
                mode="not_available",
                translated_summary=summary,
                translated_next_steps=next_steps,
            )

        translated_summary = summary
        for source, target in phrasebook.items():
            translated_summary = translated_summary.replace(source, target)

        translated_steps = [phrasebook.get(step, step) for step in next_steps]
        return TranslationResult(
            language=self.LANGUAGE_NAMES.get(normalized, language),
            mode="demo_phrasebook",
            translated_summary=translated_summary,
            translated_next_steps=translated_steps,
        )

    def _call_sarvam_api(self, text: str, source: str, target: str, api_key: str) -> str:
        url = "https://api.sarvam.ai/translate"
        headers = {
            "api-subscription-key": api_key,
            "Content-Type": "application/json"
        }
        payload = {
            "input": text,
            "source_language_code": source,
            "target_language_code": target,
            "mode": "formal"
        }
        with httpx.Client() as client:
            resp = client.post(url, json=payload, headers=headers, timeout=5.0)
            if resp.status_code == 200:
                return resp.json().get("translated_text", text)
            else:
                raise ValueError(f"Sarvam API returned status code {resp.status_code}: {resp.text}")
