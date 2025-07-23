import React, { useRef, useState, useCallback, useContext } from "react"
import { Col, Form, Modal, Nav, Row, Tab } from "react-bootstrap"
import { faCheck, faDownload, faTimes } from "@fortawesome/free-solid-svg-icons"

import { uidMaxLength, veriMaxLength } from "src/constant/filterConstants"
import { fetchPlayerData, setUrlParams } from "src/utilities/utils"
import Context from "src/utilities/Context/Context"
import DataContext from "src/utilities/Context/DataContext"
import Icon from "src/utilities/Icon"
import Button from "src/utilities/Button"

import "./style.scss"

export interface IUserDataModalProps {
    open: boolean
    onClose: () => void
}

const UserDataModal: React.FC<IUserDataModalProps> = (props) => {
    const dataContext = useContext(DataContext)
    const { toolId } = useContext(Context)
    const { playerData, setPlayerData } = dataContext
    const { open, onClose } = props
    const ref = useRef(null)

    const [action, setAction] = useState<string>("import")
    const [uid, setUid] = useState<string>("")
    const [veri, setVeri] = useState<string>("")
    const [inputDisabled, setInputDisabled] = useState<boolean>(false)
    const [dataStatus, setDataStatus] = useState<IObject>({})

    const onCloseModal = useCallback(() => {
        setAction("import")
        setUid("")
        setVeri("")
        setInputDisabled(false)
        setDataStatus({})

        onClose()
    }, [onClose])

    const onChangeDataStatus = useCallback((status: string, text: string) => {
        setDataStatus({
            status: status,
            text: text,
        })
    }, [])

    const resetPanel = useCallback(
        (selectedTab: string | null) => {
            if (selectedTab !== action) {
                setUid("")
                setVeri("")
                setInputDisabled(false)
                setDataStatus({})
            }
        },
        [action]
    )

    const importData = useCallback(async () => {
        setPlayerData({})

        const data: IObject | null = await fetchPlayerData(
            uid,
            veri,
            action,
            setInputDisabled,
            onChangeDataStatus
        )

        if (data) {
            setPlayerData(data)

            if (toolId === "backpack-viewer") {
                setUrlParams({ uid })
            }
        }
    }, [action, onChangeDataStatus, setPlayerData, toolId, uid, veri])

    const saveBackpack = useCallback(() => {
        try {
            setInputDisabled(true)
            localStorage.setItem("PLAYER_DATA", JSON.stringify(playerData))
            setDataStatus({
                status: "saved",
                text: "儲存背包完成",
            })
        } catch (e) {
            console.error(e)

            setDataStatus({
                status: "error",
                text: "無法儲存背包",
            })
        } finally {
            setInputDisabled(false)
        }
    }, [playerData])

    const onChangeUid = useCallback((uid: string) => {
        setUid(uid)
    }, [])

    const onChangeVeri = useCallback((veri: string) => {
        setVeri(veri)
    }, [])

    const onInputKeyPress = useCallback(
        (event: any) => {
            if (event?.key === "Enter") {
                // prevent pressing enter cause reload of page
                event.preventDefault()
                dataStatus.status === "success" ? saveBackpack() : importData()
            }
        },
        [dataStatus.status, importData, saveBackpack]
    )

    const renderSubPanel = useCallback(
        (event: string) => {
            return (
                <div className='sub-panel'>
                    <Form>
                        <Form.Group>
                            <Form.Control
                                type='input'
                                className='input uid-input'
                                placeholder='輸入 UID'
                                value={uid}
                                maxLength={uidMaxLength}
                                onChange={(e) => onChangeUid(e.target.value)}
                                onKeyDown={onInputKeyPress}
                                disabled={inputDisabled}
                            />
                            {event === "update" ? (
                                <Form.Control
                                    type='input'
                                    className='input veri-input'
                                    placeholder='輸入驗證碼'
                                    value={veri}
                                    maxLength={veriMaxLength}
                                    onChange={(e) =>
                                        onChangeVeri(e.target.value)
                                    }
                                    onKeyDown={onInputKeyPress}
                                    disabled={inputDisabled}
                                />
                            ) : (
                                <></>
                            )}
                        </Form.Group>
                    </Form>
                    <Row>
                        <Col xs={12}>
                            {dataStatus.status === "success" ? (
                                <Button
                                    className={"start-btn"}
                                    text={"儲存背包"}
                                    onClick={saveBackpack}
                                    disabled={inputDisabled}
                                />
                            ) : (
                                <Button
                                    className={"start-btn"}
                                    text={"確定"}
                                    onClick={importData}
                                    disabled={inputDisabled}
                                />
                            )}
                        </Col>
                        <Col xs={12}>
                            <div className={`data-status ${dataStatus.status}`}>
                                {dataStatus.status === "success" ||
                                dataStatus.status === "saved" ? (
                                    <Icon icon={faCheck} />
                                ) : dataStatus.status === "error" ? (
                                    <Icon icon={faTimes} />
                                ) : dataStatus.status === "waiting" ? (
                                    <Icon icon={faDownload} />
                                ) : (
                                    <></>
                                )}
                                {dataStatus.text}
                            </div>
                        </Col>
                    </Row>
                </div>
            )
        },
        [
            dataStatus,
            importData,
            inputDisabled,
            onChangeUid,
            onChangeVeri,
            saveBackpack,
            uid,
            veri,
        ]
    )

    const renderPanel = useCallback(() => {
        return (
            <Tab.Container defaultActiveKey='import' onSelect={resetPanel}>
                <Row>
                    <Col xs={12}>
                        <Nav
                            variant='pills'
                            className='tab-btn'
                            fill
                            onSelect={(eventKey) =>
                                setAction(eventKey as string)
                            }
                        >
                            <Nav.Item>
                                <Nav.Link eventKey='import'>匯入背包</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey='update'>更新背包</Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <Tab.Content>
                            <Tab.Pane eventKey='import'>
                                {renderSubPanel("import")}
                            </Tab.Pane>
                            <Tab.Pane eventKey='update'>
                                {renderSubPanel("update")}
                            </Tab.Pane>
                        </Tab.Content>
                    </Col>
                </Row>
            </Tab.Container>
        )
    }, [renderSubPanel, resetPanel])

    return (
        <div ref={ref}>
            <Modal
                show={open}
                onHide={onCloseModal}
                dialogClassName='user-data-modal'
                container={ref}
            >
                <Modal.Header closeButton />
                <Modal.Body>{renderPanel()}</Modal.Body>
            </Modal>
        </div>
    )
}

export default UserDataModal
