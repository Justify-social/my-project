# Cypress E2E Test Organization Guide

## 📁 Directory Structure

```
config/cypress/e2e/
├── auth/                    # Authentication & login tests
│   ├── flow.cy.js          # Complete authentication flows
│   └── signin.cy.js        # Sign-in specific tests
├── billing/                # Billing & payment tests
├── brand-health/           # Brand health feature tests
├── brand-lift/             # Brand lift study tests
├── campaigns/              # Campaign management tests
│   ├── api.cy.js          # Campaign API tests
│   ├── crud.cy.js         # Create/Read/Update/Delete operations
│   ├── details.cy.js      # Campaign details page tests
│   ├── list.cy.js         # Campaign list page tests
│   ├── README.md          # Campaign-specific test documentation
│   └── wizard/            # Campaign creation wizard tests
├── dashboard/              # Dashboard page tests
├── layout/                 # Layout & navigation tests
├── reports/                # Reporting feature tests
├── settings/               # Settings page tests
│   ├── branding.cy.js     # Branding settings tests
│   ├── settings.cy.js     # General settings tests
│   └── team-management.cy.js # Team management tests
├── shared/                 # Shared utilities & cross-feature tests
│   ├── basic-functionality.cy.js     # Basic app functionality tests
│   ├── best-practices-example.cy.js  # Example of best practices
│   └── test-auth.cy.js               # Authentication command tests
├── campaigns-update.md     # Campaign test update documentation
└── README.md              # General E2E testing documentation
```

## 🎯 Test Organization Principles

### 1. **Feature-Based Organization**

Tests are organized by application features/modules:

- `auth/` - Authentication flows
- `campaigns/` - Campaign management
- `settings/` - Application settings
- `dashboard/` - Dashboard functionality

### 2. **Hierarchical Structure**

- **Feature directories** contain related test files
- **Shared utilities** in `shared/` directory
- **Sub-features** get their own subdirectories (e.g., `campaigns/wizard/`)

### 3. **Naming Conventions**

- **Test files**: `feature-name.cy.js`
- **Page-specific tests**: `page-name.cy.js`
- **Functionality tests**: `functionality-type.cy.js`
- **API tests**: `api.cy.js`

## 📝 File Naming Guidelines

### Test Files

```
✅ Good Examples:
- signin.cy.js
- campaign-list.cy.js
- team-management.cy.js
- billing-checkout.cy.js

❌ Avoid:
- test.cy.js (too generic)
- campaignTests.cy.js (camelCase, not descriptive)
- settings_page.cy.js (underscores)
```

### Documentation Files

```
✅ Documentation:
- README.md (general documentation)
- feature-update.md (update notes)
- ORGANIZATION.md (structure documentation)
```

## 🧪 Test Categories

### 1. **Smoke Tests** (`shared/basic-functionality.cy.js`)

- Critical path testing
- Basic application functionality
- Authentication middleware verification
- Performance baseline checks

### 2. **Feature Tests** (Feature directories)

- Complete feature workflows
- User journey testing
- API integration testing
- Error handling verification

### 3. **Integration Tests** (`shared/`)

- Cross-feature functionality
- End-to-end user workflows
- System integration verification

### 4. **Authentication Tests** (`auth/` & `shared/test-auth.cy.js`)

- Login/logout flows
- Role-based access testing
- Session management verification

## 🎯 Best Practices for Organization

### 1. **Keep Related Tests Together**

```
✅ Good:
campaigns/
├── list.cy.js
├── details.cy.js
├── crud.cy.js
└── wizard/
    ├── step1.cy.js
    └── step2.cy.js

❌ Avoid:
├── campaign-list.cy.js
├── billing.cy.js
├── campaign-details.cy.js
├── settings.cy.js
```

### 2. **Use Descriptive Directory Names**

```
✅ Clear names:
- settings/
- campaigns/
- brand-lift/
- auth/

❌ Unclear names:
- misc/
- tests/
- pages/
- other/
```

### 3. **Maintain Consistent Structure**

Each feature directory should follow a similar pattern:

```
feature/
├── README.md          # Feature-specific documentation
├── api.cy.js         # API testing
├── list.cy.js        # List/index pages
├── details.cy.js     # Detail pages
├── crud.cy.js        # CRUD operations
└── subfolder/        # Sub-features
```

## 📊 Current Test Inventory

### ✅ **Organized Tests:**

- **Authentication**: 2 tests in `auth/`
- **Campaigns**: 4 tests + wizard in `campaigns/`
- **Settings**: 3 tests in `settings/`
- **Shared**: 3 utility tests in `shared/`

### 📋 **Feature Coverage:**

- ✅ Authentication flows
- ✅ Campaign management
- ✅ Settings management
- ✅ Basic functionality
- 🔄 Billing (directory exists, needs tests)
- 🔄 Brand Health (directory exists, needs tests)
- 🔄 Brand Lift (directory exists, needs tests)
- 🔄 Dashboard (directory exists, needs tests)

## 🚀 Next Steps for Organization

### 1. **Immediate (This Week)**

- [x] Move settings tests to proper directory
- [x] Create organization documentation
- [ ] Review existing tests for proper placement
- [ ] Update test imports if needed

### 2. **Short Term (Next 2 Weeks)**

- [ ] Create README files for each feature directory
- [ ] Standardize test structure across features
- [ ] Add missing test coverage for empty directories
- [ ] Implement data-cy attributes in components

### 3. **Long Term (Next Month)**

- [ ] Create test templates for new features
- [ ] Implement automated organization checking
- [ ] Create test coverage reports by feature
- [ ] Establish test maintenance workflows

## 🔧 Maintenance Guidelines

### Adding New Tests

1. **Identify the feature** the test belongs to
2. **Check if directory exists**, create if needed
3. **Follow naming conventions** for consistency
4. **Update documentation** if adding new patterns
5. **Ensure imports work** with new structure

### Refactoring Tests

1. **Group related tests** into feature directories
2. **Extract common utilities** to `shared/`
3. **Update file names** to be more descriptive
4. **Maintain backwards compatibility** during transitions

### Regular Cleanup

- **Monthly review** of test organization
- **Remove outdated tests** that no longer apply
- **Consolidate duplicate tests** across features
- **Update documentation** to reflect changes

---

**Last Updated**: January 2025  
**Next Review**: February 2025  
**Maintained By**: QA Team
