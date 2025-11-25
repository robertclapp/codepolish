# CodePolish Feature Roadmap

This document outlines the planned features for CodePolish, organized by priority and complexity. Each feature includes a detailed Claude Code prompt for implementation.

---

## Phase 1: Core Infrastructure (Completed)

### 1.1 Database Race Condition Fix ✅
- Implemented atomic credit operations using SQL-level constraints
- Added proper error types for insufficient credits and missing subscriptions

### 1.2 Database Performance ✅
- Added indexes for polishes (userId, status, createdAt composite)
- Added indexes for subscriptions (stripeCustomerId, status, periodEnd)

### 1.3 API Router Architecture ✅
- Created polishRouter with full CRUD operations
- Created subscriptionRouter with billing management
- Added Zod input validation across all procedures

### 1.4 Rate Limiting ✅
- Implemented in-memory rate limiter with configurable windows
- Added procedure-specific rate limits (polish: 10/min, mutation: 30/min, query: 120/min)

### 1.5 Frontend Refactoring ✅
- Split Dashboard into PolishInput, PolishOutput, PolishHistory, SubscriptionSettings
- Created usePolish and useSubscription custom hooks

---

## Phase 2: Payment Integration (High Priority)

### 2.1 Stripe Checkout Integration

**Priority:** High
**Complexity:** Medium
**Files to modify:** `server/subscriptionRouter.ts`, `server/_core/stripe.ts` (new)

**Claude Code Prompt:**
```
Implement Stripe checkout integration for CodePolish:

1. Create a new file `server/_core/stripe.ts` with:
   - Stripe client initialization using STRIPE_SECRET_KEY env var
   - Helper functions for creating checkout sessions
   - Price ID mapping for pro ($19/mo) and team ($49/mo) plans

2. Update `server/subscriptionRouter.ts`:
   - Implement createCheckoutSession to create real Stripe sessions
   - Add success/cancel URL handling with proper redirects
   - Store stripeCustomerId when checkout completes

3. Add environment variables:
   - STRIPE_SECRET_KEY
   - STRIPE_PRO_PRICE_ID
   - STRIPE_TEAM_PRICE_ID
   - STRIPE_WEBHOOK_SECRET

4. Create checkout success page at `/checkout/success` that:
   - Verifies the session
   - Updates subscription in database
   - Redirects to dashboard with success message

Test the flow end-to-end with Stripe test mode.
```

### 2.2 Stripe Webhook Handler

**Priority:** High
**Complexity:** Medium
**Files to modify:** `server/_core/index.ts`, `server/_core/stripeWebhook.ts` (new)

**Claude Code Prompt:**
```
Implement Stripe webhook handling for subscription events:

1. Create `server/_core/stripeWebhook.ts`:
   - Webhook signature verification using STRIPE_WEBHOOK_SECRET
   - Handle events: checkout.session.completed, customer.subscription.updated,
     customer.subscription.deleted, invoice.payment_failed

2. Update `server/_core/index.ts`:
   - Add raw body parser for /api/stripe/webhook endpoint
   - Register webhook route before JSON body parser

3. For each event:
   - checkout.session.completed: Update subscription to active, set plan and credits
   - customer.subscription.updated: Sync plan changes, update credits
   - customer.subscription.deleted: Set status to cancelled
   - invoice.payment_failed: Send notification, set status to past_due

4. Add automatic credit refresh on subscription renewal using periodStart comparison
```

### 2.3 Billing Portal Integration

**Priority:** Medium
**Complexity:** Low
**Files to modify:** `server/subscriptionRouter.ts`

**Claude Code Prompt:**
```
Add Stripe Customer Portal integration:

1. Add new procedure `createPortalSession` in subscriptionRouter:
   - Use stripe.billingPortal.sessions.create
   - Require stripeCustomerId exists
   - Return portal URL for redirect

2. Update SubscriptionSettings component:
   - Add "Manage Billing" button for paid plans
   - Handle redirect to Stripe portal
   - Show loading state during redirect

3. Configure Stripe portal in dashboard to allow:
   - Plan upgrades/downgrades
   - Payment method updates
   - Subscription cancellation
   - Invoice history viewing
```

---

## Phase 3: Core Polish Features (High Priority)

### 3.1 Advanced Polish Analysis Engine

**Priority:** High
**Complexity:** High
**Files to modify:** `server/polishRouter.ts`, `server/_core/polishEngine.ts` (new)

