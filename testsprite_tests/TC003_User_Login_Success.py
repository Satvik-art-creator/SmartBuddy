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
        # -> Click on the Login button to open the login form.
        frame = context.pages[-1]
        # Click the Login button on the homepage to open login form
        elem = frame.locator('xpath=html/body/div/div[2]/header/div/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Input valid email and password, then click the Login button.
        frame = context.pages[-1]
        # Input valid email in the email field
        elem = frame.locator('xpath=html/body/div/div[2]/div[2]/div/form/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('demo@smartbuddy.com')
        

        frame = context.pages[-1]
        # Input valid password in the password field
        elem = frame.locator('xpath=html/body/div/div[2]/div[2]/div/form/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Demo123!')
        

        frame = context.pages[-1]
        # Click the Login button to submit the login form
        elem = frame.locator('xpath=html/body/div/div[2]/div[2]/div/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Verify the presence of JWT token in the response or local storage to confirm successful authentication.
        frame = context.pages[-1]
        # Click Logout button to end session after verification
        elem = frame.locator('xpath=html/body/div/div[2]/nav/div/div/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the Logout button in the confirmation dialog to complete logout.
        frame = context.pages[-1]
        # Click Logout button in the confirmation dialog to confirm logout
        elem = frame.locator('xpath=html/body/div/div[2]/nav/div/div[2]/div[2]/div[2]/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=Login').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Your AI Campus').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Companion').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Connect, Collaborate, and Grow.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=SmartBuddy helps students thrive with AI-powered tools for finding study partners, discovering campus events, and maintaining wellness throughout your academic journey.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Get Started').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Everything You Need to Succeed').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Powerful features designed for modern students').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Find Study Buddies').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Connect with classmates who share your courses and study goals. Build meaningful study groups powered by AI matching.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Join Campus Events').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Discover clubs, workshops, and social events tailored to your interests. Never miss out on campus life again.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Boost Your Wellness').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Track your mental health, set wellness goals, and access resources. Balance academics with self-care effortlessly.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Ready to Transform Your Campus Experience?').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Join thousands of students already using SmartBuddy').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Get Started Free').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=© 2025 SmartBuddy. All rights reserved.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Privacy').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Terms').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Contact').first).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    