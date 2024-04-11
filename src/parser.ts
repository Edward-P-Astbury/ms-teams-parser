
export interface Message {
    attachments: [];
    cachedDeduplicationKey: string;
    clientArrivalTime: string;
    clientmessageid: string;
    composetime: string;
    content: string;
    contenttype: string;
    conversationId: string;
    createdTime: string;
    creator: string;
    isFromMe: boolean;
    messageKind: string;
    messagetype: string;
    origin_file: string;
    originalArrivalTime: string;
    properties: { importance: number; subject: string };
    record_type: string;
    version: string;
  }

  interface User {
    displayName: string,
    email:string,
    mri:string,
    origin_file:string,
    record_type:string,
    userPrincipalName:string
  }

  interface MessageWithMRI extends Message{
    receiverMRI: string,
    senderMRI: string
  }

  interface UserMessage extends MessageWithMRI {
    name?:string
  }
  
  export async function parser(): Promise<Map<string, UserMessage[]>> {
    const filePath: string = 'src/jane_doe_v_1_4_00_11161.json';
    const userFilePath :string = 'src/users.json';
  
    try {
      // Fetch the JSON data asynchronously
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const userResponse = await fetch(userFilePath);

      if (!userResponse.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const jsonText: string = await response.text(); // Read the response body as text
    //   console.log(jsonText)
      const allMessages: Message[] = JSON.parse(jsonText); // Parse the JSON text into an array

      const jsonUser : string = await userResponse.text();
      const users : User[] = JSON.parse(jsonUser);

      const messagesWithMRIs : MessageWithMRI[] =[];

      allMessages.map((message) => {
        if (message.conversationId) {
        if (message.conversationId.slice(0,2) === '19') {
          const indexAfter19 = message.conversationId.indexOf("19:") + "19:".length;

          const substringAfter19 = message.conversationId.substring(indexAfter19);

          const splitString = substringAfter19?.split("_");

          const stringBeforeAt = splitString[0].split("@")[0];

          const senderMRI : string = splitString[0];
          const receiverMRI : string = stringBeforeAt;
          const newMessage : MessageWithMRI = {
              attachments: message.attachments,
              cachedDeduplicationKey: message.cachedDeduplicationKey,
              clientArrivalTime: message.clientArrivalTime,
              clientmessageid: message.clientmessageid,
              composetime: message.composetime,
              content: message.content,
              contenttype: message.contenttype,
              conversationId: message.conversationId,
              createdTime: message.createdTime,
              creator: message.creator,
              isFromMe: message.isFromMe,
              messageKind: message.messageKind,
              messagetype: message.messagetype,
              origin_file: message.origin_file,
              originalArrivalTime: message.originalArrivalTime,
              properties: { importance: message.properties.importance, subject: message.properties.subject },
              record_type: message.record_type,
              version: message.version,
              senderMRI : senderMRI,
              receiverMRI:receiverMRI
          }
          messagesWithMRIs.push(newMessage);
      }}
      })


      const messagesWithUsername : UserMessage[] = []

      messagesWithMRIs.map((message) => {
        users.map((user) => {
            const newMessage : UserMessage = message;
            const indexOf = user.mri.indexOf('8:origid:') + '8:origid:'.length;
            if (message.isFromMe) {
              // console.log('reciverURI',message.receiverMRI, 'user', user.mri.slice(indexOf,user.mri.length))
                if (message.creator.slice(indexOf,user.mri.length) === user.mri.slice(indexOf,user.mri.length)) {
                    const name = user.displayName;
                    newMessage.name = name;
                    messagesWithUsername.push(newMessage);
                }
            }
            else {
                if (message.creator.slice(indexOf,user.mri.length) === user.mri.slice(indexOf,user.mri.length)) {
                    const name = user.displayName;
                    newMessage.name = name;
                    messagesWithUsername.push(newMessage);
                }
            }
        })
      })
  
      const conversations = new Map<string, UserMessage[]>();

      console.log(messagesWithUsername, 'with username', allMessages.length)
      // messagesWithUsername.map((message) => {if (message.isFromMe) console.log(message)})
  
      messagesWithUsername.forEach((message) => {
        if (message.conversationId && message.conversationId.slice(0, 2) === '19') {
          if (!conversations.has(message.conversationId)) {
            conversations.set(message.conversationId, [message]);
          } else {
            const messages: UserMessage[] = conversations.get(message.conversationId)!;
            messages.push(message);
            conversations.set(message.conversationId, messages);
          }
        }
      });

      conversations.forEach((val,key) => {
        val.sort(function(a,b){
            return new Date(b.createdTime) - new Date(a.createdTime);
          });        conversations.set(key, val);
      })
  
      return conversations;
    } catch (err) {
      console.error('Error reading the file:', err);
      throw err; // Rethrow the error to be handled by the caller
    }
  }
  
  