import React from 'react';

interface ModalProps {
    onClose?: () => void;
    handleBack?: () => void;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({onClose, handleBack, children}) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white h-full w-full flex flex-col justify-between p-8 relative">
                {handleBack && (
                    <button
                        onClick={handleBack}
                        className="absolute top-2 left-8 text-gray-600 text-2xl"
                    >
                        &larr;
                    </button>
                )}
                {onClose && (
                    <button
                        onClick={onClose}
                        className="absolute top-2 right-2 text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded flex justify-center items-center"
                        style={{width: '40px', height: '40px'}}
                    >
                        &times;
                    </button>
                )}
                <div className="flex-grow flex flex-col">
                    {children}
                </div>
            </div>
        </div>
    );
};


export default Modal;
