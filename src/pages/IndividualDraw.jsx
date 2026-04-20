import { useState, useRef, useEffect } from 'react'
import { useSettings } from '../SettingsContext'
import s from '../css/IndividualDraw.module.css'

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function removeOne(arr, value) {
  const idx = arr.indexOf(value)
  if (idx === -1) return arr
  return [...arr.slice(0, idx), ...arr.slice(idx + 1)]
}

export default function IndividualDraw() {
  const { availableStudents } = useSettings()
  const [result, setResult] = useState(null)
  const [displayNum, setDisplayNum] = useState(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [history, setHistory] = useState([])
  const [pool, setPool] = useState([])
  const [cycleCount, setCycleCount] = useState(0)
  const intervalRef = useRef(null)

  // availableStudents가 바뀌면 풀 초기화
  useEffect(() => {
    setPool([...availableStudents])
    setHistory([])
    setResult(null)
    setDisplayNum(null)
    setCycleCount(0)
  }, [availableStudents.join(',')])  // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const draw = () => {
    if (availableStudents.length === 0 || isAnimating) return
    setIsAnimating(true)
    setResult(null)

    // 풀이 비었으면 재충전
    const currentPool = pool.length === 0 ? [...availableStudents] : [...pool]
    if (pool.length === 0) setCycleCount(prev => prev + 1)

    let count = 0
    intervalRef.current = setInterval(() => {
      // 애니메이션 중에는 전체 목록에서 랜덤 표시 (시각 효과)
      setDisplayNum(pickRandom(availableStudents))
      count++
      if (count >= 28) {
        clearInterval(intervalRef.current)
        // 풀에서 비복원 추출
        const final = pickRandom(currentPool)
        const newPool = removeOne(currentPool, final)
        setDisplayNum(final)
        setResult(final)
        setHistory(prev => [final, ...prev.slice(0, 14)])
        setPool(newPool)
        setIsAnimating(false)
      }
    }, 80)
  }

  const reset = () => {
    if (isAnimating) return
    setResult(null)
    setDisplayNum(null)
    setHistory([])
    setPool([...availableStudents])
    setCycleCount(0)
  }

  const displayClass = [
    s.display,
    isAnimating ? s.animating : '',
    result && !isAnimating ? s.result : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={s.section}>
      <div className={s.controls}>
        <button
          className="draw-btn"
          onClick={draw}
          disabled={availableStudents.length === 0 || isAnimating}
        >
          🎯 뽑기!
        </button>
        {history.length > 0 && (
          <button className={s.resetBtn} onClick={reset} disabled={isAnimating}>
            초기화
          </button>
        )}
      </div>

      <div className={displayClass}>
        {displayNum !== null ? (
          <>
            <span className={s.bigNumber}>{displayNum}</span>
            <span className={s.numberLabel}>번</span>
          </>
        ) : (
          <span className={s.placeholder}>?</span>
        )}
      </div>

      {result && !isAnimating && (
        <p className={s.resultText}>
          🎉 <strong>{result}번</strong> 학생이 선택되었습니다!
        </p>
      )}

      {availableStudents.length > 0 && (
        <div className={s.poolStatus}>
          <span className={s.poolLabel}>남은 풀</span>
          <span className={s.poolCount}>{pool.length} / {availableStudents.length}명</span>
          {cycleCount > 0 && (
            <span className={s.cycleTag}>{cycleCount}회 순환</span>
          )}
        </div>
      )}

      {history.length > 0 && (
        <div className={s.history}>
          <h3 className={s.historyTitle}>뽑기 기록</h3>
          <div className={s.historyList}>
            {history.map((num, i) => (
              <span key={i} className={`${s.historyItem}${i === 0 ? ` ${s.latest}` : ''}`}>
                {num}번
              </span>
            ))}
          </div>
        </div>
      )}

      {!displayNum && (
        <div className={s.emptyState}>
          <div className={s.emptyIcon}>🎯</div>
          <p>
            버튼을 눌러 학생을 뽑아보세요. <br/>
            Create By 임제민 | CSS Power By Claude.ai
          </p>
        </div>
      )}
    </div>
  )
}
