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
        # -> Click on 'Get Started' button to open registration form.
        frame = context.pages[-1]
        # Click on 'Get Started' button to open registration form
        elem = frame.locator('xpath=html/body/div/div[2]/section/div/div/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Fill registration form with full name, email demo@smartbuddy.com, password, branch, year, skills, interests, availability, then submit.
        frame = context.pages[-1]
        # Enter full name
        elem = frame.locator('xpath=html/body/div/div[2]/div/div/div/div/form/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Demo User')
        

        frame = context.pages[-1]
        # Enter already registered email
        elem = frame.locator('xpath=html/body/div/div[2]/div/div/div/div/form/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('demo@smartbuddy.com')
        

        frame = context.pages[-1]
        # Enter password
        elem = frame.locator('xpath=html/body/div/div[2]/div/div/div/div/form/div[3]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Demo123!')
        

        frame = context.pages[-1]
        # Add a skill
        elem = frame.locator('xpath=html/body/div/div[2]/div/div/div/div/form/div[5]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('JavaScript')
        

        frame = context.pages[-1]
        # Add skill
        elem = frame.locator('xpath=html/body/div/div[2]/div/div/div/div/form/div[5]/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Add interest Web Development, select availability Flexible, then submit the registration form.
        frame = context.pages[-1]
        # Add an interest
        elem = frame.locator('xpath=html/body/div/div[2]/div/div/div/div/form/div[6]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Web Development')
        

        frame = context.pages[-1]
        # Add interest
        elem = frame.locator('xpath=html/body/div/div[2]/div/div/div/div/form/div[6]/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Click Create Account to submit registration form
        elem = frame.locator('xpath=html/body/div/div[2]/div/div/div/div/form/div[7]/select').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Change availability to 'Flexible' and submit the registration form to test registration failure with already registered email.
        frame = context.pages[-1]
        # Click 'Create Account' button to submit registration form
        elem = frame.locator('xpath=html/body/div/div[2]/div/div/div/div/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=User with this email already exists').first).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    