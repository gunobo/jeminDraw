import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDraw } from '../DrawContext'
import s from '../css/GroupResult.module.css'

const GROUP_COLORS = [
  { main: '#f87171', light: 'rgba(248,113,113,0.1)'  },
  { main: '#34d399', light: 'rgba(52,211,153,0.1)'   },
  { main: '#60a5fa', light: 'rgba(96,165,250,0.1)'   },
  { main: '#c084fc', light: 'rgba(192,132,252,0.1)'  },
  { main: '#fb923c', light: 'rgba(251,146,60,0.1)'   },
  { main: '#22d3ee', light: 'rgba(34,211,238,0.1)'   },
  { main: '#a78bfa', light: 'rgba(167,139,250,0.1)'  },
  { main: '#f472b6', light: 'rgba(244,114,182,0.1)'  },
  { main: '#fbbf24', light: 'rgba(251,191,36,0.1)'   },
  { main: '#86efac', light: 'rgba(134,239,172,0.1)'  },
]

function buildSequence(groups) {
  const all = groups.flatMap((group, groupIdx) =>
    group.map(num => ({ num, groupIdx }))
  )
  // Fisher-Yates shuffle for random reveal order
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[all[i], all[j]] = [all[j], all[i]]
  }
  return all
}

export default function GroupResult() {
  const { groups } = useDraw()   // ← Context 변수에서 읽기
  const navigate = useNavigate()

  const seqRef = useRef(buildSequence(groups))
  const sequence = seqRef.current
  const total = sequence.length

  // cardIdx: which card is showing (-1 = none)
  // animPhase: 'in' | 'out'
  const [cardIdx, setCardIdx]             = useState(-1)
  const [animPhase, setAnimPhase]         = useState('in')
  const [placed, setPlaced]               = useState([])       // { num, groupIdx }[]
  const [justPlacedGroup, setJustPlaced]  = useState(null)     // groupIdx currently flashing
  const [done, setDone]                   = useState(false)

  const timersRef = useRef([])

  const clearAll = () => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  const at = (fn, ms) => {
    const id = setTimeout(fn, ms)
    timersRef.current.push(id)
  }

  // Kick off card reveal sequence
  const runCard = (idx) => {
    if (idx >= total) {
      setDone(true)
      setCardIdx(-1)
      return
    }

    setCardIdx(idx)
    setAnimPhase('in')

    // card-in plays for ~380ms, stay visible until t=420ms
    at(() => {
      // Start exit: card shrinks toward container
      setAnimPhase('out')
      setJustPlaced(sequence[idx].groupIdx)  // container flashes

      // card-out plays for ~240ms; place number mid-exit
      at(() => {
        setPlaced(prev => [...prev, sequence[idx]])
        setJustPlaced(null)

        // brief gap before next card
        at(() => runCard(idx + 1), 80)
      }, 230)
    }, 420)
  }

  useEffect(() => {
    if (groups.length === 0) {
      navigate('/group', { replace: true })
      return
    }
    at(() => runCard(0), 350)
    return clearAll
  }, [])

  const skipToEnd = () => {
    clearAll()
    setPlaced(sequence)
    setDone(true)
    setCardIdx(-1)
    setJustPlaced(null)
  }

  const currentItem = cardIdx >= 0 && cardIdx < total ? sequence[cardIdx] : null
  const currentColor = currentItem
    ? GROUP_COLORS[currentItem.groupIdx % GROUP_COLORS.length]
    : null

  return (
    <div className={s.page}>

      <div className={s.toolbar}>
        <div>
        <button className={s.backBtn} onClick={() => navigate(-1)}>← 돌아가기</button>
        </div>
      </div>

      {/* ── Stage ── */}
      {!done && (
        <div className={s.stage}>
          {currentItem && (
            <div
              key={cardIdx}
              className={`${s.bigCard} ${animPhase === 'in' ? s.cardIn : s.cardOut}`}
              style={{ background: currentColor.main }}
            >
              <span className={s.bigNum}>{currentItem.num}</span>
              <span className={s.bigLabel}>번</span>
            </div>
          )}

          {currentItem && (
            <div
              key={`hint-${cardIdx}`}
              className={s.groupHint}
              style={{ color: currentColor.main }}
            >
              → {currentItem.groupIdx + 1}모둠
            </div>
          )}

          <div className={s.progressWrap}>
            <div className={s.progressBar}>
              <div
                className={s.progressFill}
                style={{ width: `${(placed.length / total) * 100}%` }}
              />
            </div>
            <span className={s.progressText}>{placed.length} / {total}</span>
          </div>

          <button className={s.skipBtn} onClick={skipToEnd}>
            결과 바로보기 →
          </button>
        </div>
      )}

      {/* ── 2×2 Group Containers ── */}
      <div className={s.groupsGrid}>
        {groups.map((group, idx) => {
          const color = GROUP_COLORS[idx % GROUP_COLORS.length]
          const members = placed
            .filter(p => p.groupIdx === idx)
            .map(p => p.num)
            .sort((a, b) => a - b)
          const isFlashing = justPlacedGroup === idx

          return (
            <div
              key={idx}
              className={`${s.groupCard}${isFlashing ? ` ${s.flash}` : ''}`}
              style={{ borderTopColor: color.main, background: color.light }}
            >
              <div className={s.groupTitle} style={{ color: color.main }}>
                {idx + 1}모둠
                <span className={s.groupCount}>{members.length}/{group.length}명</span>
              </div>
              <div className={s.groupMembers}>
                {members.map(num => (
                  <span
                    key={num}
                    className={s.memberBadge}
                    style={{ background: color.main }}
                  >
                    {num}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Done: action buttons ── */}
      {done && (
        <div className={s.doneActions}>
          <button
            className={`draw-btn ${s.redrawBtn}`}
            onClick={() => navigate('/group')}
          >
            🎲 다시 뽑기
          </button>
          <button
            className={s.exportBtn}
            onClick={() => navigate('/group/export')}  // state 없이 이동
          >
            💾 결과 저장
          </button>
        </div>
      )}
    </div>
  )
}
