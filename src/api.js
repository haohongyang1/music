const API_BASE = 'http://localhost:3001'

export async function fetchAnnotation(scoreId) {
  try {
    const response = await fetch(`${API_BASE}/api/annotations/${scoreId}`)
    if (!response.ok) {
      throw new Error('获取标注数据失败')
    }
    return await response.json()
  } catch (error) {
    console.error('获取标注数据失败:', error)
    return { marks: [], playOrder: '' }
  }
}

export async function saveAnnotation(scoreId, marks, playOrder) {
  try {
    const response = await fetch(`${API_BASE}/api/annotations/${scoreId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ marks, playOrder }),
    })
    if (!response.ok) {
      throw new Error('保存标注数据失败')
    }
    return await response.json()
  } catch (error) {
    console.error('保存标注数据失败:', error)
    throw error
  }
}