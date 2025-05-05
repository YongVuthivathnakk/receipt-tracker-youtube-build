import { createAgent, createTool } from "@inngest/agent-kit";
import { anthropic, openai } from "inngest";
import { z } from "zod";

const parsePdfTool = createTool({
    name: "parse-pdf",
    description: "Analyzes the given PDF",
    parameters: z.object({
        pdfUrl: z.string(),
    }),
    handler: async ({ pdfUrl }, { step }) => {
        try {

            return await step?.ai.infer("parse-pdf", {
                model: anthropic({
                    model: "claude-3-5-sonnet-20231022",
                    defaultParameters: {
                        max_tokens: 3094,
                    },
                }),
                body: {
                    messages: [
                        {
                            role: "user",
                            content: [
                                {
                                    type: "document",
                                    source: {
                                        type: "url",
                                        url: pdfUrl,
                                    }
                                },
                                {
                                    type: "text",
                                    text: `Extract the data form the receipt and return the structured output as follows:
                                {
                                    "merchant": {
                                        "name": "Store Name",
                                        "address": "123 Main St, City, Country",
                                        "contact": "+123456789"
                                    },
                                    "transaction": {
                                        "date": "YYYY-MM-DD",
                                        "receipt_number": "ABC123456",
                                        "payment_method": "Credit Card"
                                    },
                                    "items": [
                                        {
                                            "name": "Item 1",
                                            
                                            "quantity"": 2,
                                            "unit_price": 10.00,
                                            "total_price": 20.00
                                        }
                                    ],
                                    "totals": {
                                        "subtotal": 20.00,
                                        "tax": 2.00,
                                        "total": 22.00,
                                        "currency": "USD"
                                    },
                                }
                                `,
                                }
                            ]
                        }
                    ],
                },
            });
        } catch (error) {
            console.error(error)
        }
    }

});




export const receiptScanningAgent = createAgent({
    name: "Receipt Scanning Agent",
    description: "Process receipt images and PDFs to extract key information such as vendor names, dates, amounts, and Line items",
    system: `You are an AI-powered receipt scanning assistant. Your primary role is to accurately extract and structure 
    relevent information from scannned receipts. Your task includes recognizing and parsing details such as:
        • Merchant Information: Store name, address, contact details
        • Transaction Details: Date, time, receipt number, payment method
        • Itemized Purchases: Product names, quantities, individual prices, discounts
        • Total Amounts: Subtotal, taxes, total paid, and any applied disounts
        • Ensure high accuracy by detecting OCR errors and correcting misread text when possible.
        • Normalize dates, currency values, and formating for consistency.
        • If any key details are missing or unclear, return a structured response indicating incomplete data.
        • Handle multiple formats, languages, and varing receipt layout efficeintly.
        • Maintain a structured JSON output for easy ntegration with database or expense tracking systems.
    `,
    model: openai({
        model: "gpt-4o-mini",
        defaultParameters: {
            max_completion_tokens: 3094,
        },
    })
});