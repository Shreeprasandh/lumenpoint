import { GoogleGenerativeAI } from '@google/generative-ai';

interface VideoContext {
  title: string;
  topic: string;
  keyPoints: string[];
  relatedConcepts: string[];
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI('AIzaSyBE_aMmFCyXVqlHS_x7FDwds4iMACXpXQQ');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Mock video context database (used as source material for AI)
const videoContexts: Record<string, VideoContext> = {
  'f1': {
    title: 'F1 2026 Engine Rules EXPLAINED: The 50/50 Power Split That Changes EVERYTHING',
    topic: 'automotive engineering',
    keyPoints: [
      'Power unit consists of internal combustion engine, turbocharger, MGU-K, MGU-H, and energy store',
      'MGU-K focuses on kinetic energy recovery during braking',
      'Thermal management is critical for optimal performance',
      'Fuel efficiency regulations drive innovation in hybrid systems',
      '50/50 power split means equal contribution from combustion engine and electric motors',
      'New regulations aim to make racing more sustainable and cost-effective'
    ],
    relatedConcepts: ['hybrid technology', 'energy recovery', 'thermal dynamics', 'regulatory compliance', 'sustainable racing']
  },
  'ai': {
    title: 'AI LUXURY FACTORY: Build a $10,000/Mo YouTube Channel (100% Automated)',
    topic: 'artificial intelligence',
    keyPoints: [
      'Neural networks consist of layers of interconnected nodes',
      'Deep learning uses multiple hidden layers for complex pattern recognition',
      'Training data quality directly impacts model accuracy',
      'Overfitting occurs when models perform well on training data but poorly on new data',
      'Automation can scale content creation exponentially',
      'AI can analyze trends and optimize content strategy'
    ],
    relatedConcepts: ['machine learning', 'neural networks', 'data science', 'pattern recognition', 'content automation']
  },
  'systems': {
    title: 'Complex Systems Simplified',
    topic: 'systems engineering',
    keyPoints: [
      'Complex systems exhibit emergent behavior not predictable from individual components',
      'Feedback loops can be reinforcing or balancing',
      'System boundaries define what is included in analysis',
      'Interconnectedness creates both opportunities and vulnerabilities'
    ],
    relatedConcepts: ['system dynamics', 'emergence', 'feedback loops', 'complexity theory']
  }
};

export const getVideoContext = (videoTitle: string): VideoContext | null => {
  const title = videoTitle.toLowerCase();

  if (title.includes('f1') || title.includes('power unit')) {
    return videoContexts.f1;
  }
  if (title.includes('ai') || title.includes('architecture')) {
    return videoContexts.ai;
  }
  if (title.includes('complex') || title.includes('systems')) {
    return videoContexts.systems;
  }

  // Default fallback
  return videoContexts.ai;
};

export const getInitialSuggestions = (videoTitle: string): string[] => {
  const context = getVideoContext(videoTitle);
  if (!context) return ['What are the key takeaways from this video?'];

  return [
    `What are the main concepts covered in ${context.topic}?`,
    'How does this relate to real-world applications?',
    'What are the most important principles discussed?',
    'Can you explain the core framework presented?'
  ];
};

export const generateAIResponse = async (userMessage: string, videoTitle: string): Promise<string> => {
  try {
    const context = getVideoContext(videoTitle);

    // Create a more general, conversational prompt that can handle any topic
    const contextPrompt = context ?
`You are a helpful, knowledgeable AI assistant having a conversation about a video titled "${context.title}" which covers ${context.topic}.

Key points from the video:
${context.keyPoints.map(point => `- ${point}`).join('\n')}

Related concepts: ${context.relatedConcepts.join(', ')}

User's message: "${userMessage}"

Respond naturally and conversationally, like you're chatting with a friend. Draw from the video content when relevant, but feel free to discuss any topic the user brings up. Be engaging, helpful, and ask follow-up questions when appropriate. Don't be overly structured or formal - just have a normal conversation.` :
`You are a helpful, knowledgeable AI assistant.

User's message: "${userMessage}"

Respond naturally and conversationally, like you're chatting with a friend. Be engaging, helpful, and ask follow-up questions when appropriate. Don't be overly structured or formal - just have a normal conversation.`;

    const result = await model.generateContent(contextPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating AI response:', error);
    // Fallback to mock responses if API fails
    return generateFallbackResponse(userMessage, videoTitle);
  }
};

// Fallback function for when API fails - natural chat-like responses
const generateFallbackResponse = (userMessage: string, videoTitle: string): string => {
  const context = getVideoContext(videoTitle);

  // Natural, conversational responses that feel like chatting with a friend
  if (context) {
    const chatResponses = [
      `Hey, that's a cool question about ${context.topic}! I think the video really nailed how ${context.keyPoints[0].toLowerCase()}. Makes you wonder about all the real-world applications, right? What got you thinking about this?`,
      `Oh man, I love this topic! The video explains it so well - ${context.keyPoints[1]?.toLowerCase() || 'these ideas just click together perfectly'}. It's actually pretty mind-blowing when you think about it. Have you noticed this in your own experiences?`,
      `That's such a good observation! The video goes deep into ${context.relatedConcepts.slice(0, 2).join(' and ')}, and honestly, it's changed how I see a lot of things. What's your favorite part of the video so far?`,
      `You know what? That's exactly the kind of question that makes these topics so interesting! The video shows how ${context.keyPoints[2]?.toLowerCase() || 'everything connects in these amazing ways'}. It's like puzzle pieces fitting together. What do you think about how this applies to today's world?`,
      `Awesome question! I think the video's biggest takeaway about ${context.topic} is that ${context.keyPoints[0].toLowerCase()}. It's one of those things that seems obvious once you hear it, but changes everything. What stood out to you most?`
    ];

    return chatResponses[Math.floor(Math.random() * chatResponses.length)];
  }

  // General natural chat responses
  const generalChatResponses = [
    "That's such an interesting question! I love how you're diving into this. What specifically caught your attention about it?",
    "Great question! It's always fun to explore these kinds of topics. What made you want to know more about this?",
    "You know, that's exactly the kind of thoughtful stuff that leads to the best conversations! I'd love to hear your thoughts on this too.",
    "That's a really good point! It's amazing how these topics connect to so many different areas. What got you thinking about this?",
    "Love this question! It's the kind of thing that really gets you thinking. What's your perspective on how this fits into the bigger picture?"
  ];

  return generalChatResponses[Math.floor(Math.random() * generalChatResponses.length)];
};
