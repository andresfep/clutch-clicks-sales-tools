/* =====================================================================
   Clutch Clicks — Growth Plan Call Script (content)
   ---------------------------------------------------------------------
   All word-for-word copy lives here so the sales team can edit the
   script without touching app logic. Source: "Growth Plan Call SOP —
   Closer Edition" (built from Brandon Ly's recorded calls).

   Template fields: {{name}} {{shop}} {{city}} {{trade}} {{aov}}
   {{conservative}} {{software}} render as highlighted fields that fill
   in from the Numbers panel.
   ===================================================================== */

window.CC_PRICING = {
  monthly: 297,
  listing: 500,
  listingSpecial: 250,
  receptionist: 200,
  threeMonthMonths: 3,
};

/* The five sections the rep sees. Each one renders as a single page;
   `steps` are the SOP stages stacked inside it. */
window.CC_SECTIONS = [
  { id: 'discovery', num: 1, label: 'INTRO + DISCOVERY', title: 'Intro + Discovery', time: '0 – 12 min', target: 720,
    goal: 'Confirm the video, gate the decision maker, set the path, and get every objection on the table while you still have time to handle it.',
    steps: ['intro', 'watch', 'questions'] },
  { id: 'bridge', num: 2, label: 'ROI BRIDGE', title: 'ROI Bridge', time: '12 – 19 min', target: 420,
    goal: 'Teach them how they actually make money with us. All three metrics get covered — in whatever order the call takes you — before the money.',
    steps: ['bridge', 'm1', 'm2', 'm3'] },
  { id: 'money', num: 3, label: 'THE MONEY', title: 'The Money', time: '19 – 22 min', target: 240,
    goal: 'Their ticket, cut in half, tied to the features. Must land before any price is on the table.',
    steps: ['money'] },
  { id: 'gmb', num: 4, label: 'THE GMB', title: 'Diagnose the GMB', time: '22 – 26 min', target: 240,
    goal: 'Show them what\'s broken on their Google profile so the listing price makes sense in the close.',
    steps: ['gmb'] },
  { id: 'closing', num: 5, label: 'CLOSING', title: 'Closing', time: '26 – 30 min', target: 600,
    goal: 'Four things, timeline, $297 and $500 stated plainly, the special, binary ask, card, onboarding booked.',
    steps: ['checkout', 'payment'] },
  { id: 'post', num: 6, label: 'POST-CALL', title: 'Post-Call', time: 'After', target: 0,
    goal: 'Log what happened. This is what will sync to GoHighLevel.',
    steps: ['postcall'] },
];

/* The straight line. When an objection or question interrupts, answer it,
   then fall back to the first section that isn't done yet. */
window.CC_STRAIGHT_LINE = ['discovery', 'bridge', 'money', 'gmb', 'closing'];

/* Stages that MUST be checked off before the rep moves to checkout. */
window.CC_CHECKOUT_REQUIRES = ['m1', 'm2', 'm3', 'money', 'gmb'];

/* The metrics — used by the Questions stage "leads into" links and by
   the ROI Bridge to show what is still owed. */
window.CC_METRICS = [
  { id: 'm1', short: 'Metric 1', label: 'Leads captured' },
  { id: 'm2', short: 'Metric 2', label: 'Missed calls saved' },
  { id: 'm3', short: 'Metric 3', label: 'Reviews / reactivation' },
];

/* The 6 most common questions from the discovery stage. Each one ends with a bridge
   into a metric so the rep can teach it right there and check it off. */
