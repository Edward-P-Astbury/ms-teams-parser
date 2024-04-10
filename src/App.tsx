import React, { useState, useEffect } from 'react';
import { parser, Message as MessageType } from './parser';

interface Conversation {
  id: string;
  name: string;
  messages: { id: string; text: string; fromMe: boolean; timestamp: string }[];
}

interface MessageProps {
  text: string;
  fromMe: boolean;
  timestamp: string;
}

const Message: React.FC<MessageProps> = ({ text, fromMe, timestamp }) => {
  const messageStyle: React.CSSProperties = {
    backgroundColor: fromMe ? 'blue' : 'grey',
    color: fromMe ? 'white' : 'black',
    borderRadius: '10px',
    padding: '8px',
    margin: '4px',
    maxWidth: '70%',
    alignSelf: fromMe ? 'flex-end' : 'flex-start',
  };

  const timestampStyle: React.CSSProperties = {
    fontSize: '0.8em',
    color: 'gray',
    margin: '2px',
    alignSelf: fromMe ? 'flex-end' : 'flex-start',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <p style={timestampStyle}>{timestamp}</p>
      <div style={messageStyle}>
        <p>{text}</p>
      </div>
    </div>
  );
};

const ConversationNavBar: React.FC<{ conversations: Conversation[]; onConversationSelect: (conversationId: string) => void }> = ({ conversations, onConversationSelect }) => {
  return (
    <nav>
      <ul>
        {conversations.map(conversation => (
          <li key={conversation.id}>
            <button onClick={() => onConversationSelect(conversation.id)}>{conversation.name}</button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

const MessagingApp: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dataParsed = await parser();

        const convos: Conversation[] = [];
        if (dataParsed) {
          dataParsed.forEach((val, key) => {
            const convo = {
              id: key,
              name: key,
              messages: val.map((message) => ({
                id: message.clientmessageid,
                text: message.content,
                fromMe: message.isFromMe,
                timestamp: message.createdTime
              }))
            };
            convos.push(convo);
          });
        }

        setConversations(convos);
      } catch (error) {
        console.error('Error parsing data:', error);
      }
    };

    fetchData();
  }, []);

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversation(conversationId);
  };

  return (
    <div>
      <ConversationNavBar conversations={conversations} onConversationSelect={handleConversationSelect} />
      {selectedConversation !== null && (
        <div>
          {conversations.find(conversation => conversation.id === selectedConversation)?.messages.map(message => (
            <Message key={message.id} text={message.text} fromMe={message.fromMe} timestamp={message.timestamp} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MessagingApp;
