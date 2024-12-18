import React from "react";
import {IChat} from "../../../entity/chat";

interface ChatItemProps {
    chat: IChat,
    selectChat: (chatId: string) => void,
}


const ChatItem: React.FC<ChatItemProps> = ({chat, selectChat}) => {
    const formattedTime = new Date(Number(chat.timestamp)).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });

    return (
        <div
            className="flex items-center p-4 border-b cursor-pointer hover:bg-gray-100"
            onClick={() => selectChat(chat.id)}
        >
            <div
                className="w-12 h-12 rounded-full mr-4"
                style={{
                    backgroundImage: `url(${process.env.REACT_APP_HOST_URL}/logo512.png)`,
                    backgroundSize: '100%'
                }}
            />
            <div className="flex-1 overflow-hidden">
                <div className="font-semibold truncate">{chat.name}</div>
                <div className="text-gray-600 text-sm whitespace-normal break-words line-clamp-2">
                    {chat.lastMessage}
                </div>
            </div>
            <div className="text-gray-500 text-xs whitespace-nowrap ml-4">
                {formattedTime}
            </div>
        </div>
    );
};

export default ChatItem;