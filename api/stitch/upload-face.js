// api/stitch/upload-face.js
// Vercel Serverless Function: Upload user portrait to Google Stitch Project
import * as os from 'node:os';
import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import { extractCredentials, getStitchClient, Stitch } from './_helper.js';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Chỉ chấp nhận phương thức POST' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  const { apiKey, projectId } = extractCredentials(req, body);
  const imageBase64 = body?.imageBase64;
  const title = body?.title || `User Portrait - ${Date.now()}`;

  if (!apiKey) {
    return res.status(400).json({ success: false, error: 'Chưa có STITCH_API_KEY.' });
  }

  if (!imageBase64) {
    return res.status(400).json({ success: false, error: 'Thiếu dữ liệu ảnh gương mặt (imageBase64).' });
  }

  let cleanBase64 = imageBase64;
  let ext = '.png';
  if (imageBase64.includes(';base64,')) {
    const parts = imageBase64.split(';base64,');
    cleanBase64 = parts[1];
    if (parts[0].includes('jpeg') || parts[0].includes('jpg')) ext = '.jpg';
    else if (parts[0].includes('webp')) ext = '.webp';
  }

  const tempDir = os.tmpdir();
  const tempFilePath = path.join(tempDir, `vietstar-face-${Date.now()}${ext}`);

  try {
    await fs.writeFile(tempFilePath, Buffer.from(cleanBase64, 'base64'));

    const client = await getStitchClient(apiKey);
    const sdk = new Stitch(client);
    const project = sdk.project(projectId);

    let uploadedScreens = [];
    try {
      uploadedScreens = await project.upload(tempFilePath, { title });
    } finally {
      await fs.unlink(tempFilePath).catch(() => {});
    }

    const targetScreen = uploadedScreens?.[0];
    if (!targetScreen) {
      return res.status(502).json({
        success: false,
        error: 'Stitch Cloud không tạo được screen khi tải ảnh lên.',
      });
    }

    let rawUrl = '';
    try {
      const details = await client.callTool('get_screen', {
        name: targetScreen.name || `projects/${projectId}/screens/${targetScreen.id}`,
        projectId,
        screenId: targetScreen.id,
      });
      rawUrl = details?.screenshot?.downloadUrl || '';
    } catch {
      // ignore
    }

    const proxiedUrl = rawUrl
      ? `/api/stitch/proxy-image?url=${encodeURIComponent(rawUrl)}`
      : undefined;

    return res.status(200).json({
      success: true,
      screenId: targetScreen.id,
      screenName: targetScreen.name,
      screenshotUrl: proxiedUrl,
      rawDownloadUrl: rawUrl,
    });
  } catch (err) {
    console.error('[API upload-face] Lỗi upload ảnh chân dung:', err);
    await fs.unlink(tempFilePath).catch(() => {});
    return res.status(500).json({
      success: false,
      error: err.message || 'Lỗi upload ảnh chân dung lên Google Stitch Cloud',
    });
  }
}
