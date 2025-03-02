# Change Format - File Converter

A web application that converts files between different formats. Supports documents, spreadsheets, presentations, and images.

## Features

- Convert documents (PDF, DOC, DOCX, ODT, RTF, TXT)
- Convert spreadsheets (XLS, XLSX, ODS, CSV)
- Convert presentations (PPT, PPTX, ODP)
- Convert images (JPG, PNG, GIF, SVG, WEBP)
- Browser-based conversions for compatible formats
- Server-side conversions for complex formats using LibreOffice

## Requirements

- Node.js 14+
- LibreOffice (must be installed on the server)

## Setup

1. Install dependencies:

```bash
npm install
# or
yarn install
```

2. Make sure LibreOffice is installed on your system:

```bash
# Ubuntu/Debian
sudo apt-get install libreoffice

# macOS
brew install libreoffice
# or download from https://www.libreoffice.org/

# Windows
# Download from https://www.libreoffice.org/
```

3. Run the application:

```bash
npm run dev
# or
yarn dev
```

## Deployment Options

### Cloud Deployment (Vercel, Netlify)

Cloud deployments have limited conversion capabilities due to the lack of LibreOffice in serverless environments.

1. Clone the repository
2. Deploy to Vercel or Netlify
3. Only browser-compatible conversions will work (most image formats)

### Self-Hosted Deployment (Full Capabilities)

For full conversion capabilities, use Docker:

```bash
# Build the Docker image
docker build -t change-formate .

# Run the container
docker run -p 3000:3000 change-formate
```

### Environment Variables

- `CONVERSION_API_KEY`: (Optional) API key for external conversion service

## Troubleshooting PDF Conversions

Converting PDFs can be challenging due to their nature:

1. **Text-based PDFs vs. Scanned Documents**:
   - Text-based PDFs usually convert better than scanned documents
   - Scanned PDFs are essentially images and may not convert properly to text formats

2. **PDF to Document formats**:
   - PDF to DOCX/DOC conversion works best when the PDF contains actual text
   - Formatting may not be perfectly preserved
   - Tables and complex layouts may be simplified

3. **PDF to Spreadsheet formats**:
   - Only works well if the PDF contains well-structured tabular data
   - Complex layouts may not convert properly

4. **Timeout Issues**:
   - Large PDFs may take longer to convert
   - Try splitting large PDFs into smaller files

5. **LibreOffice Installation**:
   - Ensure LibreOffice is properly installed on your server
   - Run `node scripts/check-libreoffice.js` to verify the installation

## API Usage

The application exposes a conversion API endpoint:

```
POST /api/convert
```

Form data parameters:
- `file`: The file to convert
- `targetFormat`: The desired output format (e.g., "pdf", "docx")

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Check LibreOffice installation
node scripts/check-libreoffice.js
```

## Technologies

- Next.js
- LibreOffice (for file conversions)
- TypeScript
- Docker

## License

MIT
