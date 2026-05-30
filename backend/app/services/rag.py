import math
import re
from collections import Counter

from app.models.schemas import ClassificationResult, ExtractionResult, KnowledgeSnippet
from app.services.legal_knowledge import LEGAL_KNOWLEDGE


class RAGService:
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

        snippets: list[KnowledgeSnippet] = []
        for item in LEGAL_KNOWLEDGE:
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