window.CC_QUESTIONS = [
  {
    id: 'own',
    q: '"Do I own the website? What happens if I cancel?"',
    answer: [
      { type: 'say', text: '"You keep everything we build you on the front end — the whole site, all the service pages, all your data, all your leads. What you don\'t keep are the AI automations, the Missed Call Text-Back, and the review system. Those are ours."' },
      { type: 'say', text: '"I\'m sure you\'re asking yourself what\'s the difference between a smart website vs a traditional website, and why shops have this set up?"' },
      { type: 'stop', text: 'They answer.' },
      { type: 'say', text: '"The real reason guys switch to a smart website system over a traditional one comes down to the sales process: tracking your lead flow and knowing your numbers so you can scale the smartest way possible. Before I get into that — do you know how many leads you\'re capturing from your website right now?"' },
    ],
    leadsTo: 'm1',
  },
  {
    id: 'ads',
    q: '"Why don\'t you just run ads for me?" / "What makes you different?"',
    answer: [
      { type: 'say', text: '"We run ads and have in-depth SEO packages on the back end, however we will never sell you on ads if you don\'t have your foundation set up. Most guys come to me thinking the first thing they have to do is run ads to bring in new business to their shop."' },
      { type: 'say', text: '"That\'s like going from second gear to fourth gear without starting at first gear. If we sold you on ads, we\'d be burning your money. First gear is your Google My Business listing and a website that actually turns the traffic into leads. Does that make sense?"' },
      { type: 'tip', text: 'Expect this one. It comes up on most calls in some form — have it loaded.' },
    ],
    leadsTo: 'm1',
  },
  {
    id: 'catch',
    q: '"Why is it only $297? What\'s the catch?"',
    answer: [
      { type: 'say', text: '"That\'s a great question. There is no catch. It\'s $297 a month, no contract. We rebuild your site so you can capture leads and turn them into real conversations you can close on, implement a system to catch the calls you\'re missing, and get you more reviews to outrank your competitors."' },
      { type: 'say', text: '"The reason why people pay us $297 a month and we don\'t do contracts is because we track three numbers every month so you can understand your ROI: leads captured from the traffic you\'re already getting, missed calls saved, reviews earned."' },
      { type: 'say', text: '"Let\'s talk about leads captured. Do you know how many leads you\'re capturing through your current website at the moment?"' },
    ],
    leadsTo: 'm1',
  },
  {
    id: 'software',
    q: '"Will it work with my software?"',
    answer: [
      { type: 'say', text: '"Yep — CCC One, Tekmetric, Shopmonkey, Mitchell 1. We pull your list out of whatever you\'re on, or connect on the back end so they talk to each other."' },
      { type: 'say', text: '"We reactivate them to leave a Google review, which helps you outrank your competitors, and if you ever want to send a promotion, we help you craft it."' },
      { type: 'say', text: '"Are you on any of those, or where do you keep your customers?"' },
      { type: 'capture', field: 'software', label: 'Their shop software / where the customer list lives' },
    ],
    leadsTo: 'm3',
  },
  {
    id: 'host',
    q: '"Do you host it? What about my domain?"',
    answer: [
      { type: 'say', text: '"You keep your domain wherever it is. We just point it at the new site we build you, and we handle the hosting."' },
      { type: 'say', text: '"Do you own your domain?"' },
      { type: 'tip', text: 'Answer one level deeper than asked. On a closed call, one hosting question turned into four lessons — hosting, what you keep if you cancel, why smart websites exist, and the dashboard.' },
    ],
    leadsTo: 'm1',
  },
  {
    id: 'upsell',
    q: '"You guys sell more stuff on the call? The ad said you sell more stuff later?"',
    answer: [
      { type: 'say', text: '"That\'s a great question. Most guys I speak to think the first thing they have to do is run paid ads. That\'s going from second gear to fourth without starting at first. First gear is building out your foundation using the most valuable asset you have — your Google listing — with a smart website built in congruence with it to maximize the traffic you\'re already getting."' },
      { type: 'say', text: '"The reason why people pay us $297 a month and we don\'t do contracts is because we track three numbers every month so you can understand your ROI: leads captured from the traffic you\'re already getting, missed calls saved, reviews earned."' },
      { type: 'say', text: '"Some guys on the $297 package are totally happy with the lead flow once the foundation\'s built. Some want to pour fuel on the fire — that\'s when we explore paid ads or in-depth SEO, which we run. But we never sell you that on the front end without the foundation. That\'s the \'other stuff\' in the video. There\'s no catch."' },
      { type: 'say', text: '"Are you running ads at the moment?"' },
      { type: 'capture', field: 'runningAds', label: 'Running ads right now?', kind: 'yesno' },
    ],
    leadsTo: 'm1',
  },
];

