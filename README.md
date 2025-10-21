# Metric Insights API Tests

A comprehensive test suite for validating Metric Insights API functionality. This repository helps you verify that your Metric Insights instance works correctly after upgrades and provides examples for creating your own tests.

## ⚡ Quick Start (5 minutes)

### 1. Prerequisites

**Required Software:**
- **Node.js 18+** ([Download here](https://nodejs.org/))
- **Git** (for cloning the repository)

**Required Access:**
- Access to a Metric Insights instance (v7.1.2+)
- Admin account credentials
- API Application credentials (ID and Key)

**How to get API credentials:**
1. Login to your MI instance as administrator
2. Navigate to **Admin > System > External Applications**
3. Click **"+ Create New Application"**
4. Save the Application ID and Application Key

### 2. Installation

```bash
# Clone the repository
git clone https://github.com/metricinsights/playwright-testing-guide.git
cd playwright-testing-guide

# Install dependencies (includes Playwright, TypeScript, and all required packages)
npm install

# Install Playwright browsers (first time only)
npx playwright install chromium
```

### 3. Configuration

**For single environment:**
```bash
cp .env.example .env
```

**For multiple environments:**
```bash
cp .env.example .env.dev
cp .env.example .env.staging
cp .env.example .env.production
```

Edit your `.env` file(s) with instance details:

```bash
BASE_URL=https://your-instance.metricinsights.com
APPLICATION_ID=your_app_id
APPLICATION_KEY=your_app_key
USERNAME_ADMIN=admin
DEFAULT_USERNAME_ADMIN=admin
DEFAULT_PASSWORD_ADMIN=your_password
USERNAME_POWER=playwright_power_user
USERNAME_REGULAR=playwright_regular_user
# ... (see .env.example for all variables)
```

**Important:** Never commit `.env*` files to version control! They are already in `.gitignore`.

### 4. Verify Setup

Run a quick test to verify everything is configured correctly:

```bash
# Test authentication
npm test tests/auth/auth-admin.spec.ts
```

Expected output:
```
✓ should retrieve Admin token successfully (200ms)
```

If you see this, congratulations! Your setup is complete! 🎉

### 5. Run Tests

**Single environment (using .env):**
```bash
# Run all tests
npm test

# Run specific test file
npm test tests/content/dataset.spec.ts

# Run specific directory
npm test tests/auth/

# Run with headed browser (visible)
npm run test:headed

# Run in UI mode (interactive)
npm run test:ui

# View HTML report after tests
npm run test:report
```

**Multiple environments (using .env.<instance>):**
```bash
# Interactive selector - choose environment and test file
npm run test:dev

# Or specify directly:
npm run test:dev staging                              # Run all tests
npm run test:dev staging tests/auth/auth-admin.spec.ts  # Run specific file
npm run test:dev production tests/content/            # Run specific directory
```

## 📁 Test Structure

```
tests/
├── auth/              # Authentication and token management
├── users/             # User CRUD operations and access control
├── content/           # Datasets, metrics, categories
├── organization/      # Folders, favorites, topics
├── advanced/          # Dimensions, glossary terms
└── utils/             # Shared helper functions
```

## 🧪 Available Test Suites

### Core Functionality
- **Authentication** (`tests/auth/`) - Token generation and validation
- **Users** (`tests/users/`) - User management and access control
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

## 📖 Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `BASE_URL` | Yes | Your MI instance URL | `https://demo.metricinsights.com` |
| `APPLICATION_ID` | Yes | API Application ID | `your-app-id` |
| `APPLICATION_KEY` | Yes | API Application Key | `your-secret-key` |
| `USERNAME_ADMIN` | Yes | Admin username | `admin` |
| `DEFAULT_USERNAME_ADMIN` | Yes | Admin username for UI login | `admin` |
| `DEFAULT_PASSWORD_ADMIN` | Yes | Admin password | `admin123` |
| `USERNAME_POWER` | No | Test power user (auto-created) | `playwright_power_user` |
| `USERNAME_REGULAR` | No | Test regular user (auto-created) | `playwright_regular_user` |

See `.env.example` for the complete list of variables.

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

## ✍️ Writing Your Own Tests

### Example: Create a Simple Test

Create `tests/my-custom-test.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import { getTokens } from './utils/auth';
import { apiInstance } from './utils/auth';

let tokens: Awaited<ReturnType<typeof getTokens>>;

test.describe('My Custom Tests', () => {
  test.beforeAll(async () => {
    tokens = await getTokens();
  });

  test('My first API test', async () => {
    // Make API request
    const response = await apiInstance.get('/api/metric', {
      headers: { token: tokens.admin }
    });
    
    // Validate response
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('metrics');
  });
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
import { createCategory, deleteCategory } from './content/category';

let tokens: Awaited<ReturnType<typeof getTokens>>;
let categoryId: number;

test.describe('Category Tests', () => {
  test.beforeAll(async () => {
    tokens = await getTokens();
  });

  test('should create a category', async () => {
    const response = await createCategory(
      tokens.admin,
      'Playwright Test Category'
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

- **Issues**: [GitHub Issues](https://github.com/metricinsights/playwright-testing-guide/issues)
- **Metric Insights Support**: support@metricinsights.com
- **Documentation**: [help.metricinsights.com](https://help.metricinsights.com)

## 🔄 Version Compatibility

| Test Suite Version | MI Version | Status |
|-------------------|------------|--------|
| 1.x | 7.1.2+ | ✅ Supported |

Always test against your specific MI version before relying on these tests in production.

---

**Note**: These tests create temporary test data (prefixed with "Playwright") and clean it up automatically. However, always run tests on non-production instances first to ensure they work correctly with your configuration.
