import {
  BankDetail,
  Counterparty,
  ExchangeRate,
  RevolutAccount,
  RevolutTransaction,
  TeamMember,
  TransferReason,
} from '../../src/types/revolut.js';
import { Scope, ToolContext, ToolDefinition } from '../../src/utils/tool.js';

export const mockAccounts: RevolutAccount[] = [
  {
    id: 'acc-gbp',
    name: 'Main',
    balance: 28900,
    currency: 'GBP',
    state: 'active',
    public: false,
    created_at: '2026-05-31T17:59:46Z',
    updated_at: '2026-05-31T17:59:47Z',
  },
  {
    id: 'acc-eur',
    name: 'European suppliers',
    balance: 3280,
    currency: 'EUR',
    state: 'active',
    public: false,
    created_at: '2026-05-31T17:59:46Z',
    updated_at: '2026-05-31T17:59:47Z',
  },
];

export const mockBankDetails: BankDetail[] = [
  {
    account_no: '06543359',
    sort_code: '042909',
    beneficiary: 'Acme Corporation',
    pooled: false,
    schemes: ['chaps', 'bacs', 'faster_payments'],
    estimated_time: { unit: 'hours', min: 2, max: 24 },
  },
  {
    iban: 'GB20REVO04290906543359',
    bic: 'REVOGB21',
    bank_country: 'GB',
    beneficiary: 'Acme Corporation',
    pooled: false,
    schemes: ['sepa', 'swift'],
    estimated_time: { unit: 'days', min: 1, max: 3 },
  },
];

export const mockTransactions: RevolutTransaction[] = [
  {
    id: 'txn-1',
    type: 'transfer',
    state: 'completed',
    request_id: 'req-1',
    created_at: '2026-05-31T10:00:00Z',
    updated_at: '2026-05-31T10:00:00Z',
    completed_at: '2026-05-31T10:00:01Z',
    reference: 'INV-1',
    legs: [
      {
        leg_id: 'leg-1',
        account_id: 'acc-gbp',
        amount: 210,
        currency: 'GBP',
        description: 'To Acme Corp.',
        balance: 28690,
      },
    ],
  },
  {
    id: 'txn-2',
    type: 'topup',
    state: 'completed',
    request_id: 'req-2',
    created_at: '2026-05-31T09:00:00Z',
    updated_at: '2026-05-31T09:00:00Z',
    legs: [
      {
        leg_id: 'leg-2',
        account_id: 'acc-gbp',
        amount: 300,
        currency: 'GBP',
        description: 'Card Topup',
        balance: 28900,
      },
    ],
  },
];

export const mockCounterparties: Counterparty[] = [
  {
    id: 'cp-1',
    name: 'Acme Corp.',
    state: 'created',
    created_at: '2026-05-31T17:59:47Z',
    updated_at: '2026-05-31T17:59:47Z',
    profile_type: 'business',
    accounts: [
      {
        id: 'cpa-1',
        type: 'external',
        name: 'Acme Corp.',
        currency: 'EUR',
        iban: 'DE89370400440532013000',
        bic: 'BARCDE22',
        bank_country: 'DE',
      },
    ],
  },
  {
    id: 'cp-2',
    name: 'Rory Pearson',
    state: 'created',
    created_at: '2026-05-31T17:59:47Z',
    updated_at: '2026-05-31T17:59:47Z',
    profile_type: 'personal',
    revtag: 'zzznj6287',
    country: 'GB',
  },
];

export const mockRate: ExchangeRate = {
  from: { amount: 100, currency: 'GBP' },
  to: { amount: 134.59, currency: 'USD' },
  rate: 1.345997208834888,
  fee: { amount: 0.54, currency: 'USD' },
  rate_date: '2026-02-27T00:00:00Z',
};

export const mockTransferReasons: TransferReason[] = [
  { country: 'GB', currency: 'GBP', code: 'general', description: 'General' },
  { country: 'US', currency: 'USD', code: 'invoice', description: 'Invoice payment' },
  { country: 'DE', currency: 'EUR', code: 'goods', description: 'Payment for goods' },
];

export const mockTeamMembers: TeamMember[] = [
  {
    id: 'tm-1',
    email: 'owner@example.com',
    role_id: 'owner',
    state: 'active',
    first_name: 'Jane',
    last_name: 'Doe',
  },
];

export type MockClient = ReturnType<typeof createMockClient>;

export function createMockClient(overrides: Record<string, unknown> = {}) {
  return {
    getAccounts: jest.fn().mockResolvedValue(mockAccounts),
    getAccount: jest.fn().mockResolvedValue(mockAccounts[0]),
    getAccountBankDetails: jest.fn().mockResolvedValue(mockBankDetails),
    getTransactions: jest.fn().mockResolvedValue(mockTransactions),
    getTransaction: jest.fn().mockResolvedValue(mockTransactions[0]),
    cancelTransaction: jest.fn().mockResolvedValue(undefined),
    getCounterparties: jest.fn().mockResolvedValue(mockCounterparties),
    getCounterparty: jest.fn().mockResolvedValue(mockCounterparties[0]),
    createCounterparty: jest.fn().mockResolvedValue(mockCounterparties[0]),
    deleteCounterparty: jest.fn().mockResolvedValue(undefined),
    getRate: jest.fn().mockResolvedValue(mockRate),
    exchange: jest.fn().mockResolvedValue({ id: 'fx-1', state: 'completed' }),
    getPaymentDrafts: jest.fn().mockResolvedValue({ payment_orders: [] }),
    createPayment: jest.fn().mockResolvedValue({ id: 'pay-1', state: 'pending' }),
    transfer: jest.fn().mockResolvedValue({ id: 'trf-1', state: 'completed' }),
    getTransferReasons: jest.fn().mockResolvedValue(mockTransferReasons),
    getTeamMembers: jest.fn().mockResolvedValue(mockTeamMembers),
    sandboxTopup: jest.fn().mockResolvedValue({ id: 'top-1', state: 'completed' }),
    sandboxSetTransactionState: jest.fn().mockResolvedValue({}),
    ...overrides,
  };
}

export function mockContext(
  client: ReturnType<typeof createMockClient>,
  configOverrides: Record<string, unknown> = {}
): ToolContext {
  return {
    client: client as never,
    auth: {} as never,
    config: { environment: 'sandbox', ...configOverrides } as never,
  };
}

export function getTool(scope: Scope, name: string): ToolDefinition {
  const tool = scope.tools.find((t) => t.name === name);
  if (!tool) throw new Error(`Tool not found in scope ${scope.name}: ${name}`);
  return tool;
}

/** Parse input through the tool's schema then invoke its handler (mirrors the server). */
export async function callTool(
  tool: ToolDefinition,
  input: unknown,
  ctx: ToolContext
): Promise<string> {
  const parsed = tool.schema.parse(input ?? {});
  return tool.handler(parsed, ctx);
}