/* GMB findings — always these three, always this order. */
window.CC_GMB_FINDINGS = [
  {
    id: 'photos',
    title: '1. Photos and geotagging',
    blocks: [
      { type: 'say', text: '"Now when it comes down to the winning formula, outside of us helping you get more reviews, the first thing I notice are the photos. I see you have some photos uploaded on your listing, which is great — most people don\'t even have photos. However anyone can upload any photo here. And when it comes down to the winning formula there is something called geotagging an image. Are you familiar with what geotagging is?"' },
      { type: 'stop', text: 'They answer.' },
      { type: 'say', text: '"Great. Anyone can upload any photo here. However, for the photos you are showcasing, you can prove to Google on the back end that that photo was actually taken at your address — increasing your legitimacy with Google even more, outside of us getting you more reviews. Does that make sense?"' },
    ],
  },
  {
    id: 'services',
    title: '2. Services not listed — with a live competitor',
    blocks: [
      { type: 'tip', text: 'Search "{{trade}} in {{city}}" and click a competitor. Show it on screen.' },
      { type: 'say', text: '"Cool. The next thing I notice on your listing — if I were to copy-paste exactly what\'s on your listing and go to Google and look up {{trade}} in {{city}}, I\'m able to see your competitors. If I click into one of them, you can see this guy has all of his services listed on his listing. On yours you don\'t have that, and that\'s a part of the winning formula. Does that make sense?"' },
    ],
  },
  {
    id: 'description',
    title: '3. The description',
    blocks: [
      { type: 'say', text: '"And the next thing I noticed is this description here. Did you write this or did a team member write this?"' },
      { type: 'stop', text: 'They answer.' },
      { type: 'say', text: '"Cool. Most people write something super generic, like \'this is my shop, we do great work in X area.\' They don\'t realize there\'s a real strategy to writing this description to help you get the leads you\'re looking to get."' },
      { type: 'say', text: '"So those are two to three things right off the bat that could increase your chances of ranking higher, outside of the reviews we help you get. Does that make sense?"' },
    ],
  },
];

/* The four things needed on the onboarding call (Close, step 1). */
window.CC_FOUR_THINGS = [
  { id: 'photos',   label: 'Photos of their best work',      script: '"Do you have photos of your best work?" — if they hesitate: "No worries, if you don\'t have any we can help source professional photos with AI if you\'re open to that."' },
  { id: 'database', label: 'Customer database to reactivate', script: '"The 2nd thing we need is your customer database and whoever you want reactivated to leave a Google review and/or to send any special offers to bring them back in."' },
  { id: 'services', label: 'List of services',                script: '"The 3rd thing we need from you is a list of services, because we\'re going to be building individual service pages for every service you do — just like this." (show an example site)' },
  { id: 'areas',    label: 'List of service areas',           script: '"The 4th thing we need is a list of your service areas. I see you\'re in {{city}} — any neighborhoods, towns, areas you want targeted, bring that with you as well, because we\'re building individual service-area pages like this." (show an example)' },
];

/* ------------------------------------------------------------------
   STEPS — the SOP stages, stacked inside the five sections above.
   `blocks` are rendered top to bottom. Block types:
     say | ask | stop | tip | warn | rule | capture | widget | cond
   ------------------------------------------------------------------ */
