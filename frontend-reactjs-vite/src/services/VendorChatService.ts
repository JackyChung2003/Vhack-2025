// This service will provide consistent chat data across components
import { create } from 'zustand';

export interface ChatMessage {
    id: number;
    sender: string;
    text: string;
    timestamp: string;
    status?: 'sent' | 'delivered' | 'read';
}

interface Chat {
    id: number;
    organizationId: number;
    lastMessage: string;
    timestamp: string;
    unread: number;
    online: boolean;
}

interface Message {
    id: number;
    text: string;
    timestamp: string;
    fromVendor: boolean;
    type?: 'text' | 'file';
    fileUrl?: string;
    fileName?: string;
}

interface VendorChatStore {
    chats: Chat[];
    messages: Record<number, Message[]>;
    sendMessage: (chatId: number, text: string, isFromVendor: boolean) => void;
    sendFileMessage: (chatId: number, file: File, isFromVendor: boolean) => void;
    openChat: (organizationId: number) => void;
}

// Mock initial data
const mockChats: Chat[] = [
    {
        id: 1,
        organizationId: 1,
        lastMessage: "Thank you for your help!",
        timestamp: "2 hours ago",
        unread: 0,
        online: true
    },
    {
        id: 2,
        organizationId: 2,
        lastMessage: "When can we expect the delivery?",
        timestamp: "1 day ago",
        unread: 2,
        online: false
    }
];

const mockMessages: Record<number, Message[]> = {
    1: [
        {
            id: 1,
            text: "Hello! We need supplies for our upcoming charity event.",
            timestamp: "2 days ago",
            fromVendor: false,
            type: 'text'
        },
        {
            id: 2,
            text: "I'd be happy to help. What specific supplies do you need?",
            timestamp: "2 days ago",
            fromVendor: true,
            type: 'text'
        },
        {
            id: 3,
            text: "Thank you for your help!",
            timestamp: "2 hours ago",
            fromVendor: false,
            type: 'text'
        }
    ],
    2: [
        {
            id: 1,
            text: "Hi, I'm interested in your educational materials.",
            timestamp: "3 days ago",
            fromVendor: false,
            type: 'text'
        },
        {
            id: 2,
            text: "When can we expect the delivery?",
            timestamp: "1 day ago",
            fromVendor: false,
            type: 'text'
        }
    ]
};

export const useVendorChatStore = create<VendorChatStore>((set) => ({
    chats: mockChats,
    messages: mockMessages,
    
    sendMessage: (chatId, text, isFromVendor) => set((state) => {
        // Create a new message
        const newMessage = {
            id: Date.now(),
            text,
            timestamp: "Just now",
            fromVendor: isFromVendor,
            type: 'text' as const
        };
        
        // Update messages
        const updatedMessages = {
            ...state.messages,
            [chatId]: [...(state.messages[chatId] || []), newMessage],
        };
        
        // Update chat's last message
        const updatedChats = state.chats.map(chat => 
            chat.id === chatId 
                ? { ...chat, lastMessage: text, timestamp: "Just now", unread: chat.unread + 1 }
                : chat
        );
        
        return { messages: updatedMessages, chats: updatedChats };
    }),

    sendFileMessage: (chatId, file, isFromVendor) => set((state) => {
        // Create a temporary URL for the file
        const fileUrl = URL.createObjectURL(file);
        
        // Create a new message
        const newMessage = {
            id: Date.now(),
            text: `Sent a file: ${file.name}`,
            timestamp: "Just now",
            fromVendor: isFromVendor,
            type: 'file' as const,
            fileUrl,
            fileName: file.name
        };
        
        // Update messages
        const updatedMessages = {
            ...state.messages,
            [chatId]: [...(state.messages[chatId] || []), newMessage],
        };
        
        // Update chat's last message
        const updatedChats = state.chats.map(chat => 
            chat.id === chatId 
                ? { ...chat, lastMessage: `Sent a file: ${file.name}`, timestamp: "Just now", unread: chat.unread + 1 }
                : chat
        );
        
        return { messages: updatedMessages, chats: updatedChats };
    }),
    
    openChat: (organizationId) => set((state) => {
        // Check if chat already exists
        const existingChat = state.chats.find(chat => chat.organizationId === organizationId);
        if (existingChat) {
            return state;
        }
        
        // Create new chat
        const newChat: Chat = {
            id: Date.now(),
            organizationId,
            lastMessage: "",
            timestamp: "Just now",
            unread: 0,
            online: Math.random() > 0.5 // Random online status for mock data
        };
        
        return {
            chats: [...state.chats, newChat],
            messages: {
                ...state.messages,
                [newChat.id]: []
            }
        };
    })
})); 