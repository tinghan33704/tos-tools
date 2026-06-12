import React, { useCallback } from "react"
import { faUndo } from "@fortawesome/free-solid-svg-icons"
import { Col, Form, Row } from "react-bootstrap"
import { AutoTextSize } from "auto-text-size"

import { inputMaxLength } from "src/constant/filterConstants"
import Button from "src/utilities/Button"

import "./style.scss"

export interface IKeywordRowProps {
    keyword: string
    resetKeyword?: () => void
    changeKeyword?: (value: string) => void
}

const KeywordRow: React.FC<IKeywordRowProps> = (props) => {
    const { keyword, resetKeyword, changeKeyword } = props

    const onInputKeyPress = useCallback(
        (event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event?.key === "Enter") {
                // prevent pressing enter cause reload of page
                event.preventDefault()
            }
        },
        [],
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
                        <Form.Control
                            type='input'
                            className='keyword-input'
                            placeholder='輸入技能關鍵字'
                            value={keyword}
                            maxLength={inputMaxLength}
                            onChange={(e) => changeKeyword?.(e.target.value)}
                            onKeyDown={onInputKeyPress}
                        />
                    </Form.Group>
                </Form>
                <Col xs={12} className='bottom-col' />
            </Row>
        </>
    )
}

export default React.memo(KeywordRow)
