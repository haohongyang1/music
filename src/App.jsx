import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Gauge,
  ListMusic,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
} from 'lucide-react'
import './App.css'
import { getAdjacentScores, getScoreById, scoreGroups, scores } from './scoreData'

const SPEED_KEY_PREFIX = 'score-autoplay-speed:'
const DEFAULT_SPEED = 42
const MIN_SPEED = 16
const MAX_SPEED = 86

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
  if (behavior === 'smooth') {
    element.scrollTo({ top, behavior })
    return
  }

  element.scrollTop = top
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

function readStoredSpeed(scoreId, fallback) {
  const stored = window.localStorage.getItem(`${SPEED_KEY_PREFIX}${scoreId}`)
  const parsed = Number(stored)

  return Number.isFinite(parsed) ? parsed : fallback
}

function clampProgress(value) {
  return Math.min(100, Math.max(0, value))
}

function getScrollTarget(element) {
  if (element && document.fullscreenElement === element) {
    return {
      top: element.scrollTop,
      max: Math.max(0, element.scrollHeight - element.clientHeight),
      scrollTo: (top, behavior = 'auto') =>
        setElementScrollTop(element, top, behavior),
    }
  }

  return {
    top: window.scrollY,
    max: Math.max(0, document.documentElement.scrollHeight - window.innerHeight),
    scrollTo: (top, behavior = 'auto') => setWindowScrollTop(top, behavior),
  }
}

