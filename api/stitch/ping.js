// api/stitch/ping.js
// Health check and live latency test for Google Stitch API
import { extractCredentials, getStitchClient, resetStitchClient } from './_helper.js';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache, no-store');

  const startTime = Date.now();
  const { apiKey, projectId } = extractCredentials(req);

  if (!apiKey) {
    return res.status(200).json({
      success: true,
      server: 'online',
      configured: false,
      projectId,
      message: 'Server sẵn sàng. STITCH_API_KEY chưa được thiết lập (có thể nhập trực tiếp trong giao diện Atelier).',
      latencyMs: Date.now() - startTime,
    });
  }

  try {
    const client = await getStitchClient(apiKey);
    const latencyMs = Date.now() - startTime;
    return res.status(200).json({
      success: true,
      server: 'online',
      configured: true,
      projectId,
      latencyMs,
      message: `Kết nối thành công tới Google Stitch Cloud Engine (${latencyMs}ms).`,
    });
  } catch (err) {
    resetStitchClient();
    return res.status(200).json({
      success: false,
      server: 'online',
      configured: true,
      projectId,
      error: err.message || 'Lỗi bắt tay với Google Stitch SDK',
      latencyMs: Date.now() - startTime,
    });
  }
}
