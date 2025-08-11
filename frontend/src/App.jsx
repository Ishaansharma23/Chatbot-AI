import React, { useState, useEffect, useRef } from 'react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'model',
      text: "Hey there 👋 How can I help you today?"
    }
  ]);

  const chatBodyRef = useRef(null);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTo({
        top: chatBodyRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const updated = [
      ...messages,
      { role: 'user', text: message },
      { role: 'model', text: 'Typing...' }
    ];
    setMessages(updated);
    setMessage('');

    // Prepare chat history for Gemini
    const history = messages
      .map((m) =>
        m.role === 'user' ? `User: ${m.text}` : `Bot: ${m.text}`
      )
      .join('\n');

    const fullPrompt = `${history}\nUser: ${message}`;

    const body = {
      contents: [
        {
          role: 'user',
          parts: [{ text: fullPrompt }]
        }
      ]
    };

    try {
      const response = await fetch(import.meta.env.VITE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Something went wrong!');
      }

      const apiResponseText = data?.candidates?.[0]?.content?.parts?.[0]?.text
        ?.replace(/\*\*(.*?)\*\*/g, '$1')
        ?.trim();

      const final = [
        ...updated.slice(0, -1),
        { role: 'model', text: apiResponseText || 'No reply received.' }
      ];

      setMessages(final);

    } catch (error) {
      console.error('❌ Error:', error.message);
      const fallback = [
        ...updated.slice(0, -1),
        { role: 'model', text: error.message || 'Sorry, something went wrong.' }
      ];
      setMessages(fallback);
    }
  };

  return (
    <div className="fixed bottom-10 right-6 font-['Roboto'] z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-white p-3 rounded-full shadow-lg border hover:shadow-xl transition"
        >
          <img
            src="https://img.freepik.com/free-vector/chatbot-conversation-vectorart_78370-4107.jpg"
            alt="Chat"
            className="w-8 h-8 rounded-full object-cover"
          />
        </button>
      )}

      <div
        className={`fixed bottom-20 right-6 w-80 max-w-full h-[500px] flex flex-col rounded-2xl shadow-xl overflow-hidden bg-white origin-bottom-right transform transition-transform transition-opacity duration-300 delay-100 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
        }`}
      >
        <div className="flex flex-col bg-gradient-to-r from-zinc-700 to-zinc-900 p-4">
          <h4 className="text-white text-lg font-bold">Chat support</h4>
          <p className="text-white text-sm">Hi. My name is Bot. How can I help you?</p>
        </div>

        <div
          ref={chatBodyRef}
          className="flex-1 flex flex-col-reverse overflow-y-auto p-4 text-black bg-gradient-to-bl from-zinc-800 to-zinc-900"
        >
          {[...messages].reverse().map((msg, index) => (
            <div
              key={index}
              className={`px-4 py-2 rounded-2xl mb-2 max-w-[70%] font-semibold ${
                msg.role === 'model'
                  ? 'self-start bg-black text-white'
                  : 'self-end bg-black text-white'
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex items-center p-3 bg-black"
        >
          <input
            type="text"
            placeholder="Write a message..."
            className="flex-1 px-4 py-2 rounded-full border-none focus:outline-none text-white bg-transparent"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          {message.trim() && (
            <button
              type="submit"
              className="text-white font-medium ml-3"
            >
              Send
            </button>
          )}
        </form>

        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-2 right-4 text-white text-xl"
        >
          ⌄
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
