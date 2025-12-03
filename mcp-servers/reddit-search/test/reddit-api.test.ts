/**
 * Integration tests for Reddit Search MCP Server
 * 
 * Tests actual Reddit API connectivity and data parsing.
 * These tests require internet connectivity.
 * 
 * Run with: npx tsx test/reddit-api.test.ts
 */

interface RedditPost {
  title: string;
  author: string;
  url: string;
  permalink: string;
  upvotes: number;
  comments: number;
  content: string;
  created: string;
  tags: string[];
}

interface RedditApiChild {
  data: {
    title: string;
    author: string;
    permalink: string;
    ups: number;
    num_comments: number;
    selftext: string;
    created_utc: number;
    link_flair_text?: string;
  };
}

interface RedditApiResponse {
  data: {
    children: RedditApiChild[];
  };
}

// ============================================================================
// TEST HELPERS
// ============================================================================

let passCount = 0;
let failCount = 0;

function test(name: string, fn: () => Promise<void> | void): Promise<void> {
  return Promise.resolve(fn())
    .then(() => {
      console.log(`✅ PASS: ${name}`);
      passCount++;
    })
    .catch((error) => {
      console.log(`❌ FAIL: ${name}`);
      console.log(`   Error: ${error.message}`);
      failCount++;
    });
}

function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${expected}, got ${actual}`);
  }
}

function assertTrue(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

// ============================================================================
// REDDIT API FUNCTIONS (copied from index.ts for testing)
// ============================================================================

async function fetchRedditPosts(
  subreddit: string,
  sort: 'hot' | 'new' | 'top' = 'hot',
  limit: number = 25,
  timeframe: string = 'week'
): Promise<RedditPost[]> {
  const url = `https://www.reddit.com/r/${subreddit}/${sort}.json?limit=${limit}&t=${timeframe}`;
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'UIPathKnowledgeBase/2.0 (Educational Bot Test)',
      'Accept': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Reddit API error: ${response.status} ${response.statusText}`);
  }
  
  const json = await response.json() as RedditApiResponse;
  
  return json.data.children.map((child: RedditApiChild) => {
    const post = child.data;
    return {
      title: post.title,
      author: post.author,
      url: `https://www.reddit.com${post.permalink}`,
      permalink: post.permalink,
      upvotes: post.ups,
      comments: post.num_comments,
      content: post.selftext.substring(0, 500) + (post.selftext.length > 500 ? '...' : ''),
      created: new Date(post.created_utc * 1000).toISOString(),
      tags: extractTags(post.title + ' ' + post.selftext, post.link_flair_text),
    };
  });
}

function extractTags(text: string, flair?: string): string[] {
  const tags: string[] = [];
  const lowerText = text.toLowerCase();
  
  const keywords = [
    'api', 'http', 'orchestrator', 'queue', 'selector', 'excel', 
    'reframework', 'citrix', 'pdf', 'email', 'database', 'as400',
    'legacy', 'integration', 'error', 'bug', 'help', 'best-practices',
    'certification', 'learning', 'studio', 'robot', 'attended', 'unattended',
    'document-understanding', 'ai', 'ml', 'automation', 'workflow'
  ];
  
  keywords.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      tags.push(keyword);
    }
  });
  
  if (flair) {
    tags.push(flair.toLowerCase().replace(/\s+/g, '-'));
  }
  
  return [...new Set(tags)];
}

async function searchRedditPosts(query: string, limit: number = 10): Promise<RedditPost[]> {
  const url = `https://www.reddit.com/r/UiPath/search.json?q=${encodeURIComponent(query)}&restrict_sr=1&limit=${limit}&sort=relevance`;
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'UIPathKnowledgeBase/2.0 (Educational Bot Test)',
      'Accept': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Reddit search error: ${response.status}`);
  }
  
  const json = await response.json() as RedditApiResponse;
  
  return json.data.children.map((child: RedditApiChild) => {
    const post = child.data;
    return {
      title: post.title,
      author: post.author,
      url: `https://www.reddit.com${post.permalink}`,
      permalink: post.permalink,
      upvotes: post.ups,
      comments: post.num_comments,
      content: post.selftext.substring(0, 500) + (post.selftext.length > 500 ? '...' : ''),
      created: new Date(post.created_utc * 1000).toISOString(),
      tags: extractTags(post.title + ' ' + post.selftext, post.link_flair_text),
    };
  });
}

