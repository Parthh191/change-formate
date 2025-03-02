# File Format Converter

A web application for converting files between different formats using LibreOffice.

## Features

- Convert between document formats (PDF, DOCX, ODT, etc.)
- Convert between spreadsheet formats (XLSX, ODS, CSV)
- Convert between presentation formats (PPTX, ODP)
- Convert between image formats

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

## License

MIT
