# Metric Insights API Tests

A comprehensive test suite for validating Metric Insights API functionality. This repository helps you verify that your Metric Insights instance works correctly after upgrades and provides examples for creating your own tests.

## ⚡ Quick Start 

### 1. Prerequisites

**Required Software:**
- **Node.js 18+** ([Download here](https://nodejs.org/))
- **Git** (for cloning the repository)
- **Playwright** (installed automatically via `npm install`, browsers installed separately)

**Required Access:**
- Access to a Metric Insights instance (v7.2.0+)
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
cp .env.example .env.staging
```

**For multiple environments:**
```bash
cp .env.example .env.dev
cp .env.example .env.staging
cp .env.example .env.production
```

Edit your `.env` file(s) with instance details, (see .env.example for all variables). Important: Never commit `.env*` files to version control! They are already in `.gitignore`.

### 4. Verify Setup

Run a quick test to verify everything is configured correctly:

```bash
# Test authentication
npm test tests/auth/auth-admin.spec.ts
```

### 5. Run Tests

**Using .env.staging:**
```bash
# Run all tests
 npm run test:dev staging tests/  

# Run specific test file
npm run test:dev staging auth-admin.spec.ts

# Run specific directory
 npm run test:dev staging tests/auth
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

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/metricinsights/playwright-testing-guide/issues)
- **Documentation**: [help.metricinsights.com](https://help.metricinsights.com)

## 🔄 Version Compatibility

| Test Suite Version | MI Version | Status |
|-------------------|------------|--------|
| 1.x | 7.2.0+ | ✅ Supported |

Always test against your specific MI version before relying on these tests in production.

---

**Note**: These tests create temporary test data (prefixed with "Playwright") and clean it up automatically. However, always run tests on non-production instances first to ensure they work correctly with your configuration.
