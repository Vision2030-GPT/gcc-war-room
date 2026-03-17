export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  const RSS_FEEDS = [
    { name: "Khaleej Times", url: "https://www.khaleejtimes.com/feed", category: "uae" },
    { name: "Gulf News", url: "https://gulfnews.com/rss/uae", category: "uae" },
    { name: "The National", url: "https://www.thenationalnews.com/mena/rss", category: "gcc" },
    { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", category: "world" },
    { name: "Reuters World", url: "https://feeds.reuters.com/Reuters/worldNews", category: "world" },
  ];

  const parseRSS = (xml, sourceName, category) => {
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    
    while ((match = itemRegex.exec(xml)) !== null) {
      const itemXml = match[1];
      const getTag = (tag) => {
        const r = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`);
        const m = itemXml.match(r);
        return m ? (m[1] || m[2] || '').trim() : '';
      };
      
      const title = getTag('title');
      const link = getTag('link');
      const pubDate = getTag('pubDate');
      const description = getTag('description')
        .replace(/<[^>]*>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .slice(0, 200);
      
      if (title) {
        items.push({
          title,
          link,
          pubDate,
          description,
          source: sourceName,
          category,
          timestamp: pubDate ? new Date(pubDate).getTime() : 0,
        });
      }
    }
    return items;
  };

  try {
    const feedPromises = RSS_FEEDS.map(async (feed) => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        
        const response = await fetch(feed.url, {
          signal: controller.signal,
          headers: { 'User-Agent': 'GCC-War-Room-Dashboard/1.0' },
        });
        clearTimeout(timeout);
        
        if (!response.ok) return [];
        const xml = await response.text();
        return parseRSS(xml, feed.name, feed.category);
      } catch (e) {
        console.log(`Failed to fetch ${feed.name}: ${e.message}`);
        return [];
      }
    });

    const results = await Promise.all(feedPromises);
    const allItems = results
      .flat()
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 50);

    // Tag items with conflict-relevance keywords
    const conflictKeywords = ['iran', 'missile', 'drone', 'strike', 'attack', 'war', 'military', 'defense', 'defence', 'bomb', 'hormuz', 'houthi', 'ceasefire', 'conflict', 'nuclear', 'sanction', 'evacuation', 'embassy', 'shelter', 'alert', 'intercept', 'casualt', 'weapon', 'navy', 'airforce', 'centcom', 'pentagon', 'hezbollah', 'irgc', 'ballistic', 'cruise missile', 'air defense', 'oil price', 'tanker', 'shipping', 'strait', 'gulf', 'gcc', 'uae', 'dubai', 'abu dhabi', 'bahrain', 'qatar', 'kuwait', 'saudi', 'oman'];
    
    const taggedItems = allItems.map(item => {
      const text = (item.title + ' ' + item.description).toLowerCase();
      const isConflictRelated = conflictKeywords.some(kw => text.includes(kw));
      return {
        ...item,
        isConflictRelated,
        relevance: isConflictRelated ? 'high' : 'general',
      };
    });

    res.status(200).json({
      success: true,
      count: taggedItems.length,
      lastUpdated: new Date().toISOString(),
      sources: RSS_FEEDS.map(f => f.name),
      items: taggedItems,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch news feeds',
      message: error.message,
    });
  }
}
