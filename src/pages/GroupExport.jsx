import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useDraw } from '../DrawContext'
import s from '../css/GroupExport.module.css'

const GROUP_COLORS = [
  '#f87171', '#34d399', '#60a5fa', '#c084fc',
  '#fb923c', '#22d3ee', '#a78bfa', '#f472b6',
  '#fbbf24', '#86efac',
]

function getDateStr() {
  const now = new Date()
  return `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일`
}

function generateText(groups) {
  let text = `📋 모둠 뽑기 결과\n${getDateStr()}\n`
  text += '─'.repeat(30) + '\n\n'
  groups.forEach((group, idx) => {
    const sorted = [...group].sort((a, b) => a - b)
    text += `${idx + 1}모둠 (${group.length}명): ${sorted.join(', ')}번\n`
  })
  text += '\n' + '─'.repeat(30) + '\n'
  text += `전체 ${groups.reduce((s, g) => s + g.length, 0)}명 / ${groups.length}개 모둠\n`
  return text
}

export default function GroupExport() {
  const { groups } = useDraw()   // ← Context 변수에서 읽기
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  if (groups.length === 0) {
    navigate('/group', { replace: true })
    return null
  }

  /* ── PDF: 깔끔한 팝업 창에서 인쇄 ── */
  const handlePDF = () => {
    const dateStr = getDateStr()
    const totalCount = groups.reduce((sum, g) => sum + g.length, 0)

    const groupsHtml = groups.map((group, idx) => {
      const color = GROUP_COLORS[idx % GROUP_COLORS.length]
      const sorted = [...group].sort((a, b) => a - b)
      const chips = sorted.map(num =>
        `<span class="chip" style="background:${color}">${num}번</span>`
      ).join('')
      return `
        <div class="card" style="border-left:4px solid ${color}">
          <div class="card-head">
            <span class="card-title" style="color:${color}">${idx + 1}모둠</span>
            <span class="card-count">${group.length}명</span>
          </div>
          <div class="chips">${chips}</div>
        </div>`
    }).join('')

    const cols = Math.min(groups.length, 2)

    const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <title>모둠 뽑기 결과 · ${dateStr}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif;
      background: #fff;
      color: #111;
      padding: 32px 36px;
    }
    .header { margin-bottom: 28px; padding-bottom: 18px; border-bottom: 2px solid #e5e7eb; }
    .title  { font-size: 1.5rem; font-weight: 800; color: #111; margin-bottom: 8px; }
    .meta   { display: flex; gap: 18px; font-size: 0.82rem; color: #6b7280; }
    .grid   {
      display: grid;
      grid-template-columns: repeat(${cols}, 1fr);
      gap: 14px;
    }
    .card {
      border: 1px solid #e5e7eb;
      border-radius: 14px;
      padding: 16px 18px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .card-head {
      display: flex; align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }
    .card-title { font-size: 1rem; font-weight: 800; }
    .card-count {
      font-size: 0.7rem; font-weight: 600; color: #9ca3af;
      background: #f3f4f6; border-radius: 6px; padding: 2px 8px;
    }
    .chips { display: flex; flex-wrap: wrap; gap: 5px; }
    .chip  {
      color: #fff; border-radius: 7px; padding: 4px 11px;
      font-size: 0.83rem; font-weight: 700;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .footer {
      margin-top: 28px; padding-top: 14px; border-top: 1px solid #e5e7eb;
      font-size: 0.72rem; color: #9ca3af; text-align: center;
    }
    @media print {
      body { padding: 16px 20px; }
      @page { margin: 16mm 14mm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">📋 모둠 뽑기 결과</div>
    <div class="meta">
      <span>📅 ${dateStr}</span>
      <span>👥 전체 ${totalCount}명</span>
      <span>🗂️ ${groups.length}개 모둠</span>
    </div>
  </div>
  <div class="grid">${groupsHtml}</div>
  <div class="footer">뽑기 결과 · ${dateStr}</div>
  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 200);
    };
  </script>
</body>
</html>`

    const win = window.open('', '_blank', 'width=820,height=700')
    if (!win) { alert('팝업이 차단되었습니다. 팝업 허용 후 다시 시도하세요.'); return }
    win.document.write(html)
    win.document.close()
  }

  /* ── HWP 호환 TXT 다운로드 ── */
  const handleHWP = () => {
    const text = generateText(groups)
    const blob = new Blob(['\uFEFF' + text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `모둠뽑기결과_${getDateStr().replace(/[년월일 ]/g, '_').replace(/_$/,'')}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  /* ── Google Docs용 클립보드 복사 ── */
  const handleDocs = () => {
    const text = generateText(groups)
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  return (
    <div className={s.wrapper}>

      {/* ── 액션 버튼 (화면 전용, 인쇄 시 숨김) ── */}
      <div className={s.toolbar}>
        <button className={s.backBtn} onClick={() => navigate(-2)}>← 돌아가기</button>
        <div className={s.actions}>
          <button className={`${s.actionBtn} ${s.pdf}`} onClick={handlePDF}>
            <span className={s.btnIcon}>📄</span>
            PDF 저장
          </button>
          <button className={`${s.actionBtn} ${s.hwp}`} onClick={handleHWP}>
            <span className={s.btnIcon}>📝</span>
            HWP / TXT
          </button>
          <button className={`${s.actionBtn} ${s.docs} ${copied ? s.done : ''}`} onClick={handleDocs}>
            <span className={s.btnIcon}>{copied ? '✅' : '📋'}</span>
            {copied ? '복사됨!' : 'Docs 복사'}
          </button>
        </div>
      </div>

      {/* ── 결과지 (화면 + 인쇄 모두 사용) ── */}
      <div className={s.sheet} id="print-sheet">

        <div className={s.sheetHeader}>
          <div className={s.sheetTitle}>모둠 뽑기 결과</div>
          <div className={s.sheetMeta}>
            <span>📅 {getDateStr()}</span>
            <span>👥 전체 {groups.reduce((sum, g) => sum + g.length, 0)}명</span>
            <span>🗂️ {groups.length}개 모둠</span>
          </div>
        </div>

        <div className={s.groupsGrid} style={{ '--cols': Math.min(groups.length, 2) }}>
          {groups.map((group, idx) => {
            const color = GROUP_COLORS[idx % GROUP_COLORS.length]
            const sorted = [...group].sort((a, b) => a - b)
            return (
              <div key={idx} className={s.groupCard} style={{ '--c': color }}>
                <div className={s.groupHead}>
                  <span className={s.groupNum}>{idx + 1}모둠</span>
                  <span className={s.groupCount}>{group.length}명</span>
                </div>
                <div className={s.memberList}>
                  {sorted.map(num => (
                    <span key={num} className={s.memberChip} style={{ background: color }}>
                      {num}번
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <div className={s.sheetFooter}>
          뽑기 결과 · {getDateStr()}
        </div>
      </div>

    </div>
  )
}