window.CC_STAGES = {

  intro: {
    id: 'intro', part: 'A', title: 'Intro + Video Check', time: '1–2 min', target: 120,
    goal: 'Confirm they watched the video, gate the decision maker, and set the path for the call.',
    blocks: [
      { type: 'cond', when: s => s.callType === 'initial', blocks: [
        { type: 'say', label: 'Say this', text: '"Pleasure to have you on. I know we\'re going to be talking about {{shop}}. Is that the only shop you run, or do you run multiple?"' },
        { type: 'capture', field: 'multiShop', label: 'Single shop or multiple?', kind: 'choice', options: [['single', 'Single shop'], ['multi', 'Multiple shops']] },
        { type: 'say', label: 'Then', text: '"Did you get a chance to take a look at that quick video we sent over to you?"' },
        { type: 'widget', id: 'videoRule' },
        { type: 'say', label: 'Set the path', text: '"Most of the time people watch that video, they have a few questions about how the system works. We get those answered — and if everything makes sense, we get you going. Does that sound good?"' },
        { type: 'tip', text: 'Wait for the yes. Start your timer. Don\'t elaborate.' },
      ]},
      { type: 'cond', when: s => s.callType === 'followup', blocks: [
        { type: 'say', label: 'Say this — follow-up', text: '"Good to reconnect, {{name}}. Last time we walked through how {{shop}} actually makes money with the smart website system, and you wanted some time to think it over. Has anything changed on your end since we last spoke?"' },
        { type: 'capture', field: 'followupContext', label: 'What came out of the last call? (where they stalled, what they wanted to think about)', kind: 'textarea' },
        { type: 'say', label: 'Set the path', text: '"Here\'s what I\'d like to do: clear up anything that\'s still on your mind, quickly tie back to the three numbers we track, and if it makes sense, get you going today. Does that sound fair?"' },
        { type: 'tip', text: 'Follow-ups skip the video. If they never watched it, flip the call type back to Initial.' },
      ]},
      { type: 'ask', label: 'Decision maker check', text: '"Before we get into it — is there anyone else that needs to be on this call? Maybe a co-founder, a partner, anything like that?"' },
      { type: 'widget', id: 'decisionMaker' },
      { type: 'tip', text: 'If they name someone who isn\'t on the call, try to get all of them on — "can they join now?" If not, continue running the demo.' },
    ],
  },

  watch: {
    id: 'watch', part: 'B', title: 'Watch Together — if needed', time: '4 min', target: 300,
    goal: 'Only if they did not watch the video. Play the file, then check in.',
    blocks: [
      { type: 'widget', id: 'watchTogether' },
      { type: 'rule', text: 'Never perform the video live as a screen-share. That burns 10–13 minutes and squeezes the offer out of the call.' },
      { type: 'say', label: 'After the video', text: '"You still with me?"' },
    ],
  },

  questions: {
    id: 'questions', part: 'C', title: '"What Questions Came Up?"', time: '5–10 min', target: 600,
    goal: 'Get every objection on the table now, while you have time to handle it.',
    blocks: [
      { type: 'cond', when: s => s.callType === 'initial', blocks: [
        { type: 'say', label: 'Say this', text: '"After watching the video, what questions came top of mind for you?"' },
      ]},
      { type: 'cond', when: s => s.callType === 'followup', blocks: [
        { type: 'say', label: 'Say this — follow-up', text: '"Since we last spoke, what questions came up for you? What\'s been the thing holding you back?"' },
      ]},
      { type: 'rule', title: 'The 3 rules of this stage', items: [
        'Answer one level deeper than asked. They ask a narrow question; you answer it, then keep going into the thing behind it.',
        'Expect the ads question. It comes up on most calls in some form.',
        'Do not skip to the close if they go quiet. See the early-yes warning below.',
      ]},
      { type: 'widget', id: 'questionsList' },
      { type: 'widget', id: 'earlyYes' },
      { type: 'widget', id: 'questionsDone' },
    ],
  },

  bridge: {
    id: 'bridge', part: 'The transition', title: 'Open the Bridge', time: '3–5 min', target: 240,
    goal: 'Teach them how they actually make money with us and discover their gaps at the same time. Discovery and education in one.',
    blocks: [
      { type: 'warn', text: 'This stage is completely absent from our underperforming calls. It is the single biggest gap in the process. Never skip it.' },
      { type: 'say', label: 'The transition — word-for-word', text: '"Awesome, no questions. It takes around 7–10 days to get everything set up. What it looks like working with us: we schedule an onboarding call, and on that onboarding call we need four things from you to get started."' },
      { type: 'say', text: '"Before I jump into that, I\'m sure you\'re probably asking yourself — how am I actually going to make money with this? Is that a fair assumption, {{name}}?"' },
      { type: 'stop', text: 'Wait for the yes.' },
      { type: 'say', text: '"Great, that\'s the most common question we get on these calls, and the answer is simple. The reason why people pay us $297 a month and we don\'t do contracts is because we track three metrics every month so you can understand your Return On Investment: leads captured from the traffic you\'re already getting, how many missed calls we save you, and how many reviews we help you get month over month."' },
      { type: 'tip', text: 'Never say one without the other — alone, "our system just works" is a claim nobody believes.' },
      { type: 'widget', id: 'metricStatus' },
    ],
  },

  m1: {
    id: 'm1', part: 'Metric 1', title: 'Metric 1 — Leads Captured', time: '2–3 min', target: 180, metric: true,
    goal: 'Show them they can\'t measure their leads today, and why a smart website fixes that.',
    blocks: [
      { type: 'say', label: 'Say this', text: '"The first is how many leads we\'re capturing from the traffic you\'re already getting. So let me ask you — do you know how many leads you\'re capturing from your website right now?"' },
      { type: 'stop', text: 'STOP. Wait for the answer. They won\'t know.' },
      { type: 'capture', field: 'hasWebsite', label: 'Do they have a website?', kind: 'choice', options: [['yes', 'Yes — has a website'], ['no', 'No website at all']] },
      { type: 'capture', field: 'leadsNow', label: 'Leads they think they capture / month (their guess)' },
      { type: 'cond', when: s => s.numbers.hasWebsite !== 'no', blocks: [
        { type: 'say', text: '"Okay well, in business what do they commonly say — what you can\'t measure, you can\'t what?"' },
        { type: 'stop', text: 'Wait for the response: "What you can\'t measure, you can\'t track."' },
        { type: 'say', text: '"And that\'s exactly why people use a smart website system as opposed to a traditional one. If you don\'t know your numbers you won\'t know how to scale. With our system you\'re going to be able to log into the back end on desktop and/or mobile and track exactly how many leads you\'re capturing on a month-to-month basis."' },
        { type: 'say', text: '"Not only that — with traditional websites like yours, most of them have a contact-us page or a form fill, where if you fill that form out it usually ends up in an inbox where no one answers. When someone fills out this form, does yours land in an inbox?"' },
        { type: 'stop', text: 'They answer.' },
        { type: 'say', text: '"So here\'s the thing — even if you had the best receptionist watching that inbox 24/7 and responding to that lead within 5 minutes or less, most people aren\'t even going to respond to you. You know why?"' },
        { type: 'stop', text: 'They answer.' },
        { type: 'say', text: '"The reason is because most people don\'t use email as their main form of communication. If you take a look at our smart websites that we build for clients, any form fill or widget fill gets automatically texted — as opposed to hitting your traditional website and praying and waiting for a response. This is what the workflow looks like on the back end."' },
        { type: 'tip', text: 'DEMO the Tareva lead.' },
        { type: 'say', text: '"As you can see here, Tareva filled out a form and instantly gets texted: \'Hey Tareva, just got your quote through our web form. I\'ll be in touch shortly. In the meantime please send us photos of your vehicle and any details — it helps a lot so I can give you accurate info. Thanks, talk soon.\' You can see these messages are automated, right?"' },
        { type: 'stop', text: 'Confirm.' },
        { type: 'say', text: '"This message sequence can also be adjusted based on how you guys talk to your clients. You can think of our system as if it\'s dancing with your prospect, and then it\'s your job to come into the conversation, pick it up and close the deal — just like how Paul and his team did here."' },
      ]},
      { type: 'cond', when: s => s.numbers.hasWebsite === 'no', blocks: [
        { type: 'say', label: 'Conditional — no website at all', text: '"Right now you don\'t even have a website. So let me ask you this — do you know how much traffic you\'re getting from your Google listing? Or how many calls it\'s actually producing for you?"' },
        { type: 'say', text: '"Because before you ever spend a dollar on Google Ads or Facebook Ads, the most valuable asset you have is this right here — your listing. And you\'re already getting traffic to it. You\'re just not doing everything in your power to capture it."' },
        { type: 'tip', text: 'This is common. Four of the closes in the dataset had no website at all.' },
      ]},
      { type: 'ask', label: 'Land it', text: '"Does that make sense? Can you see why shops have this set up?"' },
    ],
  },

  m2: {
    id: 'm2', part: 'Metric 2', title: 'Metric 2 — Missed Calls Saved', time: '2–3 min', target: 180, metric: true,
    goal: 'Get their average ticket here. This number powers the money math later.',
    blocks: [
      { type: 'say', label: 'Say this', text: '"Second metric we track on a month-to-month basis — and why guys stay with us month over month and we don\'t do contracts — is we help them track how many missed calls we save them. Do you guys ever get any missed calls?"' },
      { type: 'stop', text: 'STOP. Wait for the answer.' },
      { type: 'capture', field: 'missedCalls', label: 'Do they get missed calls?', kind: 'choice', options: [['yes', 'Yes'], ['no', 'Says no / rarely']] },
      { type: 'say', text: '"Okay awesome. If I were to ask you, for anyone that walks through your doors today, what would you say your average ticket size is?"' },
      { type: 'stop', text: 'They answer. Capture it — this is THE number for The Money.' },
      { type: 'capture', field: 'aov', label: 'Average ticket / order value ($)', kind: 'money' },
      { type: 'say', text: '"Okay well, most shops range from $500 to $5,000+, depending on the job you\'ve got to do. Naturally, if you miss a call what usually happens?"' },
      { type: 'stop', text: 'They answer: "It goes to voicemail" / "They call the next shop."' },
      { type: 'say', text: '"Yes, that\'s definitely one of the things that happens. However, naturally, if you miss a call in a high-volume business like automotive, people need work done immediately. If you miss a call, that person is just going to call the next business. Would you agree?"' },
      { type: 'say', text: '"With our Missed Call Text-Back feature, it prevents that lead from calling your competitor — immediately texting them if you missed that call so they know they\'re being serviced by your brand and/or business. Does that make sense? Can you see why shops have this set up?"' },
      { type: 'capture', field: 'missedCallsMatter', label: 'Are missed calls important to them? (drives the money script)', kind: 'choice', options: [['yes', 'Yes — missed calls matter'], ['no', 'No — not a big deal to them']] },
      { type: 'cond', when: s => s.numbers.missedCallsMatter === 'yes' && s.numbers.aov, blocks: [
        { type: 'widget', id: 'miniMath' },
      ]},
      { type: 'widget', id: 'dismissChannel' },
    ],
  },

  m3: {
    id: 'm3', part: 'Metric 3', title: 'Metric 3 — Reviews / Reactivation', time: '2 min', target: 120, metric: true,
    goal: 'Name the metric, then move to the money. Do NOT diagnose the listing yet — Metric 3 is the hinge back to it in the GMB section.',
    blocks: [
      { type: 'say', label: 'Say this', text: '"Now when it comes down to the third metric we track every single month — and why guys stay with us month over month and we don\'t do contracts — the third metric is how many reviews we\'re able to get month over month. How are you getting reviews at the moment?"' },
      { type: 'stop', text: 'They answer.' },
      { type: 'capture', field: 'reviewProcess', label: 'How they get reviews today (their words)' },
      { type: 'capture', field: 'software', label: 'Where the customer list lives (QuickBooks, Tekmetric, Shopmonkey, CCC One…)' },
      { type: 'say', label: 'If: "We don\'t have a process in place for this."', text: '"Well, one of the main reasons guys use a smart website system is also our review system. Anyone you have in your QuickBooks, Tekmetric, Shopmonkey, CCC One — wherever you\'re storing your previous database — we take that list and reactivate them to push them to leave a Google review and/or to send any special offers to bring them back into your shop."' },
      { type: 'say', text: '"When it comes down to ranking higher on Google, do you know one of the key factors for ranking higher?"' },
      { type: 'stop', text: 'They answer: "Yeah, it\'s reviews."' },
      { type: 'say', text: '"Yes, correct. One of the things Google looks at is reviews. However, Google doesn\'t care if you have 500 Google reviews. Google wants to see consistent reviews week over week. And our system helps you automatically do that without having to reach out to your clients yourself — as well as outrank your competitors along the way. Does that make sense?"' },
      { type: 'warn', text: 'Don\'t pull up the listing yet. Name the metric, go to the money. You\'ll come back to the listing in the GMB section.' },
    ],
  },

  money: {
    id: 'money', title: 'Show Them the Money — The ROI Sequence', time: '3–5 min', target: 240,
    goal: 'Their ticket, cut in half, tied to the features. Must land BEFORE any price is on the table.',
    blocks: [
      { type: 'widget', id: 'moneyMath' },
      { type: 'stop', text: 'Wait for the agreement.' },
      { type: 'say', text: '"That\'s exactly why people stay with us month over month and we don\'t do contracts. It\'s very easy to understand your ROI when tracking these three metrics. Does that make sense?"' },
      { type: 'rule', title: 'The Halving Rule', text: 'Always cut their number roughly in half, and say out loud that you\'re being conservative. You\'re not trying to make the number impressive — you\'re trying to make it impossible to argue with.' },
      { type: 'rule', title: 'Timing Rule', text: 'The money math must land before the offer, never after. On a lost call it ran at minute 26, after all three prices were on the table — so it defended a number instead of building the case for one.' },
    ],
  },

  gmb: {
    id: 'gmb', title: 'Diagnose the GMB + Prime the Upsell', time: '3–5 min', target: 240,
    goal: 'Show them what\'s broken on their Google profile, then price the fix immediately in the close.',
    blocks: [
      { type: 'say', label: 'The transition — call back to Metric 3', text: '"So that third metric I mentioned — reviews. Let\'s actually pull up your listing, because I noticed two or three things right off the bat that could help you rank higher."' },
      { type: 'tip', text: 'Share the screen. Pull up their Google Business Profile.' },
      { type: 'say', text: '"When was the last time you optimized this listing?"' },
      { type: 'stop', text: 'STOP. Wait for the answer. If they have one, push once: "But what did they actually do to optimize it? That\'s the biggest thing." Nobody can answer that.' },
      { type: 'say', text: '"Well {{name}}, there is a winning formula to get your listing set up the right way to increase your chances of ranking higher on the map pack — outside of us getting you reviews on our $297/month package. Do you know what the map pack is?"' },
      { type: 'stop', text: 'They answer.' },
      { type: 'say', text: '"If anyone were to look up \'{{trade}} near me\' in {{city}}, Google is going to recommend 3–5 businesses. You\'ll notice two of them are most likely sponsored — those businesses pay for ads to get that traffic. The other guys are ranking organically and capturing leads without paying for ads. You\'re probably wondering: how do I get to the top of this, right?"' },
      { type: 'widget', id: 'gmbFindings' },
      { type: 'say', label: 'The Realtor Line', text: '"There\'s a winning formula to building these listings out the right way. Think about selling a house — you hire an agent. If you hire the wrong agent who doesn\'t have the formula to list it correctly, what happens? It sits. Google listings work exactly the same way."' },
      { type: 'rule', text: 'Call it "the winning formula." Never "an optimization."' },
      { type: 'ask', label: 'Transition back', text: '"So that\'s the listing. Coming back to the smart website system — any other questions before we get you going?"' },
    ],
  },

  checkout: {
    id: 'checkout', part: 'A', title: 'Transition to Checkout', time: '3–5 min', target: 240,
    goal: 'Recap, binary ask, card. Four things first, then $297 and $500 stated plainly, then the special.',
    blocks: [
      { type: 'widget', id: 'checkoutGate' },
      { type: 'widget', id: 'fourThings' },
      { type: 'say', label: '1b. Book it before the price', text: '"When would you be available for the onboarding call tomorrow — in the morning or the evening?"' },
      { type: 'say', label: '2. The $297', text: '"It\'s $297 a month for the smart website system. Everything you saw in the video, everything we talked about on this call."' },
      { type: 'say', label: '3. The listing', text: '"We also offer the winning formula to go and rebuild your listing out the right way. Once you set this up once, you don\'t have to touch it for 5+ years. That\'s $500 one time."' },
      { type: 'say', label: '4. Why guys stay', text: '"Now, there\'s a reason guys stay with us for over a year and we don\'t do contracts. It\'s because the system just works, and every month we track those three metrics I mentioned for you to understand your ROI."' },
      { type: 'say', label: '5. The special', text: '"We\'re running a special right now. If you commit to a 3-month billing cycle up front, two things happen. One — you get the listing optimization for half off: $250 instead of $500. Two — you get our AI receptionist included. Normally that\'s $200 a month. It handles all your inbound leads, picks up the phone when you can\'t, and it\'s trained specifically for your shop and how you talk to customers. Here\'s an example of what it sounds like…"' },
      { type: 'tip', text: 'Play the AI receptionist clip.' },
      { type: 'ask', text: '"Which one do you want to get started with?"' },
      { type: 'widget', id: 'offerPicker' },
      { type: 'widget', id: 'pushbacks' },
    ],
  },

  payment: {
    id: 'payment', part: 'B', title: 'Payment + Onboarding', time: '5–10 min', target: 600,
    goal: 'Collect the card, lock the onboarding call, set expectations. Nothing left to sell.',
    blocks: [
      { type: 'widget', id: 'paymentChecklist' },
      { type: 'say', label: 'While the card is processing', text: '"Perfect. So while that goes through — onboarding call is {{onboardingSlot}}. Bring the photos, your customer list, your list of services and your service areas. 7–10 days after that call, everything is live and you\'ll be able to log in and watch the three metrics for yourself."' },
      { type: 'say', label: 'Set the expectation', text: '"Month one we build everything and start reactivating your list. Month two it\'s running. Month three is when you can actually look at the numbers and see what it\'s doing. My team will be in contact with you every week."' },
    ],
  },

  postcall: {
    id: 'postcall', title: 'Post-Call — Next Steps', time: 'After the call', target: 0,
    goal: 'Log what happened. This is what will sync to GoHighLevel.',
    blocks: [
      { type: 'widget', id: 'postCall' },
    ],
  },
};

