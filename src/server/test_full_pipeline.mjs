import { Stitch, StitchToolClient } from '@google/stitch-sdk';
import { setGlobalDispatcher, Agent } from 'undici';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Setup robust timeouts
setGlobalDispatcher(new Agent({
  connect: { timeout: 60000 },
  headersTimeout: 180000,
  bodyTimeout: 180000,
}));

const envContent = fs.readFileSync('.env', 'utf-8');
let apiKey = '';
let projectId = '8753486478358563567';
for (const line of envContent.split('\n')) {
  if (line.startsWith('STITCH_API_KEY=')) apiKey = line.split('=')[1].trim();
  if (line.startsWith('STITCH_PROJECT_ID=')) projectId = line.split('=')[1].trim();
}

console.log('=== TESTING COMPLETE AVATAR -> POSTER PIPELINE ===');

async function run() {
  const client = new StitchToolClient({ apiKey });
  await client.connect();
  const sdk = new Stitch(client);
  const project = sdk.project(projectId);

  // 1. Upload sample avatar face
  console.log('1. Uploading face to Stitch...');
  // Find a reference image in public/assets or create a tiny PNG
  const sampleImagePath = path.resolve('public/assets/reference/sample5_nhat-binh_ref.png');
  const uploaded = await project.upload(sampleImagePath, { title: 'Test Avatar Pipeline' });
  const faceScreen = uploaded[0];
  console.log('Uploaded face screen ID:', faceScreen.id);

  // 2. Call edit_screens to transform avatar into custom royal poster
  console.log('2. Calling edit_screens with custom face prompt...');
  const prompt = `High-fashion imperial editorial lookbook poster photography of traditional Vietnamese royal attire:
[LOCKED HERITAGE GUARDRAIL: Strict Authentic Vietnamese Imperial Heritage & Cultural Modesty Guardrails: Modest dignified full-body silhouette, museum-grade historical Nguyen Dynasty craftsmanship, authentic dragon and phoenix gold embroidery, strictly non-revealing, zero westernized distortion.]

Subject: A handsome, dignified, and stylish young Vietnamese fashion model standing full-length in an imperial royal portrait pose.
- Face & Facial Features: Faithfully preserve and adapt the exact facial features, facial structure, almond eyes, neat natural eyebrows, refined nose, lips, defined jawline, youthful skin tone, and hairstyle from the reference portrait in the selected screen, radiating an authentic editorial expression.

Attire: Magnificent imperial crimson scarlet vermilion silk Áo Nhật Bình robe with rectangular embroidered collar trim, dragon roundels, and five-element rainbow sleeve cuffs.
Setting: The ancient stone courtyard of Hue Imperial Citadel in morning golden hour mist.
Typography & Layout: Fashion lookbook poster with title "VIETNAM FASHION LOOKBOOK - ÁO NHẬT BÌNH", curated luxury color palette swatch bar at bottom.`;

  const editRes = await client.callTool('edit_screens', {
    projectId,
    selectedScreenIds: [faceScreen.id],
    prompt,
    deviceType: 'DESKTOP',
  });

  const screenInfo = editRes?.outputComponents?.[0]?.design?.screens?.[0];
  console.log('3. edit_screens result:', {
    screenId: screenInfo?.id,
    screenName: screenInfo?.name,
    hasScreenshot: Boolean(screenInfo?.screenshot?.downloadUrl),
  });

  if (screenInfo?.screenshot?.downloadUrl) {
    console.log('Screenshot URL:', screenInfo.screenshot.downloadUrl.slice(0, 100) + '...');
    console.log('SUCCESS! Real poster generated with custom face reference!');
  } else {
    console.log('Raw output:', JSON.stringify(editRes, null, 2));
  }

  await client.close();
}

run().catch(err => {
  console.error('Pipeline failed:', err);
  process.exit(1);
});
