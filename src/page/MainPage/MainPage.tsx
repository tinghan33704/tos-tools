import React from "react"
import { Col, Row } from "react-bootstrap"
import { faDollarSign } from "@fortawesome/free-solid-svg-icons"

import { toolConfig } from "src/constant/toolConfig"
import Image from "src/utilities/Image"
import Icon from "src/utilities/Icon"

import "./style.scss"

interface IMainPageProps {}

const MainPage: React.FC<IMainPageProps> = () => {
    return (
        <div className='tool-container'>
            <Row className='tool-row'>
                {Object.values(toolConfig).map((tool: IObject) => {
                    return (
                        <Col sm={6}>
                            <a href={`./${tool?.toolPath}`}>
                                <div className='tool-btn'>
                                    <div className='icon'>
                                        <Image path={`favicon/${tool?.icon}`} />
                                    </div>
                                    <div className='title'>
                                        {tool?.title?.substring(4)}
                                    </div>
                                </div>
                            </a>
                        </Col>
                    )
                })}
                <Col sm={6}>
                    <div className='author-link'>
                        <a
                            target='_blank'
                            href='https://www.facebook.com/profile.php?id=100070781094266'
                            rel='noreferrer'
                        >
                            <Image path='other/fb_icon' width={50} />
                        </a>
                        <a
                            target='_blank'
                            href='https://home.gamer.com.tw/profile/index.php?&owner=tinghan33704'
                            rel='noreferrer'
                        >
                            <Image path='other/bahamut_icon' width={50} />
                        </a>
                        <a
                            target='_blank'
                            href='https://github.com/tinghan33704'
                            rel='noreferrer'
                        >
                            <Image path='other/github_icon' width={50} />
                        </a>
                        <a
                            target='_blank'
                            href='https://portaly.cc/tinghan33704/support'
                            rel='noreferrer'
                        >
                            <Icon
                                icon={faDollarSign}
                                style={{ fontSize: "50px", color: "#ffce3d" }}
                            />
                        </a>
                    </div>
                </Col>
            </Row>
        </div>
    )
}

export default MainPage
