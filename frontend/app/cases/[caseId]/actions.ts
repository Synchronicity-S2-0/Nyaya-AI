"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveDocumentAnalysis(caseId: string, userId: string, result: any) {
  // result is the JSON response from FastAPI
  // which contains: { case_id, document_id, analysis, suggested_document, suggested_events, case_update }
  
  if (!result || !result.suggested_document) {
    throw new Error("Invalid analysis result");
  }

  const { suggested_document, suggested_events, case_update, analysis } = result;

  // Save the document
  const newDocument = await prisma.caseDocument.create({
    data: {
      caseId,
      userId,
      sourceType: suggested_document.source_type,
      fileUrl: suggested_document.file_url,
      fileName: suggested_document.file_name,
      extractedText: suggested_document.extracted_text,
      analysisJson: analysis, // save full analysis for UI rendering
      documentType: suggested_document.document_type || "unknown"
    }
  });

  // Save events
  if (suggested_events && suggested_events.length > 0) {
    for (const event of suggested_events) {
      await prisma.caseEvent.create({
        data: {
          caseId,
          userId,
          eventType: event.event_type,
          summary: event.summary,
          metadataJson: event.metadata_json || {}
        }
      });
    }
  }

  // Update Case
  if (case_update) {
    await prisma.case.update({
      where: { id: caseId },
      data: {
        title: case_update.title || undefined,
        caseType: case_update.case_type || undefined,
        latestUrgency: case_update.latest_urgency || undefined,
        status: case_update.status || undefined,
      }
    });
  }

  revalidatePath(`/cases/${caseId}`);
  return { success: true, document: newDocument };
}

export async function saveChatInteraction(caseId: string, userId: string, result: any) {
  // result: { case_id, user_message, assistant_message, suggested_events }

  if (!result || !result.user_message || !result.assistant_message) {
    throw new Error("Invalid chat result");
  }

  // Save user message
  await prisma.caseMessage.create({
    data: {
      caseId,
      userId,
      role: "user",
      message: result.user_message.message,
    }
  });

  // Save assistant message
  await prisma.caseMessage.create({
    data: {
      caseId,
      userId,
      role: "assistant",
      message: result.assistant_message.message,
    }
  });

  // Save events
  if (result.suggested_events && result.suggested_events.length > 0) {
    for (const event of result.suggested_events) {
      await prisma.caseEvent.create({
        data: {
          caseId,
          userId,
          eventType: event.event_type,
          summary: event.summary,
          metadataJson: event.metadata_json || {}
        }
      });
    }
  }

  revalidatePath(`/cases/${caseId}`);
  return { success: true };
}
