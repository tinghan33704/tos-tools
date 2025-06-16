import React, { useState, useEffect, useCallback } from "react"
import { Routes, Route, Navigate } from "react-router-dom"

import { ThemeContextProvider } from "./utilities/Context/ThemeContext"
import { THEMES } from "./constant/toolConfig"
import { DataContextProvider } from "./utilities/Context/DataContext"
import { getPlayerStoredData } from "./utilities/utils"

import MainPage from "./page/MainPage"
import SkillFilter from "./tools/SkillFilter/SkillFilter"
import TeamSkillFilter from "./tools/TeamSkillFilter"
import LeaderSkillFilter from "./tools/LeaderSkillFilter"
import CraftFilter from "./tools/CraftFilter"
import MonsterSelector from "./tools/MonsterSelector"
import CraftSelector from "./tools/CraftSelector"
import BackpackViewer from "./tools/BackpackViewer"

import "./App.scss"
import "./styles/themes.scss"
import "./styles/colors.scss"

const App = () => {
    const [theme, setTheme] = useState<string>(
        localStorage?.getItem("TOOL_THEME")
            ? THEMES?.includes(localStorage?.getItem("TOOL_THEME") || "")
                ? (localStorage.getItem("TOOL_THEME") as string)
                : THEMES?.[0]
            : THEMES?.[0]
    )
    const [playerData, setPlayerData] = useState<string>(getPlayerStoredData())

    const changeTheme = useCallback(() => {
        const _theme =
            THEMES?.[
                ((THEMES?.findIndex((item) => item === theme) || 0) + 1) %
                    THEMES.length
            ]
        setTheme(_theme)
        localStorage.setItem("TOOL_THEME", _theme)
    }, [theme])

    useEffect(() => {
        const currentTheme = localStorage.getItem("TOOL_THEME")
        if (!currentTheme) localStorage.setItem("TOOL_THEME", THEMES?.[0])
    }, [])

    return (
        <ThemeContextProvider theme={theme} changeTheme={changeTheme}>
            <DataContextProvider
                playerData={playerData}
                setPlayerData={setPlayerData}
            >
                <div className={`App ${theme}-theme`}>
                    <Routes>
                        <Route path=''>
                            <Route index element={<MainPage />} />
                            <Route
                                path='/tos-skill-filter'
                                element={<SkillFilter />}
                            />
                            <Route
                                path='/tos-team-skill-filter'
                                element={<TeamSkillFilter />}
                            />
                            <Route
                                path='/tos-leader-skill-filter'
                                element={<LeaderSkillFilter />}
                            />
                            <Route
                                path='/tos-craft-filter'
                                element={<CraftFilter />}
                            />
                            <Route
                                path='/tos-monster-selector'
                                element={<MonsterSelector />}
                            />
                            <Route
                                path='/tos-craft-selector'
                                element={<CraftSelector />}
                            />
                            <Route
                                path='/tos-backpack-viewer'
                                element={<BackpackViewer />}
                            />
                            <Route
                                path='*'
                                element={<Navigate to='/' replace />}
                            />
                        </Route>
                    </Routes>
                </div>
            </DataContextProvider>
        </ThemeContextProvider>
    )
}

export default App
