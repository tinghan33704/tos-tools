import React, { useMemo } from "react"

interface LayoutContextProviderProps {
    isTagTab: boolean
    toggleTagTab: () => void
    children: React.ReactNode
}

const LayoutContext = React.createContext({
    isTagTab: true,
    toggleTagTab: () => {},
})

export const LayoutContextProvider = ({
    isTagTab,
    toggleTagTab,
    children,
}: LayoutContextProviderProps) => {
    const value = useMemo(
        () => ({ isTagTab, toggleTagTab }),
        [isTagTab, toggleTagTab],
    )
    return (
        <LayoutContext.Provider value={value}>
            {children}
        </LayoutContext.Provider>
    )
}

export default LayoutContext
