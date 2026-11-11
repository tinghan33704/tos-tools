import React, { useCallback } from "react"
import { Tab, Tabs } from "react-bootstrap"

import "./style.scss"

export interface IFilterTab {
    key: string
    title: string
    count?: number
    content: React.ReactNode
}

export interface IFilterTabsProps {
    id: string
    tabs: IFilterTab[]
    defaultActiveKey?: string
}

const FilterTabs: React.FC<IFilterTabsProps> = (props) => {
    const { id, tabs, defaultActiveKey } = props

    const onSelect = useCallback(() => {
        window.scrollTo({ top: 0 })
    }, [])

    return (
        <div className='filter-tabs'>
            <Tabs
                id={id}
                variant='pills'
                justify
                mountOnEnter
                defaultActiveKey={defaultActiveKey ?? tabs[0]?.key}
                className='filter-tabs-nav'
                onSelect={onSelect}
            >
                {tabs.map(({ key, title, count, content }) => (
                    <Tab
                        key={key}
                        eventKey={key}
                        title={
                            <span className='filter-tabs-title'>
                                {title}
                                {!!count && (
                                    <span className='filter-tabs-count'>
                                        {count}
                                    </span>
                                )}
                            </span>
                        }
                    >
                        {content}
                    </Tab>
                ))}
            </Tabs>
        </div>
    )
}

export default FilterTabs
