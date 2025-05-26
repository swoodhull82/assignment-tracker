# Frontend Testing Setup Notes (Jest & React Testing Library)

This document outlines the typical dependencies and setup steps required to run the provided React component tests, assuming a Create React App-like environment or a manual setup.

## 1. Dependencies

Ensure the following dependencies are listed in your `package.json` and installed:

```json
{
  "devDependencies": {
    "@testing-library/jest-dom": "^5.17.0", // or newer
    "@testing-library/react": "^13.4.0",    // or newer (v14+ for React 18)
    "@testing-library/user-event": "^13.5.0", // or newer (v14+ for React 18)
    "@types/jest": "^27.5.2", // or newer
    "jest": "^27.5.1",           // or newer (v28+ for React 18, might need jest-environment-jsdom)
    "jest-environment-jsdom": "^28.1.3", // if using Jest 28+
    "ts-jest": "^27.1.5",       // or newer (for TypeScript projects)
    "identity-obj-proxy": "^3.0.0" // For mocking CSS modules
  }
}
```

**Installation:**
```bash
npm install --save-dev @testing-library/jest-dom @testing-library/react @testing-library/user-event @types/jest jest jest-environment-jsdom ts-jest identity-obj-proxy
# or
yarn add --dev @testing-library/jest-dom @testing-library/react @testing-library/user-event @types/jest jest jest-environment-jsdom ts-jest identity-obj-proxy
```

## 2. Jest Configuration

If not using Create React App (which pre-configures Jest), you might need a `jest.config.js` (or `jest.config.ts`) file in your project root:

```javascript
// jest.config.js
module.exports = {
  roots: ['<rootDir>/src'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx', // Or your main entry point
    '!src/reportWebVitals.ts', // CRA specific
    '!src/setupTests.ts' // CRA specific
  ],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'], // Optional: for global test setup
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}',
  ],
  testEnvironment: 'jsdom', // Or 'jest-environment-jsdom' for Jest 28+
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest', // If you have Babel setup for JS files
    '^.+\\.css$': '<rootDir>/config/jest/cssTransform.js', // Example for CSS, or use identity-obj-proxy
    '^(?!.*\\.(js|jsx|mjs|cjs|ts|tsx|css|json)$)': '<rootDir>/config/jest/fileTransform.js', // Example for other files
  },
  transformIgnorePatterns: [
    '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs|cjs|ts|tsx)$',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  modulePaths: [],
  moduleNameMapper: {
    '^react-native$': 'react-native-web',
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy', // Mocks CSS Modules
    // Add any other path aliases from tsconfig.json if you use them
    // Example: '^@components/(.*)$': '<rootDir>/src/components/$1'
  },
  moduleFileExtensions: [
    'web.js', 'js', 'web.ts', 'ts', 'web.tsx', 'tsx', 'json', 'web.jsx', 'jsx', 'node',
  ],
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  resetMocks: true,
};
```
*Note: `babel-jest` and the CSS/file transforms might require additional configuration or dependencies if not using a framework like CRA.*

## 3. TypeScript Configuration (if using TypeScript)

Ensure your `tsconfig.json` includes `jest` in the `types` array:

```json
{
  "compilerOptions": {
    // ... other options
    "jsx": "react-jsx",
    "esModuleInterop": true,
    "types": ["jest", "node"] // Add "jest"
  },
  "include": ["src"]
}
```

## 4. Setup File (Optional but Recommended)

Create `src/setupTests.ts` (or `.js`) for global test configurations, like importing `@testing-library/jest-dom`:

```typescript
// src/setupTests.ts
import '@testing-library/jest-dom';

// You can add other global setup here, like:
// jest.mock('./my-global-module');

// Mock IntersectionObserver if your components use it and it's not available in JSDOM
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}

  disconnect() {
    return null;
  }

  observe() {
    return null;
  }

  takeRecords() {
    return [];
  }

  unobserve() {
    return null;
  }
};

// Mock window.matchMedia
global.matchMedia = global.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {}
  };
};

```

## 5. Running Tests

Add a script to your `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

Then run tests using `npm test` or `yarn test`.

This setup provides a basic environment for testing React components with Jest and React Testing Library. Adjust paths and configurations according to your specific project structure.
```
