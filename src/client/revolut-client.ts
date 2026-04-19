import axios, { AxiosInstance } from 'axios';
import { Config } from '../config.js';
import { RevolutAuth } from './auth.js';
import {
  OBReadAccountResponse,
  OBReadBalanceResponse,
  OBReadTransactionResponse,
} from '../types/revolut.js';

export interface GetTransactionsParams {
  fromBookingDateTime?: string;
  toBookingDateTime?: string;
}

export class RevolutClient {
  private readonly http: AxiosInstance;

  constructor(
    private readonly config: Config,
    private readonly auth: RevolutAuth
  ) {
    this.http = axios.create({
      baseURL: config.baseUrl,
      httpsAgent: auth.getMtlsAgent(),
    });

    this.http.interceptors.request.use(async (req) => {
      const token = await this.auth.getValidAccessToken();
      req.headers.Authorization = `Bearer ${token}`;
      return req;
    });
  }

  async getAccounts(): Promise<OBReadAccountResponse> {
    const response = await this.http.get<OBReadAccountResponse>('/accounts');
    return response.data;
  }

  async getAccountBalances(accountId: string): Promise<OBReadBalanceResponse> {
    const response = await this.http.get<OBReadBalanceResponse>(
      `/accounts/${accountId}/balances`
    );
    return response.data;
  }

  async getTransactions(
    accountId: string,
    params: GetTransactionsParams = {}
  ): Promise<OBReadTransactionResponse> {
    const query: Record<string, string> = {};
    if (params.fromBookingDateTime) query.fromBookingDateTime = params.fromBookingDateTime;
    if (params.toBookingDateTime) query.toBookingDateTime = params.toBookingDateTime;

    const response = await this.http.get<OBReadTransactionResponse>(
      `/accounts/${accountId}/transactions`,
      { params: query }
    );
    return response.data;
  }

  async getTransaction(
    accountId: string,
    transactionId: string
  ): Promise<OBReadTransactionResponse> {
    const response = await this.http.get<OBReadTransactionResponse>(
      `/accounts/${accountId}/transactions/${transactionId}`
    );
    return response.data;
  }
}
