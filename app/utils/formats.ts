export const FORMAT_GROUPS = {
  document: {
    name: 'Document',
    formats: ['odt', 'doc', 'docx', 'pdf', 'rtf', 'txt'],
  },
  spreadsheet: {
    name: 'Spreadsheet',
    formats: ['ods', 'xls', 'xlsx', 'csv'],
  },
  presentation: {
    name: 'Presentation',
    formats: ['odp', 'ppt', 'pptx'],
  },
  image: {
    name: 'Image',
    formats: ['jpg', 'png', 'gif', 'svg', 'webp'],
  },
};

export const isLibreOfficeFormat = (format: string) => {
  return ['odt', 'ods', 'odp'].includes(format.toLowerCase());
};

export type FormatGroup = keyof typeof FORMAT_GROUPS;

export const getValidConversions = (fileType: string): string[] => {
  // Find the group that contains the input format
  const group = Object.values(FORMAT_GROUPS).find(g => 
    g.formats.includes(fileType.toLowerCase())
  );

  if (!group) return [];

  // Return all possible formats except the input format
  return Object.values(FORMAT_GROUPS)
    .flatMap(g => g.formats)
    .filter(format => format !== fileType.toLowerCase());
};

export const isValidFormat = (file: File): boolean => {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  return Object.values(FORMAT_GROUPS)
    .some(group => group.formats.includes(extension));
};
