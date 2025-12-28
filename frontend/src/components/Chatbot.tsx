import { useState } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import axios from 'axios';

export function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string }[]>([
        { role: 'bot', text: 'Hi! I can help you analyze your demand forecasts. Ask me anything about your inventory.' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const toggleOpen = () => setIsOpen(!isOpen);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput('');
        setIsLoading(true);

        try {
            // Get context from localStorage
            const storedData = localStorage.getItem('salesData');
            let context = "";
            if (storedData) {
                // Summarize context to avoid token limits
                const data = JSON.parse(storedData).slice(0, 50); // Limit to top 50 rows for context
                context = JSON.stringify(data);
            }

            const response = await axios.post('http://localhost:8000/api/chat', {
                message: userMsg,
                context: context
            });

            setMessages(prev => [...prev, { role: 'bot', text: response.data.response }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, I encounted an error. Please try again.' }]);
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Button
                onClick={toggleOpen}
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl z-50 animate-in zoom-in duration-300"
            >
                {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
            </Button>

            {isOpen && (
                <div className="fixed bottom-24 right-6 w-[350px] sm:w-[400px] h-[500px] bg-background border rounded-xl shadow-2xl flex flex-col z-50 animate-in slide-in-from-bottom-10 fade-in duration-300 overflow-hidden">
                    <div className="p-4 border-b bg-primary/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Bot className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold">DemandAI Assistant</h3>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={cn("flex gap-2", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                    msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted"
                                )}>
                                    {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                </div>
                                <div className={cn(
                                    "p-3 rounded-lg text-sm max-w-[80%]",
                                    msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                )}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-2">
                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                    <Bot className="h-4 w-4" />
                                </div>
                                <div className="bg-muted p-3 rounded-lg text-sm">
                                    Thinking...
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t bg-background">
                        <div className="flex gap-2">
                            <input
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSend()}
                                placeholder="Ask about predictions..."
                                className="flex-1 bg-muted/50 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            <Button size="icon" onClick={handleSend} disabled={isLoading}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
