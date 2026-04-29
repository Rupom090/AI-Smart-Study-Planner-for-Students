import puppeteer from 'puppeteer';
import { exec } from 'child_process';
import fs from 'fs';

// Sleep helper
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
    console.log('Starting Laravel server...');
    const phpServer = exec('php artisan serve --port=8001');
    const viteServer = exec('npm run dev');
    
    // wait for servers to start
    await sleep(5000);

    console.log('Launching browser...');
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    const dir = 'public/docs/screenshots';
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }

    try {
        console.log('Navigating to home...');
        await page.goto('http://localhost:8001/', { waitUntil: 'networkidle0' });
        await page.screenshot({ path: `${dir}/1-landing.png` });

        console.log('Registering user...');
        await page.goto('http://localhost:8001/register', { waitUntil: 'networkidle0' });
        await page.type('input[name="name"]', 'Test Student');
        await page.type('input[name="email"]', 'test@example.com');
        await page.type('input[name="password"]', 'password123');
        await page.type('input[name="password_confirmation"]', 'password123');
        await page.keyboard.press('Enter');
        await page.waitForNavigation({ waitUntil: 'networkidle0' });

        console.log('Generating demo data...');
        // To generate demo data, we need to POST to /demo-data
        await page.evaluate(async () => {
            await window.axios.post('/demo-data');
        });
        await sleep(2000);

        console.log('Taking Dashboard screenshot...');
        await page.goto('http://localhost:8001/dashboard', { waitUntil: 'networkidle0' });
        await sleep(1000);
        await page.screenshot({ path: `${dir}/2-dashboard.png` });

        console.log('Taking Subjects screenshot...');
        await page.goto('http://localhost:8001/subjects', { waitUntil: 'networkidle0' });
        await sleep(1000);
        await page.screenshot({ path: `${dir}/3-subjects.png` });

        console.log('Taking Study Plan screenshot...');
        await page.goto('http://localhost:8001/study-plan', { waitUntil: 'networkidle0' });
        await sleep(1000);
        await page.screenshot({ path: `${dir}/4-study-plan.png` });

        console.log('Taking Focus Mode screenshot...');
        await page.goto('http://localhost:8001/focus', { waitUntil: 'networkidle0' });
        await sleep(1000);
        await page.screenshot({ path: `${dir}/5-focus-mode.png` });

        console.log('Taking Solve screenshot...');
        await page.goto('http://localhost:8001/solve', { waitUntil: 'networkidle0' });
        await sleep(1000);
        await page.screenshot({ path: `${dir}/6-solve.png` });

        console.log('Taking Flashcards screenshot...');
        await page.goto('http://localhost:8001/flashcards', { waitUntil: 'networkidle0' });
        await sleep(1000);
        await page.screenshot({ path: `${dir}/7-flashcards.png` });

    } catch (e) {
        console.error('Error during automation:', e);
    } finally {
        await browser.close();
        phpServer.kill();
        viteServer.kill();
        console.log('Done!');
        process.exit();
    }
}

main();
