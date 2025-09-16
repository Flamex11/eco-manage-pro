import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Send, X, Bot, User } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}
const FAQ_RESPONSES = {
  'collection schedule': 'Waste collection schedules vary by ward. Generally, wet waste is collected daily, dry waste 3 times a week, and hazardous waste once a month. Check with your local collector for specific timings.',
  'segregation': 'Proper waste segregation is crucial: \n• Wet waste: Food scraps, vegetable peels, garden waste\n• Dry waste: Paper, plastic, metal, glass\n• Hazardous waste: Electronics, batteries, medical waste',
  'complaint': 'To file a complaint: \n1. Go to the Complaints section\n2. Fill out the complaint form\n3. Add photos if available\n4. Submit and track the status',
  'contact': 'For urgent issues, contact your ward office directly. Non-urgent complaints can be submitted through this portal.',
  'payment': 'Waste collection fees are typically charged monthly. Contact your ward office for payment methods and schedules.'
};
export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    content: 'Hello! I\'m your waste management assistant. Ask me about collection schedules, waste segregation, or filing complaints.',
    sender: 'bot',
    timestamp: new Date()
  }]);
  const [inputValue, setInputValue] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollAreaRef.current) {
        const scrollArea = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollArea) {
          scrollArea.scrollTop = scrollArea.scrollHeight;
        }
      }
    }, 100);
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const getBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    for (const [keyword, response] of Object.entries(FAQ_RESPONSES)) {
      if (message.includes(keyword)) {
        return response;
      }
    }

    // Default responses for common greetings
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return 'Hello! How can I help you with waste management today?';
    }
    if (message.includes('help')) {
      return 'I can help you with:\n• Collection schedules\n• Waste segregation guidelines\n• Filing complaints\n• Contact information\n• Payment queries';
    }
    return 'I\'m sorry, I didn\'t understand that. Try asking about collection schedules, waste segregation, complaints, or type "help" for more options.';
  };
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Simulate bot response delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: getBotResponse(inputValue),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };
  return <>
      {/* Floating Chat Button */}
      {!isOpen && <Button onClick={() => setIsOpen(true)} className="fixed bottom-6 right-6 w-14 h-14 rounded-full gradient-primary shadow-elegant hover:shadow-glow transition-smooth z-50 text-gray-300 bg-orange-700 hover:bg-orange-600">
          <MessageCircle className="w-6 h-6" />
        </Button>}

      {/* Chat Window */}
      {isOpen && <Card className="fixed bottom-6 right-6 w-80 h-96 shadow-elegant border-border/50 z-50 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-border">
            <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
              <Bot className="w-4 h-4 text-primary" />
              Waste Management Assistant
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="w-6 h-6 p-0">
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 p-3" ref={scrollAreaRef}>
              <div className="space-y-3">
                {messages.map(message => <div key={message.id} className={`flex gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.sender === 'bot' && <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot className="w-3 h-3 text-primary" />
                      </div>}
                    
                    <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                      <pre className="whitespace-pre-wrap font-sans">
                        {message.content}
                      </pre>
                    </div>

                    {message.sender === 'user' && <div className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <User className="w-3 h-3 text-secondary" />
                      </div>}
                  </div>)}
              </div>
            </ScrollArea>

            <div className="p-3 border-t border-border">
              <div className="flex gap-2">
                <Input value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyPress={handleKeyPress} placeholder="Ask about waste management..." className="flex-1 bg-background border-border focus:ring-primary text-sm" />
                <Button onClick={handleSendMessage} size="sm" className="px-3 gradient-primary text-white" disabled={!inputValue.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>}
    </>;
}