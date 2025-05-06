import dotenv from 'dotenv'
import { chromium } from 'playwright'
import { Argument, Command } from 'commander'

dotenv.config()

function checkEnvironment (): void {
  if (process.env.HA_API_KEY === undefined || process.env.HA_API_KEY === '') {
    throw new Error('HA_API_KEY is not set')
  }

  if (process.env.HA_API_URL === undefined || process.env.HA_API_URL === '') {
    throw new Error('HA_API_URL is not set')
  }
}

async function testConnection (apiKey: string, apiUrl: string): Promise<void> {
  const response = await fetch(`${apiUrl}/api/`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    console.error(response)
    throw new Error('Failed to connect to Home Assistant')
  }
}

async function createScreenshot (apiKey: string, apiUrl: string, dashboardPath: string, outputFilename: string): Promise<void> {
  // @see https://developers.home-assistant.io/docs/frontend/external-authentication
  const script = `
    window.externalApp = {
      getExternalAuth: () => {
        window.externalAuthSetToken(true, {
          access_token: "${apiKey}",
          expires_in: 3600,
        });
      }
    }
  `

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  const page = await browser.newPage()
  await page.setViewportSize({ width: 800, height: 480 })
  await page.addInitScript({ content: script })

  await page.goto(`${apiUrl}/?external_auth=1`)
  await page.goto(`${apiUrl}/${dashboardPath}?kiosk`)

  await page.waitForSelector('hui-view')
  await page.waitForTimeout(1000) // Give extra time for any animations to complete

  await page.screenshot({
    path: '/app/output/' + outputFilename
  })

  console.log('Successfully saved screenshot to ' + outputFilename)

  await browser.close()
}

function setupCommand (): Command {
  const program = new Command()
  program.addArgument(new Argument('<dashboard-uri>', 'The URI of the dashboard to screenshot'))
  program.addArgument(new Argument('<output-filename>', 'The filename of the screenshot to save'))

  program.description('ha-dashboard-screenshot is a tool to create screenshots of the Home Assistant dashboard.')
  program.parse(process.argv)

  return program
}

async function main (): Promise<void> {
  checkEnvironment()
  const program = setupCommand()

  const apiKey = process.env.HA_API_KEY as string
  const apiUrl = (process.env.HA_API_URL as string).replace(/\/$/, '')
  const dashboardPath = program.args[0]
  const outputFilename = program.args[1]

  await testConnection(apiKey, apiUrl)
  await createScreenshot(apiKey, apiUrl, dashboardPath, outputFilename)
}

main()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
