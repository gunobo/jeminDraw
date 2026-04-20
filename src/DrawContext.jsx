import { createContext, useContext, useState } from 'react'

/* ─────────────────────────────────────────────────
   DrawContext
   뽑기 결과를 전역 변수로 저장 · 관리합니다.
   Router navigation state 대신 Context를 사용하므로
   페이지를 이동해도 결과가 유지됩니다.
───────────────────────────────────────────────── */
const DrawContext = createContext(null)

export function DrawProvider({ children }) {
  // ── 모둠 뽑기 결과 ──────────────────────────────
  const [groups, setGroups] = useState([])          // [[1,5,9], [2,6,10], ...]

  // ── 순서 뽑기 결과 ──────────────────────────────
  const [orderResult, setOrderResult] = useState([]) // [7, 3, 12, ...]

  // ── 모둠 페어링 히스토리 ─────────────────────────
  const [pairingHistory, setPairingHistory] = useState({}) // {"1-3": 2, ...} 같은 모둠 횟수

  // ── 개인 뽑기 히스토리 ───────────────────────────
  const [individualHistory, setIndividualHistory] = useState([]) // [5, 12, 3, ...]

  /** 모둠 뽑기 결과 저장 */
  const saveGroups = (newGroups) => setGroups(newGroups)

  /** 모둠 페어링 기록 갱신 */
  const updatePairingHistory = (groups) => {
    setPairingHistory(prev => {
      const next = { ...prev }
      for (const group of groups) {
        for (let i = 0; i < group.length; i++) {
          for (let j = i + 1; j < group.length; j++) {
            const key = group[i] < group[j]
              ? `${group[i]}-${group[j]}`
              : `${group[j]}-${group[i]}`
            next[key] = (next[key] || 0) + 1
          }
        }
      }
      return next
    })
  }

  /** 페어링 히스토리 초기화 */
  const resetPairingHistory = () => setPairingHistory({})

  /** 순서 뽑기 결과 저장 */
  const saveOrder = (result) => setOrderResult(result)

  /** 개인 뽑기 기록 추가 */
  const addIndividual = (num) =>
    setIndividualHistory(prev => [num, ...prev].slice(0, 30))

  /** 개인 뽑기 기록 초기화 */
  const resetIndividual = () => setIndividualHistory([])

  return (
    <DrawContext.Provider value={{
      /* 모둠 */
      groups,
      saveGroups,
      pairingHistory,
      updatePairingHistory,
      resetPairingHistory,
      /* 순서 */
      orderResult,
      saveOrder,
      /* 개인 */
      individualHistory,
      addIndividual,
      resetIndividual,
    }}>
      {children}
    </DrawContext.Provider>
  )
}

/** DrawContext 사용 훅 */
export function useDraw() {
  const ctx = useContext(DrawContext)
  if (!ctx) throw new Error('useDraw must be used inside <DrawProvider>')
  return ctx
}
