import React, { useCallback } from "react"
import { faUndo } from "@fortawesome/free-solid-svg-icons"
import {
    Col,
    Dropdown,
    DropdownButton,
    Form,
    InputGroup,
    Row,
} from "react-bootstrap"
import { AutoTextSize } from "auto-text-size"

import {
    inputMaxLength,
    type IKeywordTarget,
} from "src/constant/filterConstants"
import Button from "src/utilities/Button"

import "./style.scss"

export interface IKeywordRowProps {
    keyword: string
    resetKeyword?: () => void
    changeKeyword?: (value: string) => void
    targets?: IKeywordTarget[]
    target?: string
    changeTarget?: (value: string) => void
}

const KeywordRow: React.FC<IKeywordRowProps> = (props) => {
    const {
        keyword,
        resetKeyword,
        changeKeyword,
        targets = [],
        target,
        changeTarget,
    } = props

    const hasTargets = targets.length > 1
    const currentTarget =
        targets.find((item) => item.value === target) ?? targets[0]
    const targetWidth =
        Math.max(0, ...targets.map((item) => item.label.length)) + 3

    const onInputKeyPress = useCallback(
        (event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event?.key === "Enter") {
                // prevent pressing enter cause reload of page
                event.preventDefault()
            }
        },
        [],
    )

    const keywordInput = (
        <Form.Control
            type='input'
            className='keyword-input'
            placeholder={
                currentTarget
                    ? `輸入${currentTarget.label}關鍵字`
                    : "輸入技能關鍵字"
            }
            value={keyword}
            maxLength={inputMaxLength}
            onChange={(e) => changeKeyword?.(e.target.value)}
            onKeyDown={onInputKeyPress}
        />
    )

    return (
        <>
            <Row className='keyword-row'>
                <Col xs={8} md={9} className='keyword-row-title'>
                    <h3>
                        <AutoTextSize maxFontSizePx={26}>
                            關鍵字搜尋
                        </AutoTextSize>
                    </h3>
                </Col>
                <Col xs={4} md={3} className='keyword-row-reset-button'>
                    <Button
                        className={"reset-btn"}
                        icon={faUndo}
                        text={`重置`}
                        onClick={resetKeyword}
                    />
                </Col>
            </Row>
            <Row className='keyword-input-wrapper'>
                <Form>
                    <Form.Group>
                        {hasTargets ? (
                            <InputGroup
                                className='keyword-input-group'
                                style={
                                    {
                                        "--keyword-target-width": `${targetWidth}em`,
                                    } as React.CSSProperties
                                }
                            >
                                <DropdownButton
                                    id='keyword-target-dropdown'
                                    variant='outline-secondary'
                                    title={currentTarget?.label}
                                    onSelect={(eventKey) =>
                                        eventKey && changeTarget?.(eventKey)
                                    }
                                >
                                    {targets.map((item) => (
                                        <Dropdown.Item
                                            key={item.value}
                                            eventKey={item.value}
                                        >
                                            {item.label}
                                        </Dropdown.Item>
                                    ))}
                                </DropdownButton>
                                {keywordInput}
                            </InputGroup>
                        ) : (
                            keywordInput
                        )}
                    </Form.Group>
                </Form>
                <Col xs={12} className='bottom-col' />
            </Row>
        </>
    )
}

export default React.memo(KeywordRow)
