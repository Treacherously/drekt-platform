import React, { useState } from 'react';

interface Message {
  id: string;
  from: string;
  subject: string;
  preview: string;
  time: string;
  unread: boolean;
  fullMessage: string;
}

const mockMessages: Message[] = [
  {
    id: 'MSG-001',
    from: 'SM Supermarket - Mall of Asia',
    subject: 'Inquiry about Premium Rice',
    preview: 'Good day! We are interested in sourcing premium rice varieties for our supermarket chain...',
    time: '2 hours ago',
    unread: true,
    fullMessage: `Good day!

We are interested in sourcing premium rice varieties for our supermarket chain. We noticed your Nueva Ecija Rice Cooperative listing and would like to discuss:

1. Bulk pricing for Jasmine and Dinorado rice
2. Delivery schedules to our Metro Manila locations
3. Quality certifications and packaging options

Could we schedule a call this week to discuss further?

Best regards,
Maria Santos
Procurement Manager
SM Supermarket`,
  },
  {
    id: 'MSG-002',
    from: 'Mercury Drug - Ermita Branch',
    subject: 'Bulk Order Request',
    preview: 'Hello, we would like to place a bulk order for pharmaceutical packaging materials...',
    time: '5 hours ago',
    unread: true,
    fullMessage: `Hello,

We would like to place a bulk order for pharmaceutical packaging materials. Specifically:

- PET Bottles 500ml Clear: 10,000 units
- Plastic Caps 28mm: 15,000 units
- Glass Jars 250ml: 5,000 units

Please provide:
1. Total quotation
2. Lead time
3. Payment terms
4. Delivery options to Ermita, Manila

Looking forward to your response.

Regards,
Dr. Roberto Cruz
Supply Chain Manager
Mercury Drug Corporation`,
  },
  {
    id: 'MSG-003',
    from: 'Royal Cargo Inc',
    subject: 'Logistics Question',
    preview: 'We noticed your distribution needs and would like to offer our logistics services...',
    time: '1 day ago',
    unread: false,
    fullMessage: `Good afternoon,

We noticed your distribution needs and would like to offer our logistics services for your supply chain operations.

Royal Cargo can provide:
- Nationwide freight forwarding
- Cold chain logistics
- Warehousing solutions
- Real-time tracking

We have special rates for regular shippers and can customize solutions based on your volume.

Would you be interested in a consultation?

Best regards,
Carlos Reyes
Business Development Manager
Royal Cargo Inc`,
  },
];

export default function InboxPage() {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(mockMessages[0]);

  return (
    <div className="max-w-7xl mx-auto h-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Message List */}
        <div className="lg:col-span-1">
          <div className="dashboard-card p-4 h-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Messages
            </h3>
            <div className="space-y-2">
              {mockMessages.map((message) => (
                <button
                  key={message.id}
                  onClick={() => setSelectedMessage(message)}
                  className={`w-full text-left p-4 rounded-lg transition-colors ${
                    selectedMessage?.id === message.id
                      ? 'bg-primary-100 dark:bg-primary-900 border-l-4 border-primary-500'
                      : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <h4 className={`text-sm font-semibold ${
                      message.unread ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {message.from}
                    </h4>
                    {message.unread && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
                  </div>
                  <p className={`text-sm mb-1 ${
                    message.unread ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {message.subject}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 line-clamp-2 mb-2">
                    {message.preview}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {message.time}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Message Content */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <div className="dashboard-card p-6 h-full flex flex-col">
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {selectedMessage.subject}
                </h2>
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-semibold">
                      {selectedMessage.from.charAt(0)}
                    </div>
                    <span className="font-medium">{selectedMessage.from}</span>
                  </div>
                  <span>•</span>
                  <span>{selectedMessage.time}</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="prose dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 dark:text-gray-300">
                    {selectedMessage.fullMessage}
                  </pre>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <div className="flex gap-3">
                  <button className="btn-primary flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                    Reply
                  </button>
                  <button className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    Forward
                  </button>
                  <button className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="dashboard-card p-12 text-center h-full flex items-center justify-center">
              <div>
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No message selected
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Select a message from the list to view its contents
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
