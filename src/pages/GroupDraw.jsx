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

export default function GroupDraw() {
  const { numGroups, availableStudents } = useSettings()
  const { saveGroups } = useDraw()
  const navigate = useNavigate()

  const draw = () => {
    if (availableStudents.length === 0) return
    const shuffled = shuffle(availableStudents)
    const groups = Array.from({ length: numGroups }, () => [])
    shuffled.forEach((student, idx) => {
      groups[idx % numGroups].push(student)
    })
    saveGroups(groups)           // ← Context 변수에 저장
    navigate('/group/result')    // ← state 없이 이동
  }

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

      <p className={s.desc}>
        번호가 한 장씩 공개되며 각 모둠으로 배정됩니다 <br/>
        Create By 임제민 | CSS Power By Claude.ai
      </p>
    </div>
  )
}
