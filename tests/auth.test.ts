import { authScope } from '../src/scope/auth/index.js';
import { callTool, getTool } from './mocks/revolut-client.mock.js';
import { ToolContext } from '../src/utils/tool.js';

function ctxWithAuth(auth: Record<string, unknown>): ToolContext {
  return { client: {} as never, auth: auth as never, config: { environment: 'sandbox' } as never };
}

describe('auth scope', () => {
  it('setup_auth returns the authorization URL and next-step guidance', async () => {
    const auth = {
      buildAuthorizationUrl: jest
        .fn()
        .mockReturnValue('https://sandbox-business.revolut.com/app-confirm?client_id=x&response_type=code'),
    };
    const result = await callTool(getTool(authScope, 'setup_auth'), {}, ctxWithAuth(auth));
    expect(auth.buildAuthorizationUrl).toHaveBeenCalledTimes(1);
    expect(result).toContain('app-confirm');
    expect(result).toContain('complete_auth');
  });

  it('complete_auth exchanges the code and reports the refresh token', async () => {
    const auth = {
      exchangeCode: jest
        .fn()
        .mockResolvedValue({ accessToken: 'a', refreshToken: 'r', expiresAt: Date.now() + 2_400_000 }),
    };
    const result = await callTool(getTool(authScope, 'complete_auth'), { code: 'oa_sand_x' }, ctxWithAuth(auth));
    expect(auth.exchangeCode).toHaveBeenCalledWith('oa_sand_x');
    expect(result).toContain('Authentication complete');
    expect(result).toContain('refresh token');
  });

  it('complete_auth requires a non-empty code', async () => {
    const auth = { exchangeCode: jest.fn() };
    await expect(callTool(getTool(authScope, 'complete_auth'), {}, ctxWithAuth(auth))).rejects.toThrow();
    expect(auth.exchangeCode).not.toHaveBeenCalled();
  });
});
