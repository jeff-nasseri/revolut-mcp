import { Scope, ToolDefinition } from '../utils/tool.js';
import { authScope } from './auth/index.js';
import { accountsScope } from './accounts/index.js';
import { transactionsScope } from './transactions/index.js';
import { counterpartiesScope } from './counterparties/index.js';
import { paymentsScope } from './payments/index.js';
import { foreignExchangeScope } from './foreign-exchange/index.js';
import { teamScope } from './team/index.js';
import { sandboxScope } from './sandbox/index.js';

/** All scopes, in a stable display order. */
export const scopes: Scope[] = [
  authScope,
  accountsScope,
  transactionsScope,
  counterpartiesScope,
  paymentsScope,
  foreignExchangeScope,
  teamScope,
  sandboxScope,
];

/** Flattened list of every tool across all scopes. */
export function allTools(): ToolDefinition<any>[] {
  return scopes.flatMap((scope) => scope.tools);
}
