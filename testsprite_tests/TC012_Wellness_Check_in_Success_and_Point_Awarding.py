import asyncio
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None
    
    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()
        
        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )
        
        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)
        
        # Open a new page in the browser context
        page = await context.new_page()
        
        # Navigate to your target URL and wait until the network request is committed
        await page.goto("http://localhost:3000", wait_until="commit", timeout=10000)
        
        # Wait for the main page to reach DOMContentLoaded state (optional for stability)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=3000)
        except async_api.Error:
            pass
        
        # Iterate through all iframes and wait for them to load as well
        for frame in page.frames:
            try:
                await frame.wait_for_load_state("domcontentloaded", timeout=3000)
            except async_api.Error:
                pass
        
        # Interact with the page elements to simulate user flow
        # -> Click on Login button to proceed to login page.
        frame = context.pages[-1]
        # Click on the Login button on homepage to go to login page
        elem = frame.locator('xpath=html/body/div/div[2]/header/div/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Input email and password, then click login button.
        frame = context.pages[-1]
        # Input email for login
        elem = frame.locator('xpath=html/body/div/div[2]/div[2]/div/form/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('demo@smartbuddy.com')
        

        frame = context.pages[-1]
        # Input password for login
        elem = frame.locator('xpath=html/body/div/div[2]/div[2]/div/form/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Demo123!')
        

        frame = context.pages[-1]
        # Click login button to submit credentials
        elem = frame.locator('xpath=html/body/div/div[2]/div[2]/div/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Send POST request to /api/wellness/checkin with mood and tip in request body and valid JWT token.
        await page.goto('http://localhost:3000/api/wellness/checkin', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Click the 'Check-in Today' button to open wellness check-in form.
        frame = context.pages[-1]
        # Click the 'Check-in Today' button to open wellness check-in form
        elem = frame.locator('xpath=html/body/div/div[2]/div/div[2]/div[2]/div[3]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click 'Change Mood' button to test mood update functionality.
        frame = context.pages[-1]
        # Click 'Change Mood' button to test mood update functionality
        elem = frame.locator('xpath=html/body/div/div[2]/div/div[3]/div/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=Hey Demo User! Keep pushing forward and stay positive!').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Remember, every step you take is progress toward your goals!').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=You\'re capable of achieving amazing things. Keep up the great work!').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=How are you feeling today?').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Happy').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Neutral').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Stressed').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Your positive energy is contagious! Keep spreading the smiles.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=90').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=1').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Great!').first).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    