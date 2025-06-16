import React, { useState, useEffect } from "react";
import Link from "next/link"

export default function StickyBar (props) {
  const { sticky_note={} } = props;

  const [show, setShow] = useState("slide-up-sticky d-none");

  const closeSticyBar = () => {
    props.closeSticky();
    setShow("slide-up-sticky d-none");
  }

  useEffect(() => {
    if (props.show === false) {
      setShow("slide-up-sticky d-none");
    } else {
      setShow("");
    }
  }, [show])

  return (
    <div className={`sticky-bar container-fluid ${show}`}>
      <div className="row sticky-container">
          <div className="col-12 d-flex align-items-center">
            <div dangerouslySetInnerHTML={{__html: sticky_note.content}} className="sticky-text"></div>
            {sticky_note.has_button ? <Link href={`${sticky_note.link}`}><button className="sticky-button">{sticky_note.button_text}</button></Link> : ""}
            <img className="pointer ml-auto" onClick={closeSticyBar} width="20" src="/static/images/times.svg" atl="times-image" />
          </div>
      </div>
    </div>
  )

}
