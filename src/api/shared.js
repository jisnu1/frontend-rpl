import apiClient from './apiClient';

// Mock data menggunakan struktur flat yang sesuai dengan komponen SharedFileTable
const LOCAL_SHARED_FILES = [
  {
    id: 1,
    name: 'Design_Guidelines_v2.pdf',
    shareMethod: 'Shared via Link',
    owner: 'Alex Morgan',
    ownerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAaXe7B0cwkfBmbJ2L4WGi7RTh0m6WhYJU1IeiFBkv22lcbgSWD9MlBgps4B2fynU6R--slXKvVEFpE-fa3RRtb8q8Q-4TdIzlT8EWJkqlvdRE5w3kCMAmyVDW6NbrF5bbwwea9OQBtDUj0n56oHTGwPkdYf6PeMUzyezKDratkjxgd7Btv7xrmuz6jdpXp4DVvf6fsQKW-o9EmrYqvZ5hjJ6yXKFF2e1rVPsdt-xnpMTZWgl_LhY-qV1As-FtLnBpuxdYS-GzsUu4',
    sharedDate: 'Oct 12, 2023',
    size: '4.2 MB',
  },
  {
    id: 2,
    name: 'Annual_Report_Draft.docx',
    shareMethod: 'Direct Access',
    owner: 'Liam White',
    ownerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCO3Wk9DtGmom3HqdPOXV5VuZbnGbTUc5w8dkh0WKW9OsIXT70ji79SrH8h8iqeiDljy-uW4SY95SneEUTIeEiJ3zhOQqF9i5UIf4QrAv_SWS4GuprobZivrIBBD4a_Y5-QF8X_Z_cdmM9c0oKd3Se1lLa9rqAsC_zXCqJJwHZr9WZWJtmoDl0eDXrH8FBINjxxKKAj4suS2fYelCL2_G8zU75yzLfwPMfFtVb4lSgICGzV3pvmBpIZKOS8LfS3FUXdlB-0mCg4cDY',
    sharedDate: 'Oct 10, 2023',
    size: '128 KB',
  },
  {
    id: 3,
    name: 'Company_Retreat_Photo_01.jpg',
    shareMethod: 'Internal Team',
    owner: 'Sarah Chen',
    ownerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBoWxa2g1wKCr1q2neUGyawIKISaJCVAvqn3zJ8-Ay9OA8FtTaIE7eUud5C7QJMYasjEAxlzWPygtSsNWrRkEoACDwTNkeTwpykTAmT4zy1vzNXWM4ZTqPNHYtQh66ZENUKZccQZsOt293S60OhDJc3QMrTzoq4sj18ElvLraxagh3-4HpcLXyepDEi97hCbG1WIFgKnZZRRaR0mOs30l4oUtGsbuxenHH_xK9h_WK18EL1RC3WxHlDXKq_LZ9iSzjaDi8Rr1cgjCM',
    sharedDate: 'Oct 09, 2023',
    size: '8.5 MB',
  },
  {
    id: 4,
    name: 'Q3_Revenue_Analysis.xlsx',
    shareMethod: 'Finance Department',
    owner: 'Tom Harris',
    ownerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCm0QxMG3oewUnoiXlUWfZD5D0Y0h5-rQvHU17dhIufiQ0V5Kp8Gi_jrTo1V8VsziFbQo2p2BUfvRvTTGaoNuqOD_tlSD2jfd7Z1Og6ilYi-fg_oXwEmo0vJMVy3-3uZwLl-yUGNynO6IMHiZhOIjsDko31SxTID5ZoMtApE5zSWZHORfhShkusdtjtOYWn-FLEDqxGs0xkfA5Y_Gpllh1s2OJvkCxXjV1TEVpUKfwVqZjUo8JED7TmOfGFLQt6LLXzEtMh0ThlZWs',
    sharedDate: 'Oct 05, 2023',
    size: '1.2 MB',
  },
  {
    id: 5,
    name: 'Onboarding_Video_Draft.mp4',
    shareMethod: 'Shared via HR',
    owner: 'Emma Klein',
    ownerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCX-KinNy7nDaNcI6Kl4zPLSYnUUEkYs5-IwVyaHU4Yb4cCkojTOlGsGDvcFUCXnZRyAlXtbOsLJouVzLVCfVgfnEZYTXqGwiv5FFf43Wx_FiPUoHeB2gUAN3PsiRsEZznQhSmUSejVThcFq92Hyb2ATJZGDEvPuerj5e6gGXtDLKki-cYfPGHHFyQvXnVLKkyvg6m1pWcYZImxXpBEX2aIHFumcd1oELxYC6ebKM0vbpULbEeVqg3vfNwAn341fTMgfTRrS2q2sMw',
    sharedDate: 'Sep 28, 2023',
    size: '45.8 MB',
  },
  {
    id: 6,
    name: 'Brand_Assets_2024.zip',
    shareMethod: 'Internal Team',
    owner: 'Sarah Chen',
    ownerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBoWxa2g1wKCr1q2neUGyawIKISaJCVAvqn3zJ8-Ay9OA8FtTaIE7eUud5C7QJMYasjEAxlzWPygtSsNWrRkEoACDwTNkeTwpykTAmT4zy1vzNXWM4ZTqPNHYtQh66ZENUKZccQZsOt293S60OhDJc3QMrTzoq4sj18ElvLraxagh3-4HpcLXyepDEi97hCbG1WIFgKnZZRRaR0mOs30l4oUtGsbuxenHH_xK9h_WK18EL1RC3WxHlDXKq_LZ9iSzjaDi8Rr1cgjCM',
    sharedDate: 'Sep 25, 2023',
    size: '150.0 MB',
  },
  {
    id: 7,
    name: 'User_Feedback_Summary.pdf',
    shareMethod: 'Shared via Link',
    owner: 'Alex Morgan',
    ownerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAaXe7B0cwkfBmbJ2L4WGi7RTh0m6WhYJU1IeiFBkv22lcbgSWD9MlBgps4B2fynU6R--slXKvVEFpE-fa3RRtb8q8Q-4TdIzlT8EWJkqlvdRE5w3kCMAmyVDW6NbrF5bbwwea9OQBtDUj0n56oHTGwPkdYf6PeMUzyezKDratkjxgd7Btv7xrmuz6jdpXp4DVvf6fsQKW-o9EmrYqvZ5hjJ6yXKFF2e1rVPsdt-xnpMTZWgl_LhY-qV1As-FtLnBpuxdYS-GzsUu4',
    sharedDate: 'Sep 22, 2023',
    size: '1.8 MB',
  },
  {
    id: 8,
    name: 'Product_Catalog_Final.docx',
    shareMethod: 'Marketing Department',
    owner: 'Liam White',
    ownerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCO3Wk9DtGmom3HqdPOXV5VuZbnGbTUc5w8dkh0WKW9OsIXT70ji79SrH8h8iqeiDljy-uW4SY95SneEUTIeEiJ3zhOQqF9i5UIf4QrAv_SWS4GuprobZivrIBBD4a_Y5-QF8X_Z_cdmM9c0oKd3Se1lLa9rqAsC_zXCqJJwHZr9WZWJtmoDl0eDXrH8FBINjxxKKAj4suS2fYelCL2_G8zU75yzLfwPMfFtVb4lSgICGzV3pvmBpIZKOS8LfS3FUXdlB-0mCg4cDY',
    sharedDate: 'Sep 15, 2023',
    size: '3.0 MB',
  },
  {
    id: 9,
    name: 'Financial_Projections_Q4.xlsx',
    shareMethod: 'Finance Department',
    owner: 'Tom Harris',
    ownerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCm0QxMG3oewUnoiXlUWfZD5D0Y0h5-rQvHU17dhIufiQ0V5Kp8Gi_jrTo1V8VsziFbQo2p2BUfvRvTTGaoNuqOD_tlSD2jfd7Z1Og6ilYi-fg_oXwEmo0vJMVy3-3uZwLl-yUGNynO6IMHiZhOIjsDko31SxTID5ZoMtApE5zSWZHORfhShkusdtjtOYWn-FLEDqxGs0xkfA5Y_Gpllh1s2OJvkCxXjV1TEVpUKfwVqZjUo8JED7TmOfGFLQt6LLXzEtMh0ThlZWs',
    sharedDate: 'Sep 10, 2023',
    size: '2.4 MB',
  },
  {
    id: 10,
    name: 'Social_Media_Banner.png',
    shareMethod: 'Marketing Department',
    owner: 'Emma Klein',
    ownerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCX-KinNy7nDaNcI6Kl4zPLSYnUUEkYs5-IwVyaHU4Yb4cCkojTOlGsGDvcFUCXnZRyAlXtbOsLJouVzLVCfVgfnEZYTXqGwiv5FFf43Wx_FiPUoHeB2gUAN3PsiRsEZznQhSmUSejVThcFq92Hyb2ATJZGDEvPuerj5e6gGXtDLKki-cYfPGHHFyQvXnVLKkyvg6m1pWcYZImxXpBEX2aIHFumcd1oELxYC6ebKM0vbpULbEeVqg3vfNwAn341fTMgfTRrS2q2sMw',
    sharedDate: 'Sep 05, 2023',
    size: '1.5 MB',
  },
  {
    id: 11,
    name: 'Q3_Strategy_Review.mp4',
    shareMethod: 'Internal Team',
    owner: 'Sarah Chen',
    ownerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBoWxa2g1wKCr1q2neUGyawIKISaJCVAvqn3zJ8-Ay9OA8FtTaIE7eUud5C7QJMYasjEAxlzWPygtSsNWrRkEoACDwTNkeTwpykTAmT4zy1vzNXWM4ZTqPNHYtQh66ZENUKZccQZsOt293S60OhDJc3QMrTzoq4sj18ElvLraxagh3-4HpcLXyepDEi97hCbG1WIFgKnZZRRaR0mOs30l4oUtGsbuxenHH_xK9h_WK18EL1RC3WxHlDXKq_LZ9iSzjaDi8Rr1cgjCM',
    sharedDate: 'Aug 29, 2023',
    size: '120.0 MB',
  },
  {
    id: 12,
    name: 'Customer_Surveys_2023.xlsx',
    shareMethod: 'Direct Access',
    owner: 'Alex Morgan',
    ownerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAaXe7B0cwkfBmbJ2L4WGi7RTh0m6WhYJU1IeiFBkv22lcbgSWD9MlBgps4B2fynU6R--slXKvVEFpE-fa3RRtb8q8Q-4TdIzlT8EWJkqlvdRE5w3kCMAmyVDW6NbrF5bbwwea9OQBtDUj0n56oHTGwPkdYf6PeMUzyezKDratkjxgd7Btv7xrmuz6jdpXp4DVvf6fsQKW-o9EmrYqvZ5hjJ6yXKFF2e1rVPsdt-xnpMTZWgl_LhY-qV1As-FtLnBpuxdYS-GzsUu4',
    sharedDate: 'Aug 20, 2023',
    size: '921 KB',
  },
];

/**
 * Fetches shared files from Spring Boot backend.
 * Falls back to LOCAL_SHARED_FILES on failure.
 * Backend response must return flat structure:
 *   { id, name, shareMethod, owner, ownerAvatar, sharedDate, size }
 */
export async function fetchSharedFiles() {
  try {
    const response = await apiClient.get('/shared/files');
    // Normalize backend response if needed
    const data = response.data;
    if (Array.isArray(data)) return data;
    return LOCAL_SHARED_FILES;
  } catch (error) {
    console.warn('API Shared Files gagal, menggunakan data lokal:', error.message);
    return LOCAL_SHARED_FILES;
  }
}
