# Stripe Setup Guide for CodePolish
## Complete Step-by-Step Instructions

This guide walks you through setting up Stripe for CodePolish, from claiming your test sandbox to configuring webhooks and creating products. Follow each step carefully to ensure payments work correctly before launch.

---

## ⚠️ CRITICAL: Claim Your Stripe Sandbox (Do This First!)

Your Stripe test sandbox expires on **January 17, 2026**. You must claim it before this date.

### Step 1: Claim Your Sandbox

**Action Required:**
1. Visit this URL: https://dashboard.stripe.com/claim_sandbox/YWNjdF8xU1VtWnJCVnRFbTF2dXZCLDE3NjQwNjg1NjQv100KKKAW76f
2. Click **"Claim Sandbox"**
3. Create a Stripe account or log in if you already have one
4. Your test environment is now active!

**What You Get:**
- Full access to Stripe's test environment
- Test API keys (already configured in your app)
- Ability to create products and test payments
- Webhook testing capabilities

**Important Notes:**
- Test mode uses fake card numbers (4242 4242 4242 4242)
- No real money is processed in test mode
- You can switch to live mode after completing KYC verification

---

## 📦 Step 2: Create Stripe Products

Now that you have access to Stripe, you need to create four products that match CodePolish's pricing structure.

### Product 1: Pro Plan ($19/month)

**Steps:**
1. Go to Stripe Dashboard: https://dashboard.stripe.com/test/products
2. Click **"+ Add product"** button (top right)
3. Fill in the product details:
   - **Name**: `CodePolish Pro`
   - **Description**: `100 code polishes per month with all features`
   - **Pricing model**: Select **"Standard pricing"**
   - **Price**: `19.00`
   - **Billing period**: Select **"Monthly"**
   - **Currency**: `USD`
4. Click **"Save product"**
5. **CRITICAL**: Copy the **Price ID** (starts with `price_`)
   - It will look like: `price_1AbC2dEfGhIjKlMn`
   - You'll need this in Step 4

### Product 2: Team Plan ($49/month)

**Steps:**
1. Click **"+ Add product"** again
2. Fill in the product details:
   - **Name**: `CodePolish Team`
   - **Description**: `500 code polishes per month with team features`
   - **Pricing model**: Select **"Standard pricing"**
   - **Price**: `49.00`
   - **Billing period**: Select **"Monthly"**
   - **Currency**: `USD`
3. Click **"Save product"**
4. **CRITICAL**: Copy the **Price ID**

### Product 3: 50 Credits ($9 one-time)

**Steps:**
1. Click **"+ Add product"** again
2. Fill in the product details:
   - **Name**: `50 Credits`
   - **Description**: `One-time purchase of 50 code polishes`
   - **Pricing model**: Select **"Standard pricing"**
   - **Price**: `9.00`
   - **Billing period**: Select **"One time"**
   - **Currency**: `USD`
3. Click **"Save product"**
4. **CRITICAL**: Copy the **Price ID**

### Product 4: 100 Credits ($15 one-time)

**Steps:**
1. Click **"+ Add product"** again
2. Fill in the product details:
   - **Name**: `100 Credits`
   - **Description**: `One-time purchase of 100 code polishes`
   - **Pricing model**: Select **"Standard pricing"**
   - **Price**: `15.00`
   - **Billing period**: Select **"One time"**
   - **Currency**: `USD`
3. Click **"Save product"**
4. **CRITICAL**: Copy the **Price ID**

**You should now have 4 Price IDs. Keep them handy for the next step!**

---

## 🔑 Step 3: Configure Price IDs in Your App

Now you need to add the Price IDs you just copied to your CodePolish environment variables.

### Option A: Using Manus Management UI (Recommended)

**Steps:**
1. Open your CodePolish project in Manus
2. Click the **Settings** icon (gear icon in top right)
3. Navigate to **Settings → Secrets** in the left sidebar
4. Click **"+ Add Secret"** button
5. Add each of these four secrets:

**Secret 1:**
- **Key**: `STRIPE_PRICE_PRO`
- **Value**: `price_xxxxx` (paste your Pro plan Price ID)
- Click **"Add"**

**Secret 2:**
- **Key**: `STRIPE_PRICE_TEAM`
- **Value**: `price_xxxxx` (paste your Team plan Price ID)
- Click **"Add"**

**Secret 3:**
- **Key**: `STRIPE_PRICE_CREDITS_50`
- **Value**: `price_xxxxx` (paste your 50 Credits Price ID)
- Click **"Add"**

