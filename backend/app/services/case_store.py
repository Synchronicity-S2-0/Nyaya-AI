from __future__ import annotations

from datetime import UTC, datetime
from uuid import uuid4

import httpx

from app.core.config import Settings


def utc_now() -> str:
    return datetime.now(UTC).isoformat()


class CaseNotFoundError(Exception):
    pass


class CaseAccessError(Exception):
    pass


class CaseStore:
    def create_case(self, user_id: str, title: str | None) -> dict:
        raise NotImplementedError

    def list_cases(self, user_id: str) -> list[dict]:
        raise NotImplementedError

    def get_case(self, case_id: str, user_id: str) -> dict:
        raise NotImplementedError

    def get_case_detail(self, case_id: str, user_id: str) -> dict:
        raise NotImplementedError

    def update_case_after_analysis(self, case_id: str, document_type: str, urgency: str) -> dict:
        raise NotImplementedError

    def add_document(
        self,
        case_id: str,
        user_id: str,
        source_type: str,
        extracted_text: str,
        analysis_json: dict,
        document_type: str,
        file_name: str | None = None,
        file_url: str | None = None,
    ) -> dict:
        raise NotImplementedError

    def add_message(self, case_id: str, user_id: str, role: str, message: str) -> dict:
        raise NotImplementedError

    def add_event(
        self,
        case_id: str,
        user_id: str,
        event_type: str,
        summary: str,
        metadata_json: dict | None = None,
    ) -> dict:
        raise NotImplementedError

    def upload_file(self, case_id: str, file_name: str, content: bytes, content_type: str) -> str | None:
        raise NotImplementedError


class InMemoryCaseStore(CaseStore):
    def __init__(self) -> None:
        self.cases: dict[str, dict] = {}
        self.documents: dict[str, dict] = {}
        self.messages: dict[str, dict] = {}
        self.events: dict[str, dict] = {}

    def create_case(self, user_id: str, title: str | None) -> dict:
        now = utc_now()
        case = {
            "id": str(uuid4()),
            "user_id": user_id,
            "title": title or "Untitled case",
            "case_type": None,
            "status": "open",
            "latest_urgency": None,
            "created_at": now,
            "updated_at": now,
        }
        self.cases[case["id"]] = case
        return case

    def list_cases(self, user_id: str) -> list[dict]:
        cases = [case for case in self.cases.values() if case["user_id"] == user_id]
        return sorted(cases, key=lambda item: item["updated_at"], reverse=True)

    def get_case(self, case_id: str, user_id: str) -> dict:
        case = self.cases.get(case_id)
        if not case:
            raise CaseNotFoundError("Case not found.")
        if case["user_id"] != user_id:
            raise CaseAccessError("Case does not belong to this user.")
        return case

    def get_case_detail(self, case_id: str, user_id: str) -> dict:
        case = self.get_case(case_id, user_id)
        documents = [doc for doc in self.documents.values() if doc["case_id"] == case_id]
        messages = [msg for msg in self.messages.values() if msg["case_id"] == case_id]
        events = [event for event in self.events.values() if event["case_id"] == case_id]
        return {
            "case": case,
            "documents": sorted(documents, key=lambda item: item["created_at"]),
            "messages": sorted(messages, key=lambda item: item["created_at"]),
            "events": sorted(events, key=lambda item: item["created_at"]),
        }

    def update_case_after_analysis(self, case_id: str, document_type: str, urgency: str) -> dict:
        case = self.cases[case_id]
        case["case_type"] = document_type if not case.get("case_type") else case["case_type"]
        case["latest_urgency"] = urgency
        case["updated_at"] = utc_now()
        return case

    def add_document(
        self,
        case_id: str,
        user_id: str,
        source_type: str,
        extracted_text: str,
        analysis_json: dict,
        document_type: str,
        file_name: str | None = None,
        file_url: str | None = None,
    ) -> dict:
        document = {
            "id": str(uuid4()),
            "case_id": case_id,
            "user_id": user_id,
            "source_type": source_type,
            "file_url": file_url,
            "file_name": file_name,
            "extracted_text": extracted_text,
            "analysis_json": analysis_json,
            "document_type": document_type,
            "created_at": utc_now(),
        }
        self.documents[document["id"]] = document
        return document

    def add_message(self, case_id: str, user_id: str, role: str, message: str) -> dict:
        record = {
            "id": str(uuid4()),
            "case_id": case_id,
            "user_id": user_id,
            "role": role,
            "message": message,
            "created_at": utc_now(),
        }
        self.messages[record["id"]] = record
        return record

    def add_event(
        self,
        case_id: str,
        user_id: str,
        event_type: str,
        summary: str,
        metadata_json: dict | None = None,
    ) -> dict:
        event = {
            "id": str(uuid4()),
            "case_id": case_id,
            "user_id": user_id,
            "event_type": event_type,
            "summary": summary,
            "metadata_json": metadata_json or {},
            "created_at": utc_now(),
        }
        self.events[event["id"]] = event
        return event

    def upload_file(self, case_id: str, file_name: str, content: bytes, content_type: str) -> str | None:
        return None


