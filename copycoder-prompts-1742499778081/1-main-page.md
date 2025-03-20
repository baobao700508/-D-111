Set up the frontend according to the following prompt:
  <frontend-prompt>
  Create detailed components with these requirements:
  1. Use 'use client' directive for client-side components
  2. Make sure to concatenate strings correctly using backslash
  3. Style with Tailwind CSS utility classes for responsive design
  4. Use Lucide React for icons (from lucide-react package). Do NOT use other UI libraries unless requested
  5. Use stock photos from picsum.photos where appropriate, only valid URLs you know exist
  6. Configure next.config.js image remotePatterns to enable stock photos from picsum.photos
  7. Create root layout.tsx page that wraps necessary navigation items to all pages
  8. MUST implement the navigation elements items in their rightful place i.e. Left sidebar, Top header
  9. Accurately implement necessary grid layouts
  10. Follow proper import practices:
     - Use @/ path aliases
     - Keep component imports organized
     - Update current src/app/page.tsx with new comprehensive code
     - Don't forget root route (page.tsx) handling
     - You MUST complete the entire prompt before stopping
  </frontend-prompt>

  <summary_title>
AI Learning Platform Chat Interface
</summary_title>

<image_analysis>
1. Navigation Elements:
- Primary navigation: setting
- Left sidebar navigation with dated entries (今天, 昨天, 3月18日, etc.)
- Logo "Cal AI" in top left corner with gear icon
- "+" button in top header
- Chat interface title "如何学习编程" centered in header

2. Layout Components:
- Left sidebar: 250px width, full height
- Main content area: Flexible width, dark theme
- Chat input bar: Fixed to bottom, full width
- Message bubbles: Max-width 70% of container

3. Content Sections:
- Chat messages alternating between user/AI
- Timestamp indicators (11:40, 11:41)
- Message content with varying lengths
- Blue highlight for user messages
- Dark gray background for AI responses

4. Interactive Controls:
- Text input field at bottom
- Send button with translate icon
- Sidebar navigation items with hover states
- Settings gear icon in top left
- Add new chat button ("+")

5. Colors:
- Background: #1E1E1E
- Sidebar: #252526
- Text: #FFFFFF
- User message: #0066FF
- AI message: #2D2D2D
- Input field: #3D3D3D

6. Grid/Layout Structure:
- 3-column layout (sidebar, content, optional details)
- Vertical message stack with 16px spacing
- Flexible content width with max-width constraints
- Responsive container adjustments for mobile
</image_analysis>

<development_planning>
1. Project Structure:
```
src/
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── ChatContainer.tsx
│   ├── features/
│   │   ├── MessageList.tsx
│   │   ├── MessageInput.tsx
│   │   └── Navigation.tsx
│   └── shared/
├── assets/
├── styles/
├── hooks/
└── utils/
```

2. Key Features:
- Real-time chat functionality
- Message history management
- Navigation system
- User input handling
- Message formatting
- Timestamp display

3. State Management:
```typescript
interface AppState {
  chat: {
    messages: Message[];
    currentThread: string;
    isTyping: boolean;
  };
  navigation: {
    currentSection: string;
    sidebarOpen: boolean;
  };
  settings: {
    theme: 'light' | 'dark';
    language: string;
  }
}
```

4. Component Architecture:
- App (root)
  - Layout
    - Sidebar
    - ChatContainer
      - MessageList
      - MessageInput
  - SharedComponents
    - Button
    - Input
    - Icons

5. Responsive Breakpoints:
```scss
$breakpoints: (
  'mobile': 320px,
  'tablet': 768px,
  'desktop': 1024px,
  'widescreen': 1440px
);
```
</development_planning>