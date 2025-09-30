# Intercom AfterShoot Review App

An Intercom Canvas Sheet app that displays the AfterShoot review page (`https://account.aftershoot.com/review`) in an iframe within the Intercom Messenger.

## Features

- 🎨 **Canvas Kit Integration** - Uses Intercom's Canvas Kit to create a seamless messenger experience
- 📱 **Sheet (iframe) Display** - Opens AfterShoot review page in a full-screen iframe within the messenger
- 🔒 **Secure User Verification** - Decrypts and verifies Intercom user data using AES-256-GCM
- ⚡ **Vercel Ready** - Configured for easy deployment to Vercel
- 🔄 **Auto-connected to GitHub** - Deploy automatically when you push to main

## Architecture

```
User clicks button in Messenger
         ↓
    Initialize Flow (POST /initialize)
         ↓
    Returns Canvas with "Open Review" button
         ↓
    User clicks button
         ↓
    Sheet Flow (POST /sheet)
         ↓
    Opens iframe with AfterShoot review page
         ↓
    User clicks "Done"
         ↓
    Submit Sheet Flow (POST /submit-sheet)
         ↓
    Returns final Canvas
```

## Setup Instructions

### 1. Create an Intercom App

1. Go to [Intercom Developer Hub](https://app.intercom.com/a/apps/_/developer-hub)
2. Click **"New app"**
3. Give it a name (e.g., "AfterShoot Review")
4. Once created, go to **Basic Information** and copy your **Client Secret**

### 2. Deploy to Vercel

Since your Vercel is already connected to GitHub:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import this repository: `tprayt/intercom-aftershoot-review-app`
4. Add environment variable:
   - **Name**: `CLIENT_SECRET`
   - **Value**: Your Intercom Client Secret from step 1
5. Click **Deploy**

After deployment, Vercel will give you a URL like: `https://your-app.vercel.app`

### 3. Configure Intercom Webhooks

1. Go back to your Intercom app in the Developer Hub
2. Navigate to **Configure > Canvas Kit**
3. Click **"For users, leads, and visitors"**
4. Enable the locations where you want the app to appear (e.g., "Messenger Home")
5. Add your webhook URLs (replace `your-app.vercel.app` with your actual Vercel URL):

   - **Initialize flow webhook URL**: `https://your-app.vercel.app/initialize`
   - **Submit flow webhook URL**: `https://your-app.vercel.app/initialize` (reuses initialize)
   - **Submit Sheet flow webhook URL**: `https://your-app.vercel.app/submit-sheet`

6. Click **Save**
7. Toggle the app to **"On"**

### 4. Add App to Messenger

1. Go to your Intercom workspace
2. Navigate to **Messenger & Omnichannel > Messenger > Manage Settings**
3. Scroll to **"Customize Home with apps"**
4. Click **"Add an app"**
5. Select your newly created app
6. Save changes

## Testing

1. Open your Intercom Messenger (on your website or in the Intercom workspace)
2. You should see the "AfterShoot Review" app on the Messenger home
3. Click **"Open Review Dashboard"**
4. The AfterShoot review page should open in an iframe
5. Click **"Done"** to close and return to the messenger

## Local Development

```bash
# Clone the repository
git clone https://github.com/tprayt/intercom-aftershoot-review-app.git
cd intercom-aftershoot-review-app

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env and add your CLIENT_SECRET

# Run the server
npm start
```

The app will be available at `http://localhost:3000`

### Testing Locally with ngrok

Since Intercom needs to send webhooks to your server, you'll need to expose your local server:

```bash
# Install ngrok: https://ngrok.com/download
ngrok http 3000
```

Use the ngrok URL (e.g., `https://abc123.ngrok.io`) in your Intercom webhook configuration.

## Project Structure

```
intercom-aftershoot-review-app/
├── index.js              # Main Express server with webhook endpoints
├── public/
│   └── sheet.html        # HTML page with AfterShoot iframe
├── package.json          # Node.js dependencies
├── vercel.json          # Vercel deployment configuration
├── .env.example         # Environment variables template
├── .gitignore           # Git ignore rules
└── README.md            # This file
```

## Endpoints

### POST /initialize
- **Purpose**: Initialize the Canvas Kit flow
- **Returns**: Canvas object with button to open sheet
- **Called by**: Intercom when app is loaded in messenger

### POST /sheet
- **Purpose**: Open the sheet (iframe)
- **Returns**: HTML page with AfterShoot iframe
- **Called by**: Intercom when user clicks "Open Review Dashboard"
- **Security**: Decrypts user object to verify legitimate request

### POST /submit-sheet
- **Purpose**: Handle sheet closure
- **Returns**: Final canvas object
- **Called by**: Intercom when user clicks "Done" in the sheet

## Security

- User data is encrypted by Intercom using AES-256-GCM
- The app decrypts this data using your CLIENT_SECRET to verify authenticity
- Never commit your CLIENT_SECRET to the repository
- Use Vercel environment variables for production secrets

## Troubleshooting

### App doesn't appear in Messenger
- Check that the app is toggled "On" in Developer Hub
- Verify webhooks are saved correctly
- Check that you've added the app to Messenger Home settings

### Sheet doesn't open
- Verify your Vercel URL is correct in the webhook configuration
- Check Vercel logs for errors
- Ensure CLIENT_SECRET is set in Vercel environment variables

### Iframe doesn't load AfterShoot page
- Check browser console for CORS or CSP errors
- Verify the AfterShoot URL is accessible
- Check that the iframe sandbox attributes are correct

### "Invalid signature" errors
- Ensure CLIENT_SECRET matches your Intercom app's secret
- Check that the secret is properly set in Vercel environment variables

## Resources

- [Intercom Canvas Kit Documentation](https://developers.intercom.com/docs/canvas-kit-reference)
- [Intercom Sheets Flow Guide](https://developers.intercom.com/docs/set-up-sheets-flows)
- [Vercel Documentation](https://vercel.com/docs)
- [AfterShoot](https://aftershoot.com/)

## Support

For issues with:
- **This app**: Open an issue on GitHub
- **Intercom integration**: Check [Intercom Developer Docs](https://developers.intercom.com/)
- **Vercel deployment**: Check [Vercel Support](https://vercel.com/support)
- **AfterShoot**: Contact [AfterShoot Support](https://aftershoot.com/support)

## License

MIT License - feel free to use and modify as needed.