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
    id: "fec5a26327db48eba70799f2d5dcd498",
    name: "projects/8753486478358563567/screens/fec5a26327db48eba70799f2d5dcd498",
    title: "Áo Tấc Cung Đình Xanh Thanh Thiên • Di Sản Hoàng Triều",
    screenshotUrl: "/api/stitch/proxy-image?url=" + encodeURIComponent("https://lh3.googleusercontent.com/aida/AEtjO1Xm0YjSKv0oQs9KxljwMgvcz-xA3WN0RbK8QX9f2ckcV864qzOy3TIYxWXImDO0rK0sz_LvIVXpjM7nfnmZJViCX_MbNkOIdivfvCX4XYKHI7tGvo_w5Azo3jUiyy06suj89bxmOQZ1Yx5FovgD7uLoR6Zw121LZ46AXo801MPwUaubJc472p4n2gzV1LWcYcJhLLIVW-_sIcTWC1WytE6Im3aq4y0-uQ1f96e0umLL41QzNSC0G39tdtM"),
    rawDownloadUrl: "https://lh3.googleusercontent.com/aida/AEtjO1Xm0YjSKv0oQs9KxljwMgvcz-xA3WN0RbK8QX9f2ckcV864qzOy3TIYxWXImDO0rK0sz_LvIVXpjM7nfnmZJViCX_MbNkOIdivfvCX4XYKHI7tGvo_w5Azo3jUiyy06suj89bxmOQZ1Yx5FovgD7uLoR6Zw121LZ46AXo801MPwUaubJc472p4n2gzV1LWcYcJhLLIVW-_sIcTWC1WytE6Im3aq4y0-uQ1f96e0umLL41QzNSC0G39tdtM"
  },
  {
    id: "787baeea90324c2cab0c481ab7c36875",
    name: "projects/8753486478358563567/screens/787baeea90324c2cab0c481ab7c36875",
    title: "Áo Nhật Bình Đỏ Hoàng Cung Triều Nguyễn • Thủy Ba Sóng Nước",
    screenshotUrl: "/api/stitch/proxy-image?url=" + encodeURIComponent("https://lh3.googleusercontent.com/aida/AEtjO1UkerNndtgWfhYLI8wBYebSgwXnlvRLnEE9TQVmTjndIA-cS8SyK9gt9Z6jRpuOpB8AI9xj6BPNLdXhWDrN9Bw_5IHT7rIo9fGHWjl0KeLRRUbjG6kRtbDroZy2zTSgLW-_FIG_D7EYdPGTRZpjnqXR4_rKvUaTfP_xU291LgpGtUMULQ6kuAdZXJrlfuSVhAM2Qr5Ckd0-6bPxep13z64feM9nZEXRaQWlmWdX8tqdPoH_dinlVmkgFA"),
    rawDownloadUrl: "https://lh3.googleusercontent.com/aida/AEtjO1UkerNndtgWfhYLI8wBYebSgwXnlvRLnEE9TQVmTjndIA-cS8SyK9gt9Z6jRpuOpB8AI9xj6BPNLdXhWDrN9Bw_5IHT7rIo9fGHWjl0KeLRRUbjG6kRtbDroZy2zTSgLW-_FIG_D7EYdPGTRZpjnqXR4_rKvUaTfP_xU291LgpGtUMULQ6kuAdZXJrlfuSVhAM2Qr5Ckd0-6bPxep13z64feM9nZEXRaQWlmWdX8tqdPoH_dinlVmkgFA"
  },
  {
    id: "24ca449ef9ba4131b11056dfd07a729b",
    name: "projects/8753486478358563567/screens/24ca449ef9ba4131b11056dfd07a729b",
    title: "Lookbook Hoàng Thành Huế • Áo Nhật Bình Cung Đình (Gemini 3.8 Flash)",
    screenshotUrl: "/api/stitch/proxy-image?url=" + encodeURIComponent("https://lh3.googleusercontent.com/aida/AEtjO1XSu_-MRSFCH77FDqbxY-41sZJ74NbirKqQeCw2JeNNMAVa3dYc_265WNQycG9EZi4hzNkt4nebKkbjVmkUwEzw5x6Ar4C4PxTQO1mUMWr2pULkpgAOnlASkEbSHG5zfs-aOvFd75ZE9VOIcox4W8uvnICAWTawzDvuf_xsYRE_dUfT43AFNk6acbtJ_lWefIY_4pxtcBeHX_glNwbs61B9ZdrfPOldoAdSdaD7C0XnVjTXjg1tJZfz8N8"),
    rawDownloadUrl: "https://lh3.googleusercontent.com/aida/AEtjO1XSu_-MRSFCH77FDqbxY-41sZJ74NbirKqQeCw2JeNNMAVa3dYc_265WNQycG9EZi4hzNkt4nebKkbjVmkUwEzw5x6Ar4C4PxTQO1mUMWr2pULkpgAOnlASkEbSHG5zfs-aOvFd75ZE9VOIcox4W8uvnICAWTawzDvuf_xsYRE_dUfT43AFNk6acbtJ_lWefIY_4pxtcBeHX_glNwbs61B9ZdrfPOldoAdSdaD7C0XnVjTXjg1tJZfz8N8"
  },
  {
    id: "84ec4138aec64bf7930a224cf7d82c35",
    name: "projects/8753486478358563567/screens/84ec4138aec64bf7930a224cf7d82c35",
    title: "Quần Lụa Lĩnh Đen Tuyền Nam Bộ • Đen Mờ Truyền Thống",
    screenshotUrl: "/api/stitch/proxy-image?url=" + encodeURIComponent("https://lh3.googleusercontent.com/aida/AEtjO1WfWMzM_LSlfWokMF-Vz0K8EYfwU_x04Qi0757YZn4imF-VX-cjEPYwb_2f3Y3lLj9vnjRKL-Thor1YqQ5qq-kh5pOEoegnK5s5VbF-YX_bHutwbzgKIwAYsToJgR1elt2ipIYJ2hJyq_o_OBvIQaGVzt_qC4shrnMxIQ-VjO44SiT64uA2767d20cEpPPtPlvIgb2cS6vudNyHqz2QcdKUcUs3oaEKDQ4Anvv9ZSi4aB4D-3evXWeAZFw"),
    rawDownloadUrl: "https://lh3.googleusercontent.com/aida/AEtjO1WfWMzM_LSlfWokMF-Vz0K8EYfwU_x04Qi0757YZn4imF-VX-cjEPYwb_2f3Y3lLj9vnjRKL-Thor1YqQ5qq-kh5pOEoegnK5s5VbF-YX_bHutwbzgKIwAYsToJgR1elt2ipIYJ2hJyq_o_OBvIQaGVzt_qC4shrnMxIQ-VjO44SiT64uA2767d20cEpPPtPlvIgb2cS6vudNyHqz2QcdKUcUs3oaEKDQ4Anvv9ZSi4aB4D-3evXWeAZFw"
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
