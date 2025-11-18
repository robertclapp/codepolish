# CodePolish Demo Video Script
## 60-Second Version for Social Media

**Target Platforms:** Twitter, LinkedIn, Product Hunt, YouTube Shorts, TikTok, Instagram Reels

**Goal:** Show the transformation from messy AI code to production-ready code in a compelling, shareable format that drives signups.

---

## Video Specifications

**Duration:** 55-60 seconds (optimal for all platforms)

**Format:** 1080x1920 (vertical) for mobile-first platforms, 1920x1080 (horizontal) for YouTube/Twitter

**Style:** Screen recording with text overlays and smooth transitions

**Music:** Upbeat, tech-focused background music (royalty-free from Epidemic Sound or Artlist)

**Voiceover:** Optional but recommended for accessibility

**Tools Needed:**
- Screen recording software (OBS Studio - free, or Loom)
- Video editing software (CapCut - free, DaVinci Resolve - free, or iMovie)
- Text overlay tool (built into most editors)
- Background music (Epidemic Sound, Artlist, or YouTube Audio Library)

---

## Script Breakdown

### Scene 1: The Problem (0-10 seconds)

**Visual:**
- Screen shows a messy React component with obvious issues
- Code is poorly formatted, has hardcoded values, missing error handling
- Highlight specific problems with red underlines or arrows

**Text Overlay:**
```
"AI tools generate beautiful UIs...
But the code? 😬"
```

**Voiceover (Optional):**
"AI design tools like MagicPath and v0 create stunning interfaces in seconds, but the code they generate is far from production-ready."

**Shot Details:**
- Open VS Code or browser with AI-generated code
- Scroll slowly through the code showing issues
- Use cursor to point at specific problems:
  - Hardcoded values
  - Missing error handling
  - Poor component structure
  - No TypeScript types

**Code Example to Show:**
```jsx
function UserCard() {
  const [data, setData] = useState()
  
  useEffect(() => {
    fetch('https://api.example.com/user/123')
      .then(res => res.json())
      .then(data => setData(data))
  }, [])
  
  return (
    <div style={{padding: '20px', backgroundColor: '#f0f0f0'}}>
      <h2>{data.name}</h2>
      <p>{data.email}</p>
      <button onClick={() => alert('Clicked!')}>
        Contact
      </button>
    </div>
  )
}
```

**Timing:** 10 seconds

---

### Scene 2: The Solution (10-20 seconds)

**Visual:**
- Quick transition to CodePolish landing page
- Show the tagline: "Turn Messy AI Code Into Production-Ready Magic"
- Paste the messy code into CodePolish editor
- Click "Polish Code" button

**Text Overlay:**
```
"CodePolish fixes it in 60 seconds ✨"
```

**Voiceover (Optional):**
"That's where CodePolish comes in. Just paste your code, click polish, and watch the magic happen."

**Shot Details:**
- Navigate to codepolish.app
- Show clean, professional interface
- Paste the messy code from Scene 1
- Give it a name: "User Card Component"
- Select framework: "React"
- Click the prominent "Polish Code" button
- Show loading animation with progress indicator

**Timing:** 10 seconds

---

### Scene 3: The Transformation (20-40 seconds)

**Visual:**
- Split screen showing before/after code side by side
- Highlight improvements with green checkmarks
- Show quality score increasing from 45 → 92
- Display improvement summary

**Text Overlay:**
```
"Before: 45/100 → After: 92/100 📈

✅ Proper error handling
✅ TypeScript types
✅ Reusable components
✅ Accessibility fixes
✅ Performance optimized
✅ Security hardened"
```

**Voiceover (Optional):**
"CodePolish analyzes your code, identifies issues, and refactors it following best practices. Error handling, TypeScript types, accessibility, performance—all handled automatically."

**Shot Details:**
- Show diff view with before/after comparison
- Highlight specific improvements:
  - Error boundaries added
  - TypeScript interfaces defined
  - Props extracted to constants
  - ARIA labels added
  - Loading states implemented
  - Try-catch blocks added

