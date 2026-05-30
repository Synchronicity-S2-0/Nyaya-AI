const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function analyzeText(text: string, targetLanguage: string = "en", draftType: string = "reply") {
  const response = await fetch(`${API_BASE_URL}/api/v1/documents/analyze-text`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      target_language: targetLanguage,
      draft_type: draftType
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to analyze text: ${response.statusText}`);
  }

  return response.json();
}

export async function analyzeCaseText(
  caseId: string, 
  userId: string, 
  text: string, 
  documentId?: string,
  targetLanguage: string = "en", 
  draftType: string = "reply"
) {
  const response = await fetch(`${API_BASE_URL}/api/v1/cases/${caseId}/documents/analyze-text`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      document_id: documentId || null,
      file_url: null,
      file_name: null,
      text,
      target_language: targetLanguage,
      draft_type: draftType
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to analyze case text: ${response.statusText}`);
  }

  return response.json();
}

export async function analyzeCaseFile(
  caseId: string,
  userId: string,
  file: File,
  fileUrl: string,
  documentId?: string,
  targetLanguage: string = "en",
  draftType: string = "reply"
) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("user_id", userId);
  if (documentId) formData.append("document_id", documentId);
  formData.append("file_url", fileUrl);
  formData.append("target_language", targetLanguage);
  formData.append("draft_type", draftType);

  const response = await fetch(`${API_BASE_URL}/api/v1/cases/${caseId}/documents/analyze`, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Failed to analyze case file: ${response.statusText}`);
  }

  return response.json();
}

export async function sendCaseMessage(
  caseId: string,
  userId: string,
  message: string,
  documents: any[] = [],
  messages: any[] = [],
  events: any[] = []
) {
  const response = await fetch(`${API_BASE_URL}/api/v1/cases/${caseId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      message,
      documents,
      messages,
      events
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to send case message: ${response.statusText}`);
  }

  return response.json();
}
