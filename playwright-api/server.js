const express = require('express')
const { chromium } = require('playwright')

const app = express()
app.use(express.json())

const PORT = process.env.PORT || 3001

const BROWSER_ARGS = ['--no-sandbox', '--disable-setuid-sandbox']

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.post('/screenshot', async (req, res) => {
  const { url } = req.body

  if (!url) {
    return res.status(400).json({ error: 'url é obrigatória' })
  }

  let browser
  try {
    browser = await chromium.launch({ args: BROWSER_ARGS })
    const page = await browser.newPage()
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto(url, { waitUntil: 'networkidle' })
    const image = await page.screenshot({ encoding: 'base64', fullPage: true })
    res.json({ image })
  } catch (err) {
    console.error('[screenshot]', err)
    res.status(500).json({ error: err.message })
  } finally {
    if (browser) await browser.close()
  }
})

app.post('/cadastrar-reu', async (req, res) => {
  const { processoUrl, nomeReu } = req.body

  if (!processoUrl || !nomeReu) {
    return res.status(400).json({ error: 'processoUrl e nomeReu são obrigatórios' })
  }

  let browser
  try {
    browser = await chromium.launch({ args: BROWSER_ARGS })
    const page = await browser.newPage()

    // TODO: implementar após acesso ao DataJuri
    // 1. Login
    // 2. Navegar até processoUrl
    // 3. Cadastrar nomeReu na ficha raiz

    res.json({ success: true })
  } catch (err) {
    console.error('[cadastrar-reu]', err)
    res.status(500).json({ error: err.message })
  } finally {
    if (browser) await browser.close()
  }
})

app.listen(PORT, () => {
  console.log(`playwright-api rodando na porta ${PORT}`)
})
