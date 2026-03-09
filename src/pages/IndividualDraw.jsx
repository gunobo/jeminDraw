import { useState, useRef, useEffect } from 'react'
import { useSettings } from '../SettingsContext'
import s from '../css/IndividualDraw.module.css'

export default function IndividualDraw() {
  const { availableStudents } = useSettings()
  const [result, setResult] = useState(null)
  const [displayNum, setDisplayNum] = useState(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [history, setHistory] = useState([])
  const intervalRef = useRef(null)

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const draw = () => {
    if (availableStudents.length === 0 || isAnimating) return
    setIsAnimating(true)
    setResult(null)

    let count = 0
    intervalRef.current = setInterval(() => {
      setDisplayNum(availableStudents[Math.floor(Math.random() * availableStudents.length)])
      count++
      if (count >= 28) {
        clearInterval(intervalRef.current)
        const final = availableStudents[Math.floor(Math.random() * availableStudents.length)]
        setDisplayNum(final)
        setResult(final)
        setHistory(prev => [final, ...prev.slice(0, 14)])
        setIsAnimating(false)
      }
    }, 80)
  }

  const reset = () => {
    if (isAnimating) return
    setResult(null)
    setDisplayNum(null)
    setHistory([])
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
          <p>버튼을 눌러 학생을 뽑아보세요</p>
        </div>
      )}
    </div>
  )
}