**Polished Code to Show:**
```typescript
interface UserCardProps {
  userId: string;
  onContact?: (userId: string) => void;
}

interface UserData {
  name: string;
  email: string;
}

const CARD_STYLES = {
  padding: '1.25rem',
  backgroundColor: 'var(--card-bg)',
  borderRadius: '0.5rem',
} as const;

export function UserCard({ userId, onContact }: UserCardProps) {
  const [data, setData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://api.example.com/user/${userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const userData = await response.json();
        setData(userData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [userId]);
  
  const handleContact = () => {
    if (onContact && userId) {
      onContact(userId);
    }
  };
  
  if (loading) {
    return (
      <div style={CARD_STYLES} role="status" aria-live="polite">
        <p>Loading user data...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div style={CARD_STYLES} role="alert">
        <p>Error: {error}</p>
      </div>
    );
  }
  
  if (!data) {
    return null;
  }
  
  return (
    <div style={CARD_STYLES}>
      <h2>{data.name}</h2>
      <p>{data.email}</p>
      <button 
        onClick={handleContact}
        aria-label={`Contact ${data.name}`}
      >
        Contact
      </button>
    </div>
  );
}
```

**Timing:** 20 seconds

---

### Scene 4: The Call-to-Action (40-55 seconds)

**Visual:**
- Show CodePolish dashboard with polish history
- Display pricing: Free (5 polishes), Pro ($19/mo, 100 polishes)
- Show "Start Polishing Free" button

**Text Overlay:**
```
"Start with 5 free polishes
Upgrade to Pro for $19/mo

codepolish.app"
```

**Voiceover (Optional):**
"Get started with five free polishes per month, or upgrade to Pro for just nineteen dollars and polish up to one hundred components. Stop wasting hours refactoring AI code. Start shipping production-ready code today."

**Shot Details:**
- Show dashboard with:
  - Polish history (3-4 completed polishes)
  - Quality score improvements
  - Credits remaining
- Highlight pricing cards
- End with logo and URL

**Timing:** 15 seconds

---

### Scene 5: Closing Hook (55-60 seconds)

**Visual:**
- Quick montage of before/after scores
- Logo animation
- Final URL display

**Text Overlay:**
```
"Production-ready code in 60 seconds ⚡

Try it free: codepolish.app"
```

**Voiceover (Optional):**
"CodePolish. Turn messy AI code into production-ready magic."

**Shot Details:**
- Fast cuts of quality scores improving
- CodePolish logo with tagline
- Clear URL with call-to-action

**Timing:** 5 seconds

---

## Visual Storyboard

### Frame-by-Frame Breakdown

**Frame 1 (0:00-0:03):** 
- Close-up of messy code in VS Code
- Red squiggly lines under problematic code
- Text overlay fades in: "AI tools generate beautiful UIs..."

**Frame 2 (0:03-0:06):**
- Zoom in on specific code smell (hardcoded value)
- Circle appears around the issue
- Text overlay: "But the code? 😬"

**Frame 3 (0:06-0:10):**
- Pan to show more issues
- Multiple red arrows pointing to problems
- Quick fade to black

**Frame 4 (0:10-0:13):**
- Fade in to CodePolish landing page
- Smooth scroll to hero section
- Text overlay: "CodePolish fixes it in 60 seconds ✨"

**Frame 5 (0:13-0:17):**
- Click "Start Polishing Free" button
- Transition to dashboard
- Paste code into editor

**Frame 6 (0:17-0:20):**
- Name the component
- Select React framework
- Click "Polish Code" button
- Loading animation starts

**Frame 7 (0:20-0:25):**
- Split screen transition
- Before code on left, after code on right
- Highlight differences with green/red colors

**Frame 8 (0:25-0:30):**
- Quality score animation: 45 → 92
- Checkmarks appear next to improvements
- Text overlay lists improvements

