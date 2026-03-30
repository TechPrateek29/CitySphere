import React, { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi! I'm CitySphere AI. How can I help you today?", isBot: true }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMsg = input.trim();
    setMessages(prev => [...prev, { text: userMsg, isBot: false }]);
    setInput('');

    // Mock AI Response Logic
    setTimeout(() => {
      let botResponse = "I'm still learning, but you can navigate to the Dashboard to manage your requests!";
      const lowerInput = userMsg.toLowerCase();
      
      if (lowerInput.includes('complaint')) {
        botResponse = "To file a complaint, please log in and go to your Citizen Dashboard. You will see a 'File New Complaint' form at the top.";
      } else if (lowerInput.includes('bill') || lowerInput.includes('pay')) {
        botResponse = "You can pay utility bills securely from the 'My Utility Bills' section on your Dashboard after logging in.";
      } else if (lowerInput.includes('certificate') || lowerInput.includes('license')) {
        botResponse = "For birth, death, or marriage certificates, click on 'Service Requests' in the sidebar to fill out the application.";
      }

      setMessages(prev => [...prev, { text: botResponse, isBot: true }]);
    }, 600);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-white w-80 h-96 rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          <div className="bg-secondary p-4 text-white flex justify-between items-center">
            <div>
               <h3 className="font-semibold text-sm">CitySphere AI Assistant</h3>
               <p className="text-xs opacity-75">Online 24/7</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-blue-700 p-1 rounded"><X size={18} /></button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.isBot ? 'bg-gray-200 text-gray-800 self-start rounded-tl-none' : 'bg-secondary text-white self-end rounded-tr-none'}`}>
                {msg.text}
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="p-3 bg-white border-t flex items-center space-x-2">
            <input 
              className="flex-1 p-2 bg-gray-100 rounded-lg outline-none text-sm focus:border-secondary border"
              placeholder="Ask me anything..."
              value={input}
              onChange={e => setInput(e.target.value)}
            />
            <button type="submit" className="bg-secondary text-white p-2 rounded-lg hover:bg-blue-600"><Send size={16} /></button>
          </form>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-secondary text-white p-4 rounded-full shadow-2xl hover:bg-blue-600 transition transform hover:scale-105"
        >
          <MessageCircle size={24} />
        </button>
      )}
    </div>
  );
};

export default ChatAssistant;
