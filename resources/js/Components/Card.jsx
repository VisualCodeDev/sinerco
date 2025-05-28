import React from "react";

const Card = (props) => {
    const { title, form = false, headerSticky = false } = props;
    return (
        <div
            className={`rounded-xl overflow-hidden border shadow-sm relative ${
                form && "h-[50vh] overflow-y-scroll"
            }`}
        >
            <div className="">{props.children}</div>
        </div>
    );
};

Card.Header = (props) => {
    return (
        <div
            className={`${props.className && props.className} w-full p-5 ${
                props.headerSticky && "sticky top-0 left-0"
            }`}
        >
            <h2 className="text-xl font-bold">{props.children}</h2>
        </div>
    );
};

Card.Body = (props) => {
    return <div className="p-5 bg-white">{props.children}</div>;
};

Card.Footer = (props) => {
    return (
        <div className="bg-slate-100 p-5 sticky bottom-0 left-0 w-full">
            {props.children}
        </div>
    );
};

export default Card;
