// src/server/stitchPlugin.ts
// Vite Plugin cung cấp API endpoint bảo mật cho Google Stitch SDK
import type { Plugin, ViteDevServer } from 'vite';
import { loadEnv } from 'vite';
import { StitchToolClient } from '@google/stitch-sdk';

let cachedClient: StitchToolClient | null = null;

// Bộ nhớ đệm các poster vừa được sinh trong phiên làm việc
interface CachedScreen {
  id: string;
  name: string;
  title: string;
  screenshotUrl?: string;
  rawDownloadUrl?: string;
  htmlCode?: any;
  width?: string;
  height?: string;
}

const generatedScreensCache: CachedScreen[] = [
  {
    id: '24ca449ef9ba4131b11056dfd07a729b',
    name: 'projects/8753486478358563567/screens/24ca449ef9ba4131b11056dfd07a729b',
    title: 'Lookbook Hoàng Thành Huế • Áo Nhật Bình Cung Đình (Gemini 3.8 Flash)',
    screenshotUrl: `/api/stitch/proxy-image?url=${encodeURIComponent('https://lh3.googleusercontent.com/aida/AEtjO1XSu_-MRSFCH77FDqbxY-41sZJ74NbirKqQeCw2JeNNMAVa3dYc_265WNQycG9EZi4hzNkt4nebKkbjVmkUwEzw5x6Ar4C4PxTQO1mUMWr2pULkpgAOnlASkEbSHG5zfs-aOvFd75ZE9VOIcox4W8uvnICAWTawzDvuf_xsYRE_dUfT43AFNk6acbtJ_lWefIY_4pxtcBeHX_glNwbs61B9ZdrfPOldoAdSdaD7C0XnVjTXjg1tJZfz8N8')}`,
    rawDownloadUrl: 'https://lh3.googleusercontent.com/aida/AEtjO1XSu_-MRSFCH77FDqbxY-41sZJ74NbirKqQeCw2JeNNMAVa3dYc_265WNQycG9EZi4hzNkt4nebKkbjVmkUwEzw5x6Ar4C4PxTQO1mUMWr2pULkpgAOnlASkEbSHG5zfs-aOvFd75ZE9VOIcox4W8uvnICAWTawzDvuf_xsYRE_dUfT43AFNk6acbtJ_lWefIY_4pxtcBeHX_glNwbs61B9ZdrfPOldoAdSdaD7C0XnVjTXjg1tJZfz8N8',
  }
];

async function getStitchClient(apiKey: string): Promise<StitchToolClient> {
  if (cachedClient) {
    if ((cachedClient as any).isConnected) {
      return cachedClient;
    }
    try {
      await cachedClient.close();
    } catch {
      // ignore
    }
    cachedClient = null;
  }
  const client = new StitchToolClient({ apiKey });
  await client.connect();
  cachedClient = client;
  return client;
}

function resetStitchClient() {
  if (cachedClient) {
    try {
      cachedClient.close();
    } catch {
      // ignore
    }
    cachedClient = null;
  }
}