class SupabaseCaseStore(CaseStore):
    def __init__(self, settings: Settings) -> None:
        if not settings.supabase_url or not settings.supabase_service_role_key:
            raise ValueError("Supabase URL and service role key are required.")
        self.base_url = settings.supabase_url.rstrip("/")
        self.bucket = settings.supabase_storage_bucket
        self.headers = {
            "apikey": settings.supabase_service_role_key,
            "Authorization": f"Bearer {settings.supabase_service_role_key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        }

    def create_case(self, user_id: str, title: str | None) -> dict:
        now = utc_now()
        return self._insert(
            "cases",
            {
                "user_id": user_id,
                "title": title or "Untitled case",
                "case_type": None,
                "status": "open",
                "latest_urgency": None,
                "created_at": now,
                "updated_at": now,
            },
        )

    def list_cases(self, user_id: str) -> list[dict]:
        return self._request(
            "GET",
            f"/rest/v1/cases?user_id=eq.{user_id}&order=updated_at.desc",
        )

    def get_case(self, case_id: str, user_id: str) -> dict:
        rows = self._request(
            "GET",
            f"/rest/v1/cases?id=eq.{case_id}&select=*",
        )
        if not rows:
            raise CaseNotFoundError("Case not found.")
        case = rows[0]
        if case["user_id"] != user_id:
            raise CaseAccessError("Case does not belong to this user.")
        return case

    def get_case_detail(self, case_id: str, user_id: str) -> dict:
        case = self.get_case(case_id, user_id)
        documents = self._request(
            "GET",
            f"/rest/v1/case_documents?case_id=eq.{case_id}&order=created_at.asc",
        )
        messages = self._request(
            "GET",
            f"/rest/v1/case_messages?case_id=eq.{case_id}&order=created_at.asc",
        )
        events = self._request(
            "GET",
            f"/rest/v1/case_events?case_id=eq.{case_id}&order=created_at.asc",
        )
        return {"case": case, "documents": documents, "messages": messages, "events": events}

    def update_case_after_analysis(self, case_id: str, document_type: str, urgency: str) -> dict:
        current = self._request("GET", f"/rest/v1/cases?id=eq.{case_id}&select=case_type")
        case_type = current[0].get("case_type") if current else None
        rows = self._request(
            "PATCH",
            f"/rest/v1/cases?id=eq.{case_id}",
            {
                "case_type": case_type or document_type,
                "latest_urgency": urgency,
                "updated_at": utc_now(),
            },
        )
        return rows[0]

    def add_document(
        self,
        case_id: str,
        user_id: str,
        source_type: str,
        extracted_text: str,
        analysis_json: dict,
        document_type: str,
        file_name: str | None = None,
        file_url: str | None = None,
    ) -> dict:
        return self._insert(
            "case_documents",
            {
                "case_id": case_id,
                "user_id": user_id,
                "source_type": source_type,
                "file_url": file_url,
                "file_name": file_name,
                "extracted_text": extracted_text,
                "analysis_json": analysis_json,
                "document_type": document_type,
                "created_at": utc_now(),
            },
        )

    def add_message(self, case_id: str, user_id: str, role: str, message: str) -> dict:
        return self._insert(
            "case_messages",
            {
                "case_id": case_id,
                "user_id": user_id,
                "role": role,
                "message": message,
                "created_at": utc_now(),
            },
        )

    def add_event(
        self,
        case_id: str,
        user_id: str,
        event_type: str,
        summary: str,
        metadata_json: dict | None = None,
    ) -> dict:
        return self._insert(
            "case_events",
            {
                "case_id": case_id,
                "user_id": user_id,
                "event_type": event_type,
                "summary": summary,
                "metadata_json": metadata_json or {},
                "created_at": utc_now(),
            },
        )

    def upload_file(self, case_id: str, file_name: str, content: bytes, content_type: str) -> str | None:
        safe_name = file_name.replace("/", "_").replace("\\", "_")
        object_path = f"{case_id}/{uuid4()}-{safe_name}"
        headers = {
            "apikey": self.headers["apikey"],
            "Authorization": self.headers["Authorization"],
            "Content-Type": content_type,
            "x-upsert": "false",
        }
        with httpx.Client(timeout=20.0) as client:
            response = client.post(
                f"{self.base_url}/storage/v1/object/{self.bucket}/{object_path}",
                content=content,
                headers=headers,
            )
        response.raise_for_status()
        return f"{self.base_url}/storage/v1/object/public/{self.bucket}/{object_path}"

    def _insert(self, table: str, payload: dict) -> dict:
        rows = self._request("POST", f"/rest/v1/{table}", payload)
        return rows[0]

    def _request(self, method: str, path: str, payload: dict | None = None) -> list[dict]:
        with httpx.Client(timeout=15.0) as client:
            response = client.request(
                method,
                f"{self.base_url}{path}",
                headers=self.headers,
                json=payload,
            )
        response.raise_for_status()
        return response.json()
