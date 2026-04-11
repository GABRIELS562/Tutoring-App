'use client'

import { createContext, useContext, ReactNode } from 'react'

export type UserData = {
  id: string
  email: string
  name: string
  grade: number | null
  school: string | null
  xp: number
  streakCount: number
  hearts: number
  isPremium: boolean
}

type UserContextType = {
  user: UserData | null
}

const UserContext = createContext<UserContextType>({ user: null })

export function UserProvider({
  children,
  user,
}: {
  children: ReactNode
  user: UserData | null
}) {
  return (
    <UserContext.Provider value={{ user }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
