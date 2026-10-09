// api/stitch/generate.js
// Generates a new Stitch screen via Google Cloud / Gemini Flash
import { extractCredentials, getStitchClient, resetStitchClient, CURATED_HERITAGE_SCREENS } from './_helper.js';

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
  const prompt = body?.prompt || '';
  const quality = body?.quality || 'standard';
  // Dùng DESKTOP cho poster thời trang để tạo ảnh nghệ thuật hoàn chỉnh
  const deviceType = body?.deviceType || 'DESKTOP';
  const referenceScreenId = body?.referenceScreenId;

  // Nếu không có apiKey trên server, phục vụ tác phẩm di sản tương thích
  if (!apiKey) {
    const randomIndex = Math.floor(Math.random() * CURATED_HERITAGE_SCREENS.length);
    const matched = CURATED_HERITAGE_SCREENS[randomIndex];
    return res.status(200).json({
      success: true,
      screen: {
        id: 'gen-' + Date.now(),
        name: `projects/${projectId}/screens/gen-${Date.now()}`,
        title: `${matched.title} (Atelier Heritage Render)`,
        screenshotUrl: matched.screenshotUrl,
        rawDownloadUrl: matched.rawDownloadUrl,
        isHeritageFallback: true,
      },
      fallback: true,
    });
  }

  if (!prompt) {
    return res.status(400).json({ success: false, error: 'Thiếu tham số prompt.' });
  }

  // Hàm bọc timeout 120 giây cho Google Cloud hoàn thành tác phẩm tỉ mỉ
  const withTimeout = (promise, ms = 120000) => {
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error('Google Stitch Cloud timeout (120s limit)')), ms);
    });
    return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
  };

  try {
    let client = await getStitchClient(apiKey);
    let genRes;

    try {
      if (referenceScreenId) {
        genRes = await withTimeout(
          client.callTool('edit_screens', {
            projectId,
            selectedScreenIds: [referenceScreenId],
            prompt,
            deviceType,
          }),
          120000
        );
      } else {
        genRes = await withTimeout(
          client.callTool('generate_screen_from_text', {
            projectId,
            prompt,
            deviceType,
          }),
          120000
        );
      }
    } catch (callErr) {
      console.warn('[API generate] Thử lần 1 thất bại, khởi tạo kết nối mới và thử lại lần 2:', callErr?.message || callErr);
      resetStitchClient();
      client = await getStitchClient(apiKey, true);

      if (referenceScreenId) {
        genRes = await withTimeout(
          client.callTool('edit_screens', {
            projectId,
            selectedScreenIds: [referenceScreenId],
            prompt,
            deviceType,
          }),
          120000
        );
      } else {
        genRes = await withTimeout(
          client.callTool('generate_screen_from_text', {
            projectId,
            prompt,
            deviceType,
          }),
          120000
        );
      }
    }

    const screenInfo = genRes?.outputComponents?.[0]?.design?.screens?.[0];
    if (!screenInfo || !screenInfo.name) {
      return res.status(502).json({
        success: false,
        error: 'Stitch Cloud không trả về kết quả screen hợp lệ.',
        raw: genRes,
      });
    }

    // Ưu tiên screenshotUrl có sẵn từ kết quả sinh của Google Stitch
    let rawUrl = screenInfo?.screenshot?.downloadUrl;
    let screenTitle = screenInfo.title || screenInfo.prompt || 'Poster Cổ Phục Việt Nam';
    let htmlCode = screenInfo.htmlCode;

    if (!rawUrl) {
      try {
        const sId = screenInfo.id || screenInfo.name.split('/').pop();
        const screenDetails = await withTimeout(
          client.callTool('get_screen', {
            name: screenInfo.name,
            projectId,
            screenId: sId,
          }),
          15000
        );
        rawUrl = screenDetails?.screenshot?.downloadUrl;
        screenTitle = screenDetails?.title || screenTitle;
        htmlCode = screenDetails?.htmlCode || htmlCode;
      } catch (detailsErr) {
        console.warn('[API generate] Could not fetch details for screen:', screenInfo.name, detailsErr?.message);
      }
    }

    const proxiedUrl = rawUrl
      ? (rawUrl.startsWith('/') ? rawUrl : `/api/stitch/proxy-image?url=${encodeURIComponent(rawUrl)}`)
      : undefined;

    const newScreen = {
      id: screenInfo.id || screenInfo.name.split('/').pop(),
      name: screenInfo.name,
      title: screenTitle,
      screenshotUrl: proxiedUrl || rawUrl,
      rawDownloadUrl: rawUrl,
      htmlCode,
      width: screenInfo.width,
      height: screenInfo.height,
      isAiGenerated: true,
    };

    return res.status(200).json({
      success: true,
      screen: newScreen,
    });
  } catch (err) {
    console.error('[API generate] Stitch engine error:', err.message);
    resetStitchClient();
    return res.status(500).json({
      success: false,
      error: err.message || 'Lỗi khi gọi Google Stitch Engine',
    });
  }
}

