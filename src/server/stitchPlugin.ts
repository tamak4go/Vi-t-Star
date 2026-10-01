// src/server/stitchPlugin.ts
// Vite Plugin cung cấp API endpoint bảo mật cho Google Stitch SDK (Local Dev)
import type { Plugin, ViteDevServer } from 'vite';
import { loadEnv } from 'vite';
import { StitchToolClient } from '@google/stitch-sdk';

let cachedClient: StitchToolClient | null = null;

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

const CURATED_HERITAGE_SCREENS: CachedScreen[] = [
  {
    id: "fec5a26327db48eba70799f2d5dcd498",
    name: "projects/8753486478358563567/screens/fec5a26327db48eba70799f2d5dcd498",
    title: "Áo Tấc Cung Đình Xanh Thanh Thiên • Di Sản Hoàng Triều",
    screenshotUrl: `/api/stitch/proxy-image?url=${encodeURIComponent("https://lh3.googleusercontent.com/aida/AEtjO1Xm0YjSKv0oQs9KxljwMgvcz-xA3WN0RbK8QX9f2ckcV864qzOy3TIYxWXImDO0rK0sz_LvIVXpjM7nfnmZJViCX_MbNkOIdivfvCX4XYKHI7tGvo_w5Azo3jUiyy06suj89bxmOQZ1Yx5FovgD7uLoR6Zw121LZ46AXo801MPwUaubJc472p4n2gzV1LWcYcJhLLIVW-_sIcTWC1WytE6Im3aq4y0-uQ1f96e0umLL41QzNSC0G39tdtM")}`,
    rawDownloadUrl: "https://lh3.googleusercontent.com/aida/AEtjO1Xm0YjSKv0oQs9KxljwMgvcz-xA3WN0RbK8QX9f2ckcV864qzOy3TIYxWXImDO0rK0sz_LvIVXpjM7nfnmZJViCX_MbNkOIdivfvCX4XYKHI7tGvo_w5Azo3jUiyy06suj89bxmOQZ1Yx5FovgD7uLoR6Zw121LZ46AXo801MPwUaubJc472p4n2gzV1LWcYcJhLLIVW-_sIcTWC1WytE6Im3aq4y0-uQ1f96e0umLL41QzNSC0G39tdtM",
  },
  {
    id: "787baeea90324c2cab0c481ab7c36875",
    name: "projects/8753486478358563567/screens/787baeea90324c2cab0c481ab7c36875",
    title: "Áo Nhật Bình Đỏ Hoàng Cung Triều Nguyễn • Thủy Ba Sóng Nước",
    screenshotUrl: `/api/stitch/proxy-image?url=${encodeURIComponent("https://lh3.googleusercontent.com/aida/AEtjO1UkerNndtgWfhYLI8wBYebSgwXnlvRLnEE9TQVmTjndIA-cS8SyK9gt9Z6jRpuOpB8AI9xj6BPNLdXhWDrN9Bw_5IHT7rIo9fGHWjl0KeLRRUbjG6kRtbDroZy2zTSgLW-_FIG_D7EYdPGTRZpjnqXR4_rKvUaTfP_xU291LgpGtUMULQ6kuAdZXJrlfuSVhAM2Qr5Ckd0-6bPxep13z64feM9nZEXRaQWlmWdX8tqdPoH_dinlVmkgFA")}`,
    rawDownloadUrl: "https://lh3.googleusercontent.com/aida/AEtjO1UkerNndtgWfhYLI8wBYebSgwXnlvRLnEE9TQVmTjndIA-cS8SyK9gt9Z6jRpuOpB8AI9xj6BPNLdXhWDrN9Bw_5IHT7rIo9fGHWjl0KeLRRUbjG6kRtbDroZy2zTSgLW-_FIG_D7EYdPGTRZpjnqXR4_rKvUaTfP_xU291LgpGtUMULQ6kuAdZXJrlfuSVhAM2Qr5Ckd0-6bPxep13z64feM9nZEXRaQWlmWdX8tqdPoH_dinlVmkgFA",
  },
  {
    id: "24ca449ef9ba4131b11056dfd07a729b",
    name: "projects/8753486478358563567/screens/24ca449ef9ba4131b11056dfd07a729b",
    title: "Lookbook Hoàng Thành Huế • Áo Nhật Bình Cung Đình (Gemini 3.8 Flash)",
    screenshotUrl: `/api/stitch/proxy-image?url=${encodeURIComponent("https://lh3.googleusercontent.com/aida/AEtjO1XSu_-MRSFCH77FDqbxY-41sZJ74NbirKqQeCw2JeNNMAVa3dYc_265WNQycG9EZi4hzNkt4nebKkbjVmkUwEzw5x6Ar4C4PxTQO1mUMWr2pULkpgAOnlASkEbSHG5zfs-aOvFd75ZE9VOIcox4W8uvnICAWTawzDvuf_xsYRE_dUfT43AFNk6acbtJ_lWefIY_4pxtcBeHX_glNwbs61B9ZdrfPOldoAdSdaD7C0XnVjTXjg1tJZfz8N8")}`,
    rawDownloadUrl: "https://lh3.googleusercontent.com/aida/AEtjO1XSu_-MRSFCH77FDqbxY-41sZJ74NbirKqQeCw2JeNNMAVa3dYc_265WNQycG9EZi4hzNkt4nebKkbjVmkUwEzw5x6Ar4C4PxTQO1mUMWr2pULkpgAOnlASkEbSHG5zfs-aOvFd75ZE9VOIcox4W8uvnICAWTawzDvuf_xsYRE_dUfT43AFNk6acbtJ_lWefIY_4pxtcBeHX_glNwbs61B9ZdrfPOldoAdSdaD7C0XnVjTXjg1tJZfz8N8",
  },
  {
    id: "84ec4138aec64bf7930a224cf7d82c35",
    name: "projects/8753486478358563567/screens/84ec4138aec64bf7930a224cf7d82c35",
    title: "Quần Lụa Lĩnh Đen Tuyền Nam Bộ • Đen Mờ Truyền Thống",
    screenshotUrl: `/api/stitch/proxy-image?url=${encodeURIComponent("https://lh3.googleusercontent.com/aida/AEtjO1WfWMzM_LSlfWokMF-Vz0K8EYfwU_x04Qi0757YZn4imF-VX-cjEPYwb_2f3Y3lLj9vnjRKL-Thor1YqQ5qq-kh5pOEoegnK5s5VbF-YX_bHutwbzgKIwAYsToJgR1elt2ipIYJ2hJyq_o_OBvIQaGVzt_qC4shrnMxIQ-VjO44SiT64uA2767d20cEpPPtPlvIgb2cS6vudNyHqz2QcdKUcUs3oaEKDQ4Anvv9ZSi4aB4D-3evXWeAZFw")}`,
    rawDownloadUrl: "https://lh3.googleusercontent.com/aida/AEtjO1WfWMzM_LSlfWokMF-Vz0K8EYfwU_x04Qi0757YZn4imF-VX-cjEPYwb_2f3Y3lLj9vnjRKL-Thor1YqQ5qq-kh5pOEoegnK5s5VbF-YX_bHutwbzgKIwAYsToJgR1elt2ipIYJ2hJyq_o_OBvIQaGVzt_qC4shrnMxIQ-VjO44SiT64uA2767d20cEpPPtPlvIgb2cS6vudNyHqz2QcdKUcUs3oaEKDQ4Anvv9ZSi4aB4D-3evXWeAZFw",
  }
];

