import React, { useState, useEffect } from 'react';
import { parser, Message as MessageType } from './parser';

interface Conversation {
  id: string;
  name: string;
  messages: { id: string; text: string; fromMe: boolean; timestamp: string, displayName:string }[];
}

interface MessageProps {
  text: string;
  fromMe: boolean;
  timestamp: string;
  displayName :string
}

const Message: React.FC<MessageProps> = ({ text, fromMe, timestamp, displayName }) => {
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

  const displayNameStyle: React.CSSProperties = {
    fontSize: '0.8em',
    color: 'gray',
    margin: '2px',
    alignSelf: fromMe ? 'flex-end' : 'flex-start',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <p style={displayNameStyle}>{displayName}</p>
      <div style={messageStyle}>
        <p>{text}</p>
      </div>
      <p style={timestampStyle}>{timestamp}</p>
    </div>
  );
};

const ConversationNavBar: React.FC<{ conversations: Conversation[]; onConversationSelect: (conversationId: string) => void }> = ({ conversations, onConversationSelect }) => {
  const names : string[] =[]
  conversations.map(conversation => conversation.messages.map((message) => {
    if (!message.fromMe) {
      if (!names.includes(message.displayName)) {
        names.push(message.displayName)
      }
  }
  }))
  return (
    <nav>
      <ul>
        {conversations.map((conversation,i) => (
          <li key={conversation.name}>
            <button onClick={() => onConversationSelect(conversation.id)}>{names[i]? names[i] : conversation.id}</button>
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
                timestamp: message.createdTime,
                displayName: message.name? message.name : '',
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
            <Message key={message.id} text={message.text} fromMe={message.fromMe} timestamp={message.timestamp} displayName={message.displayName} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MessagingApp;
