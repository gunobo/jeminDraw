import { createContext, useContext, useState } from 'react'

const SettingsContext = createContext(null)

export function SettingsProvider({ children }) {
  const [totalStudents, setTotalStudents] = useState(16)
  const [numGroups, setNumGroups] = useState(4)
  const [absentInput, setAbsentInput] = useState('')

  const absentNumbers = [...new Set(
    absentInput
      .split(/[,\s]+/)
      .map(n => parseInt(n.trim()))
      .filter(n => !isNaN(n) && n >= 1 && n <= totalStudents)
  )]

  const availableStudents = Array.from({ length: totalStudents }, (_, i) => i + 1)
    .filter(n => !absentNumbers.includes(n))

  return (
    <SettingsContext.Provider value={{
      totalStudents, setTotalStudents,
      numGroups, setNumGroups,
      absentInput, setAbsentInput,
      absentNumbers,
      availableStudents,
    }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => useContext(SettingsContext)
