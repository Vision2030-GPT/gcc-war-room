export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

  const RSS_FEEDS = [
    { name: "Khaleej Times", url: "https://news.google.com/rss/search?q=site:khaleejtimes.com&hl=en&gl=AE&ceid=AE:en", category: "uae" },
    { name: "UAE News", url: "https://news.google.com/rss/search?q=UAE+Dubai+Abu+Dhabi&hl=en&gl=AE&ceid=AE:en", category: "uae" },
    { name: "Gulf Conflict", url: "https://news.google.com/rss/search?q=Iran+UAE+Gulf+war+missile+drone&hl=en&gl=AE&ceid=AE:en", category: "conflict" },
  ];

  const parseRSS = (xml, defaultSource, category) => {
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    while ((match = itemRegex.exec(xml)) !== null) {
      const itemXml = match[1];
      const getTag = (tag) => {
        const r = new RegExp('<' + tag + '[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></' + tag + '>|<' + tag + '[^>]*>([\\s\\S]*?)</' + tag + '>');
        const m = itemXml.match(r);
        return m ? (m[1] || m[2] || '').trim() : '';
      };
      let title = getTag('title');
      const link = getTag('link');
      const pubDate = getTag('pubDate');
      let description = getTag('description').replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&#39;/g, "'").slice(0, 250);
      let source = defaultSource;
      const sourceMatch = title.match(/\s-\s([^-]+)$/);
      if (sourceMatch) { source = sourceMatch[1].trim(); title = title.replace(/\s-\s[^-]+$/, '').trim(); }
      if (title && title.length > 5) {
        items.push({ title, link, pubDate, description, source, category, timestamp: pubDate ? new Date(pubDate).getTime() : 0 });
      }
    }
    return items;
  };

  try {
    const results = await Promise.all(RSS_FEEDS.map(async (feed) => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        const response = await fetch(feed.url, { signal: controller.signal, headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GCC-War-Room/1.0)', 'Accept': 'application/rss+xml, application/xml, text/xml, */*' } });
        clearTimeout(timeout);
        if (!response.ok) return [];
        return parseRSS(await response.text(), feed.name, feed.category);
      } catch (e) { return []; }
    }));

    const seen = new Set();
    const deduped = results.flat().filter(item => { const key = item.title.toLowerCase().slice(0, 50); if (seen.has(key)) return false; seen.add(key); return true; });
    deduped.sort((a, b) => b.timestamp - a.timestamp);

    const conflictKW = ['iran', 'missile', 'drone', 'strike', 'attack', 'war', 'military', 'defense', 'defence', 'bomb', 'hormuz', 'houthi', 'ceasefire', 'conflict', 'nuclear', 'evacuation', 'embassy', 'shelter', 'alert', 'intercept', 'casualt', 'weapon', 'navy', 'centcom', 'hezbollah', 'irgc', 'ballistic', 'air defense', 'oil price', 'tanker', 'strait', 'gulf crisis', 'gcc', 'khamenei', 'epic fury', 'thaad', 'patriot', 'jebel ali', 'fujairah', 'ncema'];

    const tagged = deduped.slice(0, 40).map(item => {
      const text = (item.title + ' ' + item.description).toLowerCase();
      const isConflictRelated = conflictKW.some(kw => text.includes(kw));
      const isUAE = ['uae', 'dubai', 'abu dhabi', 'sharjah', 'fujairah', 'emirates'].some(kw => text.includes(kw));
      return { ...item, isConflictRelated, isUAE };
    });

    const sourceCounts = {};
    tagged.forEach(item => { sourceCounts[item.source] = (sourceCounts[item.source] || 0) + 1; });

    res.status(200).json({ success: true, count: tagged.length, lastUpdated: new Date().toISOString(), sources: Object.entries(sourceCounts).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count })), items: tagged });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
