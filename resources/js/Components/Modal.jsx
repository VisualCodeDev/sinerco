import React from "react";

const Modal = (props) => {
    const {
        size,
        title,
        form = false,
        headerSticky = false,
        handleCloseModal,
        showModal,
    } = props;

    let selectedSize = size === 'xl' ? 'w-2/3' : size === 'lg' ? 'w-1/2' : size === 'md' && 'w-1/3'
    
    return (
        <>
            {showModal && (
                <div className={`fixed rounded-xl border shadow-sm top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${selectedSize}`}>
                    <div className="bg-slate-200 w-full p-5 sticky top-0 left-0 flex justify-between">
                        <div className="w-full">
                            <h2 className="text-xl font-bold">{title}</h2>
                        </div>
                        <div className="text-xl font-bold w-fit text-end">
                            <span onClick={handleCloseModal} className="cursor-pointer">🞩</span>
                        </div>
                    </div>
                    <div className="">{props.children}</div>
                </div>
            )}
        </>
    );
};

Modal.Body = (props) => {
    return <div className="p-5 bg-white w-full">{props.children}</div>;
};

Modal.Footer = (props) => {
    return (
        <div className="bg-slate-100 p-5 sticky bottom-0 left-0 w-full">
            {props.children}
        </div>
    );
};

export default Modal;
