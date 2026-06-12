import React, { useMemo } from "react"

interface DataContextProviderProps {
    playerData: IObject
    setPlayerData: (data: IObject) => void
    children: React.ReactNode
}

const DataContext = React.createContext({
    playerData: {} as IObject,
    setPlayerData: (data: IObject) => {},
})

export const DataContextProvider = ({
    playerData,
    setPlayerData,
    children,
}: DataContextProviderProps) => {
    const value = useMemo(
        () => ({ playerData, setPlayerData }),
        [playerData, setPlayerData],
    )
    return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export default DataContext
