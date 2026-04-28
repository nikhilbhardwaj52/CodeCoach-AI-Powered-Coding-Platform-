import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Send } from 'lucide-react';

function ChatAi({ problem }) {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hi! I'm your AI coding tutor. How can I help you with this problem?" }
    ]);
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, reset } = useForm();
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const getHint = async () => {
        setIsLoading(true);
        
        // Add thinking indicator
        setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: "🤔 Thinking...",
            isTemp: true
        }]);

        try {
            const response = await axios.post('http://localhost:5000/ai/chat', {
                messages: [{ role: 'user', content: 'Give me a hint for this problem' }],
                title: problem?.title || "Coding Problem",
                description: problem?.description || "",
                testCases: problem?.visibleTestCases || [],
                startCode: problem?.startCode?.[0]?.initialCode || ""
            }, {
                headers: { 'Content-Type': 'application/json' }
            });

            // Remove thinking indicator
            setMessages(prev => prev.filter(m => !m.isTemp));
            
            // Add hint response
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: `💡 ${response.data.message || response.data.text || "Try breaking down the problem into smaller parts!"}`
            }]);
            
        } catch (error) {
            console.error("Hint Error:", error);
            // Remove thinking indicator
            setMessages(prev => prev.filter(m => !m.isTemp));
            
            // Fallback hint
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: "💡 **Hint:** Try to think about what the problem is asking. Look at the input and expected output examples to understand the pattern."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmit = async (data) => {
        const userMessage = data.message;
        
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        reset();
        setIsLoading(true);

        setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: "🤔 Thinking...",
            isTemp: true
        }]);

        try {
            const response = await axios.post('http://localhost:5000/ai/chat', {
                messages: [{ role: 'user', content: userMessage }],
                title: problem?.title || "Coding Problem",
                description: problem?.description || "",
                testCases: problem?.visibleTestCases || [],
                startCode: problem?.startCode?.[0]?.initialCode || ""
            }, {
                headers: { 'Content-Type': 'application/json' }
            });

            setMessages(prev => prev.filter(m => !m.isTemp));
            
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: response.data.message || response.data.text || "Let me help you with that!"
            }]);
            
        } catch (error) {
            console.error("Error:", error);
            setMessages(prev => prev.filter(m => !m.isTemp));
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: "❌ Sorry, I'm having trouble connecting. Please try again."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen max-h-[80vh] min-h-[500px]">
            {/* Hint Button */}
            <div className="p-3 border-b bg-base-100">
                <button 
                    onClick={getHint} 
                    className="btn btn-sm btn-outline btn-primary w-full"
                    disabled={isLoading}
                >
                    {isLoading ? "⏳ Getting Hint..." : "💡 Get AI Hint"}
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-base-200">
                {messages.map((msg, index) => (
                    <div 
                        key={index} 
                        className={`chat ${msg.role === "user" ? "chat-end" : "chat-start"}`}
                    >
                        <div className={`chat-bubble ${msg.role === "user" ? "chat-bubble-primary" : "chat-bubble-secondary"} ${msg.isTemp ? "opacity-50" : ""}`}>
                            {msg.isTemp ? (
                                <div className="flex items-center gap-2">
                                    <span className="loading loading-spinner loading-xs"></span>
                                    {msg.content}
                                </div>
                            ) : (
                                msg.content
                            )}
                        </div>
                    </div>
                ))}
                
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="sticky bottom-0 p-4 bg-base-100 border-t">
                <div className="flex items-center gap-2">
                    <input 
                        placeholder="Ask me anything..." 
                        className="input input-bordered flex-1" 
                        {...register("message", { required: true })}
                        disabled={isLoading}
                    />
                    <button type="submit" className="btn btn-primary btn-sm" disabled={isLoading}>
                        <Send size={18} />
                    </button>
                </div>
                <div className="text-xs text-gray-500 mt-2 text-center">
                    💡 Ask for hints, code review, or debugging help
                </div>
            </form>
        </div>
    );
}

export default ChatAi;