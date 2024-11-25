import React, {useMemo} from 'react';
import ChatItem from "./ChatItem/ChatItem";
import ChatPage from "./ChatPage/ChatPage";
import Modal from "../ui/modal/Modal";
import {useUnit} from "effector-react/effector-react.umd";
import {$chats, $currentChat, setCurrentChat} from "../../entity/chat";
import {logout} from "../../entity/auth";

const Chat: React.FC = () => {
    const currentChat = useUnit($currentChat)
    const chats = useUnit($chats)

    const sortedChats = useMemo(() => {
        return chats.sort((a, b) => {
            const timestampA = Number(a.timestamp);
            const timestampB = Number(b.timestamp);
            return timestampB - timestampA;
        });
    }, [chats]);


    if (currentChat) {
        return <Modal onClose={() => setCurrentChat(null)}><ChatPage chatId={currentChat}/></Modal>;
    }

    return (
        <Modal>
            <div
                className="bg-blue-500 text-white p-4 text-center font-bold sticky top-0 z-10 flex justify-between items-center">
                <span>Chats</span>
                <button
                    onClick={() => logout()}
                    className="text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
                >
                    Logout
                </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(100vh)]">
                {sortedChats
                    .map((chat) => (
                        <ChatItem
                            key={chat.id}
                            chat={chat}
                            selectChat={() => setCurrentChat(chat.id)}
                        />
                    ))}
            </div>
        </Modal>
    );
};

export default Chat;