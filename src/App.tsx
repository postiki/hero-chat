import React, {useEffect} from 'react';
import {useUnit} from "effector-react";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import {$modal, showModal} from "./entity/modals";
import {$authed, validateToken} from "./entity/auth";
import modalTypes from "./entity/modals/modalTypes";
import Chat from "./components/Chat/Chat";
import Modal from "./components/ui/modal/Modal";

const App: React.FC = () => {
    const modal = useUnit($modal);
    const auth = useUnit($authed);

    useEffect(() => {
        if (!auth) {
            validateToken()
        }
    }, [auth]);

    if (modal === modalTypes.login) {
        return <Login/>
    }
    if (modal === modalTypes.register) {
        return <Register/>
    }

    if (!auth) {
        return (
            <Modal>
                <h1 className="text-center text-2xl font-bold mt-4">Auth App</h1>
                <div className="flex flex-col items-center gap-2 mt-4">
                    <button
                        onClick={() => showModal(modalTypes.login)}
                        className="bg-blue-500 text-white px-4 py-2 rounded w-40"
                    >
                        Open Login
                    </button>
                    <button
                        onClick={() => showModal(modalTypes.register)}
                        className="bg-blue-500 text-white px-4 py-2 rounded w-40"
                    >
                        Open Register
                    </button>
                </div>
            </Modal>
        )
    }

    return (
        <div className="App">
            {modal === modalTypes.chat && <Chat/>}
        </div>
    );
};

export default App;
