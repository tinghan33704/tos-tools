import React, { useMemo } from "react"

interface ThemeContextProviderProps {
    theme: string
    changeTheme: () => void
    repairThemeSwitch: () => void
    children: React.ReactNode
}

const ThemeContext = React.createContext({
    theme: "",
    changeTheme: () => {},
    /***** EASTER EGG *****/
    // Click on Josuke's image fix the theme switch
    repairThemeSwitch: () => {},
    /***** EASTER EGG *****/
})

export const ThemeContextProvider = ({
    theme,
    changeTheme,
    repairThemeSwitch,
    children,
}: ThemeContextProviderProps) => {
    const value = useMemo(
        () => ({ theme, changeTheme, repairThemeSwitch }),
        [theme, changeTheme, repairThemeSwitch],
    )
    return (
        <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    )
}

export default ThemeContext
