import React, { useMemo } from "react"

interface ContextProviderProps {
    toolId: string
    children: React.ReactNode
}

const Context = React.createContext({
    toolId: "",
})

export const ContextProvider = ({ toolId, children }: ContextProviderProps) => {
    const value = useMemo(() => ({ toolId }), [toolId])
    return <Context.Provider value={value}>{children}</Context.Provider>
}

export default Context
