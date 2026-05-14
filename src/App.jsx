import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  ChevronRight,
  Gauge,
  ListMusic,
  Pause,
  Play,
} from 'lucide-react'
import './App.css'
import { getScoreById, scoreGroups, scores } from './scoreData'

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
  const readerRef = useRef(null)
  const controlsTimerRef = useRef(0)
  const countdownTimerRef = useRef(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)
  const [speed, setSpeed] = useState(() => readStoredSpeed(DEFAULT_SPEED))
  const speedRef = useRef(speed)

  useEffect(() => {
    setWindowScrollTop(0)
    setElementScrollTop(readerRef.current, 0)
    setScoreOffset(readerRef.current, 0)
    scrollTopRef.current = 0
  }, [])

  useEffect(() => {
    speedRef.current = speed
    window.localStorage.setItem(SPEED_STORAGE_KEY, String(speed))
  }, [speed])

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
      const nextTop = scrollTopRef.current + (pixelsPerSecond * elapsed) / 1000

      if (nextTop >= target.max - 2) {
        target.scrollTo(target.max)
        scrollTopRef.current = target.max
        setIsPlaying(false)
        return
      }

      target.scrollTo(nextTop)
      scrollTopRef.current = nextTop
      animationRef.current = requestAnimationFrame(step)
    }

    animationRef.current = requestAnimationFrame(step)

    return () => cancelAnimationFrame(animationRef.current)
  }, [isPlaying])

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

  const togglePlayback = useCallback(() => {
    window.clearInterval(countdownTimerRef.current)
    setCountdown(0)
    setIsPlaying((playing) => !playing)
    revealControls()
  }, [revealControls])

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
      >
        <div
          className="playback-controls"
          onClick={(event) => event.stopPropagation()}
          onDoubleClick={(event) => event.stopPropagation()}
          onPointerDown={keepControlsVisible}
          onPointerUp={revealControls}
        >
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
        </div>
        {score.pages.map((page, index) => (
          <figure className="score-page" key={page.src}>
            <img
              id={`${score.id}-page-${index + 1}`}
              src={page.src}
              alt={`${score.title} ${page.label}`}
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
