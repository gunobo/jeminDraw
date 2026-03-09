import { useState } from 'react'
import { useSettings } from '../SettingsContext'
import s from '../css/OrderDraw.module.css'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const RANK_COLORS = ['#F59E0B', '#9CA3AF', '#B45309']

export default function OrderDraw() {
  const { availableStudents } = useSettings()
  const [order, setOrder] = useState(null)

  const draw = () => {
    if (availableStudents.length === 0) return
    setOrder(null)
    setTimeout(() => setOrder(shuffle(availableStudents)), 10)
  }

  return (
    <div>
      <button
        className="draw-btn"
        onClick={draw}
        disabled={availableStudents.length === 0}
      >
        📋 {order ? '다시 뽑기' : '순서 뽑기!'}
      </button>

      {order && (
        <div className={s.list}>
          {order.map((num, idx) => (
            <div
              key={num}
              className={s.item}
              style={{ animationDelay: `${Math.min(idx * 18, 500)}ms` }}
            >
              <span
                className={s.rank}
                style={idx < 3 ? { color: RANK_COLORS[idx], fontWeight: 800 } : {}}
              >
                {idx + 1}
              </span>
              <span className={s.num}>{num}번</span>
              {idx === 0 && <span className={s.badge}>🥇</span>}
              {idx === 1 && <span className={s.badge}>🥈</span>}
              {idx === 2 && <span className={s.badge}>🥉</span>}
            </div>
          ))}
        </div>
      )}

      {!order && (
        <div className={s.emptyState}>
          <div className={s.emptyIcon}>📋</div>
          <p>버튼을 눌러 발표 순서를 정해보세요</p>
        </div>
      )}
    </div>
  )
}
