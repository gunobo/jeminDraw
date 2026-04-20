import { useNavigate } from 'react-router-dom'
import { useSettings } from '../SettingsContext'
import { useDraw } from '../DrawContext'
import s from '../css/GroupDraw.module.css'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pairKey(a, b) {
  return a < b ? `${a}-${b}` : `${b}-${a}`
}

function groupScore(groups, history) {
  let total = 0
  for (const group of groups) {
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        total += history[pairKey(group[i], group[j])] || 0
      }
    }
  }
  return total
}

function smartGroup(students, numGroups, history) {
  const shuffled = shuffle(students)
  const groups = Array.from({ length: numGroups }, () => [])
  shuffled.forEach((s, i) => groups[i % numGroups].push(s))

  // 반복 페어 최소화를 위한 그리디 스왑
  let best = groupScore(groups, history)
  for (let iter = 0; iter < 300; iter++) {
    const g1 = Math.floor(Math.random() * numGroups)
    let g2 = Math.floor(Math.random() * (numGroups - 1))
    if (g2 >= g1) g2++

    const i1 = Math.floor(Math.random() * groups[g1].length)
    const i2 = Math.floor(Math.random() * groups[g2].length)
    ;[groups[g1][i1], groups[g2][i2]] = [groups[g2][i2], groups[g1][i1]]

    const score = groupScore(groups, history)
    if (score < best) {
      best = score
    } else {
      ;[groups[g1][i1], groups[g2][i2]] = [groups[g2][i2], groups[g1][i1]]
    }
  }
  return groups
}

export default function GroupDraw() {
  const { numGroups, availableStudents } = useSettings()
  const { saveGroups, pairingHistory, updatePairingHistory, resetPairingHistory } = useDraw()
  const navigate = useNavigate()

  const draw = () => {
    if (availableStudents.length === 0) return
    const groups = smartGroup(availableStudents, numGroups, pairingHistory)
    updatePairingHistory(groups)
    saveGroups(groups)
    navigate('/group/result')
  }

  const historyCount = Object.keys(pairingHistory).length

  const perGroupMin = availableStudents.length > 0 ? Math.floor(availableStudents.length / numGroups) : 0
  const perGroupMax = availableStudents.length > 0 ? Math.ceil(availableStudents.length / numGroups) : 0
  const perGroupText = perGroupMin === perGroupMax ? `${perGroupMin}명` : `${perGroupMin}~${perGroupMax}명`

  return (
    <div className={s.page}>
      <div className={s.infoBar}>
        <div className={s.infoItem}>
          <span className={s.infoLabel}>모둠 수</span>
          <strong className={s.infoValue}>{numGroups}개</strong>
        </div>
        <div className={s.infoDivider} />
        <div className={s.infoItem}>
          <span className={s.infoLabel}>참여 학생</span>
          <strong className={s.infoValue}>{availableStudents.length}명</strong>
        </div>
        <div className={s.infoDivider} />
        <div className={s.infoItem}>
          <span className={s.infoLabel}>모둠당 인원</span>
          <strong className={s.infoValue}>{availableStudents.length > 0 ? perGroupText : '-'}</strong>
        </div>
      </div>

      <button
        className="draw-btn"
        onClick={draw}
        disabled={availableStudents.length === 0}
      >
        🎲 모둠 뽑기!
      </button>

      {historyCount > 0 && (
        <button className={s.resetHistory} onClick={resetPairingHistory}>
          기록 초기화
        </button>
      )}

      <p className={s.desc}>
        {historyCount > 0
          ? '이전 모둠과 겹치지 않도록 배정됩니다'
          : '번호가 한 장씩 공개되며 각 모둠으로 배정됩니다'
        }<br/>
        Create By 임제민 | CSS Power By Claude.ai
      </p>
    </div>
  )
}