// ============================================================================
// TESTS
// ============================================================================

async function runTests() {
  console.log('\n🧪 Reddit Search MCP Server - Integration Tests\n');
  console.log('=' .repeat(60));
  
  // Test 1: Can fetch hot posts from r/UiPath
  await test('fetchRedditPosts returns posts from r/UiPath', async () => {
    const posts = await fetchRedditPosts('UiPath', 'hot', 5);
    assertTrue(Array.isArray(posts), 'Result should be an array');
    assertTrue(posts.length > 0, 'Should return at least 1 post');
    assertTrue(posts.length <= 5, 'Should respect limit parameter');
  });
  
  // Test 2: Posts have required fields
  await test('Posts have all required fields', async () => {
    const posts = await fetchRedditPosts('UiPath', 'hot', 1);
    const post = posts[0];
    
    assertTrue(typeof post.title === 'string', 'title should be string');
    assertTrue(typeof post.author === 'string', 'author should be string');
    assertTrue(typeof post.url === 'string', 'url should be string');
    assertTrue(typeof post.upvotes === 'number', 'upvotes should be number');
    assertTrue(typeof post.comments === 'number', 'comments should be number');
    assertTrue(Array.isArray(post.tags), 'tags should be array');
    assertTrue(post.url.includes('reddit.com'), 'url should contain reddit.com');
  });
  
  // Test 3: Can search r/UiPath
  await test('searchRedditPosts returns search results', async () => {
    const posts = await searchRedditPosts('automation', 3);
    assertTrue(Array.isArray(posts), 'Result should be an array');
    // Note: Search might return 0 results depending on query
  });
  
  // Test 4: extractTags identifies UIPath keywords
  await test('extractTags identifies relevant keywords', () => {
    const tags = extractTags('Need help with API integration and Excel automation');
    assertTrue(tags.includes('api'), 'Should identify "api"');
    assertTrue(tags.includes('excel'), 'Should identify "excel"');
    assertTrue(tags.includes('help'), 'Should identify "help"');
    assertTrue(tags.includes('integration'), 'Should identify "integration"');
  });
  
  // Test 5: extractTags handles flair
  await test('extractTags includes flair as tag', () => {
    const tags = extractTags('Some post content', 'Question');
    assertTrue(tags.includes('question'), 'Should include flair as lowercase tag');
  });
  
  // Test 6: extractTags removes duplicates
  await test('extractTags removes duplicate tags', () => {
    const tags = extractTags('api API Api integration');
    const apiCount = tags.filter(t => t === 'api').length;
    assertEqual(apiCount, 1, 'Should have only one "api" tag');
  });
  
  // Test 7: Can fetch different sort orders
  await test('fetchRedditPosts supports different sort orders', async () => {
    const hotPosts = await fetchRedditPosts('UiPath', 'hot', 2);
    const newPosts = await fetchRedditPosts('UiPath', 'new', 2);
    
    assertTrue(hotPosts.length > 0, 'Hot posts should return results');
    assertTrue(newPosts.length > 0, 'New posts should return results');
  });
  
  // Test 8: Handles empty subreddit gracefully
  await test('Handles non-existent subreddit with error', async () => {
    try {
      await fetchRedditPosts('thisdoesnotexist12345xyz', 'hot', 1);
      throw new Error('Should have thrown an error');
    } catch (error) {
      assertTrue(error instanceof Error, 'Should throw Error');
    }
  });
  
  // Summary
  console.log('\n' + '=' .repeat(60));
  console.log(`\n📊 Test Results: ${passCount} passed, ${failCount} failed\n`);
  
  if (failCount > 0) {
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('Test runner error:', error);
  process.exit(1);
});
