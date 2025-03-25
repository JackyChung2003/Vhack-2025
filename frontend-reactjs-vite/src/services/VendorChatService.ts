// This service will provide consistent chat data across components
import { create } from 'zustand';

export interface ChatMessage {
    id: number;
    sender: string;
    text: string;
    timestamp: string;
    status?: 'sent' | 'delivered' | 'read';
    transactionProposal?: TransactionProposal;
}

export interface Chat {
    id: number;
    organizationId: number;
    lastMessage: string;
    timestamp: string;
    unread: number;
    online: boolean;
    avatar: string | null;
    messages: ChatMessage[];
}

interface Message {
    id: number;
    text: string;
    timestamp: string;
    fromVendor: boolean;
    transactionProposal?: TransactionProposal;
}

export interface TransactionProposal {
    items: Array<{
        name: string;
        quantity: number;
        price: number;
    }>;
    totalAmount: number;
    status: 'pending' | 'accepted' | 'rejected';
}

interface VendorChatStore {
    chats: Chat[];
    messages: Record<number, Message[]>;
    sendMessage: (chatId: number, text: string) => void;
    sendTransactionProposal: (chatId: number, proposal: Omit<TransactionProposal, 'status'>) => void;
    acceptProposal: (chatId: number, messageId: number) => void;
    rejectProposal: (chatId: number, messageId: number) => void;
    openChat: (organizationId: number) => void;
}

