# Custom Domain Setup for Supabase

## Problem
By default, OAuth screens show your Supabase project URL (e.g., `gunercosxlagxvnbyvod.supabase.co`), which looks unprofessional and exposes your infrastructure.

## Solution
Configure a custom domain for your Supabase project so OAuth screens show your branded domain instead.

## Steps to Set Up Custom Domain

### 1. Choose Your Domain
You need a domain you own, for example:
- `auth.docmaps.app` (subdomain recommended)
- `api.yourdomain.com`
- `backend.yourdomain.com`

### 2. Configure in Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Scroll down to **Custom Domains** section
4. Click **Add custom domain**
5. Enter your chosen domain (e.g., `auth.docmaps.app`)

### 3. Add DNS Records

Supabase will provide you with DNS records to add to your domain registrar:

**CNAME Record:**
```
Type: CNAME
Name: auth (or your chosen subdomain)
Value: [your-project-ref].supabase.co
TTL: 3600 (or Auto)
```

**Example for Cloudflare:**
- Type: `CNAME`
- Name: `auth`
- Target: `gunercosxlagxvnbyvod.supabase.co`
- Proxy status: DNS only (gray cloud)

**Example for other providers (Namecheap, GoDaddy, etc.):**
- Host: `auth`
- Points to: `gunercosxlagxvnbyvod.supabase.co`
- Record Type: `CNAME`

### 4. Wait for DNS Propagation

- DNS changes can take 5 minutes to 48 hours to propagate
- Check status in Supabase dashboard
- You can verify DNS propagation using: `dig auth.yourdomain.com`

### 5. Update Environment Variables

Once the custom domain is verified, update your `.env.local` files:

**Before:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://gunercosxlagxvnbyvod.supabase.co
```

**After:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://auth.docmaps.app
```

Update in both:
- `apps/editor/.env.local`
- `apps/web/.env.local`

### 6. Update OAuth Redirect URLs

In your OAuth provider settings (Google, GitHub, etc.), update the authorized redirect URIs:

**Before:**
```
https://gunercosxlagxvnbyvod.supabase.co/auth/v1/callback
```

**After:**
```
https://auth.docmaps.app/auth/v1/callback
```

**For Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Edit your OAuth 2.0 Client ID
5. Update **Authorized redirect URIs**
6. Save changes

### 7. Test the Setup

1. Restart your development server
2. Try signing in with Google OAuth
3. The OAuth consent screen should now show your custom domain

## Benefits

✅ **Professional appearance** - Shows your brand instead of Supabase infrastructure
✅ **Security** - Hides your Supabase project reference
✅ **Trust** - Users see a domain they recognize
✅ **Consistency** - All auth flows use your branded domain

## Alternative: Free Tier Limitation

If you're on Supabase's free tier, custom domains may not be available. In that case:

### Option 1: Upgrade to Pro Plan
- Custom domains are available on Pro plan ($25/month)
- Includes other benefits like better performance and support

### Option 2: Use Vercel Rewrites (Workaround)
You can proxy Supabase through your Vercel domain:

**In `next.config.js`:**
```javascript
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: 'https://gunercosxlagxvnbyvod.supabase.co/auth/v1/:path*',
      },
    ];
  },
};
```

Then update your Supabase URL:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://yourdomain.com/api
```

**Note:** This approach has limitations and may not work perfectly with all Supabase features.

## Troubleshooting

### DNS not propagating
- Wait longer (up to 48 hours)
- Clear your DNS cache: `sudo dscacheutil -flushcache` (Mac) or `ipconfig /flushdns` (Windows)
- Check with online DNS checkers: https://dnschecker.org

### SSL Certificate errors
- Supabase automatically provisions SSL certificates
- This can take 10-15 minutes after DNS verification
- Check certificate status in Supabase dashboard

### OAuth still showing old domain
- Clear browser cache and cookies
- Make sure you updated the redirect URI in OAuth provider
- Verify environment variables are updated and server restarted

## Production Deployment

When deploying to production (Vercel):

1. Add environment variables in Vercel dashboard
2. Use your custom domain for `NEXT_PUBLIC_SUPABASE_URL`
3. Update OAuth redirect URIs to use production domain
4. Test thoroughly before going live

## Summary

Custom domains make your app look professional and secure. While it requires a paid Supabase plan, it's worth it for production applications. For development, the default Supabase URL is fine.
