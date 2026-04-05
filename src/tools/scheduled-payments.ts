import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { HttpClient } from "../client/http.js";
import {
  OBWriteDomesticScheduledConsentResponse,
  OBWriteDomesticScheduledResponse,
  OBWriteInternationalScheduledConsentResponse,
  OBWriteInternationalScheduledResponse,
  OBWriteFundsConfirmationResponse,
} from "../types/payments.js";

export function registerScheduledPaymentTools(server: McpServer, http: HttpClient): void {
  // --- Domestic Scheduled Payments ---

  server.tool(
    "create_domestic_scheduled_payment_consent",
    "Create a domestic scheduled payment consent. Schedules a future domestic payment.",
    {
      amount: z.string().describe("Payment amount as a decimal string"),
      currency: z.string().describe("Currency code (GBP or EUR)"),
      scheduled_date: z.string().describe("ISO 8601 datetime for the scheduled execution"),
      creditor_scheme: z.string().describe("Creditor account scheme"),
      creditor_identification: z.string().describe("Creditor account number/IBAN"),
      creditor_name: z.string().describe("Creditor/beneficiary name"),
      reference: z.string().optional().describe("Payment reference"),
    },
    async ({ amount, currency, scheduled_date, creditor_scheme, creditor_identification, creditor_name, reference }) => {
      const idempotencyKey = randomUUID().substring(0, 40);

      const requestBody = {
        Data: {
          Permission: "Create",
          Initiation: {
            InstructionIdentification: randomUUID().substring(0, 36),
            EndToEndIdentification: randomUUID().substring(0, 36),
            RequestedExecutionDateTime: scheduled_date,
            InstructedAmount: { Amount: amount, Currency: currency },
            CreditorAccount: {
              SchemeName: creditor_scheme,
              Identification: creditor_identification,
              Name: creditor_name,
            },
            ...(reference && { RemittanceInformation: { Unstructured: reference } }),
          },
        },
        Risk: {},
      };

      const response = await http.post<OBWriteDomesticScheduledConsentResponse>(
        "/domestic-scheduled-payment-consents",
        requestBody,
        { scope: "payments", requireJws: true, idempotencyKey }
      );

      return { content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }] };
    }
  );

  server.tool(
    "get_domestic_scheduled_payment_consent",
    "Retrieve the status of a domestic scheduled payment consent.",
    { consent_id: z.string().describe("The consent ID") },
    async ({ consent_id }) => {
      const response = await http.get<OBWriteDomesticScheduledConsentResponse>(
        `/domestic-scheduled-payment-consents/${consent_id}`,
        "payments"
      );
      return { content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }] };
    }
  );

  server.tool(
    "create_domestic_scheduled_payment",
    "Execute a domestic scheduled payment using an authorized consent.",
    {
      consent_id: z.string().describe("The authorized consent ID"),
      amount: z.string().describe("Payment amount (must match consent)"),
      currency: z.string().describe("Currency code (must match consent)"),
      scheduled_date: z.string().describe("Scheduled date (must match consent)"),
      creditor_scheme: z.string().describe("Creditor scheme (must match consent)"),
      creditor_identification: z.string().describe("Creditor account (must match consent)"),
      creditor_name: z.string().describe("Creditor name (must match consent)"),
      instruction_identification: z.string().describe("Instruction ID from consent"),
      end_to_end_identification: z.string().describe("End-to-end ID from consent"),
      reference: z.string().optional().describe("Payment reference (must match consent)"),
    },
    async ({ consent_id, amount, currency, scheduled_date, creditor_scheme, creditor_identification, creditor_name, instruction_identification, end_to_end_identification, reference }) => {
      const idempotencyKey = randomUUID().substring(0, 40);

      const requestBody = {
        Data: {
          ConsentId: consent_id,
          Initiation: {
            InstructionIdentification: instruction_identification,
            EndToEndIdentification: end_to_end_identification,
            RequestedExecutionDateTime: scheduled_date,
            InstructedAmount: { Amount: amount, Currency: currency },
            CreditorAccount: {
              SchemeName: creditor_scheme,
              Identification: creditor_identification,
              Name: creditor_name,
            },
            ...(reference && { RemittanceInformation: { Unstructured: reference } }),
          },
        },
        Risk: {},
      };

      const response = await http.post<OBWriteDomesticScheduledResponse>(
        "/domestic-scheduled-payments",
        requestBody,
        { scope: "payments", requireJws: true, idempotencyKey }
      );

      return { content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }] };
    }
  );

  server.tool(
    "get_domestic_scheduled_payment",
    "Retrieve the status of a domestic scheduled payment.",
    { payment_id: z.string().describe("The scheduled payment ID") },
    async ({ payment_id }) => {
      const response = await http.get<OBWriteDomesticScheduledResponse>(
        `/domestic-scheduled-payments/${payment_id}`,
        "payments"
      );
      return { content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }] };
    }
  );

  // --- International Scheduled Payments ---

  server.tool(
    "create_international_scheduled_payment_consent",
    "Create an international scheduled payment consent. Schedules a future international payment.",
    {
      amount: z.string().describe("Payment amount as a decimal string"),
      currency: z.string().describe("Instructed amount currency code"),
      currency_of_transfer: z.string().describe("Target currency for the transfer"),
      scheduled_date: z.string().describe("ISO 8601 datetime for scheduled execution"),
      creditor_scheme: z.string().describe("Creditor account scheme (e.g. UK.OBIE.IBAN)"),
      creditor_identification: z.string().describe("Creditor account IBAN or number"),
      creditor_name: z.string().describe("Creditor/beneficiary name"),
      reference: z.string().optional().describe("Payment reference"),
      charge_bearer: z.enum(["BorneByCreditor", "BorneByDebtor", "FollowingServiceLevel", "Shared"]).optional(),
    },
    async ({ amount, currency, currency_of_transfer, scheduled_date, creditor_scheme, creditor_identification, creditor_name, reference, charge_bearer }) => {
      const idempotencyKey = randomUUID().substring(0, 40);

      const requestBody = {
        Data: {
          Permission: "Create",
          Initiation: {
            InstructionIdentification: randomUUID().substring(0, 36),
            EndToEndIdentification: randomUUID().substring(0, 36),
            RequestedExecutionDateTime: scheduled_date,
            CurrencyOfTransfer: currency_of_transfer,
            InstructedAmount: { Amount: amount, Currency: currency },
            CreditorAccount: {
              SchemeName: creditor_scheme,
              Identification: creditor_identification,
              Name: creditor_name,
            },
            ...(reference && { RemittanceInformation: { Unstructured: reference } }),
            ...(charge_bearer && { ChargeBearer: charge_bearer }),
          },
        },
        Risk: {},
      };

      const response = await http.post<OBWriteInternationalScheduledConsentResponse>(
        "/international-scheduled-payment-consents",
        requestBody,
        { scope: "payments", requireJws: true, idempotencyKey }
      );

      return { content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }] };
    }
  );

  server.tool(
    "get_international_scheduled_payment_consent",
    "Retrieve the status of an international scheduled payment consent.",
    { consent_id: z.string().describe("The consent ID") },
    async ({ consent_id }) => {
      const response = await http.get<OBWriteInternationalScheduledConsentResponse>(
        `/international-scheduled-payment-consents/${consent_id}`,
        "payments"
      );
      return { content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }] };
    }
  );

  server.tool(
    "get_international_scheduled_payment_funds_confirmation",
    "Check if funds are available for an authorized international scheduled payment consent.",
    { consent_id: z.string().describe("The authorized consent ID") },
    async ({ consent_id }) => {
      const response = await http.get<OBWriteFundsConfirmationResponse>(
        `/international-scheduled-payment-consents/${consent_id}/funds-confirmation`,
        "payments"
      );
      return { content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }] };
    }
  );

  server.tool(
    "create_international_scheduled_payment",
    "Execute an international scheduled payment using an authorized consent.",
    {
      consent_id: z.string().describe("The authorized consent ID"),
      amount: z.string().describe("Payment amount (must match consent)"),
      currency: z.string().describe("Currency code (must match consent)"),
      currency_of_transfer: z.string().describe("Transfer currency (must match consent)"),
      scheduled_date: z.string().describe("Scheduled date (must match consent)"),
      creditor_scheme: z.string().describe("Creditor scheme (must match consent)"),
      creditor_identification: z.string().describe("Creditor account (must match consent)"),
      creditor_name: z.string().describe("Creditor name (must match consent)"),
      instruction_identification: z.string().describe("Instruction ID from consent"),
      end_to_end_identification: z.string().describe("End-to-end ID from consent"),
    },
    async ({ consent_id, amount, currency, currency_of_transfer, scheduled_date, creditor_scheme, creditor_identification, creditor_name, instruction_identification, end_to_end_identification }) => {
      const idempotencyKey = randomUUID().substring(0, 40);

      const requestBody = {
        Data: {
          ConsentId: consent_id,
          Initiation: {
            InstructionIdentification: instruction_identification,
            EndToEndIdentification: end_to_end_identification,
            RequestedExecutionDateTime: scheduled_date,
            CurrencyOfTransfer: currency_of_transfer,
            InstructedAmount: { Amount: amount, Currency: currency },
            CreditorAccount: {
              SchemeName: creditor_scheme,
              Identification: creditor_identification,
              Name: creditor_name,
            },
          },
        },
        Risk: {},
      };

      const response = await http.post<OBWriteInternationalScheduledResponse>(
        "/international-scheduled-payments",
        requestBody,
        { scope: "payments", requireJws: true, idempotencyKey }
      );

      return { content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }] };
    }
  );

  server.tool(
    "get_international_scheduled_payment",
    "Retrieve the status of an international scheduled payment.",
    { payment_id: z.string().describe("The scheduled payment ID") },
    async ({ payment_id }) => {
      const response = await http.get<OBWriteInternationalScheduledResponse>(
        `/international-scheduled-payments/${payment_id}`,
        "payments"
      );
      return { content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }] };
    }
  );
}
