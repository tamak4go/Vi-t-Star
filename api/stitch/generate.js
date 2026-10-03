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
  const deviceType = body?.deviceType || (quality === 'fast' ? 'MOBILE' : 'DESKTOP');

  // Hàm chọn mẫu di sản tương thích tốt nhất dựa theo nội dung prompt
  const getSmartFallbackScreen = () => {
    const p = prompt.toLowerCase();
    let matched = CURATED_HERITAGE_SCREENS[0]; // Mặc định Áo Tấc

    if (p.includes('nhật bình') || p.includes('nhat binh')) {
      matched = CURATED_HERITAGE_SCREENS.find(s => s.id === 'heritage-nhat-binh') || matched;
    } else if (p.includes('ngũ thân') || p.includes('ngu than') || p.includes('lập lĩnh')) {
      matched = CURATED_HERITAGE_SCREENS.find(s => s.id === 'heritage-ngu-than') || matched;
    } else if (p.includes('áo dài') || p.includes('ao dai') || p.includes('kỉ yếu') || p.includes('ki yeu')) {
      matched = CURATED_HERITAGE_SCREENS.find(s => s.id === 'heritage-ao-dai') || matched;
    } else if (p.includes('bà ba') || p.includes('ba ba') || p.includes('nam bộ')) {
      matched = CURATED_HERITAGE_SCREENS.find(s => s.id === 'heritage-ao-ba-ba') || matched;
    } else if (p.includes('thái') || p.includes('thai') || p.includes('thổ cẩm')) {
      matched = CURATED_HERITAGE_SCREENS.find(s => s.id === 'heritage-dan-toc-thai') || matched;
    } else if (p.includes('chăm') || p.includes('cham') || p.includes('tháp')) {
      matched = CURATED_HERITAGE_SCREENS.find(s => s.id === 'heritage-co-phuc-cham') || matched;
    } else if (p.includes('áo tấc') || p.includes('ao tac')) {
      matched = CURATED_HERITAGE_SCREENS.find(s => s.id === 'heritage-ao-tac') || matched;
    } else {
      // Chọn ngẫu nhiên trong danh sách mẫu đẹp
      const randomIndex = Math.floor(Math.random() * CURATED_HERITAGE_SCREENS.length);
      matched = CURATED_HERITAGE_SCREENS[randomIndex];
    }

    return {
      id: 'gen-' + Date.now(),
      name: `projects/${projectId}/screens/gen-${Date.now()}`,
      title: `${matched.title} (Atelier Heritage Render)`,
      screenshotUrl: matched.screenshotUrl,
      rawDownloadUrl: matched.rawDownloadUrl,
      isHeritageFallback: true,
    };
  };

  // Chế độ 'fast': Kết xuất di sản tức thì (<1s), không phải chờ Google Cloud hàng phút
  if (quality === 'fast') {
    const instantScreen = getSmartFallbackScreen();
    return res.status(200).json({
      success: true,
      screen: instantScreen,
      fastMode: true,
    });
  }

  // Nếu không có apiKey trên server, lập tức phục vụ tác phẩm di sản tương thích
  if (!apiKey) {
    const fallbackScreen = getSmartFallbackScreen();
    return res.status(200).json({
      success: true,
      screen: fallbackScreen,
      fallback: true,
    });
  }

  // Hàm bọc timeout 8 giây chống treo chờ Google Cloud quá lâu
  const withTimeout = (promise, ms = 8000) => {
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error('Google Stitch Cloud timeout (8s limit)')), ms);
    });
    return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
  };

  try {
    let client = await getStitchClient(apiKey);
    let genRes;
    try {
      genRes = await withTimeout(
        client.callTool('generate_screen_from_text', {
          projectId,
          prompt: prompt || 'Traditional Vietnamese Royal Costume fashion poster, editorial studio portrait',
          deviceType,
        }),
        8000
      );
    } catch (callErr) {
      if (callErr.message?.includes('transport') || callErr.message?.includes('connect')) {
        resetStitchClient();
        client = await getStitchClient(apiKey);
        genRes = await withTimeout(
          client.callTool('generate_screen_from_text', {
            projectId,
            prompt: prompt || 'Traditional Vietnamese Royal Costume fashion poster, editorial studio portrait',
            deviceType,
          }),
          8000
        );
      } else {
        throw callErr;
      }
    }

    const screenInfo = genRes?.outputComponents?.[0]?.design?.screens?.[0];
    if (!screenInfo || !screenInfo.name) {
      console.warn('[API generate] Stitch did not return valid screen info, serving heritage render');
      return res.status(200).json({
        success: true,
        screen: getSmartFallbackScreen(),
        fallback: true,
      });
    }

    // Lấy chi tiết screen
    let screenDetails;
    try {
      screenDetails = await client.callTool('get_screen', {
        name: screenInfo.name,
      });
    } catch (detailsErr) {
      console.warn('[API generate] Could not fetch details for screen:', screenInfo.name);
    }

    const rawUrl = screenDetails?.screenshot?.downloadUrl;
    const proxiedUrl = rawUrl
      ? `/api/stitch/proxy-image?url=${encodeURIComponent(rawUrl)}`
      : undefined;

    const newScreen = {
      id: screenInfo.id || screenInfo.name.split('/').pop(),
      name: screenInfo.name,
      title: screenDetails?.title || screenInfo.prompt || 'Poster Cổ Phục Việt Nam',
      screenshotUrl: proxiedUrl || getSmartFallbackScreen().screenshotUrl,
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
    console.error('[API generate] Stitch engine error, using smart fallback:', err.message);
    resetStitchClient();
    // Luôn đảm bảo người dùng nhận được poster di sản hoàn mỹ thay vì lỗi 500
    const fallbackScreen = getSmartFallbackScreen();
    return res.status(200).json({
      success: true,
      screen: fallbackScreen,
      fallback: true,
      engineNotice: 'Đang kết xuất từ kho tàng di sản Atelier',
    });
  }
}
