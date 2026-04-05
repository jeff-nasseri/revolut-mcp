import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { HttpClient } from "../client/http.js";
import {
  OBWriteDomesticConsentResponse,
  OBWriteDomesticResponse,
  OBWriteFundsConfirmationResponse,
} from "../types/payments.js";

export function registerDomesticPaymentTools(server: McpServer, http: HttpClient): void {
  server.tool(
    "create_domestic_payment_consent",
    "Create a domestic payment consent. The consent must be authorized by the account holder before a payment can be created. Supports GBP and EUR payments.",
    {
      amount: z.string().describe("Payment amount as a decimal string, e.g. '100.00'"),
      currency: z.string().describe("Currency code (GBP or EUR)"),
      creditor_scheme: z
        .string()
        .describe("Creditor account scheme: UK.OBIE.SortCodeAccountNumber or UK.OBIE.IBAN"),
      creditor_identification: z
        .string()
        .describe("Creditor account number/IBAN"),
      creditor_name: z.string().describe("Creditor/beneficiary name"),
      reference: z.string().optional().describe("Payment reference/remittance information"),
      end_to_end_id: z
        .string()
        .optional()
        .describe("End-to-end identification (auto-generated if not provided)"),
    },
    async ({
      amount,
      currency,
      creditor_scheme,
      creditor_identification,
      creditor_name,
      reference,
      end_to_end_id,
    }) => {
      const idempotencyKey = randomUUID().substring(0, 40);
      const instructionId = randomUUID().substring(0, 36);

      const requestBody = {
        Data: {
          Initiation: {
            InstructionIdentification: instructionId,
            EndToEndIdentification: end_to_end_id || randomUUID().substring(0, 36),
            InstructedAmount: { Amount: amount, Currency: currency },
            CreditorAccount: {
              SchemeName: creditor_scheme,
              Identification: creditor_identification,
              Name: creditor_name,
            },
            ...(reference && {
              RemittanceInformation: { Unstructured: reference },
            }),
          },
        },
        Risk: {},
      };

      const response = await http.post<OBWriteDomesticConsentResponse>(
        "/domestic-payment-consents",
        requestBody,
        { scope: "payments", requireJws: true, idempotencyKey }
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
    "get_domestic_payment_consent",
    "Retrieve the status of a domestic payment consent.",
    {
      consent_id: z.string().describe("The consent ID to retrieve"),
    },
    async ({ consent_id }) => {
      const response = await http.get<OBWriteDomesticConsentResponse>(
        `/domestic-payment-consents/${consent_id}`,
        "payments"
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
    "get_domestic_payment_funds_confirmation",
    "Check if funds are available for an authorized domestic payment consent.",
    {
      consent_id: z.string().describe("The authorized consent ID to check funds for"),
    },
    async ({ consent_id }) => {
      const response = await http.get<OBWriteFundsConfirmationResponse>(
        `/domestic-payment-consents/${consent_id}/funds-confirmation`,
        "payments"
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
    "create_domestic_payment",
    "Execute a domestic payment using an authorized consent. The consent must be in 'Authorised' status.",
    {
      consent_id: z.string().describe("The authorized consent ID"),
      amount: z.string().describe("Payment amount (must match consent)"),
      currency: z.string().describe("Currency code (must match consent)"),
      creditor_scheme: z.string().describe("Creditor account scheme (must match consent)"),
      creditor_identification: z.string().describe("Creditor account ID (must match consent)"),
      creditor_name: z.string().describe("Creditor name (must match consent)"),
      reference: z.string().optional().describe("Payment reference (must match consent)"),
      instruction_identification: z.string().describe("Instruction ID from the consent"),
      end_to_end_identification: z.string().describe("End-to-end ID from the consent"),
    },
    async ({
      consent_id,
      amount,
      currency,
      creditor_scheme,
      creditor_identification,
      creditor_name,
      reference,
      instruction_identification,
      end_to_end_identification,
    }) => {
      const idempotencyKey = randomUUID().substring(0, 40);

      const requestBody = {
        Data: {
          ConsentId: consent_id,
          Initiation: {
            InstructionIdentification: instruction_identification,
            EndToEndIdentification: end_to_end_identification,
            InstructedAmount: { Amount: amount, Currency: currency },
            CreditorAccount: {
              SchemeName: creditor_scheme,
              Identification: creditor_identification,
              Name: creditor_name,
            },
            ...(reference && {
              RemittanceInformation: { Unstructured: reference },
            }),
          },
        },
        Risk: {},
      };

      const response = await http.post<OBWriteDomesticResponse>(
        "/domestic-payments",
        requestBody,
        { scope: "payments", requireJws: true, idempotencyKey }
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
    "get_domestic_payment",
    "Retrieve the status of a domestic payment.",
    {
      payment_id: z.string().describe("The domestic payment ID"),
    },
    async ({ payment_id }) => {
      const response = await http.get<OBWriteDomesticResponse>(
        `/domestic-payments/${payment_id}`,
        "payments"
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
