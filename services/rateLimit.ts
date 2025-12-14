const STORAGE_KEY = 'bible_ai_usage';
const DAILY_LIMIT = 30;

interface UsageData {
    date: string;
    count: number;
}

export const checkRateLimit = (): boolean => {
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (!stored) return true;

    try {
        const data: UsageData = JSON.parse(stored);
        if (data.date !== today) {
            // New day, reset
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count: 0 }));
            return true;
        }
        return data.count < DAILY_LIMIT;
    } catch (e) {
        // Fallback if error parsing
        return true;
    }
};

export const incrementUsage = () => {
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem(STORAGE_KEY);
    
    let data: UsageData = { date: today, count: 0 };
    
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            if (parsed.date === today) {
                data = parsed;
            }
        } catch (e) {
            console.error("Error parsing usage data");
        }
    }
    
    data.count += 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const getRemainingCount = (): number => {
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (!stored) return DAILY_LIMIT;
    
    try {
        const data: UsageData = JSON.parse(stored);
        if (data.date !== today) return DAILY_LIMIT;
        return Math.max(0, DAILY_LIMIT - data.count);
    } catch (e) {
        return DAILY_LIMIT;
    }
};