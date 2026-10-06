import { Stitch, StitchToolClient } from '@google/stitch-sdk';
import * as fs from 'node:fs';

const envContent = fs.readFileSync('.env', 'utf-8');
let apiKey = '';
let projectId = '8753486478358563567';
for (const line of envContent.split('\n')) {
  if (line.startsWith('STITCH_API_KEY=')) apiKey = line.split('=')[1].trim();
  if (line.startsWith('STITCH_PROJECT_ID=')) projectId = line.split('=')[1].trim();
}

async function test() {
  const client = new StitchToolClient({ apiKey });
  await client.connect();
  
  // 1. Check screen 17690485059578054355
  try {
    console.log('Testing get_screen with ID: 17690485059578054355...');
    const screen = await client.callTool('get_screen', {
      name: `projects/${projectId}/screens/17690485059578054355`,
      projectId,
      screenId: '17690485059578054355'
    });
    console.log('Screen found:', screen.name, screen.title);
    console.log('Screenshot url:', screen.screenshot?.downloadUrl?.slice(0, 80));
  } catch (err) {
    console.log('get_screen failed for 17690485059578054355:', err.message);
  }

  // 2. Test edit_screens
  try {
    console.log('\nTesting edit_screens call...');
    const editRes = await client.callTool('edit_screens', {
      projectId,
      selectedScreenIds: ['17690485059578054355'],
      prompt: 'A traditional Vietnamese fashion poster featuring the person in this photo wearing royal red Ao Nhat Binh',
      deviceType: 'MOBILE',
    });
    console.log('edit_screens result:', JSON.stringify(editRes, null, 2));
  } catch (err) {
    console.error('edit_screens failed:', err);
  }

  await client.close();
}

test();
