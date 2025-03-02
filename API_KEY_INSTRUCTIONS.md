# API Key Setup for File Conversion

This application uses Zamzar's API for file conversions when running on Vercel or other serverless environments.

## Setting Up Your API Key

### Local Development

1. Create a `.env.local` file in the project root with:
   ```
   CONVERSION_API_KEY=your_zamzar_api_key_here
   ```

2. Test your API key with:
   ```bash
   # Start the development server
   npm run dev
   
   # In a separate terminal, test the API key
   curl http://localhost:3000/api/test-zamzar
   ```

### Vercel Deployment

1. Add your API key to Vercel environment variables:
   ```bash
   vercel env add CONVERSION_API_KEY
   ```

2. Enter your API key when prompted

3. Redeploy your application:
   ```bash
   vercel --prod
   ```

## Security Notes

⚠️ **IMPORTANT**: Never commit your API key to version control or expose it in client-side code!

- Store your API key in environment variables
- Add `.env.local` to your `.gitignore` file
- Use Vercel's environment variable system for production

## Usage Limits

The Zamzar API has usage limits depending on your plan. Check your usage at https://developers.zamzar.com/user/dashboard.

## Testing the Integration

1. Deploy your application to Vercel
2. Try converting a document file (e.g., PDF to DOCX)
3. The conversion should complete successfully using Zamzar's service

## Troubleshooting

If conversions fail, check:

1. Is your API key valid? Test with `/api/test-zamzar`
2. Are you trying to convert supported formats? Check [Zamzar's documentation](https://developers.zamzar.com/formats)
3. Check your application logs in Vercel for specific error messages