**Frame 9 (0:30-0:35):**
- Scroll through polished code
- Highlight specific improvements:
  - TypeScript types (green highlight)
  - Error handling (green highlight)
  - Accessibility (green highlight)

**Frame 10 (0:35-0:40):**
- Show improvement summary panel
- Display metrics:
  - Issues fixed: 12
  - Quality improvement: +47 points
  - Time saved: 2.5 hours

**Frame 11 (0:40-0:45):**
- Transition to dashboard view
- Show polish history with multiple completed polishes
- Display credits remaining

**Frame 12 (0:45-0:50):**
- Zoom in on pricing section
- Highlight Free and Pro plans
- Text overlay: "Start with 5 free polishes"

**Frame 13 (0:50-0:55):**
- Show "Upgrade to Pro" button
- Display Pro benefits
- Text overlay: "$19/mo for 100 polishes"

**Frame 14 (0:55-0:58):**
- Fast montage of before/after scores
- Multiple components improving
- Quality scores jumping: 52→88, 61→94, 48→91

**Frame 15 (0:58-1:00):**
- CodePolish logo animation
- Tagline appears: "Production-ready code in 60 seconds"
- URL fades in: "codepolish.app"
- End screen with social handles

---

## Recording Instructions

### Equipment Setup

**Screen Recording:**
- Use OBS Studio (free) or Loom (free tier)
- Record at 1920x1080 resolution
- 60 FPS for smooth transitions
- Use system audio for clicks/interactions

**Microphone (if adding voiceover):**
- Use any decent USB microphone
- Record in quiet room
- Use noise reduction in post-production

**Lighting (if showing face):**
- Natural light or ring light
- Face camera directly
- Clean background

### Recording Tips

**Preparation:**
1. Close all unnecessary browser tabs
2. Hide bookmarks bar
3. Set browser zoom to 100%
4. Clear browser cache for clean demo
5. Have code examples ready to paste
6. Practice the flow 2-3 times before recording

**During Recording:**
1. Move cursor slowly and deliberately
2. Pause briefly between actions
3. Let animations complete fully
4. Don't rush—you can speed up in editing
5. Record multiple takes for each scene

**Common Mistakes to Avoid:**
- Cursor moving too fast
- Not pausing after clicks
- Scrolling too quickly
- Text appearing too briefly
- Typos in code examples

### Editing Workflow

**Step 1: Import Footage**
- Import all screen recordings
- Import background music
- Import voiceover (if recorded)

**Step 2: Rough Cut**
- Arrange clips in order
- Cut out mistakes and pauses
- Trim to approximately 60 seconds

**Step 3: Add Transitions**
- Use smooth crossfades between scenes
- Add zoom effects for emphasis
- Use slide transitions for before/after

**Step 4: Add Text Overlays**
- Use large, readable fonts (minimum 48pt)
- High contrast (white text on dark background)
- Animate text in/out smoothly
- Keep text on screen for 2-3 seconds minimum

**Step 5: Add Effects**
- Highlight code changes with colored boxes
- Add arrows pointing to improvements
- Use checkmark animations for improvements list
- Add progress bar for loading states

**Step 6: Add Audio**
- Add background music at 20-30% volume
- Add voiceover at 80-90% volume
- Add sound effects for clicks and transitions
- Ensure audio doesn't overpower narration

**Step 7: Color Correction**
- Increase contrast slightly
- Boost saturation for vibrant colors
- Ensure code is readable
- Match colors across all scenes

**Step 8: Final Polish**
- Add fade in/out at beginning/end
- Add logo watermark (bottom right)
- Add captions for accessibility
- Export at 1080p, 60 FPS

---

## Platform-Specific Versions

### Twitter/X Version (60 seconds)

**Format:** 1920x1080 (landscape) or 1080x1080 (square)

**Optimizations:**
- Add captions (80% watch without sound)
- First 3 seconds must hook viewers
- Include @mentions of AI tools (MagicPath, v0)
- End with clear CTA and URL

