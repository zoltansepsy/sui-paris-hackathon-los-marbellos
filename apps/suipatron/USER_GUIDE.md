# SuiPatron User Guide

Welcome to SuiPatron! This guide will help you navigate the platform whether you're a creator or supporter.

## Getting Started

### Sign In

1. Click "Sign in with Google" on the homepage
2. Enter any email address (this is a demo - no real authentication)
3. You'll be automatically signed in and redirected

### First Steps

- **To Support Creators**: Browse the Explore page
- **To Become a Creator**: Click "Become a Creator" in the header

---

## For Supporters

### Discovering Creators

**Explore Page** (`/explore`)

- Browse all creators
- Use the search bar to find specific creators
- See pricing, content count, and supporter count
- Click any creator card to view their profile

### Supporting a Creator

1. Visit a creator's profile
2. Click "Support for X SUI" button
3. Review the payment details:
   - One-time payment amount
   - Number of posts you'll unlock
   - 0% platform fee
4. Click "Support for X SUI" to confirm
5. Content unlocks immediately!

### Accessing Content

**Your Feed** (`/feed`)

- View all content from creators you support
- See latest posts first
- Click any content card to view it
- Access is permanent - no expiration

---

## For Creators

### Setting Up Your Profile

**Become a Creator**

1. Click "Become a Creator" in the header
2. Fill in your profile details:
   - Display name
   - Bio (tell supporters about your work)
   - Support price (in SUI)
3. Click "Save Changes"

**Claim Your SuiNS Name**

1. In your dashboard or settings, click "Claim SuiNS Name"
2. Enter your desired name (e.g., "alice")
3. Your full identity will be: `yourname@suipatron.sui`
4. This appears on your profile as a badge

### Managing Content

**Upload Content** (Simulated)

1. Go to your Dashboard
2. Click "Add Content"
3. Select content type: Image, Text, or PDF
4. Add title and description
5. Upload your file
6. Click "Publish"

**Note**: In this demo, content upload is simulated. In production, content would be encrypted and stored on Walrus.

### Viewing Your Dashboard

**Dashboard** (`/dashboard`)

- **Balance**: Your total earnings in SUI
- **Supporters**: Number of people who've supported you
- **Content**: Your published posts
- **Profile Editor**: Update your information

**Withdrawing Earnings**

- Click "Withdraw" in the Balance card
- (In demo, this is simulated)
- In production, SUI would be sent to your wallet

### Viewing Your Public Profile

- Click your avatar → "Edit Profile" on any creator page
- Or visit `/creator/[your-id]` to see how others see your profile
- Creators see an "Edit Profile" button on their own page

---

## Key Features

### SuiNS Identity

Your human-readable blockchain identity:

- Format: `name@suipatron.sui`
- Displayed as a badge on your profile
- Makes you memorable to supporters
- Optional but recommended

### One-Time Support Model

Unlike subscriptions:

- **Pay once**: Single payment
- **Access forever**: No expiration
- **No cancellations**: You own the access
- **Zero platform fees**: Creator keeps 100%

### Content Ownership

- Creators own their content
- Content can't be removed by platform
- Encrypted and decentralized storage
- Permanent access for supporters

---

## Navigation

### Header Menu

- **SuiPatron Logo**: Return to homepage
- **Explore**: Discover creators
- **My Feed**: View content from supported creators (logged in only)
- **Become a Creator**: Set up creator profile (non-creators only)
- **Profile Menu**: Access dashboard, feed, settings, sign out

### Footer Links

- Platform information
- Resources and help
- Legal pages

---

## Demo Features & Limitations

### What's Working

✅ Full UI/UX flow
✅ Profile creation and editing
✅ Content browsing and locking
✅ Support transactions (simulated)
✅ Access control
✅ SuiNS claiming
✅ Responsive design
✅ Dark mode support

### What's Simulated

⚠️ Authentication (no real Google OAuth)
⚠️ Blockchain transactions
⚠️ Content encryption/decryption
⚠️ File uploads
⚠️ Payment processing
⚠️ Earnings withdrawals

### Data Persistence

- User accounts stored in localStorage
- Access passes tracked locally
- Data persists across browser sessions
- Clear localStorage to reset

---

## Tips & Best Practices

### For Creators

1. **Complete Your Profile**: Add a bio and SuiNS name
2. **Set Fair Pricing**: Consider your content value
3. **Upload Quality Content**: Give supporters value
4. **Engage Supporters**: Build your community

### For Supporters

1. **Explore First**: Browse multiple creators
2. **Read Bios**: Understand what you're supporting
3. **Check Content Count**: See how much you'll unlock
4. **Remember It's Permanent**: One payment, lifetime access

---

## Troubleshooting

### Can't Sign In

- Try clearing localStorage
- Make sure you're entering a valid email format
- Refresh the page and try again

### Content Not Unlocking

- Check if you've actually supported the creator
- Verify in your Feed page
- Try refreshing the creator's profile

### Lost Your Account

- This is a demo with localStorage
- Clearing browser data will reset everything
- In production, accounts would be blockchain-based

---

## Support & Feedback

This is a UI/UX prototype demonstrating the SuiPatron platform design and user experience. For questions about the actual blockchain implementation or to report issues with this demo, please refer to the project documentation.

## Key Differences from Traditional Platforms

| Feature        | Traditional (Patreon) | SuiPatron            |
| -------------- | --------------------- | -------------------- |
| Payment        | Monthly subscription  | One-time payment     |
| Platform Fee   | 5-12%                 | 0%                   |
| Content Access | While subscribed      | Permanent            |
| Account        | Email/password        | Blockchain + Google  |
| Identity       | Username              | SuiNS name           |
| Control        | Platform owns data    | Creator owns content |

---

**Enjoy exploring SuiPatron!** 🎉

Whether you're supporting creators or building your creative career, SuiPatron offers a fairer, more transparent way to connect creators with their community.
