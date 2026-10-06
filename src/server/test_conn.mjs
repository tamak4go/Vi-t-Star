import { Stitch, StitchToolClient } from '@google/stitch-sdk';
import dns from 'node:dns';
import * as fs from 'node:fs';

try {
  dns.setDefaultResultOrder('ipv4first');
} catch {}

const envContent = fs.readFileSync('.env', 'utf-8');
let apiKey = '';
let projectId = '8753486478358563567';
for (const line of envContent.split('\n')) {
  if (line.startsWith('STITCH_API_KEY=')) apiKey = line.split('=')[1].trim();
  if (line.startsWith('STITCH_PROJECT_ID=')) projectId = line.split('=')[1].trim();
}

console.log('Testing with key:', apiKey.slice(0, 8) + '...', 'project:', projectId);

async function test() {
  const t0 = Date.now();
  try {
    const client = new StitchToolClient({ apiKey });
    console.log('Connecting client...');
    await client.connect();
    console.log('Connected in', Date.now() - t0, 'ms');
    
    console.log('Calling list_screens...');
    const t1 = Date.now();
    const res = await client.callTool('list_screens', { projectId });
    console.log('list_screens success in', Date.now() - t1, 'ms, screens count:', res?.screens?.length);
    if (res?.screens?.length > 0) {
      console.log('Sample screen 0:', res.screens[0].name, res.screens[0].title);
    }
    
    await client.close();
  } catch (err) {
    console.error('Test failed in', Date.now() - t0, 'ms:', err);
  }
}

test();