export function stitchApiPlugin(): Plugin {
  return {
    name: 'vite-plugin-stitch-api',
    configureServer(server: ViteDevServer) {
      const env = loadEnv(server.config.mode, process.cwd(), '');
      const apiKey = env.STITCH_API_KEY || process.env.STITCH_API_KEY || '';
      const defaultProjectId = (env.STITCH_PROJECT_ID || process.env.STITCH_PROJECT_ID || '8753486478358563567').replace('projects/', '');

      // Middleware xử lý các request tới /api/stitch/*
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';

        if (!url.startsWith('/api/stitch')) {
          return next();
        }

        res.setHeader('Content-Type', 'application/json');

        // Kiểm tra API Key
        if (!apiKey) {
          res.statusCode = 500;
          res.end(JSON.stringify({
            success: false,
            error: 'STITCH_API_KEY chưa được cấu hình trong file .env của dự án.',
          }));
          return;
        }

        // 1. Endpoint: POST /api/stitch/generate
        if (url.startsWith('/api/stitch/generate') && req.method === 'POST') {
          // Vô hiệu hóa socket timeout để hỗ trợ các tác vụ sinh ảnh dài (khoảng 2-3 phút) từ Google Cloud
          if (req.socket) {
            req.socket.setTimeout(0);
            req.socket.setKeepAlive(true, 10000);
          }

          let bodyStr = '';
          req.on('data', (chunk) => {
            bodyStr += chunk;
          });

          req.on('end', async () => {
            try {
              const body = JSON.parse(bodyStr || '{}');
              const prompt = body.prompt;
              const quality = body.quality || 'standard';
              const deviceType = body.deviceType || (quality === 'fast' ? 'MOBILE' : 'DESKTOP');
              const projectId = (body.projectId || defaultProjectId).replace('projects/', '');

              if (!prompt) {
                res.statusCode = 400;
                res.end(JSON.stringify({ success: false, error: 'Thiếu tham số prompt' }));
                return;
              }

              console.log(`[Stitch API] Bắt đầu sinh screen (${quality} | device: ${deviceType}):`, prompt.slice(0, 100) + '...');
              let client = await getStitchClient(apiKey);

              // 1. Gọi generate_screen_from_text với auto-healing retry nếu lỗi transport
              let genRes: any;
              try {
                genRes = await client.callTool('generate_screen_from_text', {
                  projectId,
                  prompt,
                  deviceType,
                });
              } catch (callErr: any) {
                if (callErr.message?.includes('transport') || callErr.message?.includes('connect')) {
                  console.warn('[Stitch API] Kết nối cũ bị gián đoạn, đang tái kết nối client mới:', callErr.message);
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

              // Lấy screen info vừa sinh
              const screenInfo = genRes.outputComponents?.[0]?.design?.screens?.[0];
              if (!screenInfo || !screenInfo.name) {
                res.statusCode = 502;
                res.end(JSON.stringify({
                  success: false,
                  error: 'Stitch không trả về screen hợp lệ',
                  raw: genRes,
                }));
                return;
              }

              // 2. Gọi get_screen để lấy screenshot URL và HTML code
              console.log('[Stitch API] Lấy chi tiết screen:', screenInfo.name);
              const screenDetails: any = await client.callTool('get_screen', {
                name: screenInfo.name,
              });

              const rawUrl = screenDetails.screenshot?.downloadUrl;
              const proxiedUrl = rawUrl
                ? `/api/stitch/proxy-image?url=${encodeURIComponent(rawUrl)}`
                : undefined;

              const newScreen = {
                id: screenInfo.id || screenInfo.name.split('/').pop(),
                name: screenInfo.name,
                title: screenDetails.title || screenInfo.prompt,
                screenshotUrl: proxiedUrl,
                rawDownloadUrl: rawUrl,
                htmlCode: screenDetails.htmlCode,
                width: screenDetails.width,
                height: screenDetails.height,
              };

              // Lưu vào danh sách poster gần đây ở bộ nhớ đệm
              generatedScreensCache.unshift(newScreen);

              res.statusCode = 200;
              res.end(JSON.stringify({
                success: true,
                screen: newScreen,
              }));
            } catch (err: any) {
              console.error('[Stitch API] Lỗi sinh ảnh:', err);
              resetStitchClient();
              res.statusCode = 500;
              res.end(JSON.stringify({
                success: false,
                error: err.message || 'Lỗi xử lý yêu cầu Google Stitch',
              }));
            }
          });
          return;
        }

        // 2. Endpoint: GET /api/stitch/proxy-image?url=... (Chống lỗi 429/Referer của Google CDN)
        if (url.startsWith('/api/stitch/proxy-image') && req.method === 'GET') {
          try {
            const parsedUrl = new URL(url, 'http://localhost');
            const targetUrl = parsedUrl.searchParams.get('url');

            if (!targetUrl) {
              res.statusCode = 400;
              res.end('Missing url parameter');
              return;
            }

            // Gọi server-side không kèm Referer để bypass kiểm tra của Google CDN
            const imgRes = await fetch(targetUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
              },
            });

            if (!imgRes.ok) {
              res.statusCode = imgRes.status;
              res.end(`Google CDN fetch error: ${imgRes.statusText}`);
              return;
            }

            const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
            res.setHeader('Content-Type', contentType);
            res.setHeader('Cache-Control', 'public, max-age=86400');
            const arrayBuffer = await imgRes.arrayBuffer();
            res.end(Buffer.from(arrayBuffer));
          } catch (err: any) {
            console.error('[Stitch Image Proxy] Lỗi proxy ảnh:', err);
            res.statusCode = 500;
            res.end(`Image proxy error: ${err.message}`);
          }
          return;
        }

        // 3. Endpoint: GET /api/stitch/screens (Lấy danh sách các poster thời trang đã tạo gần đây)
        if (url.startsWith('/api/stitch/screens') && req.method === 'GET') {
          try {
            let client = await getStitchClient(apiKey);
            let listRes: any;
            try {
              listRes = await client.callTool('list_screens', {
                projectId: defaultProjectId,
              });
            } catch (callErr: any) {
              if (callErr.message?.includes('transport') || callErr.message?.includes('connect')) {
                resetStitchClient();
                client = await getStitchClient(apiKey);
                listRes = await client.callTool('list_screens', {
                  projectId: defaultProjectId,
                });
              } else {
                throw callErr;
              }
            }

            const fetchedScreens = (listRes.screens || [])
              .filter((s: any) => s.screenshot?.downloadUrl)
              .slice(0, 16)
              .map((s: any) => {
                const rawUrl = s.screenshot.downloadUrl;
                const proxiedUrl = `/api/stitch/proxy-image?url=${encodeURIComponent(rawUrl)}`;
                return {
                  id: s.name.split('/').pop(),
                  name: s.name,
                  title: s.title,
                  screenshotUrl: proxiedUrl,
                  rawDownloadUrl: rawUrl,
                };
              });

            // Ưu tiên hiển thị các poster vừa sinh trước, sau đó tới các màn hình từ Stitch Cloud
            const cachedIds = new Set(generatedScreensCache.map((c) => c.id));
            const screens = [
              ...generatedScreensCache,
              ...fetchedScreens.filter((s: any) => !cachedIds.has(s.id)),
            ];

            res.statusCode = 200;
            res.end(JSON.stringify({
              success: true,
              screens,
            }));
          } catch (err: any) {
            console.error('[Stitch API] Lỗi lấy danh sách screens:', err);
            resetStitchClient();
            res.statusCode = 500;
            res.end(JSON.stringify({
              success: false,
              error: err.message || 'Lỗi lấy danh sách từ Stitch',
            }));
          }
          return;
        }

        res.statusCode = 404;
        res.end(JSON.stringify({ success: false, error: 'Endpoint Stitch API không tồn tại' }));
      });
    },
  };
}
