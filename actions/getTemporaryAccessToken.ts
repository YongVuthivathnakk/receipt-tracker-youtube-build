"use server"

import { currentUser } from "@clerk/nextjs/server";

// Initialize Schematic SDK
import { SchematicClient } from "@schematichq/schematic-typescript-node";
import { RetryAfterError } from "inngest";

const apiKey = process.env.SCHEMATIC_API_KEY;
const client = new SchematicClient({apiKey});

// Get a temporary access token

export async function getTemporaryAccessToken() {
  console.log("Getting temporary access token");
  const user = await currentUser();

  if(!user) {
    console.log("No uesr found, returning null.");
    return null;
  }

  console.log(`Issuing temporary access token for user: ${user.id}`);
  const resp = await client.accesstokens.issueTemporaryAccessToken({
    resourceType: "company",
    lookup: { id: user.id }, // The lookup will vary depending on how you have configured your company
  });

  console.log(
    "Token respond received:", resp.data ? "Token received" : "No toke in response."
  );
  return resp.data?.token;
}