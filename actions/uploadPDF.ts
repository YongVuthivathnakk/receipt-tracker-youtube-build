"use server"

import { api } from "@/convex/_generated/api";
import convex from "@/lib/convexClient";
import { currentUser } from "@clerk/nextjs/server";
import { getFunctionAddress } from "convex/server";
import { getFileDownloadUrl } from "./getFileDownloadUrl";
import { inngest } from "@/inngest/client";
import Events from "@/inngest/agent/constant";

/**
 * Server action to upload a PDF file to Convex storage
*/

export async function uploadPDF(formData: FormData) {
  const user = await currentUser();

  if(!user) {
    return { success: false, error: "Not Aauthenticated"};
  }

  try {
    // Get the file file from the form data
    const file = formData.get("file") as File;
    if(!file) {
      return {success: false, error: "No file provided "};
    }

    // Validate file type
    if(
      !file.type.includes("pdf") &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      return { success: false, error: "Only PDF files are allowed"};
    }

    // Get upload URL form Convex
    const uploadUrl = await  convex.mutation(api.receipts.generateUploadURL, {});

    // Convert file to arrayBuffer for fetch API 
    const arrayBuffer = await file.arrayBuffer();

    // upload the file to the Convex storage 
    const uploadRespone = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Content-Type": file.type,
      },
      body: new Uint8Array(arrayBuffer),
    });

    if(!uploadRespone.ok) {
      throw new Error(`Failed to upload file: ${uploadRespone.statusText}`);
    }

    // Get storage ID form response
    const { storageId } = await uploadRespone.json();

    // Add receipt to the database
    const receiptId = await convex.mutation(api.receipts.storeReceipt, {
      userId: user.id,
      fileId: storageId,
      fileName: file.name,
      size: file.size,
      mimeType: file.type,
    });

    // Generate file URL
    const fileUrl = await getFileDownloadUrl(storageId);

    // TODO: Trigger inngest agent flow...
    
    await inngest.send({
      name: Events.EXTRACT_DATA_FROM_PDF_AND_SAVE_TO_DATABASE,
      data: {
        url: fileUrl.downloadUrl,
        receiptId, 
      }
    })

    return {
      success: true,
      data: {
        receiptId,
        fileName: file.name,
      }
    }

  } catch (error) {
    console.log("Server action upload error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred.",
    }
  }
}