**Claude Code Prompt:**
```
Create an advanced code polish engine with multi-pass analysis:

1. Create `server/_core/polishEngine.ts`:
   - PolishEngine class with configurable analysis passes
   - Pass 1: Static analysis (detect issues, score code)
   - Pass 2: Refactoring (apply improvements)
   - Pass 3: Enhancement (add types, docs, tests)

2. Implement analysis categories:
   - codeStyle: naming, formatting, organization
   - accessibility: ARIA, semantic HTML, focus management
   - performance: memoization, lazy loading, bundle size
   - security: XSS prevention, sanitization, CSP compliance
   - maintainability: complexity, duplication, coupling

3. Create framework-specific analyzers:
   - ReactAnalyzer: hooks rules, prop validation, key usage
   - VueAnalyzer: composition API patterns, reactivity
   - SvelteAnalyzer: store usage, action patterns

4. Add progress streaming using Server-Sent Events:
   - Stream analysis progress to frontend
   - Update UI with real-time status changes
   - Show intermediate results as they complete

5. Update polishRouter to use the new engine
```

### 3.2 Component Extraction

**Priority:** High
**Complexity:** High
**Files to modify:** `server/_core/polishEngine.ts`

**Claude Code Prompt:**
```
Implement intelligent component extraction in the polish engine:

1. Add AST parsing using @babel/parser for React/Vue analysis
2. Identify extraction opportunities:
   - Repeated JSX patterns (>2 occurrences)
   - Logical groupings (>50 lines of related code)
   - Reusable UI elements (buttons, cards, modals)

3. Create extraction algorithm:
   - Identify shared state and props
   - Generate prop interfaces/types
   - Create new component files with proper exports
   - Update original file with imports

4. Generate multi-file output format:
   {
     files: [
       { path: "components/Button.tsx", content: "..." },
       { path: "components/Card.tsx", content: "..." }
     ],
     mainFile: "refactored code with imports"
   }

5. Add configuration options:
   - minComponentSize: minimum lines to extract
   - extractStyles: whether to create CSS modules
   - generateTests: whether to create test files
```

### 3.3 Design Token Extraction

**Priority:** Medium
**Complexity:** Medium
**Files to modify:** `server/_core/polishEngine.ts`

**Claude Code Prompt:**
```
Implement design token extraction from inline styles:

1. Create TokenExtractor class:
   - Parse inline styles, Tailwind classes, and CSS-in-JS
   - Identify color values, spacing, typography, shadows
   - Generate semantic token names

2. Token categories:
   - colors: primary, secondary, text, background, border
   - spacing: padding, margin, gap values
   - typography: font sizes, weights, line heights
   - shadows: box-shadows, text-shadows
   - borders: radius, width, styles

3. Output formats:
   - CSS custom properties (--color-primary: #xxx)
   - Tailwind config extension
   - CSS Modules variables
   - Theme object for CSS-in-JS

4. Add token consistency checking:
   - Detect similar colors and suggest consolidation
   - Flag inconsistent spacing values
   - Recommend semantic names based on usage context

5. Generate tokens file with documentation comments
```

---

## Phase 4: Export & Integration (Medium Priority)

### 4.1 ZIP Download with Multiple Files

**Priority:** Medium
**Complexity:** Low
**Files to modify:** `server/polishRouter.ts`, `client/src/components/polish/PolishOutput.tsx`

**Claude Code Prompt:**
```
Implement ZIP download for multi-file polish results:

1. Add JSZip dependency to package.json
2. Create downloadZip procedure in polishRouter:
   - Accept polishId as input
   - Fetch polish result from database
   - Parse multi-file output format
   - Generate ZIP with folder structure

3. Folder structure:
   polish-output/
   ├── components/
   │   ├── Button.tsx
   │   └── Card.tsx
   ├── styles/
   │   └── tokens.css
   ├── types/
   │   └── index.ts
   └── index.tsx (main file)

4. Update PolishOutput component:
   - Call downloadZip procedure
   - Handle blob response
   - Trigger browser download

5. Add metadata file to ZIP:
   - polish-info.json with score, issues, improvements
```

### 4.2 GitHub Integration

**Priority:** Medium
**Complexity:** High
**Files to modify:** `server/_core/github.ts` (new), `server/polishRouter.ts`

