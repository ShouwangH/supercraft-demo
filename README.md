# Supercraft Demo

Photo-to-2.5D Product Placement Demo - A web app for placing 3D product models into photos.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run check-loc` | Check lines of code limits |

## Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # React components
├── lib/              # Utility functions and business logic
└── types/            # TypeScript type definitions
```

## Architecture Decisions

See [PR-PLAN.md](./PR-PLAN.md) for the full implementation plan.

### Key Decisions
- **Storage**: In-memory + local /tmp (swappable to S3 later)
- **3D**: Three.js via react-three-fiber with contact shadows
- **Testing**: Vitest with data contract tests (no pixel tests)
- **LOC Limits**: 300 lines/file, 80 lines/function (warnings, not blocking)

## Development

### Code Quality

ESLint enforces:
- Max 300 lines per file
- Max 80 lines per function
- No console.log (use console.warn/error)

### Testing

Tests focus on data contracts and determinism, not visual output:

```bash
npm run test        # Run all tests
npm run test:watch  # Watch mode
```

## License

Private - not for redistribution.
