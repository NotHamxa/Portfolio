const voltContent = `
    <text>
    Volt is a Windows search tool built with React, TypeScript, and Electron. 
    Quickly find files, apps, and folders, or search the web using bangs (like !gpt or !yt).
    </text>
    
    <imgText position="left" src="/images/volt/img1.png">
    Pin your most-used links and apps for quick access. Everything you need is just a keystroke away.
    </imgText>

    <heading>
        Web Search
    </heading>
    
    <text>
    Press Tab to switch between searching your computer and searching the web. Pretty handy.
    </text>

    <imgText position="right" src="/images/volt/img2.png">
    Google suggestions are built in, so you get that familiar autocomplete experience. Works just like you'd expect.
    </imgText>

    <imgText position="left" src="/images/volt/img3.png">
    Use bang commands (!gpt, !g, !yt) to jump straight to ChatGPT, Google, YouTube, etc. Saves time when switching between sites.
    </imgText>

    <text>
    Search history is saved locally, so you can quickly pull up previous searches.
    </text>
    
    <heading>
        File Search
    </heading>
    
    <imgText position="right" src="/images/volt/img4.png">
    Add folders to index and Volt will scan them for lightning-fast file searches. No more waiting for Windows Search to catch up - results appear instantly as you type. Works great for project folders, downloads, or anywhere you keep important files.
    </imgText>
`

const epsilonContent = `
    <img>/images/epsilon/epsilonModel.png</img>
    
    <heading>
        Backend - Python FastAPI
    </heading>
    
    <imgText position="left" src="/images/epsilon/img1.png">
        The backend is built with Python and FastAPI. Handles all request processing, 
        data management, and coordinates between different parts of the system. 
        Focused on keeping response times fast and making sure everything communicates properly.
    </imgText>
    
    <heading>
        Frontend - React TS
    </heading>
    
    <imgText position="right" src="/images/epsilon/img2.png">
        The frontend uses React with TypeScript. Clean, minimal design that's not cluttered. 
        Responsive across devices, and user data gets saved to the cloud so everything syncs 
        wherever you log in.
    </imgText>
    
    <heading>
        Admin Panel - React Electron TS 
    </heading>
    
    <imgText position="left" src="/images/epsilon/img3.png">
        The admin panel is a desktop app built with Electron. Admins can manage registrations, 
        handle user queries, and coordinate with brand ambassadors all in one place. 
        Auto-generates ID cards and has a fast QR-based attendance scanner for events.
    </imgText>
`

const discordBotContent = `
    <text>
    Cat is a Discord bot that tracks voice channel activity and rewards active members. 
    Logs time spent in VC, awards points, and runs leaderboards.
    </text>
    
    <imgText position="left" src="/images/cat/img1.png">
        Shows everyone how much time they've spent in voice channels. Adds some friendly competition and keeps people engaged.
    </imgText>
    
    <heading>
        Leaderboards
    </heading>
    
    <text>
        The bot automatically ranks members by voice channel time. Simple way to recognize the most active people in your server.
    </text>
    
    <imgText position="right" src="/images/cat/img2.png">
        Members earn points for every hour in VC, which they can spend in a custom shop. Basically turns participation into rewards.
    </imgText>
    
    <imgText position="left" src="/images/cat/img3.png">
        The shop has stuff like private voice channels, special playtime access, and other perks you can customize. Makes it easy to keep your community active.
    </imgText>
`

const expenseContent = `
    <text>
    Expense Tracker is a mobile app for managing personal finances. Track spending, set budgets, and see where your money's going.
    </text>
    
    <imgText position="left" src="/images/expenseTracker/img1.png">
        Categorize expenses, check spending trends, and keep everything organized in one place. Makes it easier to see spending patterns.
    </imgText>
    
    <heading>
        Smart Budgeting
    </heading>
    
    <text>
        Set monthly budgets for different categories and get alerts when you're getting close to your limit. Helps stay on track without overthinking it.
    </text>
    
    <imgText position="right" src="/images/expenseTracker/img2.png">
        Charts and graphs make it clear where your money's going. Add expenses quickly, snap photos of receipts, and everything syncs across devices.
    </imgText>
    
    <imgText position="left" src="/images/expenseTracker/img3.png">
        The app generates reports showing where you could save money and helps identify spending patterns. Also suggests ways to hit financial goals based on your habits.
    </imgText>
`



export { voltContent, epsilonContent, discordBotContent, expenseContent }