/* Word-for-word lines for the early-yes situation and the two pushbacks. */
window.CC_LINES = {
  earlyYes: '"Love it. Before we do that, let me show you two things so you know exactly what you\'re getting into."',
  pushbackReceptionistOnly: '"Cool — it\'s $200 a month on top of the $297. Honestly, you might as well just do the three months. You get it free, and the winning formula to get your listing built out the right way is half off. You\'d be paying more to get less."',
  downsell: '"No worries. We get you started with the foundation at $297 today. Here\'s what I\'ll do — I\'ll mark your account so you\'re grandfathered in at this special. That means whenever you\'re ready, you tell your account manager and you still get the listing at $250 and the AI receptionist included on the 3-month billing cycle, specifically built for your brand. It doesn\'t expire on you. So you get to see the system working first — reviews coming in, leads showing up in the app — and once you see it, you can add the receptionist and the listing at the special price. You\'re not risking anything. You\'ll be in contact with my team every week anyway. Let\'s get you started at $297. Onboarding tomorrow — morning or evening?"',
  downsellTriggers: ['"Cash is tight right now."', '"I just want to see how you guys work first."', '"I\'m only approved for $300."', '"Let me start small."'],
  addLater: '"Yes. It\'s marked on your account. The only thing you\'re doing is starting with the website today and adding the rest when you\'re ready."',
  whyThreeMonths: '"Because it\'s $297 a month. You\'re not going to change your business overnight for $297. Month one we build everything and start reactivating your list. You\'ll see reviews coming in and, depending on how strong your listing already is, your first leads. Month two it\'s running. Month three is when you can actually look at the numbers and see what it\'s doing. Three months is a fair shot — anything less and you\'re judging it before it\'s had a chance to work. And for giving it that shot, you get the listing at half off and the AI receptionist built specifically for your business, free. Still no contract — cancel any time after."',
  dismissChannel: '"Look — there\'s going to be a percentage of people who call you, and a percentage who never will. Think about the demographics looking at this listing. You\'ve got the boomers who are happy to pick up the phone. Then you\'ve got Gen Z and millennials — they can barely look you in the eyes and shake your hand. They don\'t want to call a business. So you want to appeal to both: capture the guy who calls, and capture the guy who never will. And that\'s exactly why people use a smart website system as opposed to a traditional one."',
  lowTicket: '"For tire and auto shops it ranges from $300 to $1,500+ depending on the job. Even at the very lowest end, every missed call is potentially $300 walking away. Would you agree?"',
};

/* Post-call outcomes. `ghlStage` is the pipeline stage we will push to
   GoHighLevel once the integration is wired up. */
window.CC_OUTCOMES = [
  { id: 'closed',   label: 'They Closed',        sub: 'Collected payment, onboarding booked', ghlStage: 'Closed — Won' },
  { id: 'followup', label: 'Follow-Up / Thinking', sub: 'Book the follow-up, decide on recap', ghlStage: 'Showed — Follow-Up' },
  { id: 'notint',   label: 'Not Interested',     sub: 'Submit call notes, done',              ghlStage: 'Showed — Not Interested' },
  { id: 'noshow',   label: 'No-Show',            sub: 'Trigger the no-show sequence',         ghlStage: 'No Show' },
];

window.CC_GHL_STAGES = [
  'No Show', 'Showed — Follow-Up', 'Showed — Not Interested', 'Closed — Won', 'Onboarding',
];