**Caption:**
```
I spent 6 hours fixing AI-generated code from @magicpath_ai

So I built CodePolish - turns messy AI code into production-ready magic in 60 seconds

✅ Proper error handling
✅ TypeScript types  
✅ Accessibility fixes
✅ Security hardened

Try it free: codepolish.app

#BuildInPublic #WebDev
```

### LinkedIn Version (60 seconds)

**Format:** 1920x1080 (landscape)

**Optimizations:**
- More professional tone
- Emphasize time/cost savings
- Include business metrics
- Target CTOs and engineering managers

**Caption:**
```
AI code generators are impressive, but the output isn't production-ready.

Our team was spending 40% of dev time refactoring AI-generated code.

So we built CodePolish - an AI-powered tool that automatically refactors code following enterprise best practices.

Results:
• 60-second turnaround time
• 47-point average quality improvement
• 2.5 hours saved per component
• $15K/month in dev time savings

Now available with a free tier: codepolish.app

#SoftwareEngineering #AI #DevTools
```

### YouTube Shorts Version (60 seconds)

**Format:** 1080x1920 (vertical)

**Optimizations:**
- Vertical format for mobile
- Larger text overlays
- More dramatic transitions
- Hook in first 2 seconds

**Title:**
"This AI Code Will Make You Cry 😭 (And How to Fix It)"

**Description:**
```
AI design tools generate beautiful UIs but terrible code. Here's how to fix it in 60 seconds with CodePolish.

Try it free: https://codepolish.app

Timestamps:
0:00 The Problem
0:10 The Solution
0:20 The Transformation
0:40 Pricing & CTA

#coding #webdevelopment #ai #react #typescript
```

### TikTok/Instagram Reels Version (30 seconds)

**Format:** 1080x1920 (vertical)

**Optimizations:**
- Cut to 30 seconds (faster pace)
- More energetic music
- Faster transitions
- Trending audio if possible

**Script (Condensed):**
- 0-5s: Show messy code with text "AI generated this 💀"
- 5-10s: Paste into CodePolish, click polish
- 10-20s: Show before/after with score 45→92
- 20-25s: List improvements with checkmarks
- 25-30s: "Try free: codepolish.app"

**Caption:**
```
POV: You're fixing AI-generated code for the 100th time today 😭

CodePolish does it in 60 seconds ⚡

Link in bio 🔗

#coding #webdev #ai #react #programmer #softwaredeveloper
```

### Product Hunt Version (90 seconds)

**Format:** 1920x1080 (landscape)

**Optimizations:**
- Longer format allowed
- More detailed explanation
- Show full feature set
- Include testimonials if available

**Additional Scenes:**
- Show GitHub integration
- Demonstrate test generation
- Display analytics dashboard
- Include pricing comparison

---

## B-Roll Footage Ideas

Capture these additional shots to use as transitions or emphasis:

1. **Developer frustration:**
   - Person staring at screen with messy code
   - Hands on head in frustration
   - Clock showing late hours

2. **Code quality visualization:**
   - Quality score gauge spinning up
   - Checkmarks appearing
   - Green highlights spreading across code

3. **Success moments:**
   - Deploy button being clicked
   - "Build successful" message
   - Happy developer reaction

4. **Product interface:**
   - Dashboard overview
   - Settings panel
   - Pricing page
   - Polish history

---

## Music Recommendations

**Upbeat & Techy:**
- "Inspiring Technology" by AudioCoffee (Epidemic Sound)
- "Digital Innovation" by Lexica (Artlist)
- "Tech Corporate" by Infraction (YouTube Audio Library)

**Energetic & Modern:**
- "Upbeat Corporate" by Bensound
- "Funky Suspense" by Bensound
- "Going Higher" by Bensound

**Free Options:**
- YouTube Audio Library (100% free, no attribution)
- Bensound (free with attribution)
- Free Music Archive (various licenses)