**Secret 4:**
- **Key**: `STRIPE_PRICE_CREDITS_100`
- **Value**: `price_xxxxx` (paste your 100 Credits Price ID)
- Click **"Add"**

6. **Restart your dev server** to apply the changes

### Option B: Using .env File (Local Development)

If you're running locally, add these to your `.env` file:

```bash
# Stripe Product Price IDs
STRIPE_PRICE_PRO=price_xxxxx
STRIPE_PRICE_TEAM=price_xxxxx
STRIPE_PRICE_CREDITS_50=price_xxxxx
STRIPE_PRICE_CREDITS_100=price_xxxxx
```

Replace `price_xxxxx` with your actual Price IDs, then restart your server.

---

## 🪝 Step 4: Configure Stripe Webhook

Webhooks allow Stripe to notify your app when payments succeed, subscriptions renew, or payments fail. This is critical for CodePolish to work correctly.

### Get Your Webhook Endpoint URL

**For Manus Deployment:**
- Your webhook URL is: `https://your-subdomain.manus.space/api/stripe/webhook`
- Replace `your-subdomain` with your actual Manus subdomain

**For Custom Domain:**
- Your webhook URL is: `https://yourdomain.com/api/stripe/webhook`

**For Local Testing:**
- Use Stripe CLI (see Step 5 below)

### Configure Webhook in Stripe Dashboard

**Steps:**
1. Go to Stripe Dashboard: https://dashboard.stripe.com/test/webhooks
2. Click **"+ Add endpoint"** button
3. Fill in the webhook details:
   - **Endpoint URL**: `https://your-subdomain.manus.space/api/stripe/webhook`
   - **Description**: `CodePolish Production Webhook` (optional)
