export interface FormatGroup {
  name: string;
  formats: string[];
}

export const FORMAT_GROUPS: Record<string, FormatGroup> = {
  document: {
    name: 'Documents',
    formats: ['pdf', 'doc', 'docx', 'odt', 'rtf', 'txt'],
  },
  spreadsheet: {
    name: 'Spreadsheets',
    formats: ['xls', 'xlsx', 'ods', 'csv'],
  },
  presentation: {
    name: 'Presentations',
    formats: ['ppt', 'pptx', 'odp'],
  },
  image: {
    name: 'Images',
    formats: ['jpg', 'png', 'gif', 'svg', 'webp'],
  },
};

// Flatten formats for easy checking
export const SUPPORTED_FORMATS = Object.values(FORMAT_GROUPS).reduce(
  (acc, group) => [...acc, ...group.formats],
  [] as string[]
);

// Formats that specifically require LibreOffice
export const LIBREOFFICE_FORMATS = [
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
  'odt', 'ods', 'odp', 'rtf', 'csv'
];

export function isLibreOfficeFormat(format: string): boolean {
  return LIBREOFFICE_FORMATS.includes(format.toLowerCase());
}

export function isValidFormat(file: File): boolean {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  return SUPPORTED_FORMATS.includes(extension);
}

// Define conversion restrictions
const FORMAT_COMPATIBILITY: Record<string, string[]> = {
  'pdf': ['doc', 'docx', 'odt', 'txt', 'rtf'], // PDF can convert to these formats
  'doc': ['pdf', 'docx', 'odt', 'txt', 'rtf'],
  'docx': ['pdf', 'doc', 'odt', 'txt', 'rtf'],
  'odt': ['pdf', 'doc', 'docx', 'txt', 'rtf'],
  'txt': ['pdf', 'doc', 'docx', 'odt', 'rtf'],
  'rtf': ['pdf', 'doc', 'docx', 'odt', 'txt'],
  'xls': ['pdf', 'xlsx', 'ods', 'csv'],
  'xlsx': ['pdf', 'xls', 'ods', 'csv'],
  'ods': ['pdf', 'xls', 'xlsx', 'csv'],
  'csv': ['pdf', 'xls', 'xlsx', 'ods'],
  'ppt': ['pdf', 'pptx', 'odp'],
  'pptx': ['pdf', 'ppt', 'odp'],
  'odp': ['pdf', 'ppt', 'pptx'],
  'jpg': ['png', 'gif', 'webp', 'pdf'],
  'png': ['jpg', 'gif', 'webp', 'pdf'],
  'gif': ['jpg', 'png', 'webp', 'pdf'],
  'svg': ['png', 'jpg', 'pdf'],
  'webp': ['jpg', 'png', 'gif', 'pdf'],
};

// Get valid conversion formats based on input format
export function getValidConversions(inputFormat: string): string[] {
  const format = inputFormat.toLowerCase();
  
  // If we have specific compatibility defined, use it
  if (FORMAT_COMPATIBILITY[format]) {
    return FORMAT_COMPATIBILITY[format];
  }
  
  // Default to all formats if no specific compatibility is defined
  return SUPPORTED_FORMATS;
}
