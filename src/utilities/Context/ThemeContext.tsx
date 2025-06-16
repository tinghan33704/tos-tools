import React from "react"

const ThemeContext = React.createContext({
    theme: "",
    changeTheme: () => {},
})

export const ThemeContextProvider = (props: any) => {
    return (
        <ThemeContext.Provider value={props}>
            {props.children}
        </ThemeContext.Provider>
    )
}

export default ThemeContext
