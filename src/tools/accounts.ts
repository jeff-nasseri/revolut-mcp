import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { HttpClient } from "../client/http.js";
import {
  OBReadAccountResponse,
  OBReadBalanceResponse,
  OBReadBeneficiaryResponse,
} from "../types/accounts.js";

export function registerAccountTools(server: McpServer, http: HttpClient): void {
  server.tool(
    "get_accounts",
    "Retrieve all accounts for the authorized user. Requires an authorized account access consent with ReadAccountsBasic or ReadAccountsDetail permission.",
    {},
    async () => {
      const response = await http.get<OBReadAccountResponse>("/accounts");

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
    "get_account",
    "Retrieve details for a specific account by ID. Note: access restricted to 5 minutes after consent authorization per PSD2 SCA.",
    {
      account_id: z.string().describe("The account ID to retrieve"),
    },
    async ({ account_id }) => {
      const response = await http.get<OBReadAccountResponse>(
        `/accounts/${account_id}`
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
    "get_account_balances",
    "Retrieve the balance of a specific account. Requires ReadBalances permission.",
    {
      account_id: z.string().describe("The account ID to get balances for"),
    },
    async ({ account_id }) => {
      const response = await http.get<OBReadBalanceResponse>(
        `/accounts/${account_id}/balances`
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
    "get_account_beneficiaries",
    "Retrieve beneficiaries for a specific account. Access restricted to 5 minutes after consent authorization. Requires ReadBeneficiariesBasic or ReadBeneficiariesDetail permission.",
    {
      account_id: z
        .string()
        .describe("The account ID to get beneficiaries for"),
    },
    async ({ account_id }) => {
      const response = await http.get<OBReadBeneficiaryResponse>(
        `/accounts/${account_id}/beneficiaries`
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
