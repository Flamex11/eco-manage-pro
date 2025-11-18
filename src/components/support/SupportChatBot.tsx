import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Send, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface SupportChatBotProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'help' | 'support' | 'issue';
}

const SUPPORT_RESPONSES = {
  help: {
    title: 'Help Center',
    greeting: 'Hi! I\'m here to help you navigate the app. What would you like to know?',
    keywords: {
      'collection': 'To manage waste collections, go to the Collections page from the sidebar. You can view scheduled pickups and their status.',
      'complaint': 'To file a complaint, navigate to the Complaints page. Click "New Complaint" and fill in the details.',
      'profile': 'You can update your profile in Settings. Click on your avatar or name to access profile settings.',
      'notification': 'Notification preferences can be managed in Settings under the Notification Preferences section.',
      'dashboard': 'The dashboard shows your overview. Admins see system-wide stats, collectors see their routes, and residents see their collection schedule.',
      'default': 'I can help you with collections, complaints, profiles, notifications, and dashboard navigation. What would you like to know more about?'
    }
  },
  support: {
    title: 'Contact Support',
    greeting: 'Hello! I\'m here to help with any technical issues or questions. Please describe your problem.',
    keywords: {
      'login': 'If you\'re having trouble logging in, try resetting your password. If the issue persists, our team will assist you within 24 hours.',
      'error': 'Please describe the error message you\'re seeing, and I\'ll help troubleshoot. Common issues can often be resolved by refreshing the page.',
      'account': 'For account-related issues, I can help with password resets, email changes, or account access problems.',
      'payment': 'For billing or payment questions, our support team will respond within 24 hours. Please provide your account details.',
      'default': 'I\'ve logged your support request. Our team typically responds within 24 hours. Is there anything specific I can help with right now?'
    }
  },
  issue: {
    title: 'Report an Issue',
    greeting: 'Thank you for reporting an issue. Please describe what\'s not working as expected.',
    keywords: {
      'bug': 'Thank you for reporting this bug. I\'ve logged it for our development team. Can you provide steps to reproduce it?',
      'slow': 'If the app is running slowly, try clearing your browser cache or using a different browser. I\'ve noted the performance issue.',
      'missing': 'If you\'re seeing missing data or features, please let me know which page you\'re on. I\'ve logged this issue.',
      'broken': 'Thank you for reporting this broken feature. Our team will investigate. Can you tell me what you were trying to do?',
      'default': 'I\'ve logged your issue report. Our team reviews all reports and prioritizes them based on severity. Thank you for helping us improve!'
    }
  }
};

export function SupportChatBot({ isOpen, onClose, mode }: SupportChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const config = SUPPORT_RESPONSES[mode];

  useEffect(() => {
    if (isOpen) {
      // Send greeting when chat opens
      const greetingMessage: Message = {
        id: Date.now().toString(),
        content: config.greeting,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages([greetingMessage]);
    } else {
      // Clear messages when closed
      setMessages([]);
      setInputValue('');
    }
  }, [isOpen, mode]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    for (const [keyword, response] of Object.entries(config.keywords)) {
      if (keyword !== 'default' && lowerMessage.includes(keyword)) {
        return response;
      }
    }
    
    return config.keywords.default;
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

    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: getBotResponse(inputValue),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-[400px] flex flex-col p-0">
        <SheetHeader className="px-6 py-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            {config.title}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea ref={scrollAreaRef} className="flex-1 px-6 py-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
                {message.sender === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button onClick={handleSendMessage} size="icon">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
