import axios, { AxiosInstance } from 'axios';
import { Config } from '../config.js';
import { RevolutAuth } from './auth.js';
import {
  BankDetail,
  Counterparty,
  ExchangeRate,
  ExchangeResult,
  PaymentDraftsResponse,
  PaymentResult,
  RevolutAccount,
  RevolutTransaction,
  TeamMember,
  TransferReason,
  TransferResult,
} from '../types/revolut.js';

export interface ListTransactionsParams {
  from?: string;
  to?: string;
  account?: string;
  count?: number;
  type?: string;
}

/** Sandbox simulation states a transfer/payment can be driven into. */
export type SandboxTransactionAction = 'complete' | 'revert' | 'decline' | 'fail';

/**
 * Thin HTTP client over the Revolut Business API. Every request is authenticated
 * with a Bearer token obtained (and auto-refreshed) by {@link RevolutAuth}.
 */
export class RevolutClient {
  private readonly http: AxiosInstance;

  constructor(
    private readonly config: Config,
    private readonly auth: RevolutAuth
  ) {
    this.http = axios.create({ baseURL: config.apiBaseUrl });
    this.http.interceptors.request.use(async (req) => {
      const token = await this.auth.getValidAccessToken();
      req.headers.Authorization = `Bearer ${token}`;
      return req;
    });
  }

  // ---- Accounts ----
  async getAccounts(): Promise<RevolutAccount[]> {
    return (await this.http.get<RevolutAccount[]>('/accounts')).data;
  }

  async getAccount(accountId: string): Promise<RevolutAccount> {
    return (await this.http.get<RevolutAccount>(`/accounts/${accountId}`)).data;
  }

  async getAccountBankDetails(accountId: string): Promise<BankDetail[]> {
    return (await this.http.get<BankDetail[]>(`/accounts/${accountId}/bank-details`)).data;
  }

  // ---- Transactions ----
  async getTransactions(params: ListTransactionsParams = {}): Promise<RevolutTransaction[]> {
    const query: Record<string, string | number> = {};
    if (params.from) query.from = params.from;
    if (params.to) query.to = params.to;
    if (params.account) query.account = params.account;
    if (params.type) query.type = params.type;
    if (params.count) query.count = params.count;
    return (await this.http.get<RevolutTransaction[]>('/transactions', { params: query })).data;
  }

  async getTransaction(transactionId: string): Promise<RevolutTransaction> {
    return (await this.http.get<RevolutTransaction>(`/transaction/${transactionId}`)).data;
  }

  async cancelTransaction(transactionId: string): Promise<void> {
    await this.http.delete(`/transaction/${transactionId}`);
  }

  // ---- Counterparties ----
  async getCounterparties(): Promise<Counterparty[]> {
    return (await this.http.get<Counterparty[]>('/counterparties')).data;
  }

  async getCounterparty(counterpartyId: string): Promise<Counterparty> {
    return (await this.http.get<Counterparty>(`/counterparty/${counterpartyId}`)).data;
  }

  async createCounterparty(payload: Record<string, unknown>): Promise<Counterparty> {
    return (await this.http.post<Counterparty>('/counterparty', payload)).data;
  }

  async deleteCounterparty(counterpartyId: string): Promise<void> {
    await this.http.delete(`/counterparty/${counterpartyId}`);
  }

  // ---- Foreign exchange ----
  async getRate(from: string, to: string, amount?: number): Promise<ExchangeRate> {
    const params: Record<string, string | number> = { from, to };
    if (amount !== undefined) params.amount = amount;
    return (await this.http.get<ExchangeRate>('/rate', { params })).data;
  }

  async exchange(payload: Record<string, unknown>): Promise<ExchangeResult> {
    return (await this.http.post<ExchangeResult>('/exchange', payload)).data;
  }

  // ---- Payments & transfers ----
  async getPaymentDrafts(): Promise<PaymentDraftsResponse> {
    return (await this.http.get<PaymentDraftsResponse>('/payment-drafts')).data;
  }

  async createPayment(payload: Record<string, unknown>): Promise<PaymentResult> {
    return (await this.http.post<PaymentResult>('/pay', payload)).data;
  }

  async transfer(payload: Record<string, unknown>): Promise<TransferResult> {
    return (await this.http.post<TransferResult>('/transfer', payload)).data;
  }

  async getTransferReasons(): Promise<TransferReason[]> {
    return (await this.http.get<TransferReason[]>('/transfer-reasons')).data;
  }

  // ---- Team ----
  async getTeamMembers(): Promise<TeamMember[]> {
    return (await this.http.get<TeamMember[]>('/team-members')).data;
  }

  // ---- Sandbox simulations (sandbox environment only) ----
  async sandboxTopup(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    return (await this.http.post<Record<string, unknown>>('/sandbox/top-up', payload)).data;
  }

  async sandboxSetTransactionState(
    transactionId: string,
    action: SandboxTransactionAction
  ): Promise<Record<string, unknown>> {
    return (
      await this.http.post<Record<string, unknown>>(
        `/sandbox/transactions/${transactionId}/${action}`,
        {}
      )
    ).data;
  }
}
