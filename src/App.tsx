import React, {useEffect, useState} from 'react';
import {useUnit} from "effector-react";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import {$modal, showModal} from "./entity/modals";
import {$authed, auth} from "./entity/auth";
import modalTypes from "./entity/modals/modalTypes";
import Chat from "./components/Chat/Chat";
import Modal from "./components/ui/modal/Modal";

function oauthSignIn() {
    var oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';

    var form = document.createElement('form');
    form.setAttribute('method', 'GET');
    form.setAttribute('action', oauth2Endpoint);

    // Parameters to pass to OAuth 2.0 endpoint.
    var params = {
        'client_id': process.env.REACT_APP_CLIENT_ID,
        'redirect_uri': `http://localhost:3000/callback`,
        'response_type': 'token',
        'scope': 'https://www.googleapis.com/auth/userinfo.email',
        'include_granted_scopes': 'true',
        'state': 'pass-through value'
    };

    for (var p in params) {
        var input = document.createElement('input');
        input.setAttribute('type', 'hidden');
        input.setAttribute('name', p);
        // @ts-ignore
        input.setAttribute('value', params[p]);
        form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit();
}

const App: React.FC = () => {
    const modal = useUnit($modal);
    const authed = useUnit($authed);

    const handleOAuthLogin = () => {
        oauthSignIn()
    };

    const [accessToken, setAccessToken] = useState<string>('');

    useEffect(() => {
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.substring(1));
        const token = params.get('access_token');
        if (token) {
            setAccessToken(token);
            auth({type: 'google'})
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
    }, []);

    if (modal === modalTypes.login) {
        return <Login/>
    }
    if (modal === modalTypes.register) {
        return <Register/>
    }

    if (!authed) {
        return (
            <Modal>
                <h1 className="text-center text-2xl font-bold mt-4">Auth App</h1>
                <div className="flex flex-col items-center gap-2 mt-4">
                    <button
                        onClick={() => showModal(modalTypes.login)}
                        className="bg-blue-500 text-white px-4 py-2 rounded w-40"
                    >
                        Log In
                    </button>
                    <button
                        onClick={() => showModal(modalTypes.register)}
                        className="bg-blue-500 text-white px-4 py-2 rounded w-40"
                    >
                        Sign Up
                    </button>
                    <button
                        onClick={handleOAuthLogin}
                        className="bg-green-500 text-white px-4 py-2 rounded w-40"
                    >
                        Login with Google
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