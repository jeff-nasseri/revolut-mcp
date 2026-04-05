import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { HttpClient } from "../client/http.js";
import {
  OBWriteInternationalConsentResponse,
  OBWriteInternationalResponse,
  OBWriteFundsConfirmationResponse,
} from "../types/payments.js";

const postalAddressSchema = z
  .object({
    street_name: z.string().optional(),
    building_number: z.string().optional(),
    post_code: z.string().optional(),
    town_name: z.string().optional(),
    country_sub_division: z.string().optional(),
    country: z.string().optional(),
    address_line: z.array(z.string()).optional(),
  })
  .optional();

export function registerInternationalPaymentTools(server: McpServer, http: HttpClient): void {
  server.tool(
    "create_international_payment_consent",
    "Create an international payment consent. Supports all Revolut currencies via SWIFT. The consent must be authorized by the account holder before payment.",
    {
      amount: z.string().describe("Payment amount as a decimal string"),
      currency: z.string().describe("Currency code of the instructed amount"),
      currency_of_transfer: z.string().describe("Target currency for the transfer"),
      creditor_scheme: z.string().describe("Creditor account scheme (e.g. UK.OBIE.IBAN)"),
      creditor_identification: z.string().describe("Creditor account IBAN or number"),
      creditor_name: z.string().describe("Creditor/beneficiary name"),
      creditor_address: postalAddressSchema.describe("Creditor postal address (recommended for international payments)"),
      reference: z.string().optional().describe("Payment reference"),
      charge_bearer: z
        .enum(["BorneByCreditor", "BorneByDebtor", "FollowingServiceLevel", "Shared"])
        .optional()
        .describe("Who bears the charges"),
      instruction_priority: z
        .enum(["Normal", "Urgent"])
        .optional()
        .describe("Payment priority"),
    },
    async ({
      amount,
      currency,
      currency_of_transfer,
      creditor_scheme,
      creditor_identification,
      creditor_name,
      creditor_address,
      reference,
      charge_bearer,
      instruction_priority,
    }) => {
      const idempotencyKey = randomUUID().substring(0, 40);

      const creditorPostalAddress = creditor_address
        ? {
            ...(creditor_address.street_name && { StreetName: creditor_address.street_name }),
            ...(creditor_address.building_number && { BuildingNumber: creditor_address.building_number }),
            ...(creditor_address.post_code && { PostCode: creditor_address.post_code }),
            ...(creditor_address.town_name && { TownName: creditor_address.town_name }),
            ...(creditor_address.country_sub_division && { CountrySubDivision: creditor_address.country_sub_division }),
            ...(creditor_address.country && { Country: creditor_address.country }),
            ...(creditor_address.address_line && { AddressLine: creditor_address.address_line }),
          }
        : undefined;

      const requestBody = {
        Data: {
          Initiation: {
            InstructionIdentification: randomUUID().substring(0, 36),
            EndToEndIdentification: randomUUID().substring(0, 36),
            CurrencyOfTransfer: currency_of_transfer,
            InstructedAmount: { Amount: amount, Currency: currency },
            CreditorAccount: {
              SchemeName: creditor_scheme,
              Identification: creditor_identification,
              Name: creditor_name,
            },
            ...(creditorPostalAddress && {
              Creditor: {
                Name: creditor_name,
                PostalAddress: creditorPostalAddress,
              },
            }),
            ...(reference && {
              RemittanceInformation: { Unstructured: reference },
            }),
            ...(charge_bearer && { ChargeBearer: charge_bearer }),
            ...(instruction_priority && { InstructionPriority: instruction_priority }),
          },
        },
        Risk: {},
      };

      const response = await http.post<OBWriteInternationalConsentResponse>(
        "/international-payment-consents",
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
    "get_international_payment_consent",
    "Retrieve the status of an international payment consent.",
    {
      consent_id: z.string().describe("The consent ID to retrieve"),
    },
    async ({ consent_id }) => {
      const response = await http.get<OBWriteInternationalConsentResponse>(
        `/international-payment-consents/${consent_id}`,
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
    "get_international_payment_funds_confirmation",
    "Check if funds are available for an authorized international payment consent.",
    {
      consent_id: z.string().describe("The authorized consent ID"),
    },
    async ({ consent_id }) => {
      const response = await http.get<OBWriteFundsConfirmationResponse>(
        `/international-payment-consents/${consent_id}/funds-confirmation`,
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
    "create_international_payment",
    "Execute an international payment using an authorized consent.",
    {
      consent_id: z.string().describe("The authorized consent ID"),
      amount: z.string().describe("Payment amount (must match consent)"),
      currency: z.string().describe("Currency code (must match consent)"),
      currency_of_transfer: z.string().describe("Transfer currency (must match consent)"),
      creditor_scheme: z.string().describe("Creditor account scheme (must match consent)"),
      creditor_identification: z.string().describe("Creditor account ID (must match consent)"),
      creditor_name: z.string().describe("Creditor name (must match consent)"),
      instruction_identification: z.string().describe("Instruction ID from consent"),
      end_to_end_identification: z.string().describe("End-to-end ID from consent"),
    },
    async ({
      consent_id,
      amount,
      currency,
      currency_of_transfer,
      creditor_scheme,
      creditor_identification,
      creditor_name,
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

      const response = await http.post<OBWriteInternationalResponse>(
        "/international-payments",
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
    "get_international_payment",
    "Retrieve the status of an international payment.",
    {
      payment_id: z.string().describe("The international payment ID"),
    },
    async ({ payment_id }) => {
      const response = await http.get<OBWriteInternationalResponse>(
        `/international-payments/${payment_id}`,
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
