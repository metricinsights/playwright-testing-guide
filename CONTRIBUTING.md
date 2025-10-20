# Contributing to Metric Insights API Tests

Thank you for your interest in contributing! This document provides guidelines for contributing to this test suite.

## 🎯 Ways to Contribute

- **Report Bugs**: Found an issue? Let us know!
- **Suggest Features**: Have an idea for a new test? Share it!
- **Submit Tests**: Add new test cases or improve existing ones
- **Improve Documentation**: Help make the docs clearer
- **Fix Issues**: Pick up an existing issue and solve it

## 🚀 Getting Started

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR_USERNAME/metric-insights-api-tests.git
cd metric-insights-api-tests
npm install
```

### 2. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-number
```

### 3. Set Up Environment

```bash
cp .env.example .env
# Edit .env with your test instance details
```

## 📝 Coding Standards

### Test File Naming

- Use lowercase with hyphens: `my-feature.spec.ts`
- Helper files without `.spec`: `my-feature.ts`
- Keep related specs and helpers together

Example:
```
tests/
  dataset.spec.ts      # Tests
  dataset.ts           # Helper functions
```

### Code Style

**TypeScript:**
- Use camelCase for functions, variables, parameters
- Use PascalCase for types and interfaces
- Use UPPER_SNAKE_CASE for constants

**Examples:**
```typescript
// ✅ Good
const myVariable = 'value';
function getUserData() { }
const API_TIMEOUT = 5000;

// ❌ Bad
const my_variable = 'value';
function get_user_data() { }
const apiTimeout = 5000;
```

### Line Length
- Maximum 120 characters per line
- Use Props type if function has more than 4 parameters

### Test Structure

Each test should:
1. **Be independent** - Not rely on other tests
2. **Clean up** - Delete created resources
3. **Be focused** - Test one thing (Single Responsibility)
4. **Be clear** - Have descriptive names

**Example:**
```typescript
import { test, expect } from '@playwright/test';
import { getTokens } from '../utils/auth';
import { createDataset, deleteDataset } from '../utils/dataset';

let tokens: Awaited<ReturnType<typeof getTokens>>;
let datasetId: number;

test.describe('Dataset API', () => {
  test.beforeAll(async () => {
    tokens = await getTokens();
  });

  test('should create dataset with valid data', async () => {
    const response = await createDataset(tokens.admin, {
      name: 'Test Dataset',
      measurement_interval: 'daily'
    });
    
    expect(response.status).toBe(200);
    datasetId = response.data.dataset.id;
  });

  test.afterAll(async () => {
    // Cleanup: Delete all created resources
    if (datasetId) {
      await deleteDataset(tokens.admin, datasetId);
    }
  });
});
```

## 🔐 Security Guidelines

### Never Commit Sensitive Data

- ❌ No hardcoded credentials
- ❌ No real API keys
- ❌ No production URLs
- ✅ Use environment variables
- ✅ Update .env.example with new variables

### Environment Variables

```typescript
// ✅ Good
const url = process.env.BASE_URL;

// ❌ Bad
const url = 'https://mycompany.metricinsights.com';
```

### Naming Test Resources

All created resources must include "Playwright" in their names:

```typescript
// ✅ Good
const name = 'Playwright_Dataset_' + randomBytes(4).toString('hex');

// ❌ Bad
const name = 'My Dataset';
```

## 🧪 Writing Tests

### 1. Use Test Helpers

Leverage existing helper functions:

```typescript
import { testLogger, TEST_CONSTANTS, nameGenerators } from '../utils/test-helpers';

// Logging
testLogger.setup('Creating test dataset');
testLogger.success('Dataset created', datasetId);
testLogger.error('Failed to create', error);

// Constants
expect(response.status).toBe(TEST_CONSTANTS.EXPECTED_STATUS.SUCCESS);

// Name generation
const name = nameGenerators.dataset();
```

