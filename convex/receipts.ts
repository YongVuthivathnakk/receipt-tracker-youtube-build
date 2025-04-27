import { argv, resourceUsage, throwDeprecation } from "process";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { receiveMessageOnPort } from "worker_threads";

// function to generate a Convex uplaod URL for the client

export const generateUploadURL = mutation({
  args: {},
  handler: async (ctx) => {
    // Generate a URL that the client can use to upload a file
    return await ctx.storage.generateUploadUrl();
  },
});

export const storeReceipt = mutation({
  args: {
    userId: v.string(),
    fileId: v.id("_storage"),
    fileName: v.string(),
    size: v.number(),
    mimeType: v.string(),
  },

  handler: async (ctx, args) => {
    // Save the receipt to the database
    const receiptId = await ctx.db.insert("receipts", {
      userId: args.userId,
      fileName: args.fileName,
      fileId: args.fileId,
      uploadedAt: Date.now(),
      size: args.size,
      mimeType: args.mimeType,
      status: "pending",
      // Initialize extracted data field as null
      merchantName: undefined,
      merchantAddress: undefined,
      merchantContact: undefined,
      transactionDate: undefined,
      transactionAmount: undefined,
      currency: undefined,
      items: [],
    });
    return receiptId;
  },
});

// function to get all receipt
export const getReceipts = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Only return receipts for the authenticated user
    return await ctx.db
      .query("receipts")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .order("desc")
      .collect();
  },
});

// function to get a single receipt by id
export const getReceiptById = query({
  args: {
    id: v.id("receipts"),
  },
  handler: async (ctx, args) => {
    // Get the receipt
    const receipt = await ctx.db.get(args.id);
    // Verify user has access to this receipt
    if (receipt) {
      const identify = await ctx.auth.getUserIdentity();
      if (!identify) {
        throw new Error("Not authenticated");
      }
      const userId = identify.subject;
      if (receipt.userId) {
        throw new Error("Not authorized to access this receipt");
      }
    }
    return receipt;
  },
});

// Generate a URL to download a receipt file
export const getReceiptDownloadURL = query({
  args: {
    fileId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    // Get temporary URL that can be used to download the file
    return await ctx.storage.getUrl(args.fileId);
  },
});

// Update the status of a receipt
export const updatReceiptStatus = mutation({
  args: {
    id: v.id("receipts"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify user has access to receipt
    const receipt = await ctx.db.get(args.id);
    if (!receipt) {
      throw new Error("Receipt not found");
    }

    const identify = await ctx.auth.getUserIdentity();
    if (!identify) {
      throw new Error("Not authenticated");
    }

    const userId = identify.subject;
    if (receipt.userId !== userId) {
      throw new Error("Not authorized to update this receipt.");
    }

    await ctx.db.patch(args.id, {
      status: args.status,
    });

    return true;
  },
});

// Delete a receipt and its file

export const deleteReceipt = mutation({
  args: {
    id: v.id("receipts"),
  },
  handler: async (ctx, args) => {
    const receipt = await ctx.db.get(args.id);
    if (!receipt) {
      throw new Error("Receipt not found");
    }
    // Verify user has access to this receipt
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;
    if (receipt.userId !== userId) {
      throw new Error("Not authorized to delete this receipt");
    }

    // Delete the file from storage
    await ctx.storage.delete(receipt.fileId);

    // Delete the receipt record
    await ctx.db.delete(args.id);

    return true;
  },
});


// Update a receipt with extraced data
export const updateReceiptWitExtractedData = mutation({
  args: {
    id: v.id("receipts"),
    fileDisplayName: v.string(),
    merchantName: v.string(),
    merchantAddress: v.string(),
    merchantContact:v.string(),
    transactionDate: v.string(),
    transactionAmount: v.string(),
    currency: v.string(),
    receiptSummary: v.string(),
    items: v.array(
      v.object({
        name: v.string(),
        quantity: v.number(),
        unitPrice: v.number(),
        totalPrice: v.number(),
      }),
    ),
  },

  handler: async (ctx, args) => {
    // Verify the receipt exists
    const receipt = await ctx.db.get(args.id);
    if (!receipt) {
        throw new Error("Receipt not found");
    }
    
    // Update the receipt with the extracted data
    await ctx.db.patch(args.id, {
        fileDisplayName: args.fileDisplayName,
        merchantName: args.merchantName,
        merchantAddress: args.merchantAddress,
        merchantContact: args.merchantContact,
        transactionDate: args.transactionDate,
        transactionAmount: args.transactionAmount,
        currency: args.currency,
        receiptSummary: args.receiptSummary,
        items: args.items,
        status: "processed", // Mark as processed now that we have extracted data
    });
    
    return {
        userId: receipt.userId,
    };
  },
});