**Claude Code Prompt:**
```
Implement GitHub repository push integration:

1. Create `server/_core/github.ts`:
   - GitHub OAuth flow for user authorization
   - Store GitHub access tokens (encrypted)
   - Octokit client wrapper with rate limiting

2. Add GitHub OAuth routes:
   - GET /api/github/auth - initiate OAuth
   - GET /api/github/callback - handle callback, store token

3. Create pushToGitHub procedure:
   - List user repositories
   - Create branch for changes
   - Commit polished files
   - Create pull request with summary

4. PR template:
   ## Code Polish Applied

   **Quality Score:** 45 → 92 (+47 points)

   ### Changes Made
   - Extracted 3 reusable components
   - Added TypeScript types
   - Fixed 8 accessibility issues

   ### Files Changed
   - src/components/Button.tsx (new)
   - src/index.tsx (modified)

5. Update frontend to show GitHub connection status and repo selector
```

### 4.3 VS Code Extension

**Priority:** Low
**Complexity:** High
**Files to modify:** New vscode-extension/ directory

**Claude Code Prompt:**
```
Create VS Code extension for CodePolish:

1. Initialize extension with yo code generator
2. Extension features:
   - Polish selected code command
   - Polish entire file command
   - Inline suggestions for improvements
   - Quality score in status bar

3. API integration:
   - Authenticate with CodePolish account
   - Call polish API from extension
   - Display results in diff view

4. Configuration options:
   - API endpoint URL
   - Auto-polish on save
   - Framework detection
   - Ignore patterns

5. Add extension to marketplace with:
   - Icon and screenshots
   - Demo GIF
   - Documentation
```

---

## Phase 5: Team & Enterprise Features (Lower Priority)

### 5.1 Team Workspaces

**Priority:** Low
**Complexity:** High
**Files to modify:** `drizzle/schema.ts`, new routers

**Claude Code Prompt:**
```
Implement team workspace functionality:

1. Add database tables:
   - teams: id, name, ownerId, createdAt
   - teamMembers: teamId, userId, role (owner/admin/member), invitedAt
   - teamInvites: id, teamId, email, token, expiresAt

2. Create teamRouter with procedures:
   - create: create new team (requires team plan)
   - invite: send email invitation
   - acceptInvite: join team with invite token
   - removeMember: remove team member
   - updateRole: change member role

3. Update subscription model:
   - Link subscriptions to teams instead of users
   - Share credits across team members
   - Track usage per member

4. Add team context to polish operations:
   - Polishes can be team-owned or personal
   - Team admins can view all team polishes

5. Create team management UI:
   - Team settings page
   - Member management
   - Usage dashboard per member
```

### 5.2 Custom Refactoring Rules

**Priority:** Low
**Complexity:** High
**Files to modify:** `drizzle/schema.ts`, `server/_core/polishEngine.ts`

**Claude Code Prompt:**
```
Implement custom refactoring rules for teams:

1. Add database table:
   - customRules: id, teamId, name, description, pattern, replacement, enabled

2. Rule types:
   - Pattern matching: find/replace with regex
   - AST transforms: structural code changes
   - Style rules: naming conventions, formatting

3. Rule builder UI:
   - Visual rule editor
   - Test rule against sample code
   - Preview changes before save

4. Integration with polish engine:
   - Load team rules before processing
   - Apply custom rules after standard polish
   - Track which rules were applied

5. Rule templates library:
   - Common patterns for React/Vue/Svelte
   - Company-specific conventions
   - Importable/exportable rules
```

### 5.3 API Access

**Priority:** Medium
**Complexity:** Medium
**Files to modify:** `server/_core/apiKeys.ts` (new), `server/routers.ts`

**Claude Code Prompt:**
```
Implement API key authentication for programmatic access:

1. Add database table:
   - apiKeys: id, userId, name, keyHash, prefix, scopes, lastUsedAt, expiresAt

2. Create apiKeyRouter:
   - create: generate new API key (show once, store hash)
   - list: list user's API keys
   - revoke: delete API key
   - rotate: create new key, revoke old

3. Add API key authentication middleware:
   - Check Authorization: Bearer sk_... header
   - Verify key hash matches
   - Apply rate limits based on plan

4. Scope-based access control:
   - polish:read - view polishes
   - polish:write - create polishes
   - subscription:read - view subscription

5. API documentation:
   - OpenAPI/Swagger spec
   - Example requests with curl
   - SDK examples (JS, Python)
```

---

## Phase 6: Analytics & Monitoring (Medium Priority)

### 6.1 Usage Analytics Dashboard

**Priority:** Medium
**Complexity:** Medium
**Files to modify:** New analytics components, `server/analyticsRouter.ts`

