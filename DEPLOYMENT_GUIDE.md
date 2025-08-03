# Deployment Guide for Hostinger

## Prerequisites
- Node.js installed on your local machine
- Access to your Hostinger hosting account
- FTP/File Manager access to your hosting

## Step 1: Build the Application

1. Run the deployment script:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

   Or manually:
   ```bash
   npm install
   npm run build
   ```

## Step 2: Upload Files

1. After building, you'll have a `dist` folder containing all your website files
2. Upload ALL contents of the `dist` folder to your domain's `public_html` directory
3. Make sure the `.htaccess` file is also uploaded (it's in the `public` folder and will be copied to `dist`)

## Step 3: Verify Supabase Configuration

Your Supabase configuration is already set up in the code:
- Project URL: `https://kadhyyqdiuustimubfzv.supabase.co`
- Anon Key: Already configured in the code

The website will work immediately after upload since it uses the existing Supabase backend.

## Step 4: Domain Configuration

1. Point your domain to Hostinger's nameservers
2. Update your domain's DNS settings if needed
3. Wait for DNS propagation (up to 24 hours)

## File Structure After Upload

Your `public_html` should contain:
```
public_html/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [other assets]
├── .htaccess
└── [other static files]
```

## Important Notes

1. **Supabase Backend**: Your app will continue using the same Supabase database and authentication
2. **Routing**: The `.htaccess` file ensures all routes work properly
3. **HTTPS**: Hostinger provides SSL certificates - enable HTTPS in your hosting panel
4. **Updates**: To update your site, rebuild locally and re-upload the `dist` folder contents

## Troubleshooting

### If routes don't work:
- Ensure `.htaccess` file is uploaded
- Check if mod_rewrite is enabled on your hosting

### If app doesn't load:
- Check browser console for errors
- Verify all files were uploaded correctly
- Ensure your domain is properly configured

### Database issues:
- Supabase should work from any domain
- Check Supabase dashboard for any access restrictions

## Support

For hosting-specific issues, contact Hostinger support.
For application issues, check the browser console and Supabase logs.