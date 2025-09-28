import React, { useEffect, useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import { 
  TrendingUp, TrendingDown, DollarSign, Target, Zap, 
  RefreshCw, LogOut, Wallet, Trophy, BarChart3, PieChart as PieChartIcon,
  ChevronLeft, ChevronRight, Circle, FileText, MessageCircle, Send, X,
  Loader2, AlertCircle
} from "lucide-react";

const Dashboard = ({ user = { email: "demo@gameplan.com" }, onSignOut = () => console.log("Sign out") }) => {
  // State management
  const [dashboardData, setDashboardData] = useState({
    finance: [],
    transactions: [],
    summary: { Needs: 0, Wants: 0, Savings: 0, goal: 500, tip: "Loading your financial game plan..." },
    sports: [],
    insight: "Loading AI insights...",
    sim: null
  });
  
  const [uiState, setUiState] = useState({
    loading: false,
    reseedStatus: "",
    goalInput: "",
    currentPage: 0,
    chatOpen: false,
    chatMessage: "",
    chatHistory: [],
    chatLoading: false
  });

  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Backend integration
  const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3001';

  const apiCall = async (endpoint, options = {}) => {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API call to ${endpoint} failed:`, error);
      throw error;
    }
  };

  // Demo randomization functions
  const generateRandomSpendingData = () => {
    // Generate random percentages that add up to 100
    const needs = Math.random() * 60 + 30; // 30-90%
    const remaining = 100 - needs;
    const wants = Math.random() * remaining * 0.8; // Up to 80% of remaining
    const savings = remaining - wants;

    // Convert percentages to dollar amounts based on a random monthly income
    const monthlyIncome = Math.random() * 3000 + 2000; // $2000-$5000
    
    return {
      Needs: Math.round((needs / 100) * monthlyIncome),
      Wants: Math.round((wants / 100) * monthlyIncome),
      Savings: Math.round((savings / 100) * monthlyIncome)
    };
  };

  const generateRandomFinanceChart = () => {
    const startingBalance = Math.random() * 3000 + 1000; // $1000-$4000
    const trendType = Math.random();
    let trend;
    
    // 40% chance upward, 40% chance downward, 20% chance volatile/mixed
    if (trendType < 0.4) {
      trend = 1; // Upward trend
    } else if (trendType < 0.8) {
      trend = -1; // Downward trend
    } else {
      trend = 0; // Mixed/volatile trend
    }
    
    const volatility = Math.random() * 200 + 150; // Increased volatility range
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const data = [];
    
    for (let i = 0; i < months.length; i++) {
      let trendComponent;
      
      if (trend === 1) {
        // Upward trend - progressively increase
        trendComponent = i * (Math.random() * 80 + 40); // $40-120 increase per month
      } else if (trend === -1) {
        // Downward trend - progressively decrease
        trendComponent = -i * (Math.random() * 80 + 40); // $40-120 decrease per month
      } else {
        // Mixed trend - random ups and downs
        trendComponent = (Math.random() - 0.5) * 400; // Large random swings
      }
      
      const randomVariation = (Math.random() - 0.5) * volatility;
      const balance = Math.max(100, startingBalance + trendComponent + randomVariation); // Minimum $100 balance
      
      data.push({
        name: months[i],
        balance: Math.round(balance)
      });
    }
    
    return data;
  };

  const generateRandomGoal = () => {
    const goals = [300, 500, 750, 1000, 1250, 1500, 2000];
    return goals[Math.floor(Math.random() * goals.length)];
  };

  const generateRandomTransactions = () => {
    const merchants = [
      "Starbucks", "McDonald's", "Target", "Amazon", "Uber", "Netflix",
      "Spotify", "CVS Pharmacy", "Shell Gas", "Whole Foods", "Costco",
      "Apple Store", "Chipotle", "Uber Eats", "Home Depot", "Best Buy"
    ];
    
    const categories = [
      "Food & Dining", "Shopping", "Transportation", "Entertainment",
      "Gas & Fuel", "Groceries", "Bills & Utilities", "Health & Fitness"
    ];

    const transactions = [];
    for (let i = 0; i < 12; i++) {
      const isDeposit = Math.random() > 0.85; // 15% chance of deposit
      transactions.push({
        id: i,
        merchant: isDeposit ? "Direct Deposit" : merchants[Math.floor(Math.random() * merchants.length)],
        amount: isDeposit ? Math.random() * 1500 + 500 : Math.random() * 200 + 10,
        type: isDeposit ? "Deposit" : "Withdrawal",
        category: isDeposit ? "Income" : categories[Math.floor(Math.random() * categories.length)],
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
      });
    }
    
    return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const generateRandomCreditData = () => {
    const creditLimits = [2500, 3000, 3500, 4000, 5000, 7500, 10000];
    const limit = creditLimits[Math.floor(Math.random() * creditLimits.length)];
    const utilizationPercent = Math.random() * 0.8 + 0.1; // 10-90% utilization
    const used = Math.round(limit * utilizationPercent);
    const available = limit - used;
    
    return { limit, used, available, utilizationPercent: Math.round(utilizationPercent * 100) };
  };

  const generateRandomInsight = (spendingData, financeData) => {
    if (!spendingData || !financeData || financeData.length < 2) {
      return "Loading your financial game plan...";
    }

    const { Needs, Wants, Savings } = spendingData;
    const total = Needs + Wants + Savings;
    const needsPercent = (Needs / total) * 100;
    const wantsPercent = (Wants / total) * 100;
    const savingsPercent = (Savings / total) * 100;
    
    const firstBalance = financeData[0].balance;
    const lastBalance = financeData[financeData.length - 1].balance;
    const isUpwardTrend = lastBalance > firstBalance;
    
    // Generate context-aware insights based on actual data
    const insights = [];
    
    // Trend-based insights
    if (isUpwardTrend) {
      insights.push("You're crushing it this month! Your balance is trending upward like LeBron's fourth quarter performance. Keep this championship momentum going!");
      insights.push("That upward trend is looking MVP-level! You're playing financial basketball like a seasoned pro - consistent execution and smart plays.");
    } else {
      insights.push("Your balance took a dip this period, but even Jordan had off games. Time to review the playbook and make some strategic adjustments for the comeback.");
      insights.push("The trend shows some challenges, but champions know how to bounce back. Focus on tightening up your financial defense and you'll be back on track.");
    }
    
    // Spending pattern insights
    if (savingsPercent >= 20) {
      insights.push(`Your ${savingsPercent.toFixed(0)}% savings rate is championship-level! You're building wealth like Tim Duncan built rings - steady, reliable fundamentals.`);
    } else if (savingsPercent < 10) {
      insights.push(`Your savings are at ${savingsPercent.toFixed(0)}% - time to bench some of those want purchases and get your savings game stronger. Even superstars need solid fundamentals.`);
    }
    
    if (wantsPercent > 40) {
      insights.push(`You're spending ${wantsPercent.toFixed(0)}% on wants - that's like taking too many three-pointers. Mix in some practical plays to balance your financial offense.`);
    } else if (wantsPercent < 15) {
      insights.push(`Your wants spending is disciplined at ${wantsPercent.toFixed(0)}%. You're playing smart financial defense, but remember to reward yourself occasionally for staying motivated.`);
    }
    
    if (needsPercent > 70) {
      insights.push(`${needsPercent.toFixed(0)}% on needs shows solid fundamentals, but see if you can optimize some of those essential expenses to free up cap space for your financial future.`);
    }
    
    return insights[Math.floor(Math.random() * insights.length)];
  };

  // Get random customer IDs for variety
  const getRandomCustomerId = () => {
    // Common Nessie demo customer IDs - you'll need to check which ones exist in your instance
    const customerIds = [
      '5e8b99c8f2edff4b7e0b0f22',
      '5e8b99c8f2edff4b7e0b0f23', 
      '5e8b99c8f2edff4b7e0b0f24',
      '5e8b99c8f2edff4b7e0b0f25',
      '5e8b99c8f2edff4b7e0b0f26',
      // Add more customer IDs as you discover them
    ];
    return customerIds[Math.floor(Math.random() * customerIds.length)];
  };

  // Load dashboard data using different Nessie customers + randomization
  const loadDashboardData = async () => {
    setUiState(prev => ({ ...prev, loading: true }));
    
    try {
      // Pick a random customer for this session
      const randomCustomerId = getRandomCustomerId();
      
      // Fetch data for the random customer
      const [financeRes, transactionsRes] = await Promise.allSettled([
        apiCall(`/customers/${randomCustomerId}/accounts`),
        apiCall(`/customers/${randomCustomerId}/accounts/transactions`)
      ]);

      let financeData, transactionData, spendingData;

      // Process Nessie finance data if available
      if (financeRes.status === 'fulfilled' && financeRes.value && financeRes.value.length > 0) {
        const accounts = financeRes.value;
        const checkingAccount = accounts.find(acc => acc.type === 'Checking') || accounts[0];
        const currentBalance = checkingAccount.balance;
        
        // Create historical chart from current balance with some randomization
        const variation = currentBalance * 0.15; // 15% variation
        const trend = Math.random() > 0.5 ? 1 : -1; // Random trend direction
        
        financeData = [
          { name: "Jan", balance: Math.round(currentBalance + trend * variation * 1.2 + (Math.random() - 0.5) * 200) },
          { name: "Feb", balance: Math.round(currentBalance + trend * variation * 0.8 + (Math.random() - 0.5) * 200) },
          { name: "Mar", balance: Math.round(currentBalance + trend * variation * 0.4 + (Math.random() - 0.5) * 200) },
          { name: "Apr", balance: Math.round(currentBalance + trend * variation * 0.1 + (Math.random() - 0.5) * 200) },
          { name: "May", balance: Math.round(currentBalance + (Math.random() - 0.5) * 100) },
          { name: "Jun", balance: Math.round(currentBalance) }
        ].map(item => ({ ...item, balance: Math.max(100, item.balance) }));
      } else {
        financeData = generateRandomFinanceChart();
      }

      // Process Nessie transactions if available, otherwise generate random
      if (transactionsRes.status === 'fulfilled' && transactionsRes.value && transactionsRes.value.length > 0) {
        // Use real Nessie transactions but add some randomization
        const nessieTransactions = transactionsRes.value;
        
        // Mix real transactions with some randomized ones
        const extraTransactions = generateRandomTransactions().slice(0, 4);
        transactionData = [...nessieTransactions, ...extraTransactions]
          .sort((a, b) => new Date(b.date || b.transaction_date) - new Date(a.date || a.transaction_date))
          .slice(0, 12)
          .map(t => ({
            id: t._id || t.id || Math.random(),
            merchant: t.merchant_name || t.merchant || t.description || 'Unknown Merchant',
            amount: t.amount || Math.random() * 100 + 10,
            type: t.type || (t.amount > 0 ? 'Deposit' : 'Withdrawal'),
            category: t.category || 'Other',
            date: new Date(t.date || t.transaction_date || Date.now()).toLocaleDateString()
          }));
      } else {
        transactionData = generateRandomTransactions();
      }

      // Generate spending breakdown based on transaction data
      if (transactionData && transactionData.length > 0) {
        const totalSpending = transactionData
          .filter(t => t.type !== 'Deposit')
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
        if (totalSpending > 0) {
          // Categorize transactions and add some randomization
          const baseNeeds = totalSpending * (0.4 + Math.random() * 0.3); // 40-70%
          const baseWants = totalSpending * (0.2 + Math.random() * 0.3); // 20-50%
          const baseSavings = Math.max(totalSpending * 0.1, Math.random() * 500 + 100); // At least 10% or $100-600
          
          spendingData = {
            Needs: Math.round(baseNeeds),
            Wants: Math.round(baseWants),
            Savings: Math.round(baseSavings)
          };
        } else {
          spendingData = generateRandomSpendingData();
        }
      } else {
        spendingData = generateRandomSpendingData();
      }

      const newData = {
        finance: financeData,
        transactions: transactionData,
        summary: {
          ...spendingData,
          goal: generateRandomGoal(),
          tip: generateRandomInsight(spendingData, financeData)
        },
        insight: generateRandomInsight(spendingData, financeData),
        credit: generateRandomCreditData(),
        // Store raw Nessie data for chatbot accuracy
        rawNessieData: {
          accounts: financeRes.status === 'fulfilled' ? financeRes.value : null,
          customerId: randomCustomerId
        },
        sim: null,
        currentCustomerId: randomCustomerId // Store for debugging
      };

      setDashboardData(newData);
    } catch (error) {
      console.error('Failed to load Nessie data:', error);
      
      // Fallback to fully randomized data
      const spendingData = generateRandomSpendingData();
      const financeData = generateRandomFinanceChart();
      setDashboardData({
        finance: financeData,
        transactions: generateRandomTransactions(),
        summary: {
          ...spendingData,
          goal: generateRandomGoal(),
          tip: generateRandomInsight(spendingData, financeData)
        },
        insight: generateRandomInsight(spendingData, financeData),
        credit: generateRandomCreditData(),
        sim: null
      });
    } finally {
      setUiState(prev => ({ ...prev, loading: false }));
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Helper functions
  const formatCurrency = (amount) => {
    const num = Number(amount) || 0;
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return `${num.toFixed(2)}`;
  };

  const formatCurrencyDetailed = (amount) => {
    const num = Number(amount) || 0;
    return `${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatTransactionAmount = (transaction) => {
    const amount = Number(transaction.amount) || 0;
    const prefix = transaction.type === "Deposit" ? "+" : transaction.type === "Withdrawal" ? "-" : "";
    return `${prefix}${formatCurrency(amount)}`;
  };

  const getUserDisplay = () => {
    if (!user) return "Player";
    return user.email || user.Username || user.name || "Player";
  };

  // Touch handlers
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && uiState.currentPage < pages.length - 1) {
      setUiState(prev => ({ ...prev, currentPage: prev.currentPage + 1 }));
    }
    if (isRightSwipe && uiState.currentPage > 0) {
      setUiState(prev => ({ ...prev, currentPage: prev.currentPage - 1 }));
    }
  };

  // Event handlers
  const handleUpdateGoal = async () => {
    const goalValue = uiState.goalInput.trim();
    if (!goalValue) return;
    
    try {
      await apiCall('/goal', {
        method: 'POST',
        body: JSON.stringify({ goal: Number(goalValue) })
      });
      
      setDashboardData(prev => ({
        ...prev,
        summary: { ...prev.summary, goal: Number(goalValue) }
      }));
      setUiState(prev => ({ ...prev, goalInput: "" }));
    } catch (error) {
      console.error('Failed to update goal:', error);
      // Fallback to local update
      setDashboardData(prev => ({
        ...prev,
        summary: { ...prev.summary, goal: Number(goalValue) }
      }));
      setUiState(prev => ({ ...prev, goalInput: "" }));
    }
  };

  const handleSimulate = async () => {
    try {
      const result = await apiCall('/simulate', {
        method: 'POST',
        body: JSON.stringify({ stake: 25 })
      });
      
      setDashboardData(prev => ({ ...prev, sim: result }));
    } catch (error) {
      console.error('Simulation failed:', error);
      // Fallback simulation for stock simulator
      const stocks = ['Apple (AAPL)', 'Microsoft (MSFT)', 'Tesla (TSLA)', 'Amazon (AMZN)'];
      const outcomes = ['Gain', 'Loss'];
      const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
      const multiplier = outcome === 'Gain' ? 1 + Math.random() * 0.3 : 1 - Math.random() * 0.2;
      const final = 25 * multiplier;
      const pctChange = ((final - 25) / 25) * 100;
      const gainLoss = final - 25;
      
      const insights = [
        "Apple played solid fundamentals! That's how you build a championship portfolio.",
        "Market volatility is like defense - it can be tough, but champions stay focused on the long game.",
        "Nice pick! You're reading the market like a point guard reading the defense.",
        "Even MJ had off nights. This stock will bounce back - keep your investment game strong!"
      ];
      
      const simData = {
        outcome,
        stock: stocks[Math.floor(Math.random() * stocks.length)],
        stake: 25,
        final: Math.round(final * 100) / 100,
        gainLoss: Math.round(gainLoss * 100) / 100,
        pctChange: Math.round(pctChange * 100) / 100,
        insight: insights[Math.floor(Math.random() * insights.length)],
        period: "1 month simulation"
      };
      
      setDashboardData(prev => ({ ...prev, sim: simData }));
    }
  };

  // Chat functionality
  const handleSendMessage = async () => {
    const message = uiState.chatMessage.trim();
    if (!message || uiState.chatLoading) return;

    const newMessage = { text: message, sender: 'user', timestamp: new Date() };
    setUiState(prev => ({
      ...prev,
      chatHistory: [...prev.chatHistory, newMessage],
      chatMessage: "",
      chatLoading: true
    }));

    try {
      const response = await apiCall('/ai/ask', {
        method: 'POST',
        body: JSON.stringify({ question: message })
      });

      const aiMessage = { 
        text: response.answer || "Sorry, I couldn't process that question right now.",
        sender: 'ai', 
        timestamp: new Date() 
      };

      setUiState(prev => ({
        ...prev,
        chatHistory: [...prev.chatHistory, aiMessage],
        chatLoading: false
      }));
    } catch (error) {
      console.error('Chat failed:', error);
      
      // Generate context-aware response based on current data
      const contextualResponse = generateContextualChatResponse(message, dashboardData);
      
      const aiMessage = { 
        text: contextualResponse,
        sender: 'ai', 
        timestamp: new Date() 
      };

      setUiState(prev => ({
        ...prev,
        chatHistory: [...prev.chatHistory, aiMessage],
        chatLoading: false
      }));
    }
  };

  const generateContextualChatResponse = (question, data) => {
    const lowerQ = question.toLowerCase();
    
    if (!data.summary || !data.finance || data.finance.length < 2) {
      return "Coach is reviewing the playbook. Try asking again in a moment!";
    }

    const { Needs, Wants, Savings, goal } = data.summary;
    const total = Needs + Wants + Savings;
    const savingsPercent = ((Savings / total) * 100).toFixed(0);
    const wantsPercent = ((Wants / total) * 100).toFixed(0);
    const needsPercent = ((Needs / total) * 100).toFixed(0);
    const goalProgress = ((Savings / goal) * 100).toFixed(0);
    
    const firstBalance = data.finance[0].balance;
    const lastBalance = data.finance[data.finance.length - 1].balance;
    const isUpwardTrend = lastBalance > firstBalance;
    const trendDirection = isUpwardTrend ? "upward" : "downward";

    // Context-aware responses based on actual data
    if (lowerQ.includes('budget') || lowerQ.includes('spending') || lowerQ.includes('doing')) {
      return `Looking at your current game plan: You're spending ${needsPercent}% on needs, ${wantsPercent}% on wants, and saving ${savingsPercent}%. Your balance is trending ${trendDirection}. ${savingsPercent >= 15 ? "Your savings discipline is solid!" : "Consider boosting that savings percentage for a stronger financial foundation."}`;
    }
    
    if (lowerQ.includes('save') || lowerQ.includes('saving')) {
      return `You're currently saving ${savingsPercent}% of your spending, with ${Savings.toFixed(0)} towards your ${goal} goal (${goalProgress}% complete). ${goalProgress >= 50 ? "You're more than halfway there - championship level!" : goalProgress >= 25 ? "Solid progress, keep the momentum going!" : "Time to amp up that savings game plan!"}`;
    }
    
    if (lowerQ.includes('trend') || lowerQ.includes('balance')) {
      return `Your balance trend is ${trendDirection} - ${isUpwardTrend ? "that's the kind of momentum champions are made of! Keep executing your game plan." : "time for some strategic adjustments. Even the best teams have rough stretches, but winners bounce back stronger."}`;
    }
    
    if (lowerQ.includes('goal')) {
      return `Your current savings goal is ${goal}, and you're at ${goalProgress}% completion with ${Savings.toFixed(0)} saved. ${goalProgress >= 75 ? "You're in the final stretch - finish strong!" : goalProgress >= 50 ? "Halfway there! Keep that discipline up." : "Remember, every champion started with the first step. Stay focused on your goal."}`;
    }
    
    if (lowerQ.includes('tip') || lowerQ.includes('advice')) {
      const tips = [
        `With ${wantsPercent}% going to wants, ${wantsPercent > 30 ? "consider trimming some of those discretionary expenses" : "you're showing good spending discipline"}.`,
        `Your ${trendDirection} trend ${isUpwardTrend ? "shows you're making smart moves" : "suggests it's time to tighten up your financial game plan"}.`,
        `At ${savingsPercent}% savings rate, ${savingsPercent >= 20 ? "you're playing at an All-Star level" : savingsPercent >= 10 ? "you're building good habits" : "there's room to level up your savings game"}.`
      ];
      return tips[Math.floor(Math.random() * tips.length)];
    }
    
    // Default responses with current data context
    const defaultResponses = [
      `Your financial playbook shows ${savingsPercent}% savings and a ${trendDirection} balance trend. What specific area would you like to focus on?`,
      `Looking at your numbers: ${needsPercent}% needs, ${wantsPercent}% wants, ${savingsPercent}% savings. How can I help optimize your game plan?`,
      `You're ${goalProgress}% toward your ${goal} goal with a ${trendDirection} trending balance. What's your next financial play?`
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const toggleChat = () => {
    setUiState(prev => ({ ...prev, chatOpen: !prev.chatOpen }));
  };

  // Computed values
  const computedValues = useMemo(() => {
    const totalBalance = dashboardData.finance.length > 0 
      ? dashboardData.finance[dashboardData.finance.length - 1].balance 
      : 1650;
    const balanceChange = dashboardData.finance.length > 1 
      ? dashboardData.finance[dashboardData.finance.length - 1].balance - dashboardData.finance[dashboardData.finance.length - 2].balance
      : 130;
    const goalProgress = dashboardData.summary.goal > 0 
      ? (dashboardData.summary.Savings / dashboardData.summary.goal * 100) 
      : 58;

    return { totalBalance, balanceChange, goalProgress };
  }, [dashboardData.finance, dashboardData.summary]);

  // Chart data
  const chartData = useMemo(() => {
    const pieData = [
      { name: "Needs", value: dashboardData.summary.Needs || 0 },
      { name: "Wants", value: dashboardData.summary.Wants || 0 },
      { name: "Savings", value: dashboardData.summary.Savings || 0 }
    ];

    const colors = ["#22c55e", "#f59e0b", "#3b82f6"];

    return { pieData, colors };
  }, [dashboardData.summary]);

  // Page definitions
  const pages = [
    {
      id: 'accounts',
      title: '🏦 Connected Accounts',
      description: "Your financial lineup is locked and loaded! GamePlan has your back by connecting directly to your accounts. Think of it like having scouts watching every play — we see your checking, savings, and credit cards so we can coach you to victory with real-time data.",
      icon: Wallet,
      color: 'from-indigo-600 to-purple-700',
      content: () => (
        <div className="space-y-6">
          {/* Main Connected Accounts Display */}
          <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 p-6 rounded-2xl border border-indigo-700/50">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-indigo-300 mb-2">Your Financial Team</h2>
                <p className="text-slate-300">All accounts synced and ready for action</p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-full">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Capital One Checking */}
              <div className="bg-slate-800/70 p-5 rounded-xl border border-slate-600 hover:border-indigo-500/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-500/20 rounded-lg">
                      <Wallet className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg">Capital One 360 Checking</h3>
                      <p className="text-slate-400 text-sm">Primary checking account</p>
                      <p className="text-xs text-slate-500 mt-1">••••1234</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-400">${formatCurrencyDetailed(computedValues.totalBalance)}</div>
                    <div className="text-sm text-slate-400">Available Balance</div>
                  </div>
                </div>
              </div>

              {/* Capital One Savings */}
              <div className="bg-slate-800/70 p-5 rounded-xl border border-slate-600 hover:border-indigo-500/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-emerald-500/20 rounded-lg">
                      <Target className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg">Capital One 360 Savings</h3>
                      <p className="text-slate-400 text-sm">High-yield savings account</p>
                      <p className="text-xs text-slate-500 mt-1">••••5678</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-400">${formatCurrency(dashboardData.summary.Savings)}</div>
                    <div className="text-sm text-slate-400">2.5% APY</div>
                  </div>
                </div>
              </div>

              {/* Capital One Credit Card */}
              <div className="bg-slate-800/70 p-5 rounded-xl border border-slate-600 hover:border-indigo-500/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-orange-500/20 rounded-lg">
                      <DollarSign className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg">Capital One Quicksilver</h3>
                      <p className="text-slate-400 text-sm">1.5% cashback on all purchases</p>
                      <p className="text-xs text-slate-500 mt-1">••••9876</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-400">
                      ${dashboardData.credit ? formatCurrency(dashboardData.credit.available) : '2,350'}
                    </div>
                    <div className="text-sm text-slate-400">Available Credit</div>
                    <div className="text-xs text-slate-500">
                      {dashboardData.credit 
                        ? `${formatCurrency(dashboardData.credit.used)} / ${formatCurrency(dashboardData.credit.limit)} used`
                        : '$650 / $3,000 used'
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security & Sync Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-900/20 border border-green-700 p-5 rounded-xl">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-green-500/20 rounded-full">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <span className="font-semibold text-green-300">Secure Connection</span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                Bank-level 256-bit encryption protects your data. We use read-only access - we can see your transactions but never move your money.
              </p>
            </div>

            <div className="bg-blue-900/20 border border-blue-700 p-5 rounded-xl">
              <div className="flex items-center space-x-3 mb-3">
                <RefreshCw className="w-5 h-5 text-blue-400" />
                <span className="font-semibold text-blue-300">Real-Time Sync</span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                Your accounts sync automatically every few minutes. Fresh data means smarter coaching and better financial plays.
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-600">
            <h3 className="font-semibold text-slate-200 mb-4 text-lg">Account Summary</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">{formatCurrency(computedValues.totalBalance + dashboardData.summary.Savings)}</div>
                <div className="text-sm text-slate-400">Total Assets</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">+{formatCurrency(computedValues.balanceChange)}</div>
                <div className="text-sm text-slate-400">This Month</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-400 mb-2">
                  {dashboardData.credit ? `${dashboardData.credit.utilizationPercent}%` : '78%'}
                </div>
                <div className="text-sm text-slate-400">Credit Utilization</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'balance',
      title: '💵 Total Balance',
      description: "This is your scoreboard — the big number that tells you if you're in the lead or falling behind. If it's climbing, you're dominating the money game. If it's slipping, it's like your defense broke down — time for a comeback play.",
      icon: DollarSign,
      color: 'from-green-600 to-emerald-700',
      content: () => (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 p-8 rounded-2xl border border-green-700/50 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="p-4 bg-green-500/20 rounded-full">
                <DollarSign className="w-12 h-12 text-green-400" />
              </div>
            </div>
            <h2 className="text-lg font-medium text-green-300 mb-2">Current Score</h2>
            <p className="text-5xl font-bold text-green-400 mb-4">{formatCurrencyDetailed(computedValues.totalBalance)}</p>
            <div className="flex items-center justify-center space-x-3">
              <div className="flex items-center space-x-2">
                {computedValues.balanceChange >= 0 ? (
                  <TrendingUp className="w-6 h-6 text-green-400" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-400" />
                )}
                <span className={`text-xl font-semibold ${computedValues.balanceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {computedValues.balanceChange >= 0 ? '+' : ''}{formatCurrency(computedValues.balanceChange)}
                </span>
              </div>
              <span className="text-slate-400">this month</span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-800/50 p-4 rounded-xl text-center">
              <div className="text-2xl font-bold text-blue-400">{formatCurrency(dashboardData.summary.Savings)}</div>
              <div className="text-sm text-slate-400">Savings</div>
              <div className="text-xs text-slate-500 mt-1">{formatCurrencyDetailed(dashboardData.summary.Savings)}</div>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl text-center">
              <div className="text-2xl font-bold text-green-400">{formatCurrency(dashboardData.summary.Needs)}</div>
              <div className="text-sm text-slate-400">Needs</div>
              <div className="text-xs text-slate-500 mt-1">{formatCurrencyDetailed(dashboardData.summary.Needs)}</div>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl text-center">
              <div className="text-2xl font-bold text-amber-400">{formatCurrency(dashboardData.summary.Wants)}</div>
              <div className="text-sm text-slate-400">Wants</div>
              <div className="text-xs text-slate-500 mt-1">{formatCurrencyDetailed(dashboardData.summary.Wants)}</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'chart',
      title: '📈 Balance Over Time',
      description: "Here's your season record. Every peak is a winning streak, every dip is a slump. Watch how your finances move like a team on a run — you want that line trending upward like a championship climb, not spiraling like a losing streak.",
      icon: BarChart3,
      color: 'from-blue-600 to-cyan-700',
      content: () => (
        <div className="space-y-6">
          <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-600">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dashboardData.finance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                  <YAxis 
                    stroke="#9CA3AF" 
                    fontSize={12}
                    domain={(() => {
                      if (dashboardData.finance.length === 0) return ['auto', 'auto'];
                      const balances = dashboardData.finance.map(d => d.balance);
                      const min = Math.min(...balances);
                      const max = Math.max(...balances);
                      const padding = (max - min) * 0.1; // 10% padding
                      return [Math.max(0, min - padding), max + padding];
                    })()}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                    labelStyle={{ color: '#F3F4F6' }}
                    formatter={(value) => [formatCurrencyDetailed(value), 'Balance']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="balance" 
                    stroke="#22c55e" 
                    fill="url(#balanceGradient)"
                    strokeWidth={3}
                  />
                  <defs>
                    <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-900/20 border border-green-700 p-4 rounded-xl">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <span className="text-sm font-medium text-green-300">Best Month</span>
              </div>
              <div className="text-xl font-bold text-green-400">
                {(() => {
                  if (dashboardData.finance.length === 0) return "Loading...";
                  
                  const maxBalance = Math.max(...dashboardData.finance.map(f => f.balance));
                  const bestMonth = dashboardData.finance.find(f => f.balance === maxBalance);
                  
                  return `${bestMonth.name}: ${formatCurrency(maxBalance)}`;
                })()}
              </div>
            </div>
            <div className="bg-blue-900/20 border border-blue-700 p-4 rounded-xl">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-medium text-blue-300">Trend</span>
              </div>
              <div className="text-xl font-bold text-blue-400">
                {(() => {
                  if (dashboardData.finance.length < 2) return "Calculating...";
                  const firstBalance = dashboardData.finance[0].balance;
                  const lastBalance = dashboardData.finance[dashboardData.finance.length - 1].balance;
                  const overallTrend = lastBalance - firstBalance;
                  return overallTrend >= 0 ? "Upward 📈" : "Downward 📉";
                })()}
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'spending',
      title: '🥧 Spending Breakdown',
      description: "The playbook pie chart. It shows how you're running your offense: \"Needs\" are the solid fundamentals, \"Wants\" are your flashy plays, and \"Savings\" is your long-term strategy. If the pie's all Wants? You're going Harlem Globetrotters with no defense — fun, but risky!",
      icon: PieChartIcon,
      color: 'from-amber-600 to-orange-700',
      content: () => (
        <div className="space-y-6">
          <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-600">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    strokeWidth={2}
                    stroke="#1f2937"
                  >
                    {chartData.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={chartData.colors[index % chartData.colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                    formatter={(value) => [formatCurrency(value), 'Amount']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {dashboardData.summary.tip && (
            <div className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 border border-amber-700 p-6 rounded-2xl">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-amber-500/20 rounded-full">
                  <Target className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-amber-300 mb-2 text-lg">Coach's Playbook</h3>
                  <p className="text-slate-300 leading-relaxed">{dashboardData.summary.tip}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'transactions',
      title: '📓 Recent Transactions',
      description: "This is the play-by-play commentary. Every swipe, every purchase — logged like game stats. Too many Uber Eats orders? That's like taking wild half-court shots all game. Here you see your strengths and the bad habits that might cost you the win.",
      icon: FileText,
      color: 'from-purple-600 to-violet-700',
      content: () => (
        <div className="space-y-4">
          {dashboardData.transactions.slice(0, 8).map((transaction, index) => (
            <div key={transaction.id || index} className="bg-slate-800/50 p-4 rounded-xl border border-slate-600/50 hover:bg-slate-700/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1">
                    <Wallet className="w-4 h-4 text-purple-400" />
                    <span className="font-medium text-white">{transaction.merchant}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-slate-400">
                    <span>{transaction.date}</span>
                    <span>•</span>
                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-slate-700 text-slate-300">
                      {transaction.category}
                    </span>
                  </div>
                </div>
                <div className={`text-right font-bold text-lg ${
                  transaction.type === 'Deposit' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {formatTransactionAmount(transaction)}
                </div>
              </div>
            </div>
          ))}
          {dashboardData.transactions.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-4" />
              <p>No transactions found. Connect your bank account to see your financial plays!</p>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'insights',
      title: '⚡ AI Insights',
      description: "Think of this as your coach's clipboard. GamePlan calls the plays: it spots hot streaks in your saving game and warns you when you're over-shooting on spending. It's like having an assistant coach whispering, \"Run the pick and roll — not another impulse buy!\"",
      icon: Zap,
      color: 'from-yellow-600 to-amber-700',
      content: () => (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-yellow-900/30 to-amber-900/30 border border-yellow-700 p-8 rounded-2xl">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-yellow-500/20 rounded-full">
                <Zap className="w-8 h-8 text-yellow-400" />
              </div>
              <div>
                <h3 className="font-bold text-yellow-300 mb-3 text-xl">Coach's Analysis</h3>
                <p className="text-slate-200 text-lg leading-relaxed">{dashboardData.insight}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-600">
            <div className="flex items-center space-x-2 mb-4">
              <Target className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-semibold">Savings Goal Progress</h2>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-slate-300 text-lg">Progress: {computedValues.goalProgress.toFixed(1)}%</span>
                <span className="text-slate-300 text-lg font-medium">
                  {formatCurrency(dashboardData.summary.Savings)} / {formatCurrency(dashboardData.summary.goal)}
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-4">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-4 rounded-full transition-all duration-1000 shadow-lg"
                  style={{ width: `${Math.min(computedValues.goalProgress, 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <input 
                type="number"
                value={uiState.goalInput} 
                onChange={(e) => setUiState(prev => ({ ...prev, goalInput: e.target.value }))} 
                placeholder="Set new goal amount"
                className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <button 
                onClick={handleUpdateGoal}
                disabled={!uiState.goalInput.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 px-6 py-3 rounded-lg transition-colors font-medium"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'simulator',
      title: '📈 Stock Simulator',
      description: "Here's your practice gym. Try out stock investments without real risk — like testing new plays before game day. Drop in $25 and see how different stocks perform in a 1-month simulation. It's all about building confidence so you can dominate when the real investment game's on.",
      icon: BarChart3,
      color: 'from-cyan-600 to-blue-700',
      content: () => (
        <div className="space-y-6">
          <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-600 text-center">
            <div className="mb-6">
              <div className="p-4 bg-cyan-500/20 rounded-full inline-block mb-4">
                <BarChart3 className="w-12 h-12 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold text-cyan-300 mb-2">Stock Practice Arena</h3>
              <p className="text-slate-400">Test your investment strategy with real stock simulations</p>
            </div>
            
            <button 
              onClick={handleSimulate}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 px-8 py-4 rounded-xl transition-all font-semibold text-lg flex items-center space-x-3 mx-auto transform hover:scale-105"
            >
              <BarChart3 className="w-5 h-5" />
              <span>Invest $25 in Random Stock</span>
            </button>
          </div>
          
          {dashboardData.sim && (
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-600 space-y-4">
              {/* Stock Info */}
              <div className="text-center mb-4">
                <h4 className="text-xl font-bold text-white mb-2">{dashboardData.sim.stock}</h4>
                <p className="text-slate-400 text-sm">{dashboardData.sim.period}</p>
                <div className={`inline-block px-4 py-2 rounded-full text-lg font-bold mt-2 ${
                  dashboardData.sim.outcome === 'Gain' ? 'bg-green-500/20 text-green-400' : 
                  dashboardData.sim.outcome === 'Loss' ? 'bg-red-500/20 text-red-400' : 
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {dashboardData.sim.outcome === 'Gain' ? '📈 Profit!' : 
                   dashboardData.sim.outcome === 'Loss' ? '📉 Loss' : 
                   '➡️ Break Even'}
                </div>
              </div>
              
              {/* Performance Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-700/50 p-4 rounded-xl text-center">
                  <span className="text-slate-400 text-sm block mb-1">Initial</span>
                  <p className="font-bold text-xl text-white">${dashboardData.sim.stake}</p>
                </div>
                <div className="bg-slate-700/50 p-4 rounded-xl text-center">
                  <span className="text-slate-400 text-sm block mb-1">Final</span>
                  <p className="font-bold text-xl text-white">${dashboardData.sim.final}</p>
                </div>
                <div className="bg-slate-700/50 p-4 rounded-xl text-center">
                  <span className="text-slate-400 text-sm block mb-1">Return</span>
                  <p className={`font-bold text-xl ${(dashboardData.sim.pctChange || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {dashboardData.sim.pctChange > 0 ? '+' : ''}{dashboardData.sim.pctChange}%
                  </p>
                </div>
              </div>

              {/* Gain/Loss Display */}
              <div className="bg-slate-700/30 p-4 rounded-xl text-center">
                <span className="text-slate-400 text-sm block mb-1">Net Gain/Loss</span>
                <p className={`font-bold text-2xl ${(dashboardData.sim.gainLoss || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {dashboardData.sim.gainLoss > 0 ? '+' : ''}${dashboardData.sim.gainLoss}
                </p>
              </div>
              
              {/* AI Coaching Insight */}
              {dashboardData.sim.insight && (
                <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border border-cyan-700 p-4 rounded-xl">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-cyan-500/20 rounded-full">
                      <Zap className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-cyan-300 mb-1">Coach's Take</h4>
                      <p className="text-slate-300 leading-relaxed">{dashboardData.sim.insight}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Demo Note */}
          <div className="bg-blue-900/20 border border-blue-700 p-4 rounded-xl">
            <div className="flex items-center space-x-3">
              <RefreshCw className="w-5 h-5 text-blue-400" />
              <div>
                <h4 className="font-semibold text-blue-300 mb-1">Demo Mode Active</h4>
                <p className="text-slate-300 text-sm">Click "Refresh Data" to see new randomized spending patterns, chart trends, and goals!</p>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white overflow-hidden">
      {/* Header */}
      <header className="p-4 bg-slate-800 flex justify-between items-center border-b border-slate-700 relative z-10">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <DollarSign className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <span className="font-bold text-lg text-green-400">GamePlan</span>
            <p className="text-sm text-slate-400">Welcome, {getUserDisplay()}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={toggleChat}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors relative"
          >
            <MessageCircle className="w-4 h-4" />
            <span>AI Chat</span>
            {uiState.chatHistory.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {uiState.chatHistory.filter(m => m.sender === 'ai').length}
              </span>
            )}
          </button>
          <button 
            onClick={onSignOut} 
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Chat Overlay */}
      {uiState.chatOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-end z-50 p-4">
          <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md h-96 flex flex-col border border-slate-600">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-600">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Zap className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-300">GamePlan Coach</h3>
                  <p className="text-xs text-slate-400">Your AI financial advisor</p>
                </div>
              </div>
              <button 
                onClick={toggleChat}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {uiState.chatHistory.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4" />
                  <p className="text-sm">Ask me anything about your finances!</p>
                  <p className="text-xs mt-2">Try: "How am I doing with my budget?" or "Tips for saving more money?"</p>
                </div>
              ) : (
                uiState.chatHistory.map((message, index) => (
                  <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs p-3 rounded-xl ${
                      message.sender === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-700 text-slate-200'
                    }`}>
                      <p className="text-sm">{message.text}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              
              {uiState.chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-700 text-slate-200 max-w-xs p-3 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Coach is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-slate-600">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={uiState.chatMessage}
                  onChange={(e) => setUiState(prev => ({ ...prev, chatMessage: e.target.value }))}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask about your finances..."
                  className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  disabled={uiState.chatLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!uiState.chatMessage.trim() || uiState.chatLoading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 p-2 rounded-lg transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {uiState.loading && (
        <div className="bg-blue-900/20 border border-blue-700 p-3 mx-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
            <span className="text-blue-300">Generating new demo data...</span>
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <div className="flex justify-center py-2">
        <button
          onClick={loadDashboardData}
          disabled={uiState.loading}
          className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
        >
          <RefreshCw className={`w-4 h-4 ${uiState.loading ? 'animate-spin' : ''}`} />
          <span>{uiState.loading ? 'Generating...' : 'New Demo Data'}</span>
        </button>
      </div>

      {/* Page Indicator */}
      <div className="flex justify-center py-4 space-x-2">
        {pages.map((_, index) => (
          <button
            key={index}
            onClick={() => setUiState(prev => ({ ...prev, currentPage: index }))}
            className="transition-all duration-200"
          >
            <Circle 
              className={`w-3 h-3 ${
                index === uiState.currentPage ? 'fill-blue-400 text-blue-400' : 'fill-slate-600 text-slate-600'
              }`} 
            />
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div 
        className="relative h-full"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div 
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${uiState.currentPage * 100}%)` }}
        >
          {pages.map((page, index) => (
            <div key={page.id} className="w-full flex-shrink-0 px-6 pb-6">
              {/* Page Header */}
              <div className={`bg-gradient-to-r ${page.color} p-6 rounded-2xl mb-6 shadow-lg`}>
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-black/20 rounded-xl">
                    <page.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-white mb-3">{page.title}</h1>
                    <p className="text-white/90 leading-relaxed">{page.description}</p>
                  </div>
                </div>
              </div>

              {/* Page Content */}
              <div className="space-y-4">
                {page.content()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="fixed bottom-6 left-6 right-6 flex justify-between items-center pointer-events-none">
        <button 
          onClick={() => setUiState(prev => ({ ...prev, currentPage: Math.max(0, prev.currentPage - 1) }))}
          disabled={uiState.currentPage === 0}
          className={`p-3 rounded-full transition-all pointer-events-auto ${
            uiState.currentPage === 0 
              ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed' 
              : 'bg-slate-700 hover:bg-slate-600 text-white shadow-lg'
          }`}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <button 
          onClick={() => setUiState(prev => ({ ...prev, currentPage: Math.min(pages.length - 1, prev.currentPage + 1) }))}
          disabled={uiState.currentPage === pages.length - 1}
          className={`p-3 rounded-full transition-all pointer-events-auto ${
            uiState.currentPage === pages.length - 1 
              ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed' 
              : 'bg-slate-700 hover:bg-slate-600 text-white shadow-lg'
          }`}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default Dashboard;