### 2. Validate Responses

Always validate:
- Status codes
- Response structure
- Required fields

```typescript
const response = await apiInstance.get('/api/dataset', {
  headers: { token }
});

// Validate status
expect(response.status).toBe(200);

// Validate structure
expect(response.data).toHaveProperty('datasets');
expect(Array.isArray(response.data.datasets)).toBe(true);

// Validate content
expect(response.data.datasets[0]).toHaveProperty('id');
expect(response.data.datasets[0]).toHaveProperty('name');
```

### 3. Handle Errors Properly

```typescript
try {
  const response = await deleteDataset(token, datasetId);
  expect(response.status).toBe(204);
} catch (error) {
  // Don't fail cleanup - just log
  testLogger.error('Cleanup failed', error);
}
```

### 4. Use Descriptive Test Names

```typescript
// ✅ Good
test('should create dataset with all required fields', async () => {});
test('should return 404 when dataset does not exist', async () => {});
test('should update dataset name successfully', async () => {});

// ❌ Bad
test('dataset test', async () => {});
test('test 1', async () => {});
test('check dataset', async () => {});
```

## 📚 Documentation

### JSDoc Comments

Add JSDoc comments for helper functions:

```typescript
/**
 * Creates a new dataset via API
 * 
 * @param token - Authentication token
 * @param data - Dataset configuration
 * @returns Promise with API response containing dataset ID
 * 
 * @example
 * const response = await createDataset(token, {
 *   name: 'My Dataset',
 *   measurement_interval: 'daily'
 * });
 */
export async function createDataset(
  token: string,
  data: DatasetConfig
): Promise<ApiResponse<Dataset>> {
  // Implementation
}
```

### Update Documentation

If you add new features, update:
- README.md - Add to test suites list
- API_REFERENCE.md - Document new functions
- EXAMPLES.md - Add usage examples

## 🧹 Before Submitting

### Checklist

- [ ] Tests pass locally: `npm test`
- [ ] Code follows style guidelines
- [ ] No ESLint warnings or errors
- [ ] All created resources are cleaned up
- [ ] Test names are descriptive
- [ ] Added/updated documentation
- [ ] No sensitive data in code
- [ ] Environment variables used correctly
- [ ] Used Crypto for random data generation
- [ ] Commit messages are clear

### Run Quality Checks

```bash
# Run tests
npm test

# Check TypeScript
npm run build

# Format code (if you have prettier configured)
npm run format
```

## 📤 Submitting Changes

### Commit Messages

Use clear, descriptive commit messages:

```bash
# ✅ Good
git commit -m "Add: dataset data filtering tests"
git commit -m "Fix: cleanup not running in metric tests"
git commit -m "Update: README with new environment variables"

# ❌ Bad
git commit -m "changes"
git commit -m "fix bug"
git commit -m "wip"
```

### Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub with:
- Clear title describing the change
- Description of what was changed and why
- Reference to any related issues
- Screenshots if applicable

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Code improvement

## Testing
How was this tested?

## Checklist
- [ ] Tests pass
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] No sensitive data
```

## 🐛 Reporting Issues

### Bug Reports

Include:
- **Description**: What happened?
- **Expected**: What should happen?
- **Steps to Reproduce**: How to reproduce?
- **Environment**: MI version, Node version
- **Logs**: Error messages or logs

### Feature Requests

Include:
- **Use Case**: Why is this needed?
- **Proposed Solution**: How should it work?
- **Alternatives**: Other options considered?

## ❓ Questions?

- Open an issue for questions
- Check existing issues first
- Be respectful and patient

## 📜 Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers
- Accept constructive criticism
- Focus on what's best for the community

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Publishing others' private information
- Unprofessional conduct

## 🙏 Thank You!

Every contribution helps make this project better for everyone. Thank you for taking the time to contribute!

---

**Questions?** Open an issue or reach out to the maintainers.

