import React from "react"

const DataContext = React.createContext({
    playerData: {} as IObject,
    setPlayerData: (data: IObject) => {},
})

export const DataContextProvider = (props: any) => {
    return (
        <DataContext.Provider value={props}>
            {props.children}
        </DataContext.Provider>
    )
}

export default DataContext
