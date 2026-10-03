// api/stitch/_helper.js
// Shared helpers for Vercel Serverless Functions and local Stitch integration
import { StitchToolClient } from '@google/stitch-sdk';
import dns from 'node:dns';

try {
  dns.setDefaultResultOrder('ipv4first');
} catch {
  // ignore
}

export const CURATED_HERITAGE_SCREENS = [
  {
    id: "heritage-ao-tac",
    name: "projects/8753486478358563567/screens/heritage-ao-tac",
    title: "Áo Tấc Cung Đình Xanh Thanh Thiên • Di Sản Hoàng Triều",
    screenshotUrl: "/assets/reference/sample6_ao-tac_ref.png",
    rawDownloadUrl: "/assets/reference/sample6_ao-tac_ref.png"
  },
  {
    id: "heritage-nhat-binh",
    name: "projects/8753486478358563567/screens/heritage-nhat-binh",
    title: "Áo Nhật Bình Đỏ Hoàng Cung Triều Nguyễn • Thủy Ba Sóng Nước",
    screenshotUrl: "/assets/reference/sample5_nhat-binh_ref.png",
    rawDownloadUrl: "/assets/reference/sample5_nhat-binh_ref.png"
  },
  {
    id: "heritage-ngu-than",
    name: "projects/8753486478358563567/screens/heritage-ngu-than",
    title: "Áo Ngũ Thân Truyền Thống • Nét Đẹp Quý Phái Cổ Truyền",
    screenshotUrl: "/assets/reference/sample4_ngu-than_ref.png",
    rawDownloadUrl: "/assets/reference/sample4_ngu-than_ref.png"
  },
  {
    id: "heritage-ao-dai",
    name: "projects/8753486478358563567/screens/heritage-ao-dai",
    title: "Áo Dài Đài Các • Nét Duyên Dáng Việt Nam",
    screenshotUrl: "/assets/reference/sample2_ao-dai_ref.png",
    rawDownloadUrl: "/assets/reference/sample2_ao-dai_ref.png"
  },
  {
    id: "heritage-ao-ba-ba",
    name: "projects/8753486478358563567/screens/heritage-ao-ba-ba",
    title: "Áo Bà Ba Nam Bộ • Hương Sắc Miền Sông Nước",
    screenshotUrl: "/assets/reference/sample3_ao-ba-ba_ref.png",
    rawDownloadUrl: "/assets/reference/sample3_ao-ba-ba_ref.png"
  },
  {
    id: "heritage-dan-toc-thai",
    name: "projects/8753486478358563567/screens/heritage-dan-toc-thai",
    title: "Trang Phục Dân Tộc Thái • Hoa Văn Thổ Cẩm Tinh Xảo",
    screenshotUrl: "/assets/reference/sample7_dan-toc-thai_ref.png",
    rawDownloadUrl: "/assets/reference/sample7_dan-toc-thai_ref.png"
  },
  {
    id: "heritage-co-phuc-cham",
    name: "projects/8753486478358563567/screens/heritage-co-phuc-cham",
    title: "Cổ Phục Chăm Pa • Vẻ Đẹp Huyền Bí Tháp Cổ",
    screenshotUrl: "/assets/reference/sample8_co-phuc-cham_ref.png",
    rawDownloadUrl: "/assets/reference/sample8_co-phuc-cham_ref.png"
  }
];

export function extractCredentials(req, body = {}) {
  const headers = req.headers || {};
  const query = req.query || {};

  const apiKey = (
    headers['x-stitch-api-key'] ||
    query.apiKey ||
    body.apiKey ||
    process.env.STITCH_API_KEY ||
    ''
  ).trim();

  const projectId = (
    headers['x-stitch-project-id'] ||
    query.projectId ||
    body.projectId ||
    process.env.STITCH_PROJECT_ID ||
    '8753486478358563567'
  ).toString().replace('projects/', '').trim();

  return { apiKey, projectId };
}

let cachedClient = null;

export async function getStitchClient(apiKey) {
  if (cachedClient) {
    if (cachedClient.isConnected) {
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

export function resetStitchClient() {
  if (cachedClient) {
    try {
      cachedClient.close();
    } catch {
      // ignore
    }
    cachedClient = null;
  }
}
