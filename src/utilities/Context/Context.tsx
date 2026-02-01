import React from "react"

const Context = React.createContext({
    toolId: "",
})

export const ContextProvider = (props: any) => {
    return (
        <Context.Provider value={{ ...props }}>
            {props.children}
        </Context.Provider>
    )
}

export default Context
