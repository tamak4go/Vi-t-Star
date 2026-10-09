// api/stitch/screens.js
// Returns lookbook screens from Stitch Cloud or curated fallback
import { extractCredentials, getStitchClient, resetStitchClient, CURATED_HERITAGE_SCREENS } from './_helper.js';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache, no-store');

  const { apiKey, projectId } = extractCredentials(req);

  // Nếu không có API Key, trả về danh sách di sản tuyển chọn chất lượng cao
  if (!apiKey) {
    return res.status(200).json({
      success: true,
      fallback: true,
      screens: CURATED_HERITAGE_SCREENS,
      message: 'Đang hiển thị thư viện bộ sưu tập mẫu di sản (Chưa cấu hình API Key)',
    });
  }

  try {
    const client = await getStitchClient(apiKey);
    let listRes;
    try {
      listRes = await client.callTool('list_screens', { projectId });
    } catch (callErr) {
      if (callErr.message?.includes('transport') || callErr.message?.includes('connect')) {
        resetStitchClient();
        const freshClient = await getStitchClient(apiKey);
        listRes = await freshClient.callTool('list_screens', { projectId });
      } else {
        throw callErr;
      }
    }

    const fetchedScreens = (listRes?.screens || [])
      .filter((s) => s.screenshot?.downloadUrl)
      .slice(0, 16)
      .map((s) => {
        const rawUrl = s.screenshot.downloadUrl;
        const proxiedUrl = rawUrl.startsWith('/') ? rawUrl : `/api/stitch/proxy-image?url=${encodeURIComponent(rawUrl)}`;
        return {
          id: s.name.split('/').pop(),
          name: s.name,
          title: s.title || 'Cổ Phục Việt Nam Studio',
          screenshotUrl: proxiedUrl,
          rawDownloadUrl: rawUrl,
        };
      });

    // Kết hợp cùng các màn hình tuyển chọn nếu danh sách ít
    const finalScreens = fetchedScreens.length > 0 ? fetchedScreens : CURATED_HERITAGE_SCREENS;

    return res.status(200).json({
      success: true,
      screens: finalScreens,
      count: finalScreens.length,
    });
  } catch (err) {
    console.error('[API screens] Error:', err);
    resetStitchClient();
    // Khi có lỗi từ Google Cloud, vẫn trả về Curated screens để UI không bị vỡ/lỗi trống trơn
    return res.status(200).json({
      success: true,
      fallback: true,
      screens: CURATED_HERITAGE_SCREENS,
      warning: `Không thể tải trực tiếp từ Stitch (${err.message}). Đang hiển thị thư viện mẫu.`,
    });
  }
}
