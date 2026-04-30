import React, { useMemo, useState } from "react";
import axios from "axios";
import axiosRetry from "axios-retry";

// import botImg from "../../dist/assets/001.avif"

axiosRetry(axios, {
  retries: 5,
  retryDelay: (retryCount) => retryCount * 2000,
  retryCondition: (error) => error.response && error.response.status === 429,
});

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Put your key in User/client/.env as: VITE_OPENAI_API_KEY=...
  const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY || "YOUR_API_KEY";

  const dummyReplies = useMemo(
    () => ({
      Hello: "Hi there! How can I assist you today?",
      "What is the weather like today?":
        "I’m currently unable to fetch weather details. But you can easily check it on your favorite weather app!",
      "Can you tell me a joke?":
        "Sure! Why don’t skeletons fight each other? They don’t have the guts!",
      "What is 5 + 3?": "5 + 3 equals 8.",
      "Tell me something interesting.":
        "Did you know that honey never spoils? Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old!",
      "Who won the World Cup in 2018?":
        "The 2018 FIFA World Cup was won by France. They defeated Croatia 4-2 in the final.",
      "Can you play music?":
        "I can't play music directly, but I recommend you check out your favorite streaming app!",
      "What’s the time?":
        "I’m unable to tell the exact time, but you can check the time on your device!",
      "Are you available 24/7?": "Yes, I’m here anytime you need assistance!",
      "How are you?":
        "I’m just a bot, but thanks for asking! How can I help you today?",
    }),
    [],
  );

  const handleSendMessage = async () => {
    const text = input.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { text, sender: "user" }]);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            ...messages.map((msg) => ({
              role: msg.sender === "user" ? "user" : "assistant",
              content: msg.text,
            })),
            { role: "user", content: text },
          ],
          max_tokens: 150,
          temperature: 0.9,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openaiApiKey}`,
          },
        },
      );

      const aiResponse = response.data?.choices?.[0]?.message?.content ?? "";

      setMessages((prev) => [...prev, { text: aiResponse, sender: "chatbot" }]);
    } catch (error) {
      console.error("Error with OpenAI API call:", error);
      const fallback =
        dummyReplies[text] || "Something went wrong. Please try again later.";
      setMessages((prev) => [...prev, { text: fallback, sender: "chatbot" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Collapsed launcher (bot image) */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="fixed bottom-6 right-4 z-40 h-14 w-14 rounded-full bg-white shadow-xl border border-white/60 flex items-center justify-center"
        aria-label={isOpen ? "Close chatbot" : "Open chatbot"}
      >
        <img src='' alt="Chatbot" className="h-10 w-10 object-contain" />
      </button>

      {/* Panel (only when open) */}
      {isOpen ? (
        <div className="fixed top-[195px] right-[9px] border-2 border-white z-40 rounded-2xl bg-white shadow-2xl h-80 w-60 animate__animated animate__fadeInRight">
          <div
            style={{
              background:
                "linear-gradient(99.88deg, #F38200 3.56%, #FF0000 105.9%)",
            }}
            className="rounded-tl-2xl rounded-tr-2xl flex px-4 py-2 justify-start items-center text-white"
          >
            <img src='' className="w-10 h-10" alt="" />
            <div className="ml-2">
              <p className="text-[10px] h-[10px]">Chat with</p>
              <p className="text-sm">Jessica Cowles</p>
            </div>
          </div>

          <div className="h-[260px] overflow-y-auto flex flex-col justify-between">
            <div className="text-[10px] mt-2 px-2">
              <div className="space-y-1 relative">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`p-1 rounded-md ${
                      msg.sender === "user"
                        ? "bg-orange-500 text-white w-40 absolute right-1"
                        : "bg-white absolute left-1 border-2 border-orange-400 top-7 text-black"
                    }`}
                  >
                    {msg.text}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center border-gray-400 border-t-2 w-[210px] py-1 mx-auto px-2 text-[10px] space-x-2">
              <input
                type="text"
                className="w-full p-1"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendMessage();
                }}
              />
              <button
                onClick={handleSendMessage}
                className="bg-orange-500 text-white w-[33px] h-[27px] rounded-full"
                disabled={loading}
                type="button"
              >
                <i className="ri-send-plane-2-line text-[14px]"></i>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

