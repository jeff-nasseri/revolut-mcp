import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { HttpClient } from "../client/http.js";
import {
  OBReadTransactionResponse,
  OBReadDirectDebitResponse,
  OBReadStandingOrderResponse,
} from "../types/transactions.js";

export function registerTransactionTools(server: McpServer, http: HttpClient): void {
  server.tool(
    "get_account_transactions",
    "Retrieve transactions for a specific account. Full history available within 5 minutes of consent authorization; after that, limited to last 90 days. Max 4 requests per account per 24 hours after SCA window.",
    {
      account_id: z.string().describe("The account ID to get transactions for"),
      from_date: z
        .string()
        .optional()
        .describe("ISO 8601 datetime - start of transaction period (fromBookingDateTime)"),
      to_date: z
        .string()
        .optional()
        .describe("ISO 8601 datetime - end of transaction period (toBookingDateTime)"),
    },
    async ({ account_id, from_date, to_date }) => {
      const params = new URLSearchParams();
      if (from_date) params.set("fromBookingDateTime", from_date);
      if (to_date) params.set("toBookingDateTime", to_date);

      const query = params.toString();
      const path = `/accounts/${account_id}/transactions${query ? `?${query}` : ""}`;

      const response = await http.get<OBReadTransactionResponse>(path);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(response, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    "get_account_direct_debits",
    "Retrieve direct debits for a specific account. Access restricted to 5 minutes after consent authorization. Requires ReadDirectDebits permission.",
    {
      account_id: z
        .string()
        .describe("The account ID to get direct debits for"),
    },
    async ({ account_id }) => {
      const response = await http.get<OBReadDirectDebitResponse>(
        `/accounts/${account_id}/direct-debits`
      );

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(response, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    "get_account_standing_orders",
    "Retrieve standing orders for a specific account. Access restricted to 5 minutes after consent authorization. Requires ReadStandingOrdersBasic or ReadStandingOrdersDetail permission.",
    {
      account_id: z
        .string()
        .describe("The account ID to get standing orders for"),
    },
    async ({ account_id }) => {
      const response = await http.get<OBReadStandingOrderResponse>(
        `/accounts/${account_id}/standing-orders`
      );

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(response, null, 2),
          },
        ],
      };
    }
  );
}
