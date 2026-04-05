import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { HttpClient } from "../client/http.js";
import {
  OBWriteDomesticStandingOrderConsentResponse,
  OBWriteDomesticStandingOrderResponse,
  OBWriteInternationalStandingOrderConsentResponse,
  OBWriteInternationalStandingOrderResponse,
} from "../types/payments.js";

export function registerStandingOrderTools(server: McpServer, http: HttpClient): void {
  // --- Domestic Standing Orders ---

  server.tool(
    "create_domestic_standing_order_consent",
    "Create a domestic standing order consent. Sets up a recurring domestic payment.",
    {
      frequency: z.string().describe("Payment frequency: EvryDay, EvryWorkgDay, IntrvlWkDay, WkInMnthDay, IntrvlMnthDay, QtrDay"),
      first_payment_amount: z.string().describe("First payment amount as decimal string"),
      currency: z.string().describe("Currency code (GBP or EUR)"),
      first_payment_date: z.string().describe("ISO 8601 datetime for the first payment"),
      final_payment_date: z.string().optional().describe("ISO 8601 datetime for the final payment"),
      recurring_payment_amount: z.string().optional().describe("Recurring payment amount (if different from first)"),
      creditor_scheme: z.string().describe("Creditor account scheme"),
      creditor_identification: z.string().describe("Creditor account number/IBAN"),
      creditor_name: z.string().describe("Creditor/beneficiary name"),
      reference: z.string().optional().describe("Payment reference"),
      number_of_payments: z.string().optional().describe("Total number of payments"),
    },
    async ({ frequency, first_payment_amount, currency, first_payment_date, final_payment_date, recurring_payment_amount, creditor_scheme, creditor_identification, creditor_name, reference, number_of_payments }) => {
      const idempotencyKey = randomUUID().substring(0, 40);

      const requestBody = {
        Data: {
          Permission: "Create",
          Initiation: {
            Frequency: frequency,
            FirstPaymentDateTime: first_payment_date,
            FirstPaymentAmount: { Amount: first_payment_amount, Currency: currency },
            CreditorAccount: {
              SchemeName: creditor_scheme,
              Identification: creditor_identification,
              Name: creditor_name,
            },
            ...(recurring_payment_amount && {
              RecurringPaymentAmount: { Amount: recurring_payment_amount, Currency: currency },
            }),
            ...(final_payment_date && { FinalPaymentDateTime: final_payment_date }),
            ...(final_payment_date && first_payment_amount && {
              FinalPaymentAmount: { Amount: recurring_payment_amount || first_payment_amount, Currency: currency },
            }),
            ...(reference && { Reference: reference }),
            ...(number_of_payments && { NumberOfPayments: number_of_payments }),
          },
        },
        Risk: {},
      };

      const response = await http.post<OBWriteDomesticStandingOrderConsentResponse>(
        "/domestic-standing-order-consents",
        requestBody,
        { scope: "payments", requireJws: true, idempotencyKey }
      );

      return { content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }] };
    }
  );

  server.tool(
    "get_domestic_standing_order_consent",
    "Retrieve the status of a domestic standing order consent.",
    { consent_id: z.string().describe("The consent ID") },
    async ({ consent_id }) => {
      const response = await http.get<OBWriteDomesticStandingOrderConsentResponse>(
        `/domestic-standing-order-consents/${consent_id}`,
        "payments"
      );
      return { content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }] };
    }
  );

  server.tool(
    "create_domestic_standing_order",
    "Execute a domestic standing order using an authorized consent.",
    {
      consent_id: z.string().describe("The authorized consent ID"),
      frequency: z.string().describe("Frequency (must match consent)"),
      first_payment_amount: z.string().describe("First payment amount (must match consent)"),
      currency: z.string().describe("Currency (must match consent)"),
      first_payment_date: z.string().describe("First payment date (must match consent)"),
      creditor_scheme: z.string().describe("Creditor scheme (must match consent)"),
      creditor_identification: z.string().describe("Creditor account (must match consent)"),
      creditor_name: z.string().describe("Creditor name (must match consent)"),
      reference: z.string().optional().describe("Reference (must match consent)"),
    },
    async ({ consent_id, frequency, first_payment_amount, currency, first_payment_date, creditor_scheme, creditor_identification, creditor_name, reference }) => {
      const idempotencyKey = randomUUID().substring(0, 40);

      const requestBody = {
        Data: {
          ConsentId: consent_id,
          Initiation: {
            Frequency: frequency,
            FirstPaymentDateTime: first_payment_date,
            FirstPaymentAmount: { Amount: first_payment_amount, Currency: currency },
            CreditorAccount: {
              SchemeName: creditor_scheme,
              Identification: creditor_identification,
              Name: creditor_name,
            },
            ...(reference && { Reference: reference }),
          },
        },
        Risk: {},
      };

      const response = await http.post<OBWriteDomesticStandingOrderResponse>(
        "/domestic-standing-orders",
        requestBody,
        { scope: "payments", requireJws: true, idempotencyKey }
      );

      return { content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }] };
    }
  );

  server.tool(
    "get_domestic_standing_order",
    "Retrieve the status of a domestic standing order.",
    { order_id: z.string().describe("The standing order ID") },
    async ({ order_id }) => {
      const response = await http.get<OBWriteDomesticStandingOrderResponse>(
        `/domestic-standing-orders/${order_id}`,
        "payments"
      );
      return { content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }] };
    }
  );

  // --- International Standing Orders ---

  server.tool(
    "create_international_standing_order_consent",
    "Create an international standing order consent. Sets up a recurring international payment.",
    {
      frequency: z.string().describe("Payment frequency"),
      first_payment_amount: z.string().describe("First payment amount"),
      currency: z.string().describe("Instructed amount currency"),
      currency_of_transfer: z.string().describe("Target currency for the transfer"),
      first_payment_date: z.string().describe("ISO 8601 datetime for first payment"),
      final_payment_date: z.string().optional().describe("ISO 8601 datetime for final payment"),
      creditor_scheme: z.string().describe("Creditor account scheme"),
      creditor_identification: z.string().describe("Creditor account IBAN or number"),
      creditor_name: z.string().describe("Creditor/beneficiary name"),
      reference: z.string().optional().describe("Payment reference"),
      charge_bearer: z.enum(["BorneByCreditor", "BorneByDebtor", "FollowingServiceLevel", "Shared"]).optional(),
    },
    async ({ frequency, first_payment_amount, currency, currency_of_transfer, first_payment_date, final_payment_date, creditor_scheme, creditor_identification, creditor_name, reference, charge_bearer }) => {
      const idempotencyKey = randomUUID().substring(0, 40);

      const requestBody = {
        Data: {
          Permission: "Create",
          Initiation: {
            Frequency: frequency,
            FirstPaymentDateTime: first_payment_date,
            CurrencyOfTransfer: currency_of_transfer,
            InstructedAmount: { Amount: first_payment_amount, Currency: currency },
            CreditorAccount: {
              SchemeName: creditor_scheme,
              Identification: creditor_identification,
              Name: creditor_name,
            },
            ...(final_payment_date && { FinalPaymentDateTime: final_payment_date }),
            ...(reference && { Reference: reference }),
            ...(charge_bearer && { ChargeBearer: charge_bearer }),
          },
        },
        Risk: {},
      };

      const response = await http.post<OBWriteInternationalStandingOrderConsentResponse>(
        "/international-standing-order-consents",
        requestBody,
        { scope: "payments", requireJws: true, idempotencyKey }
      );

      return { content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }] };
    }
  );

  server.tool(
    "get_international_standing_order_consent",
    "Retrieve the status of an international standing order consent.",
    { consent_id: z.string().describe("The consent ID") },
    async ({ consent_id }) => {
      const response = await http.get<OBWriteInternationalStandingOrderConsentResponse>(
        `/international-standing-order-consents/${consent_id}`,
        "payments"
      );
      return { content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }] };
    }
  );

  server.tool(
    "create_international_standing_order",
    "Execute an international standing order using an authorized consent.",
    {
      consent_id: z.string().describe("The authorized consent ID"),
      frequency: z.string().describe("Frequency (must match consent)"),
      first_payment_amount: z.string().describe("Amount (must match consent)"),
      currency: z.string().describe("Currency (must match consent)"),
      currency_of_transfer: z.string().describe("Transfer currency (must match consent)"),
      first_payment_date: z.string().describe("First payment date (must match consent)"),
      creditor_scheme: z.string().describe("Creditor scheme (must match consent)"),
      creditor_identification: z.string().describe("Creditor account (must match consent)"),
      creditor_name: z.string().describe("Creditor name (must match consent)"),
    },
    async ({ consent_id, frequency, first_payment_amount, currency, currency_of_transfer, first_payment_date, creditor_scheme, creditor_identification, creditor_name }) => {
      const idempotencyKey = randomUUID().substring(0, 40);

      const requestBody = {
        Data: {
          ConsentId: consent_id,
          Initiation: {
            Frequency: frequency,
            FirstPaymentDateTime: first_payment_date,
            CurrencyOfTransfer: currency_of_transfer,
            InstructedAmount: { Amount: first_payment_amount, Currency: currency },
            CreditorAccount: {
              SchemeName: creditor_scheme,
              Identification: creditor_identification,
              Name: creditor_name,
            },
          },
        },
        Risk: {},
      };

      const response = await http.post<OBWriteInternationalStandingOrderResponse>(
        "/international-standing-orders",
        requestBody,
        { scope: "payments", requireJws: true, idempotencyKey }
      );

      return { content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }] };
    }
  );

  server.tool(
    "get_international_standing_order",
    "Retrieve the status of an international standing order.",
    { order_id: z.string().describe("The standing order ID") },
    async ({ order_id }) => {
      const response = await http.get<OBWriteInternationalStandingOrderResponse>(
        `/international-standing-orders/${order_id}`,
        "payments"
      );
      return { content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }] };
    }
  );
}
