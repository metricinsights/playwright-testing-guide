# Metric Insights API Tests

A comprehensive test suite for validating Metric Insights API functionality. This repository helps you verify that your Metric Insights instance works correctly after upgrades and provides examples for creating your own tests.

## 🎯 Purpose

- **Smoke Testing**: Verify core API functionality after version upgrades
- **Regression Testing**: Ensure no breaking changes in your instance
- **Learning Resource**: Examples of working with Metric Insights API
- **Custom Test Base**: Foundation for your own automated tests

## ⚡ Quick Start (5 minutes)

### 1. Prerequisites

Before you begin, ensure you have the following installed and configured:

**Required Software:**
- **Node.js 18+** ([Download here](https://nodejs.org/))
  - Check version: `node --version` (should show v18.0.0 or higher)
  - npm comes with Node.js automatically
- **Git** (for cloning the repository)

**One-time setup:**
- npx playwright install chromium - Install browser

**What npm install does:**
- Installs Playwright
- Installs TypeScript
- Installs all dependencies (axios, ajv, prompts, cac, chalk, etc.)

**Required Access:**
- Access to a Metric Insights instance (v7.1.2+)
- Admin account credentials
- API Application credentials (ID and Key)

**How to get API credentials:**
1. Login to your MI instance as administrator
2. Navigate to **Admin > System > API Keys**
3. Click **"+ Create New Application"**
4. Save the Application ID and Application Key (you won't see the key again!)

### 2. Installation

```bash
# Clone the repository
git clone https://github.com/your-org/metric-insights-api-tests.git
cd metric-insights-api-tests

# Install dependencies (includes Playwright, TypeScript, and all required packages)
npm install

# Install Playwright browsers (first time only)
npx playwright install chromium
```

**What gets installed:**
- Playwright Test framework
- TypeScript compiler
- Axios for API requests
- Testing utilities (ajv, dotenv-cli)
- Development tools (ESLint, Prettier)

### 3. Configuration

**For single environment:**
```bash
cp .env.example .env
```

**For multiple environments:**
```bash
cp .env.example .env.staging
cp .env.example .env.production
cp .env.example .env.dev
```

Edit each file with the corresponding instance details:

```bash
BASE_URL=https://your-instance.metricinsights.com
APPLICATION_ID=your_app_id
APPLICATION_KEY=your_app_key
USERNAME_ADMIN=admin
DEFAULT_USERNAME_ADMIN=admin
DEFAULT_PASSWORD_ADMIN=your_password
USERNAME_POWER=test_power_user
USERNAME_REGULAR=test_regular_user
# ... (see .env.example for all variables)
```

**Important:** Never commit `.env*` files to version control! They are already in `.gitignore`.

### 4. Verify Setup

Run a quick test to verify everything is configured correctly:

```bash
# Test authentication with default .env
npm test tests/auth/auth-admin.spec.ts
```

Expected output:
```
✓ should retrieve Admin token successfully (200ms)
```

If you see this, congratulations! Your setup is complete! 🎉

### 5. Run Tests

**With default .env file:**
```bash
# Run all tests
npm test

# Run specific test file
npm test tests/content/dataset.spec.ts

# Run with headed browser (visible)
npm run test:headed

# Run in UI mode (interactive)
npm run test:ui

# View HTML report after tests
npm run test:report
```

**With environment selection (test:dev):**
```bash
# Interactive selector - choose environment and test file
npm run test:dev

# Or specify environment and file directly:
npm run test:dev staging tests/auth/auth-admin.spec.ts
npm run test:dev production tests/content/dataset.spec.ts
```

### Multiple Environments

If you work with multiple MI instances, create environment-specific files:

```bash
# Create separate env files for each instance
.env.staging      # Staging environment
.env.production   # Production environment  
.env.dev          # Development environment
.env.qa           # QA environment
```

**Example .env.staging:**
```bash
BASE_URL=https://staging.metricinsights.com
APPLICATION_ID=staging_app_id
APPLICATION_KEY=staging_app_key
USERNAME_ADMIN=staging_admin
DEFAULT_USERNAME_ADMIN=staging_admin
DEFAULT_PASSWORD_ADMIN=staging_password
# ... other variables
```

**Run tests with specific environment:**
```bash
# Method 1: Interactive selector (recommended)
npm run test:dev staging              # Select test file interactively
npm run test:dev production          # Select test file interactively

# Method 2: Specify both environment and file
npm run test:dev staging tests/auth/auth-admin.spec.ts
npm run test:dev production tests/content/dataset.spec.ts

# Method 3: Using dotenv-cli directly
npx dotenv -e .env.staging -- npm test
npx dotenv -e .env.production -- npm test tests/content/dataset.spec.ts
```

## 📁 Test Structure

```
tests/
├── auth/              # Authentication and token management
├── users/             # User CRUD operations
├── content/           # Datasets, metrics, categories
├── organization/      # Folders, favorites, topics
├── advanced/          # Dimensions, glossary, custom fields
├── error-handling/    # Error scenarios and edge cases
└── utils/             # Shared helper functions
```

## 🧪 Available Test Suites

### Core Functionality
- **Authentication** (`tests/auth/`) - Token generation and validation
- **Users** (`tests/users/`) - User management operations
- **Datasets** (`tests/content/dataset.spec.ts`) - Dataset CRUD and data operations
- **Metrics** (`tests/content/metric.spec.ts`) - Metric management
- **Categories** (`tests/content/category.spec.ts`) - Category operations

### Organization
- **Folders** (`tests/organization/folder.spec.ts`) - Folder management
- **Favorites** (`tests/organization/favorite.spec.ts`) - Favorite collections
- **Topics** (`tests/organization/topic.spec.ts`) - Topic management

### Advanced Features
- **Dimensions** (`tests/advanced/dimension.spec.ts`) - Dimension management
- **Glossary Terms** (`tests/advanced/glossary-term.spec.ts`) - Business glossary
- **Custom Fields** (`tests/advanced/custom-field.spec.ts`) - Custom field management

### Error Handling
- **Session Errors** (`tests/error-handling/`) - 401, 412 error scenarios

## 📖 Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `BASE_URL` | Yes | Your MI instance URL | `https://demo.metricinsights.com` |
| `APPLICATION_ID` | Yes | API Application ID | `your-app-id` |
| `APPLICATION_KEY` | Yes | API Application Key | `your-secret-key` |
| `USERNAME_ADMIN` | Yes | Admin username | `admin` |
| `DEFAULT_USERNAME_ADMIN` | Yes | Admin username for UI login | `admin` |
| `DEFAULT_PASSWORD_ADMIN` | Yes | Admin password | `admin123` |
| `USERNAME_POWER` | No | Test power user (auto-created) | `test_power` |
| `USERNAME_REGULAR` | No | Test regular user (auto-created) | `test_regular` |

## 🔧 Common Tasks

### Run Specific Test Suite

```bash
# Run only authentication tests
npm test tests/auth/

# Run only dataset tests
npm test tests/content/dataset.spec.ts

# Run with pattern
npm test --grep "should create"
```

### Debug Failed Tests

```bash
# Run in debug mode
npm run test:debug

# Run with visible browser
npm run test:headed

# Show test report
npx playwright show-report
```

### View Test Results

After running tests, open the HTML report:

```bash
npx playwright show-report
```

## ✍️ Writing Your Own Tests

### Example: Create a Simple Test

Create `tests/my-custom-test.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import { getToken, apiInstance } from './utils/auth';

test('My first API test', async () => {
  // Get authentication token
  const { data: { token } } = await getToken(process.env.USERNAME_ADMIN!);
  
  // Make API request
  const response = await apiInstance.get('/api/metric', {
    headers: { token }
  });
  
  // Validate response
  expect(response.status).toBe(200);
  expect(response.data).toHaveProperty('metrics');
});
```

### Best Practices

1. **Cleanup After Tests**: Always delete created resources in `test.afterAll()`
2. **Use Test Helpers**: Leverage utilities in `tests/utils/` for common operations
3. **Independent Tests**: Each test should work standalone
4. **Descriptive Names**: Use clear test descriptions
5. **Error Handling**: Use try-catch for cleanup operations

### Example with Cleanup

```typescript
import { test, expect } from '@playwright/test';
import { getTokens } from './utils/auth';
import { createCategory, deleteCategory } from './utils/category';

let tokens: Awaited<ReturnType<typeof getTokens>>;
let categoryId: number;

test.describe('My test suite', () => {
  test.beforeAll(async () => {
    tokens = await getTokens();
  });

  test('should create a category', async () => {
    const response = await createCategory(
      tokens.admin,
      'My Test Category'
    );
    
    categoryId = response.data.category.id;
    expect(response.status).toBe(200);
  });

  test.afterAll(async () => {
    // Cleanup
    if (categoryId) {
      await deleteCategory(tokens.admin, categoryId);
    }
  });
});
```

## 🐛 Troubleshooting

### "Invalid URL" Error

**Problem**: Tests fail with URL-related errors

**Solution**: Check that `BASE_URL` in `.env` is set correctly and includes `https://`

### "Session Expired" (412 Error)

**Problem**: Getting 412 errors during tests

**Solution**: This is expected for some error-handling tests. Check that you're using fresh tokens for actual API tests.

### "Unauthorized" (401 Error)

**Problem**: Cannot authenticate

**Solution**: 
- Verify `APPLICATION_ID` and `APPLICATION_KEY` are correct
- Check that the API user has necessary permissions
- Ensure the admin user credentials are correct

### Tests Timing Out

**Problem**: Tests exceed timeout limits

**Solution**:
- Increase timeout in `playwright.config.ts`: `timeout: 60000`
- Check network connectivity to your instance
- Verify instance performance

### No Tests Found

**Problem**: Playwright doesn't find tests

**Solution**:
- Ensure test files end with `.spec.ts`
- Check that `testDir` in `playwright.config.ts` points to correct directory
- Run `npx playwright test --list` to see discovered tests

## 📚 Additional Resources

- [Metric Insights API Documentation](https://help.metricinsights.com/m/Integrations/l/1456098-restful-api)
- [Playwright Documentation](https://playwright.dev/)
- [Contributing Guidelines](CONTRIBUTING.md)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Node.js Download](https://nodejs.org/)

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Quick Contribution Guide

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-test`
3. Make your changes
4. Ensure tests pass: `npm test`
5. Commit: `git commit -m "Add: my new test"`
6. Push: `git push origin feature/my-test`
7. Create a Pull Request


## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/your-org/metric-insights-api-tests/issues)
- **Metric Insights Support**: support@metricinsights.com
- **Documentation**: [help.metricinsights.com](https://help.metricinsights.com)

## 🔄 Version Compatibility

| Test Suite Version | MI Version | Status |
|-------------------|------------|--------|
| 1.x | 6.5+ | ✅ Supported |
| 2.x | 7.0+ | ✅ Supported |

Always test against your specific MI version before relying on these tests in production.

---

**Note**: These tests create temporary test data and clean it up automatically. However, always run tests on non-production instances first to ensure they work correctly with your configuration.

