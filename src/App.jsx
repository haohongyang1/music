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

  return maybeScoreId ? { view: 'score', scoreId: maybeScoreId } : { view: 'library' }
}

function navigateToLibrary() {
  window.location.hash = '/'
}

function navigateToScore(scoreId) {
  window.location.hash = `/score/${scoreId}`
}

function readStoredSpeed(fallback) {
  const stored = window.localStorage.getItem(SPEED_STORAGE_KEY)
  const parsed = Number(stored)

  if (!Number.isFinite(parsed)) {
    return fallback
  }

  return Math.min(MAX_SPEED, Math.max(MIN_SPEED, parsed))
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

  if (route.view === 'score' && !selectedScore) {
    return <MissingScore scoreId={route.scoreId} />
  }

  return selectedScore ? (
    <PlaybackView key={selectedScore.id} score={selectedScore} />
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

function PlaybackView({ score }) {
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

  const sectionRepeatCountRef = useRef({})

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

  const isInTriggerZone = useCallback((currentPos, section, maxScroll) => {
    const maxScrollSafe = maxScroll || 1
    const sectionStart = section.startRatio * maxScrollSafe
    const sectionEnd = section.endRatio * maxScrollSafe
    const sectionHeight = sectionEnd - sectionStart
    const threshold = Math.max(sectionHeight * 0.05, 20)

    return currentPos >= sectionEnd - threshold
  }, [])

  const shouldTriggerRepeat = useCallback((currentPos, maxScroll) => {
    if (skipRepeat) return false
    if (!score.sections?.length || !score.repeats?.length) return false

    const section = getSectionAtPosition(currentPos, maxScroll, score.sections)
    if (!section) return false

    // 查找当前段落作为结束段落的所有反复规则
    const repeat = score.repeats.find(r => r.endSection === section.id)
    if (!repeat) return false

    if (!isInTriggerZone(currentPos, section, maxScroll)) return false

    // 使用 startSection 作为计数 key
    const repeatKey = `${repeat.startSection}-${repeat.endSection}`
    const currentCount = sectionRepeatCountRef.current[repeatKey] || 0
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
          setIsPlaying(true)
          return 0
        }

        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(countdownTimerRef.current)
  }, [score.id])

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

      if (score.sections?.length) {
        const newSection = getSectionAtPosition(currentPos, target.max, score.sections)
        const newSectionId = newSection?.id || null

        if (newSectionId !== currentSectionId) {
          setCurrentSectionId(newSectionId)
          revealIndicator()
        }

        if (newSection && shouldTriggerRepeat(currentPos, target.max)) {
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
        onClick={navigateToLibrary}
      >
        返回列表
      </button>
    </main>
  )
}

export default App