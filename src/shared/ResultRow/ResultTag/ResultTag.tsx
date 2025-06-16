import React, { useCallback } from "react"
import _ from "lodash"
import { Col, Row } from "react-bootstrap"

import "./style.scss"

export interface IResultTagProps {
    searchParam: IObject
}

const ResultTag: React.FC<IResultTagProps> = (props) => {
    const { searchParam } = props
    const {
        functions,
        keyword,
        tag,
        attribute,
        race,
        star,
        charge,
        genre,
        activate,
        mode,
        skillFunctions,
        armedFunctions,
    } = searchParam

    const renderTag = useCallback(
        (type: string, text: string, subText: string = "") => {
            return (
                <Col xs={12} sm={3} className='tag-wrapper'>
                    <div
                        className={`result-tag ${type}-tag`}
                        title={`${text}${
                            subText?.length ? ` (${subText})` : ""
                        }`}
                    >
                        {text}
                        {subText && (
                            <span className='tag-subtext'>({subText})</span>
                        )}
                    </div>
                </Col>
            )
        },
        []
    )

    return (
        <Row className='tag-row'>
            {_.isPlainObject(functions)
                ? Object.entries(functions).map((item: any[]) => {
                      if (item?.[1]?.length) {
                          return item?.[1]?.map((dur: string) =>
                              renderTag("function", item[0], dur)
                          )
                      } else {
                          return renderTag("function", item[0])
                      }
                  })
                : functions?.map((item: string) => renderTag("function", item))}
            {skillFunctions?.map((item: string) =>
                renderTag("skill-function", item)
            )}
            {armedFunctions?.map((item: string) =>
                renderTag("armed-function", item)
            )}
            {keyword?.map((item: string) => renderTag("keyword", item))}
            {mode?.map((item: string) => renderTag("mode", item))}
            {activate?.map((item: string) => renderTag("activate", item))}
            {tag?.map((item: string) => renderTag("tag", item))}
            {attribute?.map((item: string) =>
                renderTag("attribute", `${item}屬性`)
            )}
            {race?.map((item: string) => renderTag("race", item))}
            {star?.map((item: string) => renderTag("star", item))}
            {charge?.map((item: string) => renderTag("charge", item))}
            {genre?.map((item: string) => renderTag("genre", item))}
        </Row>
    )
}

export default ResultTag
