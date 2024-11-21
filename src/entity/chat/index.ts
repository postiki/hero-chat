import {attach, createEffect, createEvent, createStore, sample} from 'effector';

const generateMockChats = (count: number): IChat[] => {
    return Array.from({length: count}, (_, index) => ({
        id: `${index + 1}`,
        name: `Bot ${index + 1}`,
        avatar: `/bot${index + 1}.png`,
        lastMessage: `This is the last message from Bot ${index + 1}`,
        timestamp: (new Date().getTime() + 60 * 1000 * index).toString(),
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

export const $currentChatMessages = createStore<IMessage[]>([]);
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
                resolve(generateMockMessages(20, Date.now()));
            }, 500);
        });
    }
})

sample({
    clock: setCurrentChat,
    target: fetchCurrentMessages
})

$currentChatMessages.on(fetchCurrentMessages.doneData, (_, messages) => messages)

export const sendMessage = createEvent<string>();
export const sendMessageFx = attach({
    source: {
        currentChat: $currentChat
    },
    async effect({currentChat}, payload) {
        //call api with current chat and payload
        return payload;
    }
})

sample({
    clock: sendMessage,
    target: sendMessageFx,
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

$currentChatMessages
    .on(sendMessage, (state, message) => {
        return [...state, {
            id: (state.length + 1).toString(),
            sender: 'user',
            text: message,
            timestamp: (new Date().getTime()).toString(),
        }]
    }).on(fetchOldMessagesFx.doneData, (state, messages) => {
    return [...state, ...messages]
})