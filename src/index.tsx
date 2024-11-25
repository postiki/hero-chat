import React from 'react';
import  {createRoot} from 'react-dom/client';
import './index.css';
import App from './App';
import {AuthProvider, TAuthConfig} from "react-oauth2-code-pkce";

const authConfig: TAuthConfig = {
    clientId: 'Ov23lichid7HC12UDt6B',
    authorizationEndpoint: 'https://github.com/login/oauth/authorize',
    logoutEndpoint: 'https://github.com/login/oauth/logout',
    tokenEndpoint: 'http://localhost:5000/api/token',
    redirectUri: 'http://localhost:3000/callback',
    preLogin: () => localStorage.setItem('preLoginPath', window.location.pathname),
    postLogin: () => window.location.replace(localStorage.getItem('preLoginPath') || ''),
    decodeToken: false,
    autoLogin: false,
}

const root = createRoot(document.getElementById('root') as HTMLElement);

root.render(
    <AuthProvider authConfig={authConfig}>
        <App />
    </AuthProvider>
);
