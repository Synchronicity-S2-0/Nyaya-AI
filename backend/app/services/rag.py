import math
import re
from collections import Counter
from functools import lru_cache
from pathlib import Path

from app.core.config import get_settings
from app.models.schemas import ClassificationResult, ExtractionResult, KnowledgeSnippet
from app.services.legal_knowledge import LEGAL_KNOWLEDGE


class RAGService:
    def __init__(self) -> None:
        self.last_source = "local_txt"

    def retrieve(
        self,
        text: str,
        classification: ClassificationResult,
        extraction: ExtractionResult,
        limit: int = 3,
    ) -> list[KnowledgeSnippet]:
        query_terms = self._tokens(
            " ".join(
                [
                    text[:1500],
                    classification.document_type,
                    " ".join(extraction.legal_sections),
                    " ".join(extraction.risks),
                ]
            )
        )
        query_counter = Counter(query_terms)

        self.last_source = knowledge_source()
        snippets: list[KnowledgeSnippet] = []
        for item in load_local_knowledge():
            doc_text = f"{item['title']} {item['content']} {' '.join(item['tags'])}"
            doc_counter = Counter(self._tokens(doc_text))
            score = self._cosine(query_counter, doc_counter)
            if classification.document_type in item["tags"]:
                score += 0.35
            snippets.append(
                KnowledgeSnippet(
                    title=item["title"],
                    content=item["content"],
                    tags=item["tags"],
                    score=round(score, 3),
                )
            )

        return sorted(snippets, key=lambda snippet: snippet.score, reverse=True)[:limit]

    def _tokens(self, text: str) -> list[str]:
        return re.findall(r"[a-zA-Z][a-zA-Z0-9_]{2,}", text.lower())

    def _cosine(self, a: Counter, b: Counter) -> float:
        if not a or not b:
            return 0.0
        common = set(a) & set(b)
        numerator = sum(a[token] * b[token] for token in common)
        a_norm = math.sqrt(sum(value * value for value in a.values()))
        b_norm = math.sqrt(sum(value * value for value in b.values()))
        if not a_norm or not b_norm:
            return 0.0
        return numerator / (a_norm * b_norm)


@lru_cache
def load_local_knowledge() -> list[dict[str, object]]:
    settings = get_settings()
    knowledge_path = Path(settings.local_knowledge_path)
    if not knowledge_path.is_absolute():
        knowledge_path = Path.cwd() / knowledge_path

    if not knowledge_path.exists():
        return LEGAL_KNOWLEDGE

    parsed = _parse_knowledge_txt(knowledge_path.read_text(encoding="utf-8"))
    return parsed or LEGAL_KNOWLEDGE


def knowledge_source() -> str:
    settings = get_settings()
    knowledge_path = Path(settings.local_knowledge_path)
    if not knowledge_path.is_absolute():
        knowledge_path = Path.cwd() / knowledge_path
    return "local_txt" if knowledge_path.exists() else "fallback:python_list"


def _parse_knowledge_txt(raw: str) -> list[dict[str, object]]:
    items: list[dict[str, object]] = []
    blocks = [block.strip() for block in raw.split("---") if block.strip()]

    for block in blocks:
        lines = [line.rstrip() for line in block.splitlines()]
        title = ""
        tags: list[str] = []
        content_lines: list[str] = []
        reading_content = False

        for line in lines:
            stripped = line.strip()
            if not stripped or stripped.startswith("#"):
                continue
            if reading_content:
                content_lines.append(stripped)
                continue
            if stripped.lower().startswith("title:"):
                title = stripped.split(":", 1)[1].strip()
            elif stripped.lower().startswith("tags:"):
                tags = [
                    tag.strip()
                    for tag in stripped.split(":", 1)[1].split(",")
                    if tag.strip()
                ]
            elif stripped.lower() == "content:":
                reading_content = True

        content = " ".join(content_lines).strip()
        if title and content:
            items.append({"title": title, "content": content, "tags": tags})

    return items
