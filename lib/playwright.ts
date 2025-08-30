import { chromium } from 'playwright';

const defaultLaunchOptions = {
  headless: true,
  channel: 'chrome',
  args: [
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--disable-extensions',
    '--no-first-run',
    '--no-sandbox'
  ]
};

export async function initPlaywright() {
  try {
    const browser = await chromium.launch(defaultLaunchOptions);
    return browser;
  } catch (error) {
    console.error('Failed to launch browser:', error);
    try {
      const browser = await chromium.launch({
        ...defaultLaunchOptions,
        channel: 'chrome',
      });
      return browser;
    } catch (chromeError) {
      console.error('Chrome 실행 실패:', chromeError);
      throw new Error('Chrome 브라우저가 필요합니다. Chrome을 설치해주세요.');
    }
    
    throw error;
  }
}