4. Click **"Select events"**
5. Select these events (CRITICAL - don't miss any):
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.paid`
   - ✅ `invoice.payment_failed`
6. Click **"Add events"**
7. Click **"Add endpoint"**
8. **CRITICAL**: Copy the **Signing secret** (starts with `whsec_`)
   - Click **"Reveal"** next to "Signing secret"
   - Copy the entire secret

### Add Webhook Secret to Your App

The webhook signing secret is already configured in your Manus environment as `STRIPE_WEBHOOK_SECRET`. You don't need to add it manually unless you're running locally.

**For Local Development Only:**
Add this to your `.env` file:
```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

---

## 🧪 Step 5: Test Your Stripe Integration

Before launching, you must test the entire payment flow to ensure everything works.

### Test Payment Flow

**Steps:**
1. Open your CodePolish app in a browser
2. Log in with your account
3. Go to **Dashboard → Settings**
4. Click **"Upgrade to Pro"** button
5. You should be redirected to Stripe Checkout
6. Use this test card:
   - **Card number**: `4242 4242 4242 4242`
   - **Expiry**: Any future date (e.g., `12/25`)
   - **CVC**: Any 3 digits (e.g., `123`)
   - **ZIP**: Any 5 digits (e.g., `12345`)
7. Click **"Subscribe"**
8. You should be redirected back to your dashboard
9. Verify your plan shows as **"Pro"**
10. Verify your credits show as **100**

### Test Webhook Delivery

**Steps:**
1. Go to Stripe Dashboard: https://dashboard.stripe.com/test/webhooks
2. Click on your webhook endpoint
3. Click **"Events"** tab
4. You should see recent events:
   - `checkout.session.completed` (from your test payment)
   - Status should be **"Succeeded"**
5. Click on the event to see details
6. Verify the response shows `{"received": true}` or `{"verified": true}`

**If webhook failed:**
- Check your webhook URL is correct
- Verify your app is accessible (not localhost)
- Check server logs for errors
- See Troubleshooting section below

### Test Credit Deduction

**Steps:**
1. Go to **Dashboard → Polish Code**
2. Paste any code snippet
3. Give it a name
4. Click **"Polish Code"**
5. Wait for polish to complete
6. Go to **Settings** tab
7. Verify credits decreased by 1 (should show 99/100)

**If credits didn't decrease:**
- Check server logs for errors
- Verify database connection
- See Troubleshooting section below

---

## 🔄 Step 6: Test Stripe CLI (Optional but Recommended)

The Stripe CLI allows you to test webhooks locally before deploying.

### Install Stripe CLI

**macOS:**
```bash
brew install stripe/stripe-cli/stripe
```

**Windows:**
```bash
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

**Linux:**
```bash
wget https://github.com/stripe/stripe-cli/releases/download/v1.19.0/stripe_1.19.0_linux_x86_64.tar.gz
tar -xvf stripe_1.19.0_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin
```

### Login to Stripe CLI

```bash
stripe login
```

This will open your browser to authorize the CLI.

### Forward Webhooks to Local Server

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

This command will:
- Listen for Stripe events
- Forward them to your local server
- Show you a webhook signing secret

**Copy the webhook signing secret** and add it to your `.env`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### Trigger Test Events

In a new terminal, trigger a test payment:

```bash
stripe trigger checkout.session.completed
```

You should see:
- Event received in your terminal
- Webhook processed in your server logs
- Database updated with subscription

---

## 🚀 Step 7: Switch to Live Mode (After Launch)

Once you're ready to accept real payments, you need to switch to live mode.

### Complete Stripe KYC Verification

**Steps:**
1. Go to Stripe Dashboard: https://dashboard.stripe.com
2. Click **"Activate account"** banner at the top
3. Fill in your business information:
   - Business type (Individual or Company)
   - Legal name
   - Address
   - Tax ID (SSN for individuals, EIN for companies)
   - Bank account for payouts
4. Submit verification documents if requested
5. Wait for approval (usually 1-3 business days)

### Get Live API Keys

**Steps:**
1. Once approved, toggle to **Live mode** (top right of dashboard)
2. Go to **Developers → API keys**
3. Copy your **Live Secret Key** (starts with `sk_live_`)
4. Copy your **Live Publishable Key** (starts with `pk_live_`)

### Update Environment Variables

**In Manus Settings → Secrets:**
1. Update `STRIPE_SECRET_KEY` with your live secret key
2. Update `VITE_STRIPE_PUBLISHABLE_KEY` with your live publishable key

### Recreate Products in Live Mode

**Important:** Products created in test mode don't transfer to live mode. You must recreate them:

1. Toggle to **Live mode** in Stripe Dashboard
2. Follow Step 2 above to create all 4 products again
3. Copy the new **live** Price IDs
4. Update your environment variables with the new Price IDs

### Recreate Webhook in Live Mode

1. Toggle to **Live mode**
2. Follow Step 4 above to create webhook endpoint
3. Use the same URL: `https://your-domain.com/api/stripe/webhook`
4. Select the same 5 events
5. Copy the new **live** webhook signing secret
6. Update `STRIPE_WEBHOOK_SECRET` with the new secret

### Test Live Payment

**Use the 99% discount code for testing:**
1. Stripe provides a test promo code for live mode
2. Create a promo code in Stripe Dashboard:
   - Go to **Products → Coupons**
   - Create a 99% discount coupon
   - Create a promo code: `TEST99`
3. Test a payment with minimum amount ($0.50)
4. Verify everything works before removing the discount

---

## 🐛 Troubleshooting

### Webhook Not Receiving Events

**Symptoms:**
- Payment completes but subscription not created
- Credits not added after purchase
- Stripe Dashboard shows webhook failed

**Solutions:**

**Check 1: Verify Endpoint URL**
```bash
# Your webhook URL should be accessible
curl https://your-domain.com/api/stripe/webhook
# Should return 400 or 405, not 404
```

**Check 2: Verify Webhook Secret**
- Go to Manus Settings → Secrets
- Check `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard
- Restart your server after updating

**Check 3: Check Server Logs**
- Look for errors in your server logs
- Common issues:
  - "Webhook signature verification failed" → Wrong secret
  - "Database not available" → Database connection issue
  - "User not found" → Metadata not passed correctly

**Check 4: Test with Stripe CLI**
```bash
stripe listen --forward-to https://your-domain.com/api/stripe/webhook
stripe trigger checkout.session.completed
```

### Payment Succeeds But Credits Not Added

**Symptoms:**
- Stripe shows successful payment
- Webhook received successfully
- But user's credits unchanged

**Solutions:**

**Check 1: Verify Product Key in Metadata**
- Go to Stripe Dashboard → Payments
- Click on the payment
- Check **Metadata** section
- Should include `product_key: pro` or `product_key: team`

**Check 2: Check Database**
```bash
# Connect to your database
# Check subscriptions table
SELECT * FROM subscriptions WHERE userId = YOUR_USER_ID;
```

**Check 3: Check Server Logs**
- Look for errors in `handleCheckoutCompleted` function
- Common issues:
  - "Product not found" → Wrong product_key in metadata
  - "Failed to update subscription" → Database write error

### Checkout Session Not Opening

**Symptoms:**
- Click "Upgrade to Pro" button
- Nothing happens or error message

**Solutions:**

**Check 1: Verify Price IDs**
- Go to Manus Settings → Secrets
- Verify all 4 price IDs are set correctly
- They should start with `price_`

**Check 2: Check Browser Console**
- Open browser DevTools (F12)
- Click "Upgrade to Pro"
- Check Console tab for errors
- Common issues:
  - "Failed to create checkout session" → Server error
  - "Invalid price ID" → Wrong price ID in env vars

**Check 3: Check Server Logs**
- Look for errors in `createCheckoutSession` mutation
- Common issues:
  - "No such price" → Price ID doesn't exist in Stripe
  - "Invalid API key" → Wrong Stripe secret key

### Test Card Declined

**Symptoms:**
- Using test card 4242 4242 4242 4242
- Payment declined

**Solutions:**

**Check 1: Verify Test Mode**
- Make sure you're in **Test mode** in Stripe Dashboard
- Check your API keys are test keys (start with `sk_test_`)

**Check 2: Use Correct Test Card**
- Card number: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

**Check 3: Try Different Test Cards**
- Successful payment: `4242 4242 4242 4242`
- Declined payment: `4000 0000 0000 0002`
- Insufficient funds: `4000 0000 0000 9995`

---

## ✅ Final Checklist

Before launching, verify all of these:

### Stripe Account
- [ ] Claimed Stripe test sandbox
- [ ] Created Stripe account
- [ ] Verified email address

### Products
- [ ] Created Pro plan ($19/month)
- [ ] Created Team plan ($49/month)
- [ ] Created 50 Credits ($9)
- [ ] Created 100 Credits ($15)
- [ ] Copied all 4 Price IDs

### Environment Variables
- [ ] Added `STRIPE_PRICE_PRO` to secrets
- [ ] Added `STRIPE_PRICE_TEAM` to secrets
- [ ] Added `STRIPE_PRICE_CREDITS_50` to secrets
- [ ] Added `STRIPE_PRICE_CREDITS_100` to secrets
- [ ] Verified `STRIPE_SECRET_KEY` is set
- [ ] Verified `STRIPE_WEBHOOK_SECRET` is set
- [ ] Verified `VITE_STRIPE_PUBLISHABLE_KEY` is set

### Webhook
- [ ] Created webhook endpoint in Stripe
- [ ] Added correct webhook URL
- [ ] Selected all 5 required events
- [ ] Copied webhook signing secret
- [ ] Updated `STRIPE_WEBHOOK_SECRET`

### Testing
- [ ] Tested Pro plan upgrade
- [ ] Tested Team plan upgrade
- [ ] Tested 50 credits purchase
- [ ] Tested 100 credits purchase
- [ ] Verified credits deducted after polish
- [ ] Checked webhook delivery in Stripe Dashboard
- [ ] Verified subscription created in database

### Live Mode (After Launch)
- [ ] Completed Stripe KYC verification
- [ ] Got live API keys
- [ ] Recreated products in live mode
- [ ] Recreated webhook in live mode
- [ ] Updated all environment variables
- [ ] Tested with 99% discount code
- [ ] Removed test discount code

---

## 📞 Need Help?

If you're stuck:

1. **Check Stripe Dashboard → Webhooks → Events**
   - See which events failed and why

2. **Check Server Logs**
   - Look for error messages
   - Search for "Stripe" or "webhook"

3. **Use Stripe CLI**
   - Test webhooks locally
   - See real-time event delivery

4. **Contact Stripe Support**
   - Live chat available in Stripe Dashboard
   - Very responsive and helpful

5. **Check Stripe Documentation**
   - Checkout: https://stripe.com/docs/payments/checkout
   - Webhooks: https://stripe.com/docs/webhooks
   - Testing: https://stripe.com/docs/testing

---

## 🎉 You're Done!

Once you've completed this checklist, your Stripe integration is ready for launch. Users can now:

- Sign up for Pro or Team plans
- Purchase one-time credits
- Have credits automatically deducted
- Receive subscription renewals
- Manage billing through Stripe portal

**Next step:** Record your demo video and prepare for Product Hunt launch!

---

**Last Updated:** January 2025
**Version:** 1.0