**Paid Options:**
- Epidemic Sound ($15/month - unlimited downloads)
- Artlist ($9.99/month - unlimited downloads)
- AudioJungle (pay per track, $5-20 each)

---

## Voiceover Script (Full Version)

**Opening (0-10s):**
"AI design tools like MagicPath and v0 create stunning user interfaces in seconds. But there's a problem: the code they generate is far from production-ready. Hardcoded values, missing error handling, no accessibility—it's a mess."

**Solution (10-20s):**
"That's where CodePolish comes in. Just paste your AI-generated code, click polish, and watch the transformation happen in real-time."

**Transformation (20-40s):**
"CodePolish analyzes your code using advanced AI, identifies issues, and refactors it following industry best practices. It adds proper error handling, TypeScript types, accessibility features, and security hardening. Watch the quality score jump from forty-five to ninety-two in just sixty seconds."

**CTA (40-55s):**
"Get started with five free polishes per month, or upgrade to Pro for just nineteen dollars and polish up to one hundred components. Stop wasting hours refactoring AI code. Start shipping production-ready code today."

**Closing (55-60s):**
"CodePolish. Turn messy AI code into production-ready magic. Try it free at codepolish dot app."

---

## Thumbnail Design (for YouTube)

**Elements:**
- Split screen: messy code (left) vs clean code (right)
- Large text: "AI Code → Production Ready"
- Quality scores: 45 vs 92 (in circles)
- CodePolish logo (bottom right)
- Bright colors: red for before, green for after
- Shocked face emoji or reaction (optional)

**Text Overlay:**
```
"60 SECONDS
AI CODE FIX"
```

**Color Scheme:**
- Background: Dark blue/black gradient
- Before side: Red tint
- After side: Green tint
- Text: White with black outline

---

## Distribution Checklist

After creating the video:

**Upload To:**
- [ ] Twitter/X (native upload, not YouTube link)
- [ ] LinkedIn (native upload)
- [ ] YouTube (as Short and regular video)
- [ ] TikTok
- [ ] Instagram Reels
- [ ] Product Hunt (embed in launch post)
- [ ] Reddit (r/webdev, r/reactjs - check rules first)
- [ ] Landing page (hero section)

**Optimize For Each Platform:**
- [ ] Add platform-specific captions
- [ ] Use platform-specific hashtags
- [ ] Adjust aspect ratio if needed
- [ ] Add captions/subtitles
- [ ] Include CTA in description
- [ ] Pin comment with link

**Track Performance:**
- [ ] Views
- [ ] Engagement rate
- [ ] Click-through rate to website
- [ ] Signups from video
- [ ] Shares and saves

---

## Success Metrics

**Target Metrics (First Week):**
- 10,000+ views across all platforms
- 5% engagement rate (likes, comments, shares)
- 2% click-through rate to website
- 50+ signups from video traffic

**Viral Indicators:**
- 1,000+ shares
- Featured on tech newsletters
- Reposted by influencers
- Trending on Product Hunt

**If Video Underperforms:**
- Test different hooks (first 3 seconds)
- Try different thumbnails
- Adjust caption/title
- Post at different times
- Boost with small ad spend ($20-50)

---

## Next Steps After Recording

1. **Edit the video** following the workflow above
2. **Get feedback** from 3-5 developers before publishing
3. **Create platform-specific versions** for each channel
4. **Schedule posts** for optimal times:
   - Twitter: Tuesday-Thursday, 9 AM or 1 PM EST
   - LinkedIn: Tuesday-Wednesday, 8 AM EST
   - YouTube: Saturday-Sunday, 2 PM EST
   - TikTok/Instagram: Daily, 7 PM EST
5. **Prepare to engage** with comments immediately after posting
6. **Track metrics** and adjust strategy based on performance

---

**Good luck with your demo video! This will be a powerful tool for your Product Hunt launch and ongoing marketing efforts.**
