import React from "react";
import style from "./style.module.css";

type InputProps = {
  prefix?: React.ReactNode;
  postfix?: React.ReactNode;
  innerClass?: string;
} & JSX.IntrinsicElements["input"];
export const Input = ({
  prefix,
  postfix,
  className,
  innerClass,
  ...props
}: InputProps) => {
  return (
    <label
      className={[
        style.wrapper,
        props.disabled ? style.disabled : "",
        prefix ? style["with-prefix"] : "",
        postfix ? style["with-postfix"] : "",
        className || "",
      ].join(" ")}
    >
      {prefix ? <div className={style.prefix}>{prefix}</div> : null}
      <input {...props} className={`${style.input} ${innerClass || ""}`} />
      {postfix ? <div className={style.postfix}>{postfix}</div> : null}
    </label>
  );
};
