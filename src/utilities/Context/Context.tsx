import React from "react"

const Context = React.createContext({
    toolId: "",
    toggleButton: (type: string, text: string, value: boolean) => {},
    resetButton: (type: string) => {},
    resetAll: () => {},
    functions: [],
    skillFunctions: [],
    armedFunctions: [],
    keyword: "",
    changeKeyword: (value: string) => {},
    resetKeyword: () => {},
    tag: [],
    attribute: [],
    race: [],
    star: [],
    charge: [],
    genre: [],
    activate: [],
    mode: [],
    extraTag: [],
    version: [],
    sortBy: "",
    changeSortBy: (value: string) => {},
    andOr: "",
    changeAndOr: (value: string) => {},
    startFilter: () => {},

    // setting
    showNoData: false,
    toggleShowNoData: () => {},
    useInventory: false,
    toggleUseInventory: () => {},
    resultView: "table",
    toggleResultView: () => {},
    category: "all",
    toggleCategory: () => {},
    sort: "default",
    toggleSort: () => {},
})

export const ContextProvider = (props: any) => {
    return (
        <Context.Provider value={{ ...props }}>
            {props.children}
        </Context.Provider>
    )
}

export default Context
