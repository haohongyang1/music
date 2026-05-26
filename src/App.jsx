import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Gauge,
  ListMusic,
  Pause,
  Play,
  FileText,
  Download,
  Trash2,
  Plus,
  MapPin,
} from 'lucide-react'
import './App.css'
import {
  getScoreById,
  scoreGroups,
  scores,
  getSectionAtPosition,
  getNextSection,
  STORAGE_KEYS,
} from './scoreData'

const SPEED_STORAGE_KEY = 'score-autoplay-speed'
const DEFAULT_SPEED = 18
const MIN_SPEED = 8
const MAX_SPEED = 36
const COUNTDOWN_SECONDS = 3
const ENABLE_ANNOTATION = import.meta.env.VITE_ENABLE_ANNOTATION !== 'false'

function setWindowScrollTop(top, behavior = 'auto') {
  if (behavior === 'smooth') {
    window.scrollTo({ top, behavior })
    return
  }

  const scrollingElement = document.scrollingElement || document.documentElement
  scrollingElement.scrollTop = top
  document.body.scrollTop = top
}

function setElementScrollTop(element, top, behavior = 'auto') {
  if (!element) {
    return
  }

  if (behavior === 'smooth') {
    element.scrollTo({ top, behavior })
    return
  }

  element.scrollTop = top
}

function setScoreOffset(element, top) {
  element?.style.setProperty('--score-offset', `${top}px`)
}

