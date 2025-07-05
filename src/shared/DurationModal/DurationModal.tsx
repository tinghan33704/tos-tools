import React, { useCallback, useContext, useRef } from "react"
import { Col, Modal, Row } from "react-bootstrap"

import { optionText, skillFunctionString } from "src/constant/filterConstants"
import Context from "src/utilities/Context/Context"
import FilterButton from "../FilterRow/FilterButton"

import "./style.scss"

export interface IDurationModalProps {
    open: boolean
    onClose: () => void
    durationObj: IObject
    toggleDuration: (func: string, duration: string) => void
}

const DurationModal: React.FC<IDurationModalProps> = (props) => {
    const { open, onClose, durationObj, toggleDuration } = props
    const ref = useRef(null)
    const { functions } = useContext(Context)

    const renderOptionRows = useCallback(() => {
        const selectedFunctions = skillFunctionString
            .flat()
            .filter((skill_function: string) => {
                return (
                    !["多重左上狀態", "頭像狀態", "敵身狀態"].includes(
                        skill_function
                    ) && (functions as string[]).includes(skill_function)
                )
            })

        return selectedFunctions.map((func, func_index) => (
            <Row className='option-row' key={`option-row-${func_index}`}>
                <Col xs={12} md={12} lg={4} className='option-text'>
                    {func}
                </Col>
                {optionText.map((option, option_index) => (
                    <FilterButton
                        group='option'
                        index={func_index * optionText.length + option_index}
                        text={option}
                        checked={!!durationObj?.[func]?.includes(option)}
                        callback={(e) => toggleDuration(func, option)}
                        key={`option-${
                            func_index * optionText.length + option_index
                        }`}
                        size={{ xs: 4 }}
                    />
                ))}
            </Row>
        ))
    }, [functions, durationObj, toggleDuration])

    return (
        <div ref={ref}>
            <Modal
                show={open}
                onHide={onClose}
                dialogClassName='option-modal'
                container={ref}
            >
                <Modal.Header closeButton closeVariant={"white"} />
                <Modal.Body>{renderOptionRows()}</Modal.Body>
            </Modal>
        </div>
    )
}

export default DurationModal