export const useVendorChatStore = create<VendorChatStore>((set) => ({
    chats: [
        {
            id: 1,
            organizationId: 1, // Global Relief
            lastMessage: "We can offer a 10% discount on your next order.",
            timestamp: "2 hours ago",
            unread: 2,
            online: true,
            avatar: null,
            messages: [
                { id: 1, sender: "Vendor", text: "Hello, I'm interested in your water filters.", timestamp: "Yesterday, 2:30 PM", status: 'read' },
                { id: 2, sender: "Vendor", text: "Hi there! We have several models available. What specifications are you looking for?", timestamp: "Yesterday, 3:15 PM", status: 'read' },
                { id: 3, sender: "Vendor", text: "We need filters for our clean water initiative in rural areas.", timestamp: "Yesterday, 3:20 PM", status: 'read' },
                { id: 4, sender: "Vendor", text: "Our Model X200 would be perfect for that. It's designed for rural settings with limited infrastructure.", timestamp: "Yesterday, 3:45 PM", status: 'read' },
                { id: 5, sender: "Vendor", text: "Great! What's the price for 100 units?", timestamp: "Yesterday, 4:00 PM", status: 'read' },
                { id: 6, sender: "Vendor", text: "For 100 units, the regular price would be $5,000, but we can offer a 10% discount on your next order.", timestamp: "2 hours ago", status: 'read' },
                { id: 7, sender: "Vendor", text: "Transaction Proposal", timestamp: "1 hour ago", status: 'read', transactionProposal: {
                    items: [
                        { name: "Water Filter X200", quantity: 100, price: 50 }
                    ],
                    totalAmount: 5000,
                    status: 'pending'
                } },
            ],
        },
        {
            id: 2,
            organizationId: 2, // EduCare
            lastMessage: "The shipment will arrive next Monday.",
            timestamp: "1 day ago",
            unread: 0,
            online: false,
            avatar: null,
            messages: [
                { id: 1, sender: "Vendor", text: "When will our order of school supplies arrive?", timestamp: "2 days ago, 10:15 AM", status: 'read' },
                { id: 2, sender: "Vendor", text: "We're processing your order now. The shipment will arrive next Monday.", timestamp: "1 day ago, 9:30 AM", status: 'read' },
            ],
        },
        {
            id: 3,
            organizationId: 3, // Nature First
            lastMessage: "Thank you for your order!",
            timestamp: "3 days ago",
            unread: 0,
            online: true,
            avatar: null,
            messages: [
                { id: 1, sender: "Vendor", text: "We've received your food packages. Thank you!", timestamp: "3 days ago, 11:45 AM", status: 'read' },
                { id: 2, sender: "Vendor", text: "Thank you for your order! We're glad everything arrived safely.", timestamp: "3 days ago, 12:30 PM", status: 'read' },
            ],
        },
        {
            id: 4,
            organizationId: 4, // Health Alliance
            lastMessage: "I'll prepare a transaction proposal for 80 medical kits.",
            timestamp: "1 week ago",
            unread: 0,
            online: false,
            avatar: null,
            messages: [
                { id: 1, sender: "Health Alliance", text: "Hi, we need medical supplies for our health program.", timestamp: "1 week ago, 2:00 PM", status: 'read' },
                { id: 2, sender: "Vendor", text: "Hello! What specific medical supplies do you need?", timestamp: "1 week ago, 2:05 PM", status: 'read' },
                { id: 3, sender: "Health Alliance", text: "We need medical kits with basic supplies.", timestamp: "1 week ago, 2:10 PM", status: 'read' },
                { id: 4, sender: "Vendor", text: "I can help with that. How many kits do you need?", timestamp: "1 week ago, 2:15 PM", status: 'read' },
                { id: 5, sender: "Health Alliance", text: "We need 80 medical kits.", timestamp: "1 week ago, 2:20 PM", status: 'read' },
                { id: 6, sender: "Vendor", text: "I'll prepare a transaction proposal for 80 medical kits.", timestamp: "1 week ago, 2:25 PM", status: 'read' }
            ],
        },
    ],
    
    messages: {
        1: [
            {
                id: 1,
                text: "Hello, I'm interested in your water filters.",
                timestamp: "Yesterday, 2:30 PM",
                fromVendor: false,
            },
            {
                id: 2,
                text: "Hi there! We have several models available. What specifications are you looking for?",
                timestamp: "Yesterday, 3:15 PM",
                fromVendor: true,
            },
            {
                id: 3,
                text: "We need filters for our clean water initiative in rural areas.",
                timestamp: "Yesterday, 3:20 PM",
                fromVendor: false,
            },
            {
                id: 4,
                text: "Our Model X200 would be perfect for that. It's designed for rural settings with limited infrastructure.",
                timestamp: "Yesterday, 3:45 PM",
                fromVendor: true,
            },
            {
                id: 5,
                text: "Great! What's the price for 100 units?",
                timestamp: "Yesterday, 4:00 PM",
                fromVendor: false,
            },
            {
                id: 6,
                text: "For 100 units, the regular price would be $5,000, but we can offer a 10% discount on your next order.",
                timestamp: "2 hours ago",
                fromVendor: true,
            },
            {
                id: 7,
                text: "Transaction Proposal",
                timestamp: "1 hour ago",
                fromVendor: true,
                transactionProposal: {
                    items: [
                        { name: "Water Filter X200", quantity: 100, price: 50 }
                    ],
                    totalAmount: 5000,
                    status: 'pending'
                }
            },
        ],
        2: [
            {
                id: 1,
                text: "When will our order of school supplies arrive?",
                timestamp: "2 days ago, 10:15 AM",
                fromVendor: false,
            },
            {
                id: 2,
                text: "We're processing your order now. The shipment will arrive next Monday.",
                timestamp: "1 day ago, 9:30 AM",
                fromVendor: true,
            },
        ],
        3: [
            {
                id: 1,
                text: "We've received your food packages. Thank you!",
                timestamp: "3 days ago, 11:45 AM",
                fromVendor: false,
            },
            {
                id: 2,
                text: "Thank you for your order! We're glad everything arrived safely.",
                timestamp: "3 days ago, 12:30 PM",
                fromVendor: true,
            },
        ],
        4: [
            {
                id: 1,
                text: "Hi, we need medical supplies for our health program.",
                timestamp: "1 week ago, 2:00 PM",
                fromVendor: false,
            },
            {
                id: 2,
                text: "Hello! What specific medical supplies do you need?",
                timestamp: "1 week ago, 2:05 PM",
                fromVendor: true,
            },
            {
                id: 3,
                text: "We need medical kits with basic supplies.",
                timestamp: "1 week ago, 2:10 PM",
                fromVendor: false,
            },
            {
                id: 4,
                text: "I can help with that. How many kits do you need?",
                timestamp: "1 week ago, 2:15 PM",
                fromVendor: true,
            },
            {
                id: 5,
                text: "We need 80 medical kits.",
                timestamp: "1 week ago, 2:20 PM",
                fromVendor: false,
            },
            {
                id: 6,
                text: "I'll prepare a transaction proposal for 80 medical kits.",
                timestamp: "1 week ago, 2:25 PM",
                fromVendor: true,
            }
        ],
    },
    
    sendMessage: (chatId, text) => set((state) => {
        // Create a new message
        const newMessage = {
            id: Date.now(),
            text,
            timestamp: "Just now",
            fromVendor: false,
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
    
    sendTransactionProposal: (chatId, proposal) => set((state) => {
        const newMessage: Message = {
            id: Date.now(),
            text: "Transaction Proposal",
            timestamp: "Just now",
            fromVendor: true,
            transactionProposal: { ...proposal, status: 'pending' as const }
        };
        
        const updatedMessages = {
            ...state.messages,
            [chatId]: [...(state.messages[chatId] || []), newMessage],
        };
        
        const updatedChats = state.chats.map(chat => 
            chat.id === chatId 
                ? { ...chat, lastMessage: "Transaction Proposal", timestamp: "Just now", unread: chat.unread + 1 }
                : chat
        );
        
        return { messages: updatedMessages, chats: updatedChats };
    }),
    
    acceptProposal: (chatId, messageId) => set((state) => {
        const updatedMessages = {
            ...state.messages,
            [chatId]: state.messages[chatId].map(msg => 
                msg.id === messageId && msg.transactionProposal
                    ? { ...msg, transactionProposal: { ...msg.transactionProposal, status: 'accepted' as const } }
                    : msg
            ),
        };
        
        return { messages: updatedMessages };
    }),
    
    rejectProposal: (chatId, messageId) => set((state) => {
        const updatedMessages = {
            ...state.messages,
            [chatId]: state.messages[chatId].map(msg => 
                msg.id === messageId && msg.transactionProposal
                    ? { ...msg, transactionProposal: { ...msg.transactionProposal, status: 'rejected' as const } }
                    : msg
            ),
        };
        
        return { messages: updatedMessages };
    }),

    openChat: (organizationId) => {
        // This will be handled by the chat modal component
        // The chat modal will listen to this event and show the appropriate chat
        const event = new CustomEvent('openVendorChat', { detail: { organizationId } });
        window.dispatchEvent(event);
    }
})); 