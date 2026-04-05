import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { HttpClient } from "../client/http.js";
import {
  OBWriteFileConsentResponse,
  OBWriteFileResponse,
} from "../types/payments.js";

export function registerFilePaymentTools(server: McpServer, http: HttpClient): void {
  server.tool(
    "create_file_payment_consent",
    "Create a file payment consent for batch payments. Only available for Revolut Business users. Currently only text/csv file type is supported.",
    {
      file_type: z.string().describe("File type: text/csv"),
      file_hash: z.string().describe("SHA256 hash of the file content, base64 encoded"),
      file_reference: z.string().optional().describe("Reference for the file payment"),
      number_of_transactions: z.string().optional().describe("Total number of transactions in the file"),
      control_sum: z.number().optional().describe("Sum of all amounts in the file"),
    },
    async ({ file_type, file_hash, file_reference, number_of_transactions, control_sum }) => {
      const idempotencyKey = randomUUID().substring(0, 40);

      const requestBody = {
        Data: {
          Initiation: {
            FileType: file_type,
            FileHash: file_hash,
            ...(file_reference && { FileReference: file_reference }),
            ...(number_of_transactions && { NumberOfTransactions: number_of_transactions }),
            ...(control_sum !== undefined && { ControlSum: control_sum }),
          },
        },
      };

      const response = await http.post<OBWriteFileConsentResponse>(
        "/file-payment-consents",
        requestBody,
        { scope: "payments", requireJws: true, idempotencyKey }
      );

      return { content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }] };
    }
  );

  server.tool(
    "get_file_payment_consent",
    "Retrieve the status of a file payment consent.",
    { consent_id: z.string().describe("The consent ID") },
    async ({ consent_id }) => {
      const response = await http.get<OBWriteFileConsentResponse>(
        `/file-payment-consents/${consent_id}`,
        "payments"
      );
      return { content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }] };
    }
  );

  server.tool(
    "upload_payment_file",
    "Upload a CSV file for a file payment consent. The file hash must match the hash provided when creating the consent.",
    {
      consent_id: z.string().describe("The consent ID to upload the file for"),
      file_content: z.string().describe("The CSV file content as a string"),
    },
    async ({ consent_id, file_content }) => {
      const idempotencyKey = randomUUID().substring(0, 40);

      await http.post(
        `/file-payment-consents/${consent_id}/file`,
        file_content,
        {
          scope: "payments",
          requireJws: true,
          idempotencyKey,
          contentType: "text/csv",
        }
      );

      return {
        content: [
          {
            type: "text" as const,
            text: `File uploaded successfully for consent ${consent_id}.`,
          },
        ],
      };
    }
  );

  server.tool(
    "get_payment_file",
    "Retrieve the uploaded file for a file payment consent.",
    { consent_id: z.string().describe("The consent ID") },
    async ({ consent_id }) => {
      const response = await http.get<string>(
        `/file-payment-consents/${consent_id}/file`,
        "payments"
      );
      return { content: [{ type: "text" as const, text: typeof response === "string" ? response : JSON.stringify(response, null, 2) }] };
    }
  );

  server.tool(
    "create_file_payment",
    "Execute a file/batch payment using an authorized consent.",
    {
      consent_id: z.string().describe("The authorized consent ID"),
      file_type: z.string().describe("File type (must match consent)"),
      file_hash: z.string().describe("File hash (must match consent)"),
      number_of_transactions: z.string().optional().describe("Number of transactions (must match consent)"),
      control_sum: z.number().optional().describe("Control sum (must match consent)"),
    },
    async ({ consent_id, file_type, file_hash, number_of_transactions, control_sum }) => {
      const idempotencyKey = randomUUID().substring(0, 40);

      const requestBody = {
        Data: {
          ConsentId: consent_id,
          Initiation: {
            FileType: file_type,
            FileHash: file_hash,
            ...(number_of_transactions && { NumberOfTransactions: number_of_transactions }),
            ...(control_sum !== undefined && { ControlSum: control_sum }),
          },
        },
      };

      const response = await http.post<OBWriteFileResponse>(
        "/file-payments",
        requestBody,
        { scope: "payments", requireJws: true, idempotencyKey }
      );

      return { content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }] };
    }
  );

  server.tool(
    "get_file_payment",
    "Retrieve the status of a file/batch payment.",
    { payment_id: z.string().describe("The file payment ID") },
    async ({ payment_id }) => {
      const response = await http.get<OBWriteFileResponse>(
        `/file-payments/${payment_id}`,
        "payments"
      );
      return { content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }] };
    }
  );

  server.tool(
    "get_file_payment_report",
    "Retrieve the report file for a completed file payment.",
    { payment_id: z.string().describe("The file payment ID") },
    async ({ payment_id }) => {
      const response = await http.get<string>(
        `/file-payments/${payment_id}/report-file`,
        "payments"
      );
      return { content: [{ type: "text" as const, text: typeof response === "string" ? response : JSON.stringify(response, null, 2) }] };
    }
  );
}
