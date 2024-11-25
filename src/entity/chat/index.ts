import {attach, combine, createEffect, createEvent, createStore, sample} from 'effector';
import {OpenAI} from 'openai';

const generateMockChats = (count: number): IChat[] => {
    return Array.from({length: count}, (_, index) => ({
        id: `${index + 1}`,
        name: `Bot ${index + 1}`,
        avatar: `/bot${index + 1}.png`,
        lastMessage: `chat created ${index + 1}`,
        timestamp: (new Date().getTime() - 60 * 1000 * index).toString(),
    }));
};

export interface IChat {
    id: string;
    avatar: string;
    name: string;
    lastMessage: string;
    timestamp: string;
}

export const $chats = createStore<IChat[]>([])
export const fetchChatsFx = createEffect({
    handler: async () => {
        const token = localStorage.getItem('authToken');
        if (!token || token !== 'mocked-token') {
            throw new Error('Invalid token');
        }

        return new Promise<IChat[]>((resolve) => {
            setTimeout(() => {
                resolve(generateMockChats(10));
            }, 500);
        });
    },
});
$chats.on(fetchChatsFx.doneData, (_, chats) => chats);

export const setCurrentChat = createEvent<string | null>();
export const closeCurrentChat = createEvent();
export const $currentChat = createStore<string | null>(null)
    .on(setCurrentChat, (_, chatId) => chatId)
    .on(closeCurrentChat, () => null);

interface IMessage {
    id: string;
    sender: 'bot' | 'user';
    text: string;
    timestamp: string;
}

interface IMessageStore {
    [key: string]: IMessage[];
}

export const $messagesStore = createStore<IMessageStore>({})
export const $currentChatMessages = combine(
    $currentChat,
    $messagesStore,
    (currentChat, messagesStore) => {
        if (!currentChat) {
            return [];
        }
        return messagesStore[currentChat] || [];
    }
);
const generateMockMessages = (count: number, startingTimestamp: number, startingIndex: number = 0): IMessage[] => {
    return Array.from({length: count}, (_, index) => ({
        id: `${startingIndex + index + 1}`,
        sender: index % 2 === 0 ? 'bot' : 'user', // Alternate between 'bot' and 'user'
        text: `This is ${startingIndex > 0 ? "an old message" : "a message"}`,
        timestamp: (startingTimestamp - 60 * 1000 * (count - index)).toString(), // Generate older timestamps
    }));
};
export const fetchCurrentMessages = attach({
    source: {
        currentChat: $currentChat,
    },
    async effect({currentChat}, payload) {
        return new Promise<IMessage[]>((resolve) => {
            setTimeout(() => {
                resolve([])
            }, 500);
        });
    }
})

sample({
    clock: setCurrentChat,
    target: fetchCurrentMessages
})

// $currentChatMessages.on(fetchCurrentMessages.doneData, (_, messages) => messages)

export const sendMessage = createEvent<string>();
export const sendMessageFx = attach({
    source: {
        currentChat: $currentChat
    },
    async effect({currentChat}, payload) {
        return new Promise((resolve) => {
            resolve({payload, currentChat})
        })
    }
})
export const updateMessageStore = createEvent<{ chatId: string, message: string }>()
sample({
    clock: sendMessage,
    source: {
        currentChat: $currentChat
    },
    fn: ({currentChat}, payload) => {
        return {message: payload, chatId: currentChat};
    },
    target: [sendMessageFx, updateMessageStore],
})


export const mockedResponseForMessage = attach({
    source: {
        messages: $currentChatMessages,
        chatId: $currentChat,
    },
    async effect({messages, chatId}) {
        if(!chatId){
            throw new Error('No chatId provided');
        }
        const lastUserMessage = messages[messages.length - 1];
        try {
            const openai = new OpenAI({apiKey: process.env.REACT_APP_OPENAI_KEY, dangerouslyAllowBrowser: true});
            const completion = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "user",
                        content: lastUserMessage.text
                    }
                ],
            });

            if(!completion.choices[0].message.content){
                throw new Error('no message content provided');
            }

            return {message: completion.choices[0].message.content, chatId: chatId}
        } catch (error) {
            console.log(error)
            return {message: '', chatId: chatId}
        }
    }
})
sample({
    clock: updateMessageStore,
    target: mockedResponseForMessage
})

export const fetchOldMessages = createEvent()
export const fetchOldMessagesFx = attach({
    source: {
        currentChat: $currentChat,
        currentChatMessages: $currentChatMessages
    },
    async effect({currentChat, currentChatMessages}) {
        return new Promise<IMessage[]>((resolve) => {
            setTimeout(() => {
                const oldestMessage = currentChatMessages.reduce((oldest, message) => {
                    return Number(message.timestamp) < Number(oldest.timestamp) ? message : oldest;
                }, currentChatMessages[0]);

                const oldestTimestamp = Number(oldestMessage.timestamp);
                resolve(generateMockMessages(20, oldestTimestamp, currentChatMessages.length).sort((a, b) => Number(a.timestamp) - Number(b.timestamp)));
            }, 500);
        });
    }
});


sample({
    clock: fetchOldMessages,
    target: fetchOldMessagesFx
})

$messagesStore
    .on(updateMessageStore, (state, payload) => {
        // console.log('$messagesStore on updateMessageStore', payload, state)
        if (!payload.chatId) {
            console.error('chatId is undefined or null');
            return state;
        }

        const currentMessages = state[payload.chatId] || [];

        const newState: IMessageStore = {
            ...state,
            [payload.chatId]: [
                ...currentMessages,
                {
                    id: (currentMessages.length + 1).toString(),
                    sender: 'user',
                    text: payload.message,
                    timestamp: (new Date().getTime()).toString()
                }
            ]
        };

        return newState;
    })
    .on(mockedResponseForMessage.doneData, (state, payload) => {
        // console.log('$messagesStore on mockedResponseForMessage', payload, state)
        if (!payload || !payload.chatId || !payload.message) {
            console.error('chatId is undefined or null');
            return state;
        }

        const currentMessages = state[payload.chatId] || [];

        const newState: IMessageStore = {
            ...state,
            [payload.chatId]: [
                ...currentMessages,
                {
                    id: (currentMessages.length + 1).toString(),
                    sender: 'bot',
                    text: payload.message,
                    timestamp: (new Date().getTime()).toString()
                }
            ]
        };

        return newState;
    })
// .on(fetchOldMessagesFx.doneData, (state, messages) => {
// return [...state, ...messages]
// })

const updateChatLastMessage = createEvent<{chatId: string, message: string}>()
sample({
    clock: [updateMessageStore],
    target: updateChatLastMessage,
})
sample({
    clock: mockedResponseForMessage.doneData,
    filter: (payload) => payload.message.length > 0,
    target: updateChatLastMessage,
})
$chats.on(updateChatLastMessage, (state, payload)=>{
    const newState = state.map(chat => {
        if (chat.id === payload.chatId) {
            return {
                ...chat,
                lastMessage: payload.message,
                timestamp: Date.now().toString()
            };
        }
        return chat;
    });
    return newState
})
