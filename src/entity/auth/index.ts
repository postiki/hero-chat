import {attach, createEffect, createEvent, createStore, sample} from "effector";
import {showModal} from "../modals";
import modalTypes from "../modals/modalTypes";
import {fetchChatsFx} from "../chat";

export interface IAuthParams {
    login: string;
    password: string;
}

export const register = createEvent<IAuthParams>()
export const goToLogin = createEffect(() => showModal(modalTypes.login))
export const goToChat = createEffect(() => showModal(modalTypes.chat))
export const goToAuth = createEffect(() => showModal(''))
export const auth = createEvent<IAuthParams>()

export const logout = createEvent();
export const dropToken = createEffect(() => localStorage.removeItem('authToken'));
sample({
    clock: logout,
    target: [goToLogin, dropToken],
})

export const authenticate = createEvent()
export const $authed = createStore(false)
    .on(authenticate, (_, payload) => payload)
    .reset(logout);


export const setToken = createEvent<string | null>();
export const $token = createStore<string | null>(null)
    .on(setToken, (_, token) => token)
    .reset(logout);


export const authFx = createEffect({
    handler: async (payload: IAuthParams) => {
        return new Promise<string>((resolve, reject) => {
            setTimeout(() => {
                // here we will auth user by login and pass, then got token

                if (payload.login === "test" && payload.password === "password") {
                    const token = "mocked-token";
                    localStorage.setItem('authToken', token);
                    resolve(token);
                } else {
                    reject(new Error("Unauthorized"));
                }
            }, 500);
        });
    },
});

export const registerFx = createEffect({
    handler: async (payload: IAuthParams) => {
        return new Promise<boolean>((resolve) => {
            setTimeout(() => {
                if (payload.login && payload.password) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            }, 500);
        });
    },
});

sample({
    clock: register,
    target: registerFx,
})

sample({
    clock: auth,
    target: authFx,
})

sample({
    clock: registerFx.doneData,
    filter: (success: boolean) => success,
    target: goToLogin
})

sample({
    clock: authFx.doneData,
    filter: (token: string) => token.length > 0,
    target: [setToken, authenticate, goToChat, fetchChatsFx]
})

export const validateToken = createEvent()
export const validateTokenFx = attach({
    source: {
        token: $token,
    },
    async effect({token}) {
        // here we will validate token life cicle
        const tokenRaw = localStorage.getItem("authToken")
        return new Promise<boolean>((resolve) => {
            setTimeout(() => {
                if (tokenRaw === "mocked-token") {
                    resolve(true);
                } else {
                    resolve(false);
                }
            }, 500);
        });
    },
});

sample({
    clock: validateToken,
    target: validateTokenFx,
})

sample({
    clock: validateTokenFx.doneData,
    filter: (isValid: boolean) => isValid,
    target: [authenticate, goToChat, fetchChatsFx],
})


sample({
    clock: validateTokenFx.doneData,
    filter: (isValid: boolean) => !isValid,
    target: goToAuth,
})