const generatedScreensCache: CachedScreen[] = [...CURATED_HERITAGE_SCREENS];

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
      const defaultEnvApiKey = env.STITCH_API_KEY || process.env.STITCH_API_KEY || '';
      const defaultProjectId = (env.STITCH_PROJECT_ID || process.env.STITCH_PROJECT_ID || '8753486478358563567').replace('projects/', '');

      // Middleware xử lý các request tới /api/stitch/*
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';

        if (!url.startsWith('/api/stitch')) {
          return next();
        }

        const parsedUrl = new URL(url, 'http://localhost');
        const headerKey = (req.headers['x-stitch-api-key'] as string) || '';
        const queryKey = parsedUrl.searchParams.get('apiKey') || '';
        const effectiveApiKey = (headerKey || queryKey || defaultEnvApiKey).trim();

        // 1. Endpoint: GET /api/stitch/proxy-image?url=...
        if (url.startsWith('/api/stitch/proxy-image') && req.method === 'GET') {
          try {
            const targetUrl = parsedUrl.searchParams.get('url');

            if (!targetUrl) {
              res.statusCode = 400;
              res.end('Missing url parameter');
              return;
            }

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

        res.setHeader('Content-Type', 'application/json');

        // 2. Endpoint: GET /api/stitch/ping (Kiểm tra kết nối và đo ping)
        if (url.startsWith('/api/stitch/ping') && req.method === 'GET') {
          const startTime = Date.now();
          if (!effectiveApiKey) {
            res.statusCode = 200;
            res.end(JSON.stringify({
              success: true,
              server: 'online',
              configured: false,
              projectId: defaultProjectId,
              latencyMs: Date.now() - startTime,
              message: 'Server sẵn sàng. STITCH_API_KEY chưa được thiết lập.',
            }));
            return;
          }

          try {
            await getStitchClient(effectiveApiKey);
            const latencyMs = Date.now() - startTime;
            res.statusCode = 200;
            res.end(JSON.stringify({
              success: true,
              server: 'online',
              configured: true,
              projectId: defaultProjectId,
              latencyMs,
              message: `Kết nối thành công tới Google Stitch Cloud (${latencyMs}ms).`,
            }));
          } catch (err: any) {
            resetStitchClient();
            res.statusCode = 200;
            res.end(JSON.stringify({
              success: false,
              server: 'online',
              configured: true,
              projectId: defaultProjectId,
              error: err.message || 'Lỗi bắt tay với Google Stitch SDK',
              latencyMs: Date.now() - startTime,
            }));
          }
          return;
        }

        // 3. Endpoint: GET /api/stitch/screens
        if (url.startsWith('/api/stitch/screens') && req.method === 'GET') {
          if (!effectiveApiKey) {
            res.statusCode = 200;
            res.end(JSON.stringify({
              success: true,
              fallback: true,
              screens: CURATED_HERITAGE_SCREENS,
              message: 'Đang hiển thị bộ sưu tập mẫu di sản (Chưa cấu hình API Key)',
            }));
            return;
          }

          try {
            let client = await getStitchClient(effectiveApiKey);
            let listRes: any;
            try {
              listRes = await client.callTool('list_screens', {
                projectId: defaultProjectId,
              });
            } catch (callErr: any) {
              if (callErr.message?.includes('transport') || callErr.message?.includes('connect')) {
                resetStitchClient();
                client = await getStitchClient(effectiveApiKey);
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
                  title: s.title || 'Cổ Phục Việt Nam Studio',
                  screenshotUrl: proxiedUrl,
                  rawDownloadUrl: rawUrl,
                };
              });

            const cachedIds = new Set(generatedScreensCache.map((c) => c.id));
            const screens = [
              ...generatedScreensCache,
              ...fetchedScreens.filter((s: any) => !cachedIds.has(s.id)),
            ];

            res.statusCode = 200;
            res.end(JSON.stringify({
              success: true,
              screens: screens.length > 0 ? screens : CURATED_HERITAGE_SCREENS,
              count: screens.length,
            }));
          } catch (err: any) {
            console.error('[Stitch API] Lỗi lấy danh sách screens:', err);
            resetStitchClient();
            res.statusCode = 200;
            res.end(JSON.stringify({
              success: true,
              fallback: true,
              screens: CURATED_HERITAGE_SCREENS,
              warning: `Không thể tải trực tiếp từ Stitch Cloud (${err.message}). Đang hiển thị thư viện mẫu.`,
            }));
          }
          return;
        }

        // 4. Endpoint: POST /api/stitch/generate
        if (url.startsWith('/api/stitch/generate') && req.method === 'POST') {
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
              const finalKey = (body.apiKey || effectiveApiKey).trim();
              const prompt = body.prompt;
              const quality = body.quality || 'standard';
              const deviceType = body.deviceType || (quality === 'fast' ? 'MOBILE' : 'DESKTOP');
              const projectId = (body.projectId || defaultProjectId).replace('projects/', '');

              if (!finalKey) {
                res.statusCode = 400;
                res.end(JSON.stringify({
                  success: false,
                  error: 'Chưa có STITCH_API_KEY. Vui lòng thiết lập biến môi trường hoặc nhập API Key trực tiếp trong Atelier.',
                }));
                return;
              }

              if (!prompt) {
                res.statusCode = 400;
                res.end(JSON.stringify({ success: false, error: 'Thiếu tham số prompt' }));
                return;
              }

              console.log(`[Stitch API] Sinh screen (${quality} | device: ${deviceType}):`, prompt.slice(0, 100) + '...');
              let client = await getStitchClient(finalKey);

              let genRes: any;
              try {
                genRes = await client.callTool('generate_screen_from_text', {
                  projectId,
                  prompt,
                  deviceType,
                });
              } catch (callErr: any) {
                if (callErr.message?.includes('transport') || callErr.message?.includes('connect')) {
                  resetStitchClient();
                  client = await getStitchClient(finalKey);
                  genRes = await client.callTool('generate_screen_from_text', {
                    projectId,
                    prompt,
                    deviceType,
                  });
                } else {
                  throw callErr;
                }
              }

              const screenInfo = genRes.outputComponents?.[0]?.design?.screens?.[0];
              if (!screenInfo || !screenInfo.name) {
                res.statusCode = 502;
                res.end(JSON.stringify({
                  success: false,
                  error: 'Stitch Cloud không trả về screen hợp lệ',
                  raw: genRes,
                }));
                return;
              }

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
                error: err.message || 'Lỗi khi gọi Google Stitch Engine',
              }));
            }
          });
          return;
        }

        res.statusCode = 404;
        res.end(JSON.stringify({ success: false, error: 'Endpoint Stitch API không tồn tại' }));
      });
    },
  };
}
