import React, {useState} from 'react';
import {auth} from "../../entity/auth";
import Modal from "../ui/modal/Modal";
import {showModal} from "../../entity/modals";

const Login: React.FC = () => {
    const [login, setLogin] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        auth({login, password})
        console.log(login)
    }

    return (
        <Modal handleBack={() => showModal('')}>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700">Login/email</label>
                    <input
                        type="login"
                        value={login}
                        onChange={(e) => setLogin(e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                        required
                    />
                </div>
                <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded">
                    Login
                </button>
            </form>
        </Modal>
    );
};

export default Login;
