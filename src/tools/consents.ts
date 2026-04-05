import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { HttpClient } from "../client/http.js";
import { OBReadConsentResponse, Permission } from "../types/accounts.js";

const VALID_PERMISSIONS: Permission[] = [
  "ReadAccountsBasic",
  "ReadAccountsDetail",
  "ReadBalances",
  "ReadBeneficiariesBasic",
  "ReadBeneficiariesDetail",
  "ReadDirectDebits",
  "ReadScheduledPaymentsBasic",
  "ReadScheduledPaymentsDetail",
  "ReadStandingOrdersBasic",
  "ReadStandingOrdersDetail",
  "ReadTransactionsBasic",
  "ReadTransactionsDetail",
  "ReadTransactionsCredits",
  "ReadTransactionsDebits",
];

export function registerConsentTools(server: McpServer, http: HttpClient): void {
  server.tool(
    "create_account_consent",
    "Create an account access consent. Required before accessing any account data. Returns a ConsentId that must be authorized by the account holder.",
    {
      permissions: z
        .array(z.enum(VALID_PERMISSIONS as [Permission, ...Permission[]]))
        .describe(
          "List of permissions to request. E.g. ReadAccountsDetail, ReadBalances, ReadTransactionsDetail"
        ),
      expiration_date_time: z
        .string()
        .optional()
        .describe("ISO 8601 expiration datetime for the consent"),
      transaction_from: z
        .string()
        .optional()
        .describe("ISO 8601 datetime - earliest transaction date to request"),
      transaction_to: z
        .string()
        .optional()
        .describe("ISO 8601 datetime - latest transaction date to request"),
    },
    async ({ permissions, expiration_date_time, transaction_from, transaction_to }) => {
      const requestBody = {
        Data: {
          Permissions: permissions,
          ...(expiration_date_time && { ExpirationDateTime: expiration_date_time }),
          ...(transaction_from && { TransactionFromDateTime: transaction_from }),
          ...(transaction_to && { TransactionToDateTime: transaction_to }),
        },
        Risk: {},
      };

      const response = await http.post<OBReadConsentResponse>(
        "/account-access-consents",
        requestBody,
        { scope: "accounts" }
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
    "get_account_consent",
    "Retrieve the status of an account access consent by its ConsentId.",
    {
      consent_id: z.string().describe("The consent ID to retrieve"),
    },
    async ({ consent_id }) => {
      const response = await http.get<OBReadConsentResponse>(
        `/account-access-consents/${consent_id}`
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
    "delete_account_consent",
    "Delete (reject or revoke) an account access consent.",
    {
      consent_id: z.string().describe("The consent ID to delete"),
    },
    async ({ consent_id }) => {
      await http.delete(`/account-access-consents/${consent_id}`);

      return {
        content: [
          {
            type: "text" as const,
            text: `Account access consent ${consent_id} has been deleted.`,
          },
        ],
      };
    }
  );
}
