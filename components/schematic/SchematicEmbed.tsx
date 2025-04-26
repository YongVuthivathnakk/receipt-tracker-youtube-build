"use client";

import { SchematicEmbed as SchematicEmbedComponent } from "@schematichq/schematic-components";

export default function SchematicEmbed({
    // take accessToken and componentId
    accessToken,
    componentId,
  }: {
    accessToken: string,
    componentId: string,
  }) {
    return <SchematicEmbedComponent accessToken={accessToken} id={componentId} />
}

