import {
    anthropic,
    createNetwork,
    createRoutingAgent,
    getDefaultRoutingAgent
} from "@inngest/agent-kit";

import { createServer } from "@inngest/agent-kit/server";
import { inngest } from "./client";
import Events from "./agent/constant";
import { databaseAgent } from "./agent/databaseAgent";
import { receiptScanningAgent } from "./agent/receiptScanningAgent";


const agentNetwork = createNetwork({
    name: "Agent Team",
    agents: [databaseAgent, receiptScanningAgent],
    defaultModel: anthropic({
        model: "claude-3-5-sonnet-latest",
        defaultParameters: {
            max_tokens: 1000,
        },
    }),
    defaultRouter: ({ network }) => {
        const saveToDatabase = network.state.kv.get("save-to-databse");
        if (saveToDatabase !== undefined) {
            // Terminat the agent process if saved to the database
            return undefined;
        }
        return getDefaultRoutingAgent();
    }
});

export const server = createServer({
    agents: [databaseAgent, receiptScanningAgent],  
    networks: [agentNetwork],
})

export const extractAndSavePDF = inngest.createFunction(
    { id: "Extract PDF and Save to Database" },
    { event: Events.EXTRACT_DATA_FROM_PDF_AND_SAVE_TO_DATABASE },
    async ({ event }) => {
        const result = await agentNetwork.run(
            `Extract the key data from this pdf ${event.data.url}. Once the data is extracted, save it to databasae using receipt Id ${event.data.receiptId}. Once the receipt is successfully saved to the database you can terminate the agent process.`
        );
        return result.state.kv.get("receipt");
    },
)
