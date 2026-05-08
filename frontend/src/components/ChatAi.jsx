import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../utils/axiosClient";
import { Send } from "lucide-react";

function ChatAi({ problem }) {

    const [messages, setMessages] = useState([
        {
            role: "model",
            parts: [
                {
                    text: "👋 Hi! Ask me for hints, debugging help, or DSA explanations."
                }
            ]
        }
    ]);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm();

    const messagesEndRef = useRef(null);

    useEffect(() => {

        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });

    }, [messages]);

    const onSubmit = async (data) => {

        const updatedMessages = [
            ...messages,
            {
                role: "user",
                parts: [{ text: data.message }]
            }
        ];

        setMessages(updatedMessages);

        reset();

        try {

            const response = await axiosClient.post(
                "/ai/chat",
                {
                    messages: updatedMessages,
                    title: problem.title,
                    description: problem.description,
                    testCases: problem.visibleTestCases,
                    startCode: problem.startCode
                }
            );

            setMessages(prev => [
                ...prev,
                {
                    role: "model",
                    parts: [
                        {
                            text: response.data.answer
                        }
                    ]
                }
            ]);

        } catch (error) {

            console.error(
                "API Error:",
                error.response?.data || error
            );

            setMessages(prev => [
                ...prev,
                {
                    role: "model",
                    parts: [
                        {
                            text:
                                error.response?.data?.message ||
                                "AI server busy. Try again."
                        }
                    ]
                }
            ]);
        }
    };

    return (

        <div className="flex flex-col h-[80vh] bg-[#0f172a] rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">

            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">

                <h1 className="text-white text-xl font-bold">
                    DSA AI Assistant
                </h1>

                <p className="text-slate-200 text-sm">
                    Ask for hints, debugging, or optimization
                </p>

            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-[#111827]">

                {messages.map((msg, index) => (

                    <div
                        key={index}
                        className={`flex ${
                            msg.role === "user"
                                ? "justify-end"
                                : "justify-start"
                        }`}
                    >

                        <div
                            className={`max-w-[80%] px-5 py-3 rounded-2xl shadow-lg whitespace-pre-wrap text-sm leading-relaxed ${
                                msg.role === "user"
                                    ? "bg-indigo-600 text-white rounded-br-md"
                                    : "bg-slate-800 text-slate-100 border border-slate-700 rounded-bl-md"
                            }`}
                        >

                            {msg.role === "model" && (

                                <div className="mb-2 flex items-center gap-2">

                                    <span className="text-yellow-400 text-xs font-bold uppercase tracking-wider">
                                        Hint
                                    </span>

                                </div>
                            )}

                            {msg.parts[0].text}

                        </div>

                    </div>
                ))}

                <div ref={messagesEndRef} />

            </div>

            {/* Input Area */}
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="p-4 bg-[#0f172a] border-t border-slate-700"
            >

                <div className="flex items-center gap-3">

                    <input
                        placeholder="Ask for hint, optimization, bug fix..."
                        className="
                            flex-1
                            bg-slate-800
                            text-white
                            border
                            border-slate-600
                            rounded-xl
                            px-4
                            py-3
                            outline-none
                            focus:border-indigo-500
                            focus:ring-2
                            focus:ring-indigo-500/30
                            transition-all
                        "
                        {...register("message", {
                            required: true,
                            minLength: 2
                        })}
                    />

                    <button
                        type="submit"
                        className="
                            bg-indigo-600
                            hover:bg-indigo-700
                            text-white
                            p-3
                            rounded-xl
                            transition-all
                            duration-200
                            shadow-lg
                            hover:scale-105
                            disabled:opacity-50
                        "
                        disabled={errors.message}
                    >

                        <Send size={22} />

                    </button>

                </div>

                {/* Hint Buttons */}
                <div className="flex gap-2 mt-4 flex-wrap">

                    <button
                        type="button"
                        className="px-4 py-2 text-sm bg-slate-800 text-slate-200 rounded-full border border-slate-600 hover:bg-slate-700 transition"
                    >
                        Give Hint
                    </button>

                    <button
                        type="button"
                        className="px-4 py-2 text-sm bg-slate-800 text-slate-200 rounded-full border border-slate-600 hover:bg-slate-700 transition"
                    >
                        Optimize Code
                    </button>

                    <button
                        type="button"
                        className="px-4 py-2 text-sm bg-slate-800 text-slate-200 rounded-full border border-slate-600 hover:bg-slate-700 transition"
                    >
                        Explain Approach
                    </button>

                </div>

            </form>

        </div>
    );
}

export default ChatAi;