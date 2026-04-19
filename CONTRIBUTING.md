# Contributing

Thank you for your interest in contributing to revolut-mcp!

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- A Revolut Developer account (sandbox credentials)

### Local Setup

```bash
git clone https://github.com/yourusername/revolut-mcp.git
cd revolut-mcp
npm install
cp .env.sandbox.template .env
# Fill in .env with your sandbox credentials
```

### Running Tests

```bash
npm test             # run all tests
npm run test:watch   # watch mode
npm run test:coverage
```

### Building

```bash
npm run build        # compiles TypeScript → dist/
```

## Contribution Guidelines

### Branch Naming

| Prefix | Use |
|---|---|
| `feature/` | New tools or capabilities |
| `fix/` | Bug fixes |
| `docs/` | Documentation only |
| `chore/` | Maintenance, deps, CI |

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(transactions): add pagination support
fix(auth): handle expired refresh token gracefully
docs(readme): clarify sandbox setup steps
```

GitVersion reads these prefixes to determine the next semantic version automatically.

### Pull Requests

1. Fork the repo and create your branch from `master`
2. Add or update tests for any changed behaviour
3. Make sure `npm run lint` and `npm test` pass
4. Open a PR with a clear description of what changed and why
5. Reference any related issues with `Closes #N`

### Adding a New Tool

1. Define input schema with Zod in `src/tools/<area>-tools.ts`
2. Implement the tool function (returns a formatted string)
3. Register it in `src/index.ts` — both in `ListToolsRequestSchema` and `CallToolRequestSchema`
4. Add unit tests in `tests/<area>.test.ts`
5. Update the Tools Reference table in `README.md`

## Code Style

- TypeScript strict mode is enforced
- No `any` types
- Prefer explicit return types on exported functions
- Keep tool functions pure (injectable dependencies, not hardcoded globals)
- No inline comments explaining *what* the code does — only *why* when non-obvious

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
