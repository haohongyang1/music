import express from 'express'
import cors from 'cors'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 3001
const ANNOTATIONS_DIR = path.join(__dirname, 'src', 'annotations')

// 中间件
app.use(cors())
app.use(express.json())

// 确保标注目录存在
async function ensureAnnotationsDir() {
  try {
    await fs.access(ANNOTATIONS_DIR)
  } catch {
    await fs.mkdir(ANNOTATIONS_DIR, { recursive: true })
  }
}

// 获取标注数据
app.get('/api/annotations/:scoreId', async (req, res) => {
  const { scoreId } = req.params
  const filePath = path.join(ANNOTATIONS_DIR, `${scoreId}.json`)

  try {
    const data = await fs.readFile(filePath, 'utf-8')
    res.json(JSON.parse(data))
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.json({ marks: [], playOrder: '' })
    } else {
      res.status(500).json({ error: '读取失败' })
    }
  }
})

// 保存标注数据
app.put('/api/annotations/:scoreId', async (req, res) => {
  const { scoreId } = req.params
  const { marks, playOrder } = req.body
  const filePath = path.join(ANNOTATIONS_DIR, `${scoreId}.json`)

  try {
    await ensureAnnotationsDir()
    const data = { marks, playOrder }
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
    res.json({ success: true })
  } catch (error) {
    console.error('保存失败:', error)
    res.status(500).json({ error: '保存失败' })
  }
})

app.listen(PORT, () => {
  console.log(`标注 API 服务运行在 http://localhost:${PORT}`)
})