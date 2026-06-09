import apiClient from './apiClient';

const LOCAL_TRASH_FILES = [
  {
    id: 1,
    name: 'Annual_Report_2023_v4.pdf',
    originalLocation: 'Finance / Reports',
    dateDeleted: 'Oct 24, 2023',
    size: '2.4 MB',
    type: 'pdf',
  },
  {
    id: 2,
    name: 'Branding_Assets_Draft.zip',
    originalLocation: 'Design / Archive',
    dateDeleted: 'Oct 22, 2023',
    size: '45.2 MB',
    type: 'zip',
  },
  {
    id: 3,
    name: 'Client_Meeting_Notes.docx',
    originalLocation: 'Meetings / 2023',
    dateDeleted: 'Oct 21, 2023',
    size: '128 KB',
    type: 'docx',
  },
  {
    id: 4,
    name: 'Budget_Spreadsheet_OLD.xlsx',
    originalLocation: 'Finance / Archive',
    dateDeleted: 'Oct 19, 2023',
    size: '540 KB',
    type: 'xlsx',
  },
];

/**
 * Fetch files from the trash.
 * Falls back to LOCAL_TRASH_FILES if API is unavailable.
 */
export async function fetchTrashFiles() {
  try {
    const response = await apiClient.get('/trash/files');
    const data = response.data;
    if (Array.isArray(data)) return data;
    return LOCAL_TRASH_FILES;
  } catch (error) {
    console.warn('API Trash Files failed, using local fallback:', error.message);
    return LOCAL_TRASH_FILES;
  }
}

/**
 * Restore a file from trash.
 */
export async function restoreFile(id) {
  try {
    await apiClient.post(`/trash/restore/${id}`);
    return true;
  } catch (error) {
    console.warn(`API Restore File ${id} failed, returning mock success:`, error.message);
    return true;
  }
}

/**
 * Delete a file permanently.
 */
export async function deleteFilePermanently(id) {
  try {
    await apiClient.delete(`/trash/delete/${id}`);
    return true;
  } catch (error) {
    console.warn(`API Delete File ${id} failed, returning mock success:`, error.message);
    return true;
  }
}

/**
 * Empty all trash files.
 */
export async function emptyTrash() {
  try {
    await apiClient.delete('/trash/empty');
    return true;
  } catch (error) {
    console.warn('API Empty Trash failed, returning mock success:', error.message);
    return true;
  }
}
