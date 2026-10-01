// api/stitch/generate.js
// Generates a new Stitch screen via Google Cloud / Gemini Flash
import { extractCredentials, getStitchClient, resetStitchClient } from './_helper.js';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Phương thức không được hỗ trợ (chỉ chấp nhận POST)' });
  }

  // Parse body if string
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  const { apiKey, projectId } = extractCredentials(req, body);
  const prompt = body?.prompt;
  const quality = body?.quality || 'standard';
  const deviceType = body?.deviceType || (quality === 'fast' ? 'MOBILE' : 'DESKTOP');

  if (!apiKey) {
    return res.status(400).json({
      success: false,
      error: 'Chưa có STITCH_API_KEY. Vui lòng thiết lập biến môi trường trên Vercel hoặc nhập API Key trực tiếp trong Atelier.',
    });
  }

  if (!prompt) {
    return res.status(400).json({ success: false, error: 'Thiếu tham số prompt' });
  }

  try {
    let client = await getStitchClient(apiKey);
    let genRes;
    try {
      genRes = await client.callTool('generate_screen_from_text', {
        projectId,
        prompt,
        deviceType,
      });
    } catch (callErr) {
      if (callErr.message?.includes('transport') || callErr.message?.includes('connect')) {
        resetStitchClient();
        client = await getStitchClient(apiKey);
        genRes = await client.callTool('generate_screen_from_text', {
          projectId,
          prompt,
          deviceType,
        });
      } else {
        throw callErr;
      }
    }

    const screenInfo = genRes?.outputComponents?.[0]?.design?.screens?.[0];
    if (!screenInfo || !screenInfo.name) {
      return res.status(502).json({
        success: false,
        error: 'Stitch Cloud không trả về screen hợp lệ',
        raw: genRes,
      });
    }

    // Lấy chi tiết screen
    const screenDetails = await client.callTool('get_screen', {
      name: screenInfo.name,
    });

    const rawUrl = screenDetails?.screenshot?.downloadUrl;
    const proxiedUrl = rawUrl
      ? `/api/stitch/proxy-image?url=${encodeURIComponent(rawUrl)}`
      : undefined;

    const newScreen = {
      id: screenInfo.id || screenInfo.name.split('/').pop(),
      name: screenInfo.name,
      title: screenDetails?.title || screenInfo.prompt,
      screenshotUrl: proxiedUrl,
      rawDownloadUrl: rawUrl,
      htmlCode: screenDetails?.htmlCode,
      width: screenDetails?.width,
      height: screenDetails?.height,
    };

    return res.status(200).json({
      success: true,
      screen: newScreen,
    });
  } catch (err) {
    console.error('[API generate] Error:', err);
    resetStitchClient();
    return res.status(500).json({
      success: false,
      error: err.message || 'Lỗi khi gọi Google Stitch Engine',
    });
  }
}
