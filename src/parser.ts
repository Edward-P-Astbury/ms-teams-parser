
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
  
  export async function parser(): Promise<Map<string, Message[]>> {
    const filePath: string = 'src/jane_doe_v_1_4_00_11161.json';
  
    try {
      // Fetch the JSON data asynchronously
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const jsonText: string = await response.text(); // Read the response body as text
      console.log(jsonText)
      const allMessages: Message[] = JSON.parse(jsonText); // Parse the JSON text into an array
  
      const conversations = new Map<string, Message[]>();
  
      allMessages.forEach((message) => {
        if (message.conversationId && message.conversationId.slice(0, 2) === '19') {
          if (!conversations.has(message.conversationId)) {
            conversations.set(message.conversationId, [message]);
          } else {
            const messages: Message[] = conversations.get(message.conversationId)!;
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
  
  