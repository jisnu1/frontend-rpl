export function getFileExtension(filename: string): string {
  if (!filename) return '';
  return filename.split('.').pop()?.toLowerCase() || '';
}

export function getFileCategory(filename: string): 'image' | 'pdf' | 'video' | 'audio' | 'text' | 'spreadsheet' | 'document' | 'presentation' | 'other' {
  const ext = getFileExtension(filename);
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) return 'image';
  if (['pdf'].includes(ext)) return 'pdf';
  if (['mp4', 'webm', 'ogg', 'mkv', 'avi', 'mov'].includes(ext)) return 'video';
  if (['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac'].includes(ext)) return 'audio';
  if (['xls', 'xlsx', 'csv', 'ods'].includes(ext)) return 'spreadsheet';
  if (['doc', 'docx', 'rtf', 'odt'].includes(ext)) return 'document';
  if (['ppt', 'pptx', 'odp'].includes(ext)) return 'presentation';
  if (['txt', 'log', 'md', 'json', 'xml', 'js', 'css', 'html', 'java', 'py', 'sh', 'ts', 'tsx', 'jsx', 'cpp', 'c', 'h', 'hpp', 'cs', 'go', 'rs', 'sql', 'php', 'swift', 'kt', 'kts', 'yaml', 'yml', 'ini', 'toml', 'bat', 'cmd', 'ps1', 'dart', 'rb', 'pl', 'pm', 'r', 'm', 'scala', 'groovy'].includes(ext)) return 'text';
  return 'other';
}

export function isPdfFile(filename: string): boolean {
  return getFileExtension(filename) === 'pdf';
}

export function formatSize(bytes: number): string {
  if (bytes === -1 || bytes === undefined || bytes === null) return '∞';
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
}
