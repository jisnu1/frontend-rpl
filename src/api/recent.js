import apiClient from './apiClient';

// Mock data matching the files from the provided HTML reference design
const LOCAL_RECENT_FILES = [
  {
    id: 1,
    name: 'Q4 Financial Report_Draft.pdf',
    folder: 'Shared in Finance Team',
    modifiedTime: '10:45 AM',
    timelineGroup: 'Today',
    owner: 'David Chen',
    ownerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXaHQZSLESO91dRvczF7q2cMTV6ndBareXh9wiWMC4swuCAXaxzMSupPkMtDElawakOzPN7yj74UHxFvjBP5D67l486js-n511yz79bDn7JSBPePnosstRBVuT2-N7y3F0rJLSrA2juGeu80cD2Nb3ky7U-ac7j1QR9kJ8672HLGOvQIJsCQRpeOfvbsNwbWOo0tmMS8jyd1gm2cZoaDAmZGBuPLjL8GaF8TLaPeSNz2_zq0kMzd5kR8nQWw8-pJ0Bnv0DjsUHM4E',
    size: '4.2 MB',
    type: 'pdf'
  },
  {
    id: 2,
    name: 'Client Contacts 2024.xlsx',
    folder: 'My Drive / Marketing',
    modifiedTime: '08:12 AM',
    timelineGroup: 'Today',
    owner: 'You',
    ownerAvatar: 'ME',
    size: '852 KB',
    type: 'xlsx'
  },
  {
    id: 3,
    name: 'Product Launch Keynote.pptx',
    folder: 'Shared with Design Dept',
    modifiedTime: 'Yesterday, 4:30 PM',
    timelineGroup: 'Yesterday',
    owner: 'Sarah Jenkins',
    ownerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCX1lnQfPYdXq3gFPjVpGS2u--kP-WldORdiExbE7lSpjhLegI-rtyXVmAyhUtgR3YJrtCZjmALxhkGgbw8PcpVEvf1aGGtAmQpJm9WA-XfhgcJWTrGJ-p-x2dksZBpXDW0tokmiq-aIOm8xPNpGcPs0CPmck8BOMV0z9hoiacVDycF6Jof1sQ5Xl0a2hvXM8feBy3xPina7zoi45q27EB1N9l6PdONQVossmtM8bamSKV3MF2KNBW-Eth988-Yl2Towc2nJ8dfncE',
    size: '12.5 MB',
    type: 'pptx'
  },
  {
    id: 4,
    name: 'Brand_Assets_New.zip',
    folder: 'My Drive / Branding',
    modifiedTime: 'Yesterday, 11:20 AM',
    timelineGroup: 'Yesterday',
    owner: 'You',
    ownerAvatar: 'ME',
    size: '245 MB',
    type: 'zip'
  },
  {
    id: 5,
    name: 'Customer_Interview_Final.mp4',
    folder: 'Shared by Research Team',
    modifiedTime: 'Oct 12, 2:15 PM',
    timelineGroup: 'Last Week',
    owner: 'Mark Thompson',
    ownerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBdq5Ch9aKCLAktnaTgRr-aUnfUBMHEcldAbSdQFfhFJKCttxuNUHGDj5L-thhbGYevaVTaeFzMTB-sqIBWKEgxBGm3OAKRkFuLeWNqNUScS-eGVBC2CjCDY-uGXijboKdFxQBjVpGFKVS-hEcmwJmw65r0KnQD4g5y0dcJ1kGex0gCBaopJqTGDCdiAXZeAOq33X94jAuhqABAqMNBG5cJI3xAhIe8IpFqp5e_7Yokix7dXdb4TFCuGHbND2UYT9rC8AjDrZmNmNI',
    size: '1.2 GB',
    type: 'mp4'
  },
  {
    id: 6,
    name: 'Project Aurora Archives',
    folder: 'My Drive / Archive',
    modifiedTime: 'Oct 10, 9:00 AM',
    timelineGroup: 'Last Week',
    owner: 'You',
    ownerAvatar: 'ME',
    size: '45.8 MB',
    type: 'folder'
  }
];

/**
 * Fetch files that the user worked on recently
 */
export async function fetchRecentFiles() {
  try {
    const response = await apiClient.get('/files/recent');
    const data = response.data;
    if (Array.isArray(data)) return data;
    return LOCAL_RECENT_FILES;
  } catch (error) {
    console.warn('API Recent Files failed, using local fallback data:', error.message);
    return LOCAL_RECENT_FILES;
  }
}
