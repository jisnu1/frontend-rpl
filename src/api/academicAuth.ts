import apiClient from './apiClient';

export interface AcademicVerifyResponse {
  message: string;
}

/**
 * Mengirimkan kode OTP ke email kampus sekunder untuk verifikasi mahasiswa
 */
export async function sendAcademicOtp(emailKampus: string): Promise<AcademicVerifyResponse> {
  const response = await apiClient.post<AcademicVerifyResponse>('/auth/academic/send-otp', null, {
    params: { emailKampus }
  });
  return response.data;
}

/**
 * Memverifikasi kode OTP yang dikirimkan ke email kampus sekunder
 */
export async function verifyAcademicOtp(emailKampus: string, otpCode: string): Promise<AcademicVerifyResponse> {
  const response = await apiClient.post<AcademicVerifyResponse>('/auth/academic/verify-otp', null, {
    params: { emailKampus, otpCode }
  });
  return response.data;
}
