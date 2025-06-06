import React from "react";

const Card = ({ form = false, className = "", children }) => {
    return (
        <div
            className={`rounded-xl overflow-hidden border shadow-sm relative bg-transparent ${
                form ? "h-[50vh] overflow-y-scroll" : ""
            } ${className}`}
            role="region"
            aria-label="Card container"
        >
            {children}
        </div>
    );
};

Card.Header = ({ children, className = "", headerSticky = false, style }) => {
    return (
        <div
            className={`w-full p-5 text-white ${
                headerSticky ? "sticky top-0 left-0 z-10" : ""
            } ${className}`}
            style={{ ...style }}
            role="heading"
            aria-level="2"
        >
            <h2 className="text-xl font-bold">{children}</h2>
        </div>
    );
};

Card.Body = ({ children, className = "" }) => {
    return <div className={`p-5 bg-white ${className}`}>{children}</div>;
};

Card.Footer = ({ children, className = "", footerSticky = true }) => {
    return (
        <div
            className={`bg-primary p-5 w-full ${
                footerSticky ? "sticky bottom-0 left-0 z-10" : ""
            } ${className}`}
        >
            {children}
        </div>
    );
};

export default Card;