function getCurrentProgress(element) {
  const target = getScrollTarget(element)

  if (target.max === 0) {
    return 0
  }

  return clampProgress((target.top / target.max) * 100)
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
  const readerRef = useRef(null)
  const controlsTimerRef = useRef(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showFullscreenControls, setShowFullscreenControls] = useState(false)
  const [speed, setSpeed] = useState(() =>
    readStoredSpeed(score.id, score.defaultSpeed || DEFAULT_SPEED),
  )
  const speedRef = useRef(speed)
  const [progress, setProgress] = useState(0)
  const { previous, next } = useMemo(() => getAdjacentScores(score.id), [score.id])

  useEffect(() => {
    setWindowScrollTop(0)
  }, [])

  useEffect(() => {
    speedRef.current = speed
    window.localStorage.setItem(`${SPEED_KEY_PREFIX}${score.id}`, String(speed))
  }, [score.id, speed])

  useEffect(() => {
    const reader = readerRef.current
    const updateProgress = () => setProgress(getCurrentProgress(reader))

    window.addEventListener('scroll', updateProgress, { passive: true })
    reader?.addEventListener('scroll', updateProgress, { passive: true })
    window.addEventListener('resize', updateProgress)
    updateProgress()

    return () => {
      window.removeEventListener('scroll', updateProgress)
      reader?.removeEventListener('scroll', updateProgress)
      window.removeEventListener('resize', updateProgress)
    }
  }, [score.id])

  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = document.fullscreenElement === readerRef.current
      setIsFullscreen(active)
      setShowFullscreenControls(false)
      setProgress(getCurrentProgress(readerRef.current))
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  useEffect(() => {
    return () => window.clearTimeout(controlsTimerRef.current)
  }, [])

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
      const nextTop = target.top + (pixelsPerSecond * elapsed) / 1000

      if (nextTop >= target.max - 2) {
        target.scrollTo(target.max)
        setIsPlaying(false)
        setProgress(100)
        return
      }

      target.scrollTo(nextTop)
      animationRef.current = requestAnimationFrame(step)
    }

    animationRef.current = requestAnimationFrame(step)

    return () => cancelAnimationFrame(animationRef.current)
  }, [isPlaying])

  const seekToProgress = useCallback((value) => {
    const nextProgress = Number(value)
    const target = getScrollTarget(readerRef.current)
    const top = (target.max * nextProgress) / 100
    target.scrollTo(top)
    setProgress(nextProgress)
  }, [])

  const restart = useCallback(() => {
    getScrollTarget(readerRef.current).scrollTo(0, 'smooth')
    setProgress(0)
    setIsPlaying(true)
  }, [])

  const enterFullscreen = useCallback(async () => {
    if (!readerRef.current || !document.fullscreenEnabled) {
      return
    }

    await readerRef.current.requestFullscreen()
  }, [])

  const exitFullscreen = useCallback(async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
    }
  }, [])

  const revealFullscreenControls = useCallback(() => {
    if (document.fullscreenElement !== readerRef.current) {
      return
    }

    window.clearTimeout(controlsTimerRef.current)
    setShowFullscreenControls(true)
    controlsTimerRef.current = window.setTimeout(() => {
      setShowFullscreenControls(false)
    }, 2600)
  }, [])

  const keepFullscreenControlsVisible = useCallback(() => {
    if (document.fullscreenElement !== readerRef.current) {
      return
    }

    window.clearTimeout(controlsTimerRef.current)
    setShowFullscreenControls(true)
  }, [])

  return (
    <main className="playback-shell">
      <header className="playback-header">
        <button type="button" className="ghost-button" onClick={navigateToLibrary}>
          <ArrowLeft size={18} />
          列表
        </button>
        <div className="playback-title">
          <p className="eyebrow">正在练习</p>
          <h1>{score.title}</h1>
          <p>
            {score.artist} · {score.pageCount} 页 · 选调 {score.selectedKey}
          </p>
        </div>
        <div className="song-nav">
          <button
            type="button"
            className="icon-button"
            onClick={() => navigateToScore(previous.id)}
            title={`上一首：${previous.title}`}
            aria-label={`上一首：${previous.title}`}
          >
            <SkipBack size={19} />
          </button>
          <button
            type="button"
            className="icon-button"
            onClick={() => navigateToScore(next.id)}
            title={`下一首：${next.title}`}
            aria-label={`下一首：${next.title}`}
          >
            <SkipForward size={19} />
          </button>
          <button
            type="button"
            className="icon-button"
            onClick={enterFullscreen}
            title="全屏乐谱"
            aria-label="全屏乐谱"
          >
            <Maximize2 size={19} />
          </button>
        </div>
      </header>

      <section className="practice-layout">
        <aside className="practice-panel" aria-label="播放控制">
          <div className="panel-section">
            <p className="panel-label">自动播放</p>
            <div className="transport-row">
              <button
                type="button"
                className="primary-action"
                onClick={() => setIsPlaying((playing) => !playing)}
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                {isPlaying ? '暂停' : '播放'}
              </button>
              <button
                type="button"
                className="icon-button"
                onClick={restart}
                title="从头播放"
                aria-label="从头播放"
              >
                <RotateCcw size={18} />
              </button>
            </div>
          </div>

          <div className="panel-section">
            <label className="range-label" htmlFor="speed">
              <span>
                <Gauge size={17} />
                速度
              </span>
              <strong>{speed}px/s</strong>
            </label>
            <input
              id="speed"
              type="range"
              min={MIN_SPEED}
              max={MAX_SPEED}
              value={speed}
              onChange={(event) => setSpeed(Number(event.target.value))}
            />
            <div className="range-hints">
              <span>慢</span>
              <span>快</span>
            </div>
          </div>

          <div className="panel-section">
            <label className="range-label" htmlFor="progress">
              <span>进度</span>
              <strong>{Math.round(progress)}%</strong>
            </label>
            <input
              id="progress"
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(event) => seekToProgress(event.target.value)}
            />
          </div>

          <div className="panel-section">
            <p className="panel-label">乐曲摘要</p>
            <p className="panel-copy">{score.summary}</p>
            <dl className="detail-list">
              <div>
                <dt>原调</dt>
                <dd>{score.originalKey}</dd>
              </div>
              <div>
                <dt>选调</dt>
                <dd>{score.selectedKey}</dd>
              </div>
              <div>
                <dt>来源</dt>
                <dd>{score.source}</dd>
              </div>
            </dl>
          </div>
        </aside>

        <section
          className="score-reader"
          ref={readerRef}
          aria-label={`${score.title} 乐谱`}
          data-fullscreen-active={isFullscreen ? 'true' : 'false'}
          data-controls-visible={showFullscreenControls ? 'true' : 'false'}
          onClick={(event) => {
            if (event.target.closest('.fullscreen-controls')) {
              return
            }

            revealFullscreenControls()
          }}
        >
          <div
            className="fullscreen-controls"
            onClick={(event) => event.stopPropagation()}
            onPointerDown={keepFullscreenControlsVisible}
            onPointerUp={revealFullscreenControls}
          >
            <button
              type="button"
              className="fullscreen-play"
              onClick={() => {
                setIsPlaying((playing) => !playing)
                revealFullscreenControls()
              }}
              aria-label={isPlaying ? '暂停' : '播放'}
            >
              {isPlaying ? <Pause size={22} /> : <Play size={22} />}
              {isPlaying ? '暂停' : '播放'}
            </button>
            <button
              type="button"
              className="fullscreen-exit"
              onClick={exitFullscreen}
              aria-label="退出全屏"
            >
              <Minimize2 size={21} />
              退出
            </button>
            <label className="fullscreen-speed" htmlFor="fullscreen-speed">
              <span>速度</span>
              <strong>{speed}px/s</strong>
              <input
                id="fullscreen-speed"
                type="range"
                min={MIN_SPEED}
                max={MAX_SPEED}
                value={speed}
                onChange={(event) => {
                  setSpeed(Number(event.target.value))
                  keepFullscreenControlsVisible()
                }}
              />
            </label>
          </div>
          {score.pages.map((page, index) => (
            <figure className="score-page" key={page.src}>
              <div className="page-toolbar">
                <span>{page.label}</span>
                <small>{page.focus}</small>
                <button
                  type="button"
                  className="text-button"
                  onClick={() => {
                    const pageTop = document
                      .getElementById(`${score.id}-page-${index + 1}`)
                      ?.getBoundingClientRect().top

                    if (typeof pageTop === 'number') {
                      window.scrollTo({
                        top: window.scrollY + pageTop - 96,
                        behavior: 'smooth',
                      })
                    }
                  }}
                >
                  跳转
                </button>
              </div>
              <img
                id={`${score.id}-page-${index + 1}`}
                src={page.src}
                alt={`${score.title} ${page.label}`}
              />
            </figure>
          ))}
        </section>
      </section>

      <div className="mobile-stepper" aria-label="切换乐曲">
        <button type="button" onClick={() => navigateToScore(previous.id)}>
          <ChevronLeft size={18} />
          {previous.title}
        </button>
        <button type="button" onClick={() => navigateToScore(next.id)}>
          {next.title}
          <ChevronRight size={18} />
        </button>
      </div>
    </main>
  )
}

export default App
