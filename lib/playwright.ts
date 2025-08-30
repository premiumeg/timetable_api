import { chromium } from 'playwright';

const defaultLaunchOptions = {
  headless: true,
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
      });
      return browser;
    } catch (chromeError) {
      console.error('Chromium 실행 실패:', chromeError);
      throw new Error('Chromium을 실행할 수 없습니다.');
    }
    
    throw error;
  }
}
