import React, { useCallback, useContext } from "react"
import { faUndo } from "@fortawesome/free-solid-svg-icons"
import { Col, Form, Row } from "react-bootstrap"

import { inputMaxLength } from "src/constant/filterConstants"
import Context from "src/utilities/Context/Context"
import Button from "src/utilities/Button"

import "./style.scss"

export interface IKeywordRowProps {}

const KeywordRow: React.FC<IKeywordRowProps> = (props) => {
    const { keyword, resetKeyword, changeKeyword } = useContext(Context)

    const onInputKeyPress = useCallback((event: any) => {
        if (event?.key === "Enter") {
            // prevent pressing enter cause reload of page
            event.preventDefault()
        }
    }, [])

    return (
        <>
            <Row className='keyword-row'>
                <Col xs={12} className='keyword-row-title'>
                    <h3>關鍵字搜尋</h3>
                </Col>
                <Col xs={12} className='keyword-row-reset-button'>
                    <Button
                        className={"reset-btn"}
                        icon={faUndo}
                        text={`重置關鍵字`}
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
                            onChange={(e) => changeKeyword(e.target.value)}
                            onKeyDown={onInputKeyPress}
                        />
                    </Form.Group>
                </Form>
                <Col xs={12} className='my-2' />
            </Row>
        </>
    )
}

export default KeywordRow
