# Tommy Modules

Monorepo for Tommy project modules.

## 📦 Packages

- **`@miracle380301/common`** - Common modules for frontend and backend
- **`@miracle380301/social-auth`** - Social authentication module (coming soon)

## 🏗️ Structure

```
tommy-common/
├── packages/
│   ├── common/              # @miracle380301/common
│   │   ├── backend/        # Backend modules (auth, database, queue, upload)
│   │   ├── frontend/       # React components (level1, level2, hooks, utils)
│   │   ├── stories/        # Storybook stories
│   │   ├── dist/           # Build output
│   │   ├── doc/            # Documentation
│   │   ├── test/           # Tests
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── index.ts
│   └── social-auth/        # @miracle380301/social-auth
│       ├── backend/        # OAuth services (Google, Kakao, Apple)
│       ├── frontend/       # Login components
│       └── stories/        # Storybook stories
├── .storybook/              # Storybook configuration
├── stories/                 # Demo stories
├── package.json             # Monorepo root
├── pnpm-workspace.yaml
├── tsconfig.json            # Base TypeScript config
└── README.md
```

## 🚀 Development Setup

```bash
# Install dependencies
npm install

# Build all packages
pnpm build

# Watch mode
pnpm dev

# Clean
pnpm clean
```

## 📚 Component Documentation (Storybook)

View all components with interactive examples:

```bash
# Run Storybook
npm run storybook

# Build Storybook for deployment
npm run build-storybook
```

Storybook will open at `http://localhost:6006` where you can:
- Browse all components from `@miracle380301/common` and `@miracle380301/social-auth`
- Test different props and states interactively
- View component documentation
- Copy code examples

## 📖 Package Usage

### @miracle380301/common

```bash
npm install @miracle380301/common
```

**Frontend Components:**
```tsx
import {
  Button,
  Modal,
  Input,
  LoginForm
} from '@miracle380301/common';

function App() {
  return (
    <>
      <Button variant="primary">Click me</Button>
      <LoginForm onSubmit={handleLogin} />
    </>
  );
}
```

**Backend Modules:**
```javascript
const { setupExpress, logger } = require('@miracle380301/common/backend');

const app = setupExpress();
logger.info('Server started');
```

### @miracle380301/social-auth (Coming Soon)

```bash
npm install @miracle380301/social-auth
```

## 📝 Publishing

Each package can be published independently:

```bash
cd packages/common
npm publish

# Or for GitHub Package Registry
npm publish --registry=https://npm.pkg.github.com
```

## 🔧 Adding a New Package

```bash
# Create package directory
mkdir -p packages/your-package

# Create package.json
cd packages/your-package
npm init -y

# Update package name to @miracle380301/your-package
# Add to pnpm-workspace.yaml (already includes 'packages/*')
```

## 📝 License

MIT
