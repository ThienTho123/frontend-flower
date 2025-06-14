import React, { useState, useRef } from "react";
import axios from "axios";
import "./Chatbot.css";
import { Link } from "react-router-dom";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [flowerList, setFlowerList] = useState([]);
  const productListRef = useRef(null); // Ref để điều khiển scroll
  const scrollLeft = () => {
    if (productListRef.current) {
      productListRef.current.scrollBy({ left: -150, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (productListRef.current) {
      productListRef.current.scrollBy({ left: 150, behavior: "smooth" });
    }
  };
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");

    try {
      const response = await axios.post(
        "https://deploybackend-1ta9.onrender.com/api/chat",
        {
          messages: newMessages,
        }
      );

      const botReply = { role: "assistant", content: response.data.reply };
      setMessages([...newMessages, botReply]);

      // Chỉ set flowerList nếu có dữ liệu trả về
      if (response.data.flowers && response.data.flowers.length > 0) {
        setFlowerList(response.data.flowers);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      {/* Icon mở chatbot */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="chat-icon"
        title="Chat với bot"
      >
        💬
      </div>

      {/* Khung chat */}
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">Chatbot</div>
          <div className="chat-body">
            {messages.map((msg, idx) => (
              <div key={idx} className="chat-message">
                <strong>{msg.role === "user" ? "Bạn" : "Bot"}:</strong>{" "}
                <div
                  className={`chat-bubble ${
                    msg.role === "user" ? "user" : "bot"
                  }`}
                  dangerouslySetInnerHTML={{ __html: msg.content }}
                />
                {idx === messages.length - 1 &&
                  msg.role === "assistant" &&
                  flowerList.length > 0 && (
                    <div className="product-wrapper">
                      <button className="scroll-btn left" onClick={scrollLeft}>
                        ‹
                      </button>
                      <div className="product-list" ref={productListRef}>
                        {flowerList.slice(0, 4).map((flower, i) => (
                          <Link
                            to={`/detail/${flower.flowerID}`}
                            key={i}
                            className="product-card-link"
                          >
                            <div className="product-card">
                              <img src={flower.image} alt={flower.name} />
                              <div className="product-name">{flower.name}</div>
                              <div className="product-price">
                                {flower.priceEvent ? (
                                  <>
                                    <span className="old-price">
                                      {flower.price}
                                    </span>
                                    <span className="new-price">
                                      {flower.priceEvent}
                                    </span>
                                  </>
                                ) : (
                                  <span className="normal-price">
                                    {flower.price}
                                  </span>
                                )}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                      <button
                        className="scroll-btn right"
                        onClick={scrollRight}
                      >
                        ›
                      </button>
                    </div>
                  )}
              </div>
            ))}
          </div>
          <div className="chat-input-area">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập tin nhắn..."
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button onClick={handleSend}>Gửi</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
