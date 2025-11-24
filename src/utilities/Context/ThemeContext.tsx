import React from "react"

const ThemeContext = React.createContext({
    theme: "",
    changeTheme: () => {},
    /***** EASTER EGG *****/
    // Click on Josuke's image fix the theme switch
    repairThemeSwitch: () => {},
    /***** EASTER EGG *****/
})

export const ThemeContextProvider = (props: any) => {
    return (
        <ThemeContext.Provider value={props}>
            {props.children}
        </ThemeContext.Provider>
    )
}

export default ThemeContext
