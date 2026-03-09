import { Outlet, NavLink } from 'react-router-dom'
import { useSettings } from './SettingsContext'
import s from './css/Layout.module.css'

export default function Layout() {
  const {
    totalStudents, setTotalStudents,
    numGroups, setNumGroups,
    absentInput, setAbsentInput,
    absentNumbers,
    availableStudents,
  } = useSettings()

  const clamp = (val, min, max) => Math.max(min, Math.min(max, val))

  return (
    <div className={s.app}>

      {/* ── Top Bar: Brand + Tabs ── */}
      <header className={s.topBar}>
        <div className={s.brand}>
          <span className={s.headerIcon}>🎲</span>
          <div className={s.brandText}>
            <h1>뽑기</h1>
            <p>학급 모둠 &amp; 학생 뽑기</p>
          </div>
        </div>
        <nav className={s.tabs}>
          <NavLink to="/group"      className={({ isActive }) => `${s.tab}${isActive ? ` ${s.active}` : ''}`}>👥 모둠</NavLink>
          <NavLink to="/individual" className={({ isActive }) => `${s.tab}${isActive ? ` ${s.active}` : ''}`}>🎯 개인</NavLink>
          <NavLink to="/order"      className={({ isActive }) => `${s.tab}${isActive ? ` ${s.active}` : ''}`}>📋 순서</NavLink>
        </nav>
      </header>

      {/* ── Settings Bar ── */}
      <div className={s.settingsBar}>

        <div className={s.settingGroup}>
          <span className={s.settingLabel}>전체 학생</span>
          <div className={s.numberInput}>
            <button className={s.numBtn} onClick={() => setTotalStudents(clamp(totalStudents - 1, 1, 100))}>−</button>
            <input
              type="number"
              value={totalStudents}
              min="1" max="100"
              onChange={e => setTotalStudents(clamp(parseInt(e.target.value) || 1, 1, 100))}
            />
            <button className={s.numBtn} onClick={() => setTotalStudents(clamp(totalStudents + 1, 1, 100))}>+</button>
          </div>
        </div>

        <div className={s.vDivider} />

        <div className={s.settingGroup}>
          <span className={s.settingLabel}>모둠 수</span>
          <div className={s.numberInput}>
            <button className={s.numBtn} onClick={() => setNumGroups(clamp(numGroups - 1, 2, 10))}>−</button>
            <input
              type="number"
              value={numGroups}
              min="2" max="10"
              onChange={e => setNumGroups(clamp(parseInt(e.target.value) || 2, 2, 10))}
            />
            <button className={s.numBtn} onClick={() => setNumGroups(clamp(numGroups + 1, 2, 10))}>+</button>
          </div>
        </div>

        <div className={s.vDivider} />

        <div className={`${s.settingGroup} ${s.absentGroup}`}>
          <span className={s.settingLabel}>결석 번호 <span className={s.hint}>(쉼표·공백)</span></span>
          <input
            type="text"
            className={s.absentInput}
            placeholder="예: 3 7 15"
            value={absentInput}
            onChange={e => setAbsentInput(e.target.value)}
          />
        </div>

        <div className={s.vDivider} />

        <div className={s.statsGroup}>
          <div className={s.statItem}>
            <span className={s.statNum}>{totalStudents}</span>
            <span className={s.statLbl}>전체</span>
          </div>
          <span className={s.statSep}>·</span>
          <div className={s.statItem}>
            <span className={`${s.statNum} ${s.cyan}`}>{availableStudents.length}</span>
            <span className={s.statLbl}>참여</span>
          </div>
          <span className={s.statSep}>·</span>
          <div className={s.statItem}>
            <span className={`${s.statNum} ${s.red}`}>{absentNumbers.length}</span>
            <span className={s.statLbl}>결석</span>
          </div>
        </div>

      </div>

      {/* ── Absent Tags ── */}
      {absentNumbers.length > 0 && (
        <div className={s.absentTags}>
          {absentNumbers.sort((a, b) => a - b).map(n => (
            <span key={n} className={s.absentTag}>{n}번</span>
          ))}
        </div>
      )}

      {/* ── Page Content ── */}
      <div className={s.content}>
        <Outlet />
      </div>

    </div>
  )
}