**Claude Code Prompt:**
```
Create usage analytics dashboard for users:

1. Create analyticsRouter with procedures:
   - getOverview: total polishes, avg score improvement, credits used
   - getTimeSeries: polishes per day/week/month
   - getBreakdown: polishes by framework, status, score range

2. Add dashboard components:
   - OverviewCards: key metrics with trend indicators
   - UsageChart: line chart of polishes over time
   - ScoreDistribution: histogram of quality scores
   - FrameworkBreakdown: pie chart by framework

3. Use Recharts for visualizations
4. Add date range selector (7d, 30d, 90d, custom)
5. Export analytics as CSV
```

### 6.2 Admin Analytics

**Priority:** Low
**Complexity:** Medium
**Files to modify:** `server/adminRouter.ts` (new), admin pages

**Claude Code Prompt:**
```
Create admin analytics dashboard:

1. Create adminRouter (requires admin role):
   - getTotalUsers: user count with growth
   - getActiveUsers: DAU, WAU, MAU
   - getRevenue: MRR, ARR, growth rate
   - getPolishMetrics: total polishes, avg processing time

2. Add admin dashboard at /admin:
   - Protected route checking admin role
   - Revenue metrics with charts
   - User growth charts
   - System health indicators

3. Add user management:
   - List all users with search/filter
   - View user details and polishes
   - Manage subscription manually
   - Send notifications

4. Add system monitoring:
   - API response times
   - Error rates
   - Queue depths (for background jobs)
```

---

## Phase 7: Advanced Features (Future)

### 7.1 Test Generation

**Claude Code Prompt:**
```
Implement automatic test generation for polished code:

1. Create TestGenerator class:
   - Parse component props and functions
   - Generate unit tests with Jest/Vitest
   - Generate integration tests with Testing Library
   - Generate accessibility tests with jest-axe

2. Test templates:
   - Render tests: component renders without errors
   - Prop tests: handles all prop variations
   - Event tests: click, input, form submission
   - Edge cases: empty states, error states

3. Configuration:
   - Test framework selection (Jest, Vitest)
   - Testing Library flavor (React, Vue)
   - Coverage requirements
   - Custom test patterns

4. Output test files alongside components
```

### 7.2 Documentation Generation

**Claude Code Prompt:**
```
Implement automatic documentation generation:

1. Create DocGenerator class:
   - Extract JSDoc from polished code
   - Generate Storybook stories
   - Create README with usage examples

2. Documentation formats:
   - Component README.md
   - Storybook CSF stories
   - TypeDoc JSON
   - OpenAPI for API components

3. Include:
   - Component description
   - Props table with types
   - Usage examples
   - Visual examples (for Storybook)

4. Add live preview in dashboard
```

### 7.3 Real-time Collaboration

**Claude Code Prompt:**
```
Implement real-time collaboration features:

1. Add WebSocket support with Socket.io:
   - Team members see live polish progress
   - Real-time comments on polished code
   - Presence indicators

2. Collaborative review flow:
   - Request review from team member
   - Comment on specific lines
   - Approve/reject changes
   - Merge reviewed version

3. Activity feed:
   - Team polish activity
   - Comment notifications
   - Review requests

4. Update UI for real-time updates
```

---

## Implementation Order Recommendation

1. **Immediate (Week 1-2):**
   - Stripe Checkout Integration (2.1)
   - Stripe Webhook Handler (2.2)
   - ZIP Download (4.1)

2. **Short-term (Week 3-4):**
   - Billing Portal (2.3)
   - Advanced Polish Engine (3.1)
   - Usage Analytics (6.1)

3. **Medium-term (Month 2):**
   - Component Extraction (3.2)
   - Design Token Extraction (3.3)
   - GitHub Integration (4.2)
   - API Access (5.3)

4. **Long-term (Month 3+):**
   - Team Workspaces (5.1)
   - Custom Rules (5.2)
   - Test Generation (7.1)
   - VS Code Extension (4.3)

---

## Testing Strategy

For each feature, ensure:
1. Unit tests for business logic
2. Integration tests for API endpoints
3. E2E tests for critical flows (payment, polish)
4. Manual testing checklist

Run tests with:
```bash
npm run test        # Unit tests
npm run test:e2e    # E2E tests (when implemented)
npm run check       # TypeScript type checking
```

---

## Environment Variables Required

```env
# Existing
DATABASE_URL=mysql://...
JWT_SECRET=...
OAUTH_SERVER_URL=...
VITE_APP_ID=...

# Payment (Phase 2)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_TEAM_PRICE_ID=price_...

# GitHub Integration (Phase 4)
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...

# Analytics (Phase 6)
ANALYTICS_ENABLED=true
```

---

*Last updated: 2025-11-25*
