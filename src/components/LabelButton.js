import React from "react";

export default function LabelButton(props) {
  return <button onClick={() => props.onClick()}>{props.labelName}</button>;
}