function readRoute() {
  const hash = window.location.hash.replace(/^#/, '')
  const [, maybeScoreId] = hash.match(/^\/score\/([^/]+)$/) || []
  const [, annotateScoreId] = hash.match(/^\/annotate\/([^/]+)$/) || []

  if (annotateScoreId) {
    return { view: 'annotate', scoreId: annotateScoreId }
  }

  return maybeScoreId ? { view: 'score', scoreId: maybeScoreId } : { view: 'library' }
}

function navigateToLibrary() {
  window.location.hash = '/'
}

function navigateToScore(scoreId) {
  window.location.hash = `/score/${scoreId}`
}

function navigateToAnnotate(scoreId) {
  window.location.hash = `/annotate/${scoreId}`
}

function readStoredSpeed(fallback) {
  const stored = window.localStorage.getItem(SPEED_STORAGE_KEY)
  const parsed = Number(stored)

  if (!Number.isFinite(parsed)) {
    return fallback
  }

  return Math.min(MAX_SPEED, Math.max(MIN_SPEED, parsed))
}

function readStoredAnnotations(score, fallback = { marks: [], playOrder: '' }, options = {}) {
  const storageKey = `score-annotations-${score.id}`
  const saved = window.localStorage.getItem(storageKey)

  if (!saved) {
    return fallback
  }

  try {
    const data = JSON.parse(saved)
    const marks = Array.isArray(data?.marks) ? data.marks : []

    if (options.requireMarks && marks.length === 0) {
      return fallback
    }

    return {
      marks,
      playOrder: data?.playOrder || '',
    }
  } catch (e) {
    console.warn('Failed to parse saved annotations', e)
    return fallback
  }
}

function getScrollTarget(element) {
  if (element) {
    return {
      top: 0,
      max: Math.max(0, element.scrollHeight - element.clientHeight),
      scrollTo: (top) => setScoreOffset(element, top),
    }
  }

  return {
    top: window.scrollY,
    max: Math.max(0, document.documentElement.scrollHeight - window.innerHeight),
    scrollTo: (top, behavior = 'auto') => setWindowScrollTop(top, behavior),
  }
}

function App() {
  const [route, setRoute] = useState(readRoute)

  useEffect(() => {
    const handleHashChange = () => setRoute(readRoute())
    window.addEventListener('hashchange', handleHashChange)

    if (!window.location.hash) {
      window.history.replaceState(null, '', '#/')
    }

    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const selectedScore = route.view === 'score' ? getScoreById(route.scoreId) : null
  const annotateScore = route.view === 'annotate' ? getScoreById(route.scoreId) : null

  if (route.view === 'score' && !selectedScore) {
    return <MissingScore scoreId={route.scoreId} />
  }

  if (route.view === 'annotate' && !annotateScore) {
    return <MissingScore scoreId={route.scoreId} />
  }

  return selectedScore ? (
    <PlaybackView key={selectedScore.id} score={selectedScore} />
  ) : annotateScore ? (
    <AnnotationView key={annotateScore.id} score={annotateScore} />
  ) : (
    <LibraryView />
  )
}

function MissingScore({ scoreId }) {
  return (
    <main className="empty-state">
      <p className="eyebrow">未找到乐谱</p>
      <h1>{scoreId}</h1>
      <button type="button" className="primary-action" onClick={navigateToLibrary}>
        <ArrowLeft size={18} />
        返回列表
      </button>
    </main>
  )
}

function LibraryView() {
  return (
    <main className="app-shell library-shell">
      <header className="library-header">
        <div>
          <p className="eyebrow">Score Player</p>
          <h1>乐谱自动播放</h1>
          <p className="header-copy">
            已从本地 imgs 图片整理出 {scores.length} 首乐曲，按乐曲首字母排序。
          </p>
        </div>
        <div className="library-stat" aria-label="乐谱统计">
          <ListMusic size={24} />
          <strong>{scores.reduce((total, score) => total + score.pageCount, 0)}</strong>
          <span>张乐谱图片</span>
        </div>
      </header>

      <section className="library-grid" aria-label="乐谱列表">
        {scoreGroups.map((group) => (
          <section className="score-group" key={group.letter}>
            <div className="group-letter">{group.letter}</div>
            <div className="score-cards">
              {group.scores.map((score) => (
                <article className="score-card" key={score.id}>
                  <button
                    type="button"
                    className="score-card-button"
                    onClick={() => navigateToScore(score.id)}
                    aria-label={`打开 ${score.title}`}
                  >
                    <div className="score-cover">
                      <img
                        className="score-thumb"
                        src={score.thumbnail}
                        alt={`${score.title} 乐谱缩略图`}
                      />
                      <span>{score.pageCount} 页</span>
                    </div>
                    <div className="score-card-body">
                      <div className="score-title-row">
                        <div>
                          <h2>{score.title}</h2>
                          <p>
                            {score.artist} · {score.arranger}
                          </p>
                        </div>
                        <span className="open-score">
                          打开
                          <ChevronRight size={17} />
                        </span>
                      </div>
                      <p className="score-summary">{score.summary}</p>
                      <div className="score-meta">
                        <span>{score.pageCount} 页</span>
                        <span>原调 {score.originalKey}</span>
                        <span>选调 {score.selectedKey}</span>
                        <span>{score.tuning}</span>
                      </div>
                      <div className="tag-row">
                        {score.tags.map((tag) => (
                          <span key={tag}>{tag}</span>
                        ))}
                      </div>
                    </div>
                  </button>
                </article>
              ))}
            </div>
          </section>
        ))}
      </section>
    </main>
  )
}

function PlaybackView({ score, onExit }) {
  const animationRef = useRef(0)
  const lastFrameRef = useRef(0)
  const scrollTopRef = useRef(0)
  const touchYRef = useRef(0)
  const readerRef = useRef(null)
  const controlsTimerRef = useRef(0)
  const countdownTimerRef = useRef(0)
  const indicatorTimerRef = useRef(0)

  const [isPlaying, setIsPlaying] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)
  const [progress, setProgress] = useState(0)
  const [speed, setSpeed] = useState(() => readStoredSpeed(DEFAULT_SPEED))
  const speedRef = useRef(speed)

  const [currentSectionId, setCurrentSectionId] = useState(null)
  const [skipRepeat, setSkipRepeat] = useState(() => {
    const stored = window.localStorage.getItem(STORAGE_KEYS.SKIP_REPEAT)
    return stored === 'true'
  })
  const [showSectionIndicator, setShowSectionIndicator] = useState(() => {
    const stored = window.localStorage.getItem(STORAGE_KEYS.SHOW_SECTION_INDICATOR)
    return stored !== 'false'
  })

  const [initialAnnotations] = useState(() =>
    readStoredAnnotations(
      score,
      {
        marks: score.marks || [],
        playOrder: score.playOrder || '',
      },
      { requireMarks: true },
    ),
  )
  const [marks] = useState(initialAnnotations.marks)
  const [playOrder] = useState(initialAnnotations.playOrder)

  const sectionRepeatCountRef = useRef({})
  const markJumpIndexRef = useRef(0)
  const lastScrollTopRef = useRef(0)

  // 解析播放顺序为配对
  const parsePlayOrder = useCallback(() => {
    if (!marks?.length || !playOrder) return null

    const order = playOrder.split('→').map(s => s.trim())
    const pairs = []

    for (let i = 0; i < order.length - 1; i++) {
      const start = order[i]
      const end = order[i + 1]
      pairs.push({ start, end })
    }

    // 保存完整的顺序用于后续跳转
    return { pairs, order }
  }, [marks, playOrder])

  const playPairs = parsePlayOrder()

  const setReaderOffset = useCallback((top) => {
    const target = getScrollTarget(readerRef.current)
    const nextTop = Math.min(target.max, Math.max(0, top))

    target.scrollTo(nextTop)
    scrollTopRef.current = nextTop
    setProgress(target.max > 0 ? (nextTop / target.max) * 100 : 0)
  }, [])

  const seekToProgress = useCallback(
    (value) => {
      const target = getScrollTarget(readerRef.current)
      const nextProgress = Number(value)

      setReaderOffset((target.max * nextProgress) / 100)
      lastFrameRef.current = 0
    },
    [setReaderOffset],
  )

  const moveReaderBy = useCallback(
    (delta) => {
      setReaderOffset(scrollTopRef.current + delta)
      lastFrameRef.current = 0
    },
    [setReaderOffset],
  )

  const revealControls = useCallback(() => {
    window.clearTimeout(controlsTimerRef.current)
    setShowControls(true)
    controlsTimerRef.current = window.setTimeout(() => {
      setShowControls(false)
    }, 2600)
  }, [])

  const keepControlsVisible = useCallback(() => {
    window.clearTimeout(controlsTimerRef.current)
    setShowControls(true)
  }, [])

  const isInTriggerZone = useCallback((currentPos, section, maxScroll, clientHeight) => {
    const maxScrollSafe = maxScroll || 1
    const scrollHeight = maxScrollSafe + (clientHeight || 0)
    const centerPosition = currentPos + (clientHeight || 0) / 2

    const sectionStart = section.startRatio * scrollHeight
    const sectionEnd = section.endRatio * scrollHeight
    const sectionHeight = sectionEnd - sectionStart
    const threshold = Math.max(sectionHeight * 0.05, 20)

    const inZone = centerPosition >= sectionEnd - threshold
    return inZone
  }, [])

  const shouldTriggerRepeat = useCallback((currentPos, maxScroll, clientHeight) => {
    if (skipRepeat) {
      console.log('跳过反复模式已启用')
      return false
    }
    if (!score.sections?.length) {
      console.log('没有段落数据')
      return false
    }
    if (!score.repeats?.length) {
      console.log('没有反复规则数据')
      return false
    }

    const section = getSectionAtPosition(currentPos, maxScroll, clientHeight, score.sections)
    if (!section) return false

    // 查找当前段落作为结束段落的所有反复规则
    const repeat = score.repeats.find(r => r.endSection === section.id)
    if (!repeat) return false

    if (!isInTriggerZone(currentPos, section, maxScroll, clientHeight)) return false

    // 使用 startSection 作为计数 key
    const repeatKey = `${repeat.startSection}-${repeat.endSection}`
    const currentCount = sectionRepeatCountRef.current[repeatKey] || 0

    console.log('=== 反复触发检测 ===')
    console.log(`当前位置: ${currentPos.toFixed(0)}px / ${maxScroll.toFixed(0)}px`)
    console.log(`当前段落: ${section.name} (${section.id})`)
    console.log(`段落范围: ${(section.startRatio * 100).toFixed(1)}% - ${(section.endRatio * 100).toFixed(1)}%`)
    console.log(`反复规则: ${repeat.startSection} -> ${repeat.endSection}, 跳转: ${repeat.jumpToSection}, 次数: ${repeat.times}`)
    console.log(`已播放次数: ${currentCount}`)
    console.log('===================')

    return currentCount < repeat.times
  }, [skipRepeat, score.sections, score.repeats, isInTriggerZone])

  const executeRepeat = useCallback((endSection, maxScroll) => {
    // 查找以当前段落为结束段落的反复规则
    const repeat = score.repeats.find(r => r.endSection === endSection.id)
    if (!repeat) return null

    const targetSection = score.sections.find(s => s.id === repeat.jumpToSection)
    if (!targetSection) {
      console.warn(`[Repeat] Target section not found: ${repeat.jumpToSection}`)
      return null
    }

    const repeatKey = `${repeat.startSection}-${repeat.endSection}`
    const newCount = (sectionRepeatCountRef.current[repeatKey] || 0) + 1

    return {
      position: targetSection.startRatio * (maxScroll || 1),
      repeatCount: newCount,
      repeatKey: repeatKey,
      targetSectionId: targetSection.id
    }
  }, [score.sections, score.repeats])

  const revealIndicator = useCallback(() => {
    window.clearTimeout(indicatorTimerRef.current)
    if (showSectionIndicator) {
      indicatorTimerRef.current = window.setTimeout(() => {
        setShowSectionIndicator(false)
      }, 2500)
    }
  }, [showSectionIndicator])

  useEffect(() => {
    setWindowScrollTop(0)
    setElementScrollTop(readerRef.current, 0)
    setReaderOffset(0)
  }, [setReaderOffset])

  useEffect(() => {
    speedRef.current = speed
    window.localStorage.setItem(STORAGE_KEYS.SPEED, String(speed))
  }, [speed])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.SKIP_REPEAT, String(skipRepeat))
  }, [skipRepeat])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.SHOW_SECTION_INDICATOR, String(showSectionIndicator))
    if (showSectionIndicator) {
      revealIndicator()
    }
  }, [showSectionIndicator, revealIndicator])

  useEffect(() => {
    const handleResize = () => setReaderOffset(scrollTopRef.current)

    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [setReaderOffset])

  useEffect(() => {
    countdownTimerRef.current = window.setInterval(() => {
      setCountdown((current) => {
        if (current <= 1) {
          window.clearInterval(countdownTimerRef.current)

          // 初始化标记点跳转
          markJumpIndexRef.current = 0
          if (playPairs?.order?.length && marks?.length && readerRef.current) {
            const firstTargetName = playPairs.order[0]
            const firstMark = marks.find(m => m.name === firstTargetName)
            if (firstMark) {
              console.log(`从标记点 ${firstTargetName} 开始播放 (位置 ${(firstMark.ratio * 100).toFixed(2)}%)`)
              setReaderOffset(firstMark.ratio * getScrollTarget(readerRef.current).max)
            }
          }

          setIsPlaying(true)
          return 0
        }

        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(countdownTimerRef.current)
  }, [score.id, playPairs, marks, setReaderOffset])

  useEffect(
    () => () => {
      window.clearTimeout(controlsTimerRef.current)
      window.clearInterval(countdownTimerRef.current)
    },
    [],
  )

  useEffect(() => {
    if (!isPlaying) {
      cancelAnimationFrame(animationRef.current)
      lastFrameRef.current = 0
      return undefined
    }

    const step = (timestamp) => {
      if (!lastFrameRef.current) {
        lastFrameRef.current = timestamp
      }

      const elapsed = timestamp - lastFrameRef.current
      lastFrameRef.current = timestamp
      const pixelsPerSecond = speedRef.current
      const target = getScrollTarget(readerRef.current)
      let nextTop = scrollTopRef.current + (pixelsPerSecond * elapsed) / 1000

      if (nextTop >= target.max - 2) {
        setReaderOffset(target.max)
        setIsPlaying(false)
        return
      }

      const currentPos = nextTop

      // 检测滚动方向：只有从小往大（正常播放）才触发跳转
      const isPlayingForward = currentPos > lastScrollTopRef.current
      lastScrollTopRef.current = currentPos

      // 标记点跳转逻辑
      if (playPairs?.order?.length && marks?.length && isPlayingForward) {
        const currentTargetIndex = markJumpIndexRef.current

        // 只有奇数索引的点才是触发点（1, 3, 5...）
        const triggerIndex = currentTargetIndex * 2 + 1
        if (triggerIndex < playPairs.order.length) {
          const triggerName = playPairs.order[triggerIndex]
          const triggerMark = marks.find(m => m.name === triggerName)

          if (triggerMark) {
            const triggerPosition = triggerMark.ratio * target.max
            const threshold = 20

            if (currentPos >= triggerPosition - threshold && currentPos <= triggerPosition + 100) {
              // 到达触发点，跳转到下一个点
              const nextIndex = triggerIndex + 1
              if (nextIndex < playPairs.order.length) {
                const nextName = playPairs.order[nextIndex]
                const nextMark = marks.find(m => m.name === nextName)
                // 只有从大到小时才触发跳转
                if (nextMark && triggerMark.ratio > nextMark.ratio) {
                  console.log(`=== 标记点跳转 ===`)
                  console.log(`触发点: ${triggerName} → 跳转到: ${nextName}`)
                  console.log(`跳转位置: ${(nextMark.ratio * 100).toFixed(2)}%`)
                  console.log(`===================`)

                  markJumpIndexRef.current = currentTargetIndex + 1
                  const jumpPosition = nextMark.ratio * target.max
                  nextTop = jumpPosition
                  scrollTopRef.current = jumpPosition
                  lastScrollTopRef.current = jumpPosition - 1  // 确保下一帧 isPlayingForward 为 true
                }
              } else {
                console.log(`播放顺序完成，继续播放到结束`)
                markJumpIndexRef.current = -1
              }
            }
          }
        } else {
          console.log(`播放顺序完成，继续播放到结束`)
          markJumpIndexRef.current = -1
        }
      }

      // 段落显示逻辑（保持向后兼容，但与标记点互斥）
      if (score.sections?.length && !marks?.length) {
        const newSection = getSectionAtPosition(currentPos, target.max, readerRef.current?.clientHeight, score.sections)
        const newSectionId = newSection?.id || null

        if (newSectionId !== currentSectionId) {
          setCurrentSectionId(newSectionId)
          revealIndicator()
        }

        if (newSection && shouldTriggerRepeat(currentPos, target.max, readerRef.current?.clientHeight)) {
          const jumpResult = executeRepeat(newSection, target.max)

          if (jumpResult) {
            sectionRepeatCountRef.current[jumpResult.repeatKey] = jumpResult.repeatCount
            setReaderOffset(jumpResult.position)
            setCurrentSectionId(jumpResult.targetSectionId)
            nextTop = jumpResult.position
          }
        }
      }

      setReaderOffset(nextTop)
      animationRef.current = requestAnimationFrame(step)
    }

    animationRef.current = requestAnimationFrame(step)

    return () => cancelAnimationFrame(animationRef.current)
  }, [
    isPlaying,
    setReaderOffset,
    score.sections,
    score.repeats,
    marks,
    playPairs,
    currentSectionId,
    shouldTriggerRepeat,
    executeRepeat,
    revealIndicator
  ])

  const togglePlayback = useCallback(() => {
    window.clearInterval(countdownTimerRef.current)
    setCountdown(0)
    setIsPlaying((playing) => !playing)
    revealControls()
  }, [revealControls])

  const toggleSkipRepeat = useCallback(() => {
    setSkipRepeat(prev => !prev)
    revealControls()
  }, [revealControls])

  const toggleIndicatorVisibility = useCallback(() => {
    setShowSectionIndicator(prev => !prev)
    revealControls()
  }, [revealControls])

  const handleReaderWheel = useCallback(
    (event) => {
      if (event.target.closest('.playback-controls')) {
        return
      }

      if (Math.abs(event.deltaY) < 1) {
        return
      }

      event.preventDefault()
      revealControls()
      moveReaderBy(event.deltaY)
    },
    [moveReaderBy, revealControls],
  )

  const handleReaderTouchStart = useCallback((event) => {
    if (event.target.closest('.playback-controls')) {
      return
    }

    touchYRef.current = event.touches[0]?.clientY || 0
  }, [])

  const handleReaderTouchMove = useCallback(
    (event) => {
      if (event.target.closest('.playback-controls')) {
        return
      }

      const nextY = event.touches[0]?.clientY || touchYRef.current
      const delta = touchYRef.current - nextY

      if (Math.abs(delta) < 2) {
        return
      }

      event.preventDefault()
      revealControls()
      moveReaderBy(delta)
      touchYRef.current = nextY
    },
    [moveReaderBy, revealControls],
  )

  const getSectionDisplay = () => {
    // 优先显示标记点信息
    if (playPairs?.order?.length && marks?.length) {
      const currentTargetIndex = markJumpIndexRef.current

      if (currentTargetIndex >= 0 && currentTargetIndex < playPairs.order.length) {
        const current = playPairs.order[currentTargetIndex]
        const next = playPairs.order[currentTargetIndex + 1]

        let display = `${current} → ${next}`

        if (!next) {
          display += ` → 结束`
        }

        return display
      } else if (currentTargetIndex === -1) {
        return '播放完成'
      }
    }

    // 向后兼容：显示段落信息
    if (!currentSectionId) return null
    const section = score.sections.find(s => s.id === currentSectionId)
    if (!section) return null

    const nextSection = getNextSection(currentSectionId, score.sections)

    // 检查当前段落是否在某个反复范围内
    const repeat = score.repeats?.find(r => {
      const startIndex = score.sections.findIndex(s => s.id === r.startSection)
      const endIndex = score.sections.findIndex(s => s.id === r.endSection)
      const currentIndex = score.sections.findIndex(s => s.id === currentSectionId)
      return currentIndex >= startIndex && currentIndex <= endIndex
    })

    let display = section.name

    // 如果在反复范围内，显示重复次数
    if (repeat && !skipRepeat) {
      const repeatKey = `${repeat.startSection}-${repeat.endSection}`
      const count = sectionRepeatCountRef.current[repeatKey] || 0
      // 只有在结束段落时才显示完整次数
      if (currentSectionId === repeat.endSection) {
        display = `${section.name} (${count}/${repeat.times}x)`
      }
    }

    if (nextSection) {
      display += ` → ${nextSection.name}`
    }

    return display
  }

  return (
    <main className="playback-shell">
      <section
        className="score-reader"
        ref={readerRef}
        aria-label={`${score.title} 乐谱`}
        data-controls-visible={showControls ? 'true' : 'false'}
        onClick={(event) => {
          if (event.target.closest('.playback-controls')) {
            return
          }

          revealControls()
        }}
        onDoubleClick={(event) => {
          if (event.target.closest('.playback-controls')) {
            return
          }

          navigateToLibrary()
        }}
        onWheel={handleReaderWheel}
        onTouchStart={(event) => {
          handleReaderTouchStart(event)
          event.preventDefault()
        }}
        onTouchMove={(event) => {
          handleReaderTouchMove(event)
        }}
      >
        <div
          className="playback-controls"
          onClick={(event) => event.stopPropagation()}
          onDoubleClick={(event) => event.stopPropagation()}
          onTouchMove={(event) => event.stopPropagation()}
          onPointerDown={keepControlsVisible}
          onPointerUp={revealControls}
        >
          {score.sections?.length && showSectionIndicator && (
            <div className="section-indicator">
              <span>{getSectionDisplay()}</span>
            </div>
          )}
          <label className="playback-progress" htmlFor="playback-progress">
            <span>进度</span>
            <strong>{Math.round(progress)}%</strong>
            <input
              id="playback-progress"
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={progress}
              onChange={(event) => {
                seekToProgress(event.target.value)
                keepControlsVisible()
              }}
            />
          </label>
          <div className="playback-control-row">
            <button
              type="button"
              className="playback-play"
              onClick={togglePlayback}
              aria-label={isPlaying ? '暂停' : '播放'}
            >
              {isPlaying ? <Pause size={22} /> : <Play size={22} />}
            </button>
            <label className="playback-speed" htmlFor="playback-speed">
              <span>
                <Gauge size={17} />
                速度
              </span>
              <strong>{speed}px/s</strong>
              <input
                id="playback-speed"
                type="range"
                min={MIN_SPEED}
                max={MAX_SPEED}
                step="1"
                value={speed}
                onChange={(event) => {
                  setSpeed(Number(event.target.value))
                  keepControlsVisible()
                }}
              />
            </label>
            <div className="playback-options">
              {score.repeats?.length > 0 && (
                <button
                  type="button"
                  className={`playback-option ${skipRepeat ? 'active' : ''}`}
                  onClick={toggleSkipRepeat}
                  aria-label={skipRepeat ? '启用反复' : '跳过反复'}
                >
                  跳过反复
                </button>
              )}
              {score.sections?.length > 0 && (
                <button
                  type="button"
                  className="playback-option-indicator"
                  onClick={toggleIndicatorVisibility}
                  aria-label={showSectionIndicator ? '隐藏段落' : '显示段落'}
                >
                  {showSectionIndicator ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              )}
              {ENABLE_ANNOTATION && (
                <button
                  type="button"
                  className="playback-option-annotate"
                  onClick={() => navigateToAnnotate(score.id)}
                  aria-label="标注段落"
                >
                  <FileText size={16} />
                  标注
                </button>
              )}
            </div>
          </div>
        </div>
        {score.pages.map((page, index) => (
          <figure className="score-page" key={page.src}>
            <img
              id={`${score.id}-page-${index + 1}`}
              src={page.src}
              alt={`${score.title} ${page.label}`}
              onLoad={() => setReaderOffset(scrollTopRef.current)}
            />
          </figure>
        ))}
        {countdown > 0 && (
          <div className="countdown-overlay" aria-live="polite" aria-label={`${countdown} 秒后自动播放`}>
            <div className="countdown-pulse" key={countdown}>
              <span>{countdown}</span>
            </div>
          </div>
        )}
      </section>
      <button
        type="button"
        className="screen-reader-return"
        onClick={onExit || navigateToLibrary}
      >
        返回列表
      </button>
    </main>
  )
}

function AnnotationView({ score }) {
  const readerRef = useRef(null)
  const [initialAnnotations] = useState(() => readStoredAnnotations(score))
  const [marks, setMarks] = useState(initialAnnotations.marks)
  const [playOrder, setPlayOrder] = useState(initialAnnotations.playOrder)
  const [currentRatio, setCurrentRatio] = useState(0)
  const [previewMode, setPreviewMode] = useState(false)

  const scrollTopRef = useRef(0)

  const getCurrentRatio = useCallback((scrollTop, maxScroll) => {
    if (maxScroll <= 0) return 0
    return Math.min(1, Math.max(0, scrollTop / maxScroll))
  }, [])

  useEffect(() => {
    const storageKey = `score-annotations-${score.id}`
    window.localStorage.setItem(storageKey, JSON.stringify({ marks, playOrder }))
  }, [score.id, marks, playOrder])

  const handleScroll = useCallback(() => {
    if (!readerRef.current) return
    const maxScroll = readerRef.current.scrollHeight - readerRef.current.clientHeight
    const scrollTop = readerRef.current.scrollTop
    const ratio = getCurrentRatio(scrollTop, maxScroll)
    setCurrentRatio(ratio)
    scrollTopRef.current = scrollTop
  }, [getCurrentRatio])

  useEffect(() => {
    const reader = readerRef.current
    console.log('绑定滚动事件，readerRef:', reader)
    if (reader) {
      console.log('reader scrollHeight:', reader.scrollHeight, 'clientHeight:', reader.clientHeight)
      reader.addEventListener('scroll', handleScroll)
      return () => reader.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  const addMark = useCallback(() => {
    const markNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
    const usedNames = marks.map(m => m.name)
    const nextName = markNames.find(n => !usedNames.includes(n)) || `点${marks.length + 1}`

    console.log('=== 添加标记点 ===')
    console.log(`视口中心位置: ${(currentRatio * 100).toFixed(2)}%`)
    console.log(`标记名称: ${nextName}`)

    const newMark = {
      id: `mark-${Date.now()}`,
      name: nextName,
      ratio: currentRatio
    }

    setMarks([...marks, newMark])  // 不排序，保持添加顺序

    // 自动更新播放顺序
    const orderNames = marks.map(m => m.name)
    setPlayOrder([...orderNames, nextName].join(' → '))
    console.log('================')
  }, [marks, currentRatio])

  const updateMark = useCallback((markId) => {
    const updated = marks.map(m =>
      m.id === markId ? { ...m, ratio: currentRatio } : m
    )
    setMarks(updated)
    // playOrder 不需要改变，因为名称和顺序不变
  }, [marks, currentRatio])

  const deleteMark = useCallback((markId) => {
    const updated = marks.filter(m => m.id !== markId)
    setMarks(updated)
    setPlayOrder(updated.map(m => m.name).join(' → '))
  }, [marks])

  const exportJSON = useCallback(() => {
    const data = {
      marks: marks.map(m => ({
        id: m.id,
        name: m.name,
        ratio: parseFloat(m.ratio.toFixed(4))
      })),
      playOrder: playOrder
    }
    console.log('=== 导出 JSON ===')
    console.log(JSON.stringify(data, null, 2))
    console.log('=================')
    navigator.clipboard.writeText(JSON.stringify(data, null, 2))
    alert('已复制到剪贴板，粘贴到 scoreData.js')
  }, [marks, playOrder])

  const clearAll = useCallback(() => {
    setMarks([])
    setPlayOrder('')
  }, [])

  if (previewMode) {
    const previewScore = { ...score, marks, playOrder }
    return <PlaybackView key={previewScore.id} score={previewScore} onExit={() => setPreviewMode(false)} />
  }

  return (
    <main className="annotation-shell">
      <header className="annotation-header">
        <button type="button" className="annotation-back" onClick={navigateToLibrary}>
          <ArrowLeft size={18} />
          返回
        </button>
        <h1>标注模式 - {score.title}</h1>
      </header>

      <section
        className="score-reader"
        ref={readerRef}
        aria-label={`${score.title} 乐谱`}
      >
        {score.pages.map((page, index) => (
          <figure className="score-page" key={page.src}>
            <img
              id={`${score.id}-page-${index + 1}`}
              src={page.src}
              alt={`${score.title} ${page.label}`}
            />
          </figure>
        ))}
      </section>

      <aside className="annotation-panel">
        <div className="annotation-panel-header">
          <h2>标记点</h2>
          <span className="current-position">{(currentRatio * 100).toFixed(1)}%</span>
        </div>

        <div className="mark-list">
          {marks.length === 0 ? (
            <p className="empty-message">暂无标记点，滚动乐谱后点击下方按钮添加</p>
          ) : (
            marks.map(mark => (
              <div
                key={mark.id}
                className="mark-card"
                onClick={() => {
                  if (readerRef.current) {
                    const targetScroll = mark.ratio * (readerRef.current.scrollHeight - readerRef.current.clientHeight)
                    readerRef.current.scrollTop = targetScroll
                  }
                }}
              >
                <div className="mark-header">
                  <span className="mark-name">{mark.name}</span>
                  <div className="mark-actions">
                    <button
                      type="button"
                      className="mark-update"
                      onClick={(e) => {
                        e.stopPropagation()
                        updateMark(mark.id)
                      }}
                      aria-label="更新位置到当前位置"
                      title={`更新 B 点到当前位置 ${(currentRatio * 100).toFixed(1)}%`}
                    >
                      <MapPin size={14} />
                    </button>
                    <button
                      type="button"
                      className="mark-delete"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteMark(mark.id)
                      }}
                      aria-label="删除标记"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="mark-position">
                  位置: {(mark.ratio * 100).toFixed(2)}%
                </div>
              </div>
            ))
          )}
        </div>

        <button
          type="button"
          className="annotation-add-mark"
          onClick={addMark}
        >
          <Plus size={16} />
          在当前位置添加标记
        </button>

        <div className="play-order-section">
          <label>播放顺序（用 → 分隔）</label>
          <input
            type="text"
            className="play-order-input"
            value={playOrder}
            onChange={(e) => setPlayOrder(e.target.value)}
            placeholder="例如: A → B → A → B → C → D"
          />
          <p className="play-order-hint">输入标记点名称，用 → 连接</p>
        </div>

        <div className="annotation-panel-footer">
          <button
            type="button"
            className="annotation-button annotation-preview"
            onClick={() => setPreviewMode(true)}
            disabled={marks.length === 0}
          >
            <Play size={16} />
            预览播放
          </button>
          <button
            type="button"
            className="annotation-button annotation-export"
            onClick={exportJSON}
            disabled={marks.length === 0}
          >
            <Download size={16} />
            导出 JSON
          </button>
          <button
            type="button"
            className="annotation-button annotation-clear"
            onClick={clearAll}
          >
            <Trash2 size={16} />
            清空
          </button>
        </div>
      </aside>
    </main>
  )
}

export default App
