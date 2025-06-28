import React, { useRef, useState, useCallback } from "react"
import { Col, Form, Modal, Row } from "react-bootstrap"

import { errorAlert, isValidInputString } from "src/utilities/utils"
import Button from "src/utilities/Button"

import "./style.scss"

export interface IInputModalProps {
    open: boolean
    onClose: () => void
    onChangeInput: (input: string) => void
}

const InputModal: React.FC<IInputModalProps> = (props) => {
    const { open, onClose, onChangeInput } = props
    const ref = useRef(null)

    const [inputId, setInputId] = useState("")

    const onCloseModal = useCallback(() => {
        setInputId("")
        onClose()
    }, [onClose])

    const importData = useCallback(() => {
        if (!inputId.length) {
            errorAlert(13)
            return
        } else if (!isValidInputString(inputId)) {
            errorAlert(9)
            return
        }
        onChangeInput(inputId)
        onCloseModal()
    }, [inputId, onChangeInput, onCloseModal])

    const changeInput = useCallback((val: string) => {
        setInputId(
            val
                .split("")
                .filter((ch) => ch === " " || (ch >= "0" && ch <= "9"))
                .join("")
        )
    }, [])

    const renderPanel = useCallback(() => {
        return (
            <>
                <Row>
                    <Col xs={12} className={"title"}>
                        匯入編號
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <Form>
                            <Form.Group>
                                <Form.Control
                                    type='input'
                                    as='textarea'
                                    className='id-input'
                                    placeholder='輸入編號字串'
                                    value={inputId}
                                    onKeyDown={(event) => {
                                        return [
                                            " ",
                                            "0",
                                            "1",
                                            "2",
                                            "3",
                                            "4",
                                            "5",
                                            "6",
                                            "7",
                                            "8",
                                            "9",
                                        ].includes(event?.key)
                                    }}
                                    onChange={(e) =>
                                        changeInput(e.target.value)
                                    }
                                />
                            </Form.Group>
                        </Form>
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <Button
                            className={"start-btn"}
                            text={"匯入"}
                            onClick={importData}
                        />
                    </Col>
                </Row>
            </>
        )
    }, [changeInput, importData, inputId])

    return (
        <div ref={ref}>
            <Modal
                show={open}
                onHide={onCloseModal}
                dialogClassName='input-modal'
                container={ref}
            >
                <Modal.Header closeButton />
                <Modal.Body>{renderPanel()}</Modal.Body>
            </Modal>
        </div>
    )
}

export default InputModal
