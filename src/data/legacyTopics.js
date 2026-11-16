// Each topic: id, title, section ('fundamentals' | 'hld' | 'lld'),
// why (the problem it solves), concept, diagram (inline SVG string),
// example, useCases[], practice[], sources[]
// v1 lessons written before the 12-week curriculum; curriculum.js slots them into their weeks.

export const phases = [
  {
    id: "phase0",
    title: "Phase 0 — Fundamentals",
    weeks: "Weeks 1-2",
    topics: [
      {
        id: "oop-basics",
        title: "OOP Basics",
        section: "fundamentals",
        why: `LLD interviews are OOP interviews. The interviewer gives you a messy real-world domain (a parking lot, a chess game) and watches whether you can carve it into classes with clear responsibilities. OOP exists because large programs written as one pile of functions and shared data become impossible to change safely — objects bundle data with the only code allowed to touch it, so changes stay local.`,
        concept: `The four pillars:
- **Encapsulation**: bundle data + behavior together and hide internal state behind methods. Callers can't reach in and corrupt your state; you can change internals freely.
- **Abstraction**: expose only what callers need, hide how it works. You call \`list.sort()\` without caring which algorithm runs.
- **Inheritance**: a class reuses/extends a parent class ("is-a"). Powerful but easily abused — deep hierarchies become rigid.
- **Polymorphism**: the same call behaves differently depending on the concrete type. Code written against \`Shape.area()\` works for every shape, including ones written later.

**Composition over inheritance**: model "has-a" with member objects instead of forcing "is-a" hierarchies. A \`Car\` has an \`Engine\`; swapping \`PetrolEngine\` for \`ElectricEngine\` is trivial with composition, painful with inheritance.`,
        diagram: `<svg viewBox="0 0 720 250" xmlns="http://www.w3.org/2000/svg">
<rect x="290" y="15" width="140" height="52" rx="8" class="d-box"/><text x="360" y="37" class="d-txt">Vehicle</text><text x="360" y="55" class="d-small">move() [abstract]</text>
<rect x="110" y="130" width="130" height="52" rx="8" class="d-box2"/><text x="175" y="152" class="d-txt">Car</text><text x="175" y="170" class="d-small">move(): drive</text>
<rect x="480" y="130" width="130" height="52" rx="8" class="d-box2"/><text x="545" y="152" class="d-txt">Bicycle</text><text x="545" y="170" class="d-small">move(): pedal</text>
<line x1="175" y1="130" x2="330" y2="80" class="d-line"/><polygon points="330,80 318,82 324,92" class="d-hollow"/>
<line x1="545" y1="130" x2="390" y2="80" class="d-line"/><polygon points="390,80 396,92 402,82" class="d-hollow"/>
<text x="360" y="110" class="d-small">inheritance: "is-a" (polymorphic move())</text>
<rect x="110" y="200" width="130" height="36" rx="8" class="d-box2"/><text x="175" y="223" class="d-txt">Engine</text>
<line x1="175" y1="200" x2="175" y2="182" class="d-line"/><polygon points="175,182 168,192 175,202 182,192" class="d-fill"/>
<text x="300" y="222" class="d-small">composition: Car "has-a" Engine (◆)</text>
</svg>`,
        example: `A \`Vehicle\` base class declares an abstract \`move()\`. \`Car\` implements it as driving, \`Bicycle\` as pedaling — code that works with \`Vehicle\` handles both without knowing which it has (polymorphism). Meanwhile \`Car\` *has an* \`Engine\` (composition): to support electric cars you swap in an \`ElectricEngine\`, no hierarchy surgery needed.`,
        useCases: [
          "Every LLD problem: Parking Lot (Vehicle → Car/Bike/Truck), Chess (Piece → King/Queen/Pawn), Splitwise (Split → EqualSplit/PercentSplit).",
          "Frameworks you already use: React components, Laravel models, Java collections are all polymorphism — you code against an interface.",
          "Plugin systems: payment gateways (Stripe/Razorpay/PayPal) behind one PaymentProvider interface is composition + polymorphism in production.",
        ],
        practice: [
          "Design a class hierarchy for Shape (Circle, Rectangle, Triangle) with an area() method — identify where polymorphism applies.",
          "Give a real example where composition should be chosen over inheritance, and explain why.",
          "What breaks if you expose all internal fields publicly instead of encapsulating them?",
        ],
        sources: [{ title: "Head First Design Patterns (book)", url: "" }],
      },
      {
        id: "solid",
        title: "SOLID Principles",
        section: "fundamentals",
        why: `SOLID is the answer to "why does this codebase get harder to change every month?" Each principle targets a specific way designs rot: god classes, shotgun edits, subclasses that lie, fat interfaces, hard-wired dependencies. In LLD interviews, SOLID is the vocabulary interviewers use to judge your design — "that class has two responsibilities" is an SRP critique whether or not they name it.`,
        concept: `- **S**ingle Responsibility: a class should have one reason to change. If you can say "this class does X AND Y", it's two classes.
- **O**pen/Closed: open for extension, closed for modification — add new behavior by adding new code (a new subclass, a new strategy), not by editing working code and risking it.
- **L**iskov Substitution: a subclass must be usable anywhere its parent is, without surprises. If \`Square extends Rectangle\` breaks \`setWidth()\`, the hierarchy is a lie.
- **I**nterface Segregation: many small interfaces beat one fat one. Clients shouldn't be forced to depend on methods they never call.
- **D**ependency Inversion: depend on abstractions, not concretions. High-level logic (\`OrderService\`) talks to a \`PaymentProvider\` interface, never directly to \`StripeClient\` — so you can swap or mock it.`,
        diagram: `<svg viewBox="0 0 720 230" xmlns="http://www.w3.org/2000/svg">
<defs><marker id="a-solid" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="d-fill"/></marker></defs>
<rect x="30" y="60" width="190" height="96" rx="8" class="d-box2 d-warn"/>
<text x="125" y="85" class="d-txt">UserManager</text>
<text x="125" y="107" class="d-small">login() / logout()</text>
<text x="125" y="124" class="d-small">sendWelcomeEmail()</text>
<text x="125" y="141" class="d-small">saveToDatabase()</text>
<text x="125" y="178" class="d-small">3 reasons to change = SRP violation</text>
<line x1="230" y1="108" x2="320" y2="108" class="d-line" marker-end="url(#a-solid)"/><text x="275" y="98" class="d-small">split</text>
<rect x="340" y="20" width="170" height="44" rx="8" class="d-box"/><text x="425" y="47" class="d-txt">AuthService</text>
<rect x="340" y="86" width="170" height="44" rx="8" class="d-box"/><text x="425" y="113" class="d-txt">EmailService</text>
<rect x="340" y="152" width="170" height="44" rx="8" class="d-box"/><text x="425" y="179" class="d-txt">UserRepository</text>
<text x="600" y="47" class="d-small">auth rules change</text>
<text x="600" y="113" class="d-small">email vendor changes</text>
<text x="600" y="179" class="d-small">DB schema changes</text>
</svg>`,
        example: `Violating SRP: a \`UserManager\` that handles login, sends welcome emails, AND writes SQL — three reasons to change tangled in one file; an email-vendor migration risks breaking auth. Fix: \`AuthService\`, \`EmailService\`, \`UserRepository\` — each changes independently. Then apply DIP: \`AuthService\` depends on a \`UserRepository\` interface, so tests can inject a fake repo and never touch a real DB.`,
        useCases: [
          "Payment integration: adding PayPal next to Stripe without touching checkout code = Open/Closed + Dependency Inversion working together.",
          "Unit testing anywhere: mocking is only possible because dependencies are inverted — classes that 'new' their own DB connections are untestable.",
          "LLD interview follow-ups: 'now add a new vehicle type / new pricing rule' is an Open/Closed test — good designs absorb it, bad ones need edits everywhere.",
        ],
        practice: [
          "Take a class you've written before that does 'too much' and split it per SRP.",
          "Give an example of a Liskov Substitution violation (a subclass that breaks the parent's contract).",
          "Why does Dependency Inversion make unit testing easier?",
        ],
        sources: [{ title: "Awesome Low-Level Design (GitHub)", url: "https://github.com/ashishps1/awesome-low-level-design" }],
      },
      {
        id: "uml-basics",
        title: "UML Basics",
        section: "fundamentals",
        why: `In an LLD interview you have ~45 minutes to communicate a design. UML class diagrams are the shared drawing language that lets you sketch "Library has Members, Members borrow Books via Loans" in 30 seconds and have the interviewer instantly understand the relationships and their lifetimes. You need just enough UML to whiteboard fluently — not the full spec.`,
        concept: `Class diagrams are the main UML tool used in LLD interviews. Four relationships cover almost everything:
- **Association**: two classes know about / use each other (plain line). A \`Doctor\` treats \`Patient\`s.
- **Aggregation**: "has-a" where the part survives the whole (hollow diamond ◇ on the container). A \`Team\` has \`Player\`s — disband the team, the players live on.
- **Composition**: "has-a" where the container owns the part's lifecycle (filled diamond ◆). A \`House\` owns its \`Room\`s — demolish the house, the rooms are gone.
- **Inheritance**: "is-a" (hollow triangle △ pointing at the parent).

**Multiplicity** on each end of a line: \`1\`, \`0..1\`, \`1..*\`, \`*\` — e.g. one \`Order\` has \`1..*\` \`OrderItem\`s.`,
        diagram: `<svg viewBox="0 0 720 240" xmlns="http://www.w3.org/2000/svg">
<rect x="30" y="18" width="110" height="34" rx="6" class="d-box2"/><text x="85" y="40" class="d-txt">Doctor</text>
<rect x="270" y="18" width="110" height="34" rx="6" class="d-box2"/><text x="325" y="40" class="d-txt">Patient</text>
<line x1="140" y1="35" x2="270" y2="35" class="d-line"/><text x="520" y="40" class="d-small2">association — uses / knows about</text>
<rect x="30" y="72" width="110" height="34" rx="6" class="d-box2"/><text x="85" y="94" class="d-txt">Team</text>
<rect x="270" y="72" width="110" height="34" rx="6" class="d-box2"/><text x="325" y="94" class="d-txt">Player</text>
<line x1="156" y1="89" x2="270" y2="89" class="d-line"/><polygon points="140,89 148,84 156,89 148,94" class="d-hollow"/>
<text x="520" y="94" class="d-small2">aggregation ◇ — part outlives whole</text>
<rect x="30" y="126" width="110" height="34" rx="6" class="d-box2"/><text x="85" y="148" class="d-txt">House</text>
<rect x="270" y="126" width="110" height="34" rx="6" class="d-box2"/><text x="325" y="148" class="d-txt">Room</text>
<line x1="156" y1="143" x2="270" y2="143" class="d-line"/><polygon points="140,143 148,138 156,143 148,148" class="d-fill"/>
<text x="520" y="148" class="d-small2">composition ◆ — whole owns part's lifetime</text>
<rect x="30" y="180" width="110" height="34" rx="6" class="d-box2"/><text x="85" y="202" class="d-txt">Animal</text>
<rect x="270" y="180" width="110" height="34" rx="6" class="d-box2"/><text x="325" y="202" class="d-txt">Dog</text>
<line x1="270" y1="197" x2="156" y2="197" class="d-line"/><polygon points="140,197 156,190 156,204" class="d-hollow"/>
<text x="520" y="202" class="d-small2">inheritance △ — "is-a", points at parent</text>
</svg>`,
        example: `A \`Library\` *aggregates* \`Book\`s — books exist independently and can move to another branch (◇). A \`Loan\` *composes* nothing but *associates* a \`Member\` with a \`Book\` and dies when returned. \`Member\` and \`Librarian\` both *inherit* from \`User\` (△). Multiplicity: one \`Member\` has \`0..*\` active \`Loan\`s, each \`Loan\` references exactly \`1\` \`Book\`.`,
        useCases: [
          "Whiteboarding in every LLD round — interviewers expect boxes-and-diamonds sketches before any code.",
          "Design docs at work: a small class diagram in an RFC communicates a module's shape faster than paragraphs.",
          "Reading unfamiliar codebases: mentally mapping composition vs aggregation tells you what you can safely delete or move.",
        ],
        practice: [
          "Draw (on paper) a class diagram for a simple Library Management system: Library, Book, Member, Loan.",
          "Identify aggregation vs composition in your diagram and justify each choice.",
        ],
        sources: [],
      },
    ],
  },
  {
    id: "phase1",
    title: "Phase 1 — HLD Building Blocks",
    weeks: "Weeks 3-6",
    topics: [
      {
        id: "scalability",
        title: "Scalability",
        section: "hld",
        why: `A system that works for 100 users usually dies at 1 million — not from bugs, but because one machine has a hard ceiling on CPU, RAM, and network. Scalability is the study of how to grow past that ceiling. It's the first question in every HLD interview ("design X for 10M users") and the reason every other building block in this phase exists.`,
        concept: `- **Vertical scaling (scale up)**: buy a bigger machine. Simple — no code changes — but cost grows non-linearly, there's a hard ceiling, and the machine is a single point of failure (one crash = full outage).
- **Horizontal scaling (scale out)**: add more machines and spread load across them. Near-unlimited ceiling, fault tolerant (one machine dies, others carry on), but requires architectural changes.
- **The statelessness requirement**: horizontal scaling only works if any server can handle any request. That means servers must not keep request-critical state in their own memory — sessions, carts, counters go to a shared store (Redis, DB).
- Rule of thumb: scale vertically until it's expensive or risky, then go horizontal. Real systems do both.`,
        diagram: `<svg viewBox="0 0 720 250" xmlns="http://www.w3.org/2000/svg">
<defs><marker id="a-scal" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="d-fill"/></marker></defs>
<text x="170" y="28" class="d-txt">Vertical: bigger box</text>
<line x1="30" y1="55" x2="310" y2="55" class="d-line d-dash"/><text x="170" y="48" class="d-small">hardware ceiling</text>
<rect x="110" y="140" width="120" height="70" rx="8" class="d-box"/><text x="170" y="180" class="d-txt">1 big server</text>
<line x1="170" y1="135" x2="170" y2="70" class="d-line" marker-end="url(#a-scal)"/><text x="230" y="105" class="d-small">+CPU +RAM ($$$)</text>
<text x="170" y="238" class="d-small">single point of failure</text>
<line x1="360" y1="20" x2="360" y2="240" class="d-line d-dash"/>
<text x="545" y="28" class="d-txt">Horizontal: more boxes</text>
<rect x="480" y="50" width="130" height="40" rx="8" class="d-box2"/><text x="545" y="75" class="d-txt">Load balancer</text>
<rect x="400" y="140" width="85" height="44" rx="8" class="d-box"/><text x="442" y="167" class="d-txt">S1</text>
<rect x="502" y="140" width="85" height="44" rx="8" class="d-box"/><text x="544" y="167" class="d-txt">S2</text>
<rect x="604" y="140" width="85" height="44" rx="8" class="d-box"/><text x="646" y="167" class="d-txt">S3</text>
<line x1="515" y1="92" x2="445" y2="135" class="d-line" marker-end="url(#a-scal)"/>
<line x1="545" y1="92" x2="545" y2="135" class="d-line" marker-end="url(#a-scal)"/>
<line x1="575" y1="92" x2="645" y2="135" class="d-line" marker-end="url(#a-scal)"/>
<rect x="480" y="200" width="130" height="34" rx="8" class="d-box2"/><text x="545" y="222" class="d-txt">shared state (Redis)</text>
</svg>`,
        example: `A web app storing user sessions in server memory can't scale horizontally — a user's second request might hit a different server that doesn't have their session, logging them out randomly. Fix: move sessions to Redis. Now all servers are interchangeable, you can add S4 and S5 during a traffic spike and remove them after — this elasticity is exactly what auto-scaling groups in AWS do.`,
        useCases: [
          "Flash sales (Flipkart Big Billion Days): auto-scale from 50 to 500 stateless app servers for 48 hours, then scale back down.",
          "Netflix: thousands of small stateless instances instead of giant machines — any instance can die with zero user impact.",
          "Startups: begin on one big box (vertical — simple, cheap ops), re-architect for horizontal only when traffic demands it.",
        ],
        practice: [
          "Why is vertical scaling alone insufficient for a system expecting 10M daily active users?",
          "What has to change in an app's architecture to make horizontal scaling possible?",
        ],
        sources: [{ title: "System Design Primer", url: "https://github.com/donnemartin/system-design-primer" }],
      },
      {
        id: "load-balancing",
        title: "Load Balancing",
        section: "hld",
        why: `The moment you have more than one server, someone has to decide which server gets each request — and notice when a server dies. That's the load balancer. Without it, horizontal scaling is useless: clients would need to know every server's address, and a dead server would keep receiving (and dropping) traffic. It's the front door of virtually every system you'll design.`,
        concept: `A load balancer sits in front of multiple servers and distributes incoming requests across them.
- **Algorithms**: Round Robin (take turns — fine for uniform requests), Least Connections (send to the least-busy server — better when request durations vary), IP Hash (same client always hits the same server — "sticky"), Weighted (stronger machines get more traffic).
- **L4 vs L7**: L4 balances on IP/port — fast, can't see the request content. L7 understands HTTP — it can route \`/api/video\` to one pool and \`/api/search\` to another, terminate TLS, and do smart retries. Slower per-request, far more flexible.
- **Health checks**: the LB pings each server every few seconds; a failing server is pulled out of rotation automatically and traffic redistributes. This is how machine failure becomes invisible to users.
- The LB itself can be a single point of failure — production setups run redundant pairs.`,
        diagram: `<svg viewBox="0 0 720 230" xmlns="http://www.w3.org/2000/svg">
<defs><marker id="a-lb" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="d-fill"/></marker></defs>
<rect x="30" y="85" width="110" height="50" rx="8" class="d-box2"/><text x="85" y="108" class="d-txt">Clients</text><text x="85" y="125" class="d-small">many users</text>
<rect x="250" y="85" width="140" height="50" rx="8" class="d-box"/><text x="320" y="108" class="d-txt">Load balancer</text><text x="320" y="125" class="d-small">health checks ⟳</text>
<line x1="145" y1="110" x2="245" y2="110" class="d-line" marker-end="url(#a-lb)"/>
<rect x="520" y="20" width="130" height="44" rx="8" class="d-box"/><text x="585" y="47" class="d-txt">Server 1</text>
<rect x="520" y="90" width="130" height="44" rx="8" class="d-box"/><text x="585" y="117" class="d-txt">Server 2</text>
<rect x="520" y="160" width="130" height="44" rx="8" class="d-box2 d-warn"/><text x="585" y="187" class="d-txt">Server 3 ✗</text>
<line x1="395" y1="98" x2="515" y2="45" class="d-line" marker-end="url(#a-lb)"/>
<line x1="395" y1="112" x2="515" y2="112" class="d-line" marker-end="url(#a-lb)"/>
<line x1="395" y1="126" x2="515" y2="178" class="d-line d-dash"/>
<text x="430" y="175" class="d-small">failed health check —</text>
<text x="430" y="190" class="d-small">removed from rotation</text>
</svg>`,
        example: `An e-commerce site puts an L7 load balancer in front of its servers. It routes \`/api/checkout\` to a dedicated pool (checkout must never be starved by a search-traffic spike) and \`/api/search\` to another. At 2 AM, Server 3 crashes; the health check fails twice, the LB stops sending it traffic within seconds, and no customer notices. Round Robin would be fine for search, but checkout uses Least Connections because payment requests vary wildly in duration.`,
        useCases: [
          "AWS ELB/ALB, Nginx, HAProxy — every cloud architecture has one at the edge; ALB is the L7 flavor, NLB the L4 flavor.",
          "Path-based routing in microservices: one domain, many backend services, split by URL at the L7 LB.",
          "Zero-downtime deploys: drain traffic from old servers (stop sending new requests, finish in-flight ones), deploy, re-add — all orchestrated through the LB.",
        ],
        practice: [
          "Why would you pick Least Connections over Round Robin for a system with highly variable request durations?",
          "What's a risk of IP Hash-based sticky sessions if one server goes down?",
        ],
        sources: [{ title: "ByteByteGo blog", url: "https://bytebytego.com" }],
      },
      {
        id: "caching",
        title: "Caching",
        section: "hld",
        why: `Reading from memory is ~100x faster than reading from disk, and most systems read the same hot data over and over (the same celebrity profile, the same product page). Caching exploits that: keep hot data in a fast layer and spare the database. It's usually the single cheapest performance win in any design — and "where do you cache, and how do you invalidate?" is a guaranteed interview follow-up.`,
        concept: `Store frequently-accessed data in a fast layer (memory) to avoid recomputation or slow DB hits.
- **Where (layered)**: browser cache → CDN → app-server memory → distributed cache (Redis/Memcached) → DB query cache. Each layer absorbs traffic before it hits the next.
- **Cache-aside (most common)**: app checks cache first; on miss, reads DB and writes the result into the cache for next time.
- **Write-through**: write to cache + DB together (consistent, slower writes). **Write-back**: write to cache, flush to DB later (fast, risks loss on crash).
- **Eviction**: caches are small, something must go — LRU (least recently used, the default choice), LFU, or TTL expiry.
- **The hard part is invalidation**: when the DB changes, cached copies are stale. TTLs bound the staleness; explicit invalidation on write removes it faster but is easy to get wrong.
- Know the failure mode: **cache stampede** — a hot key expires and thousands of requests hammer the DB simultaneously. Mitigate with locks or staggered TTLs.`,
        diagram: `<svg viewBox="0 0 720 240" xmlns="http://www.w3.org/2000/svg">
<defs><marker id="a-cache" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="d-fill"/></marker></defs>
<rect x="30" y="95" width="120" height="50" rx="8" class="d-box"/><text x="90" y="125" class="d-txt">App server</text>
<rect x="300" y="30" width="140" height="50" rx="8" class="d-box"/><text x="370" y="53" class="d-txt">Redis cache</text><text x="370" y="70" class="d-small">~1 ms</text>
<rect x="540" y="160" width="140" height="50" rx="8" class="d-box2"/><text x="610" y="183" class="d-txt">Database</text><text x="610" y="200" class="d-small">~50 ms</text>
<line x1="150" y1="100" x2="295" y2="60" class="d-line" marker-end="url(#a-cache)"/><text x="195" y="62" class="d-small">1. read key</text>
<line x1="300" y1="80" x2="160" y2="112" class="d-line d-good" marker-end="url(#a-cache)"/><text x="250" y="108" class="d-small">HIT → done ✓</text>
<line x1="440" y1="70" x2="565" y2="155" class="d-line d-dash" marker-end="url(#a-cache)"/><text x="540" y="100" class="d-small">2. MISS → query DB</text>
<line x1="540" y1="175" x2="445" y2="62" class="d-line d-dash" marker-end="url(#a-cache)"/><text x="440" y="135" class="d-small">3. populate cache</text>
<text x="300" y="225" class="d-small">cache-aside: next read of the same key is a 1 ms hit instead of 50 ms</text>
</svg>`,
        example: `A news feed app caches each user's assembled feed in Redis with a 60s TTL. 95% of feed opens are cache hits (~1 ms); only 5% touch the DB. When someone posts, the app explicitly invalidates their followers' cached feeds so the post shows up immediately instead of after TTL expiry. During a celebrity's viral post, staggered TTLs prevent all their followers' caches from expiring at the same second and stampeding the DB.`,
        useCases: [
          "Product pages on Amazon/Flipkart: description and images are cached everywhere; only price/stock is fetched fresh.",
          "Session storage: every login-based site keeps sessions in Redis — the canonical cache use.",
          "Computed results: trending lists, leaderboards, recommendation scores — expensive to compute, cached and refreshed on a schedule.",
          "Twitter/X timelines: pre-computed and cached per user; the DB could never assemble feeds at read time for 500M users.",
        ],
        practice: [
          "Design a cache-aside flow for fetching a user's profile — what happens on cache miss vs hit?",
          "What problem does 'cache stampede' describe, and name one mitigation.",
        ],
        sources: [{ title: "ByteByteGo blog", url: "https://bytebytego.com" }],
      },
      {
        id: "databases",
        title: "Databases: SQL vs NoSQL & Indexing",
        section: "hld",
        why: `The database is where every design gets hard: it holds state, so it can't be casually replicated like stateless app servers. Two decisions dominate every HLD interview: which database family fits the data (SQL vs NoSQL — a trade-off between guarantees and scale), and how reads stay fast as tables grow to millions of rows (indexes). Picking wrong here is expensive to undo — data migrations are the most painful change in any system.`,
        concept: `- **SQL (relational — Postgres, MySQL)**: structured schema, joins, ACID transactions (all-or-nothing, consistent, durable). The default choice when data has relationships and correctness matters — orders, payments, inventory.
- **NoSQL families**: document (MongoDB — flexible nested objects), key-value (DynamoDB/Redis — dead-simple lookups at huge scale), column-family (Cassandra — massive write throughput), graph (Neo4j — relationship-heavy queries). They scale horizontally by design, usually by relaxing consistency and dropping joins.
- Honest rule: start with SQL. Reach for NoSQL when you have a specific reason — extreme scale, flexible schema, or a access pattern SQL serves poorly.
- **Indexing**: an index is a sorted structure (usually a B-tree) on a column. Without it, a query scans every row — O(N). With it, the DB walks the tree — O(log N). A 100M-row lookup drops from ~30s to ~5ms.
- The cost: every write must also update every index (slower writes, more storage). Index the columns you filter/join on; don't index everything.`,
        diagram: `<svg viewBox="0 0 720 250" xmlns="http://www.w3.org/2000/svg">
<defs><marker id="a-db" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="d-fill"/></marker></defs>
<text x="170" y="28" class="d-txt">No index: full scan O(N)</text>
<rect x="100" y="45" width="140" height="26" rx="4" class="d-box2"/><text x="170" y="62" class="d-small">row 1</text>
<rect x="100" y="75" width="140" height="26" rx="4" class="d-box2"/><text x="170" y="92" class="d-small">row 2</text>
<rect x="100" y="105" width="140" height="26" rx="4" class="d-box2"/><text x="170" y="122" class="d-small">row 3 … row 100M</text>
<rect x="100" y="135" width="140" height="26" rx="4" class="d-box2 d-warn"/><text x="170" y="152" class="d-small">target row</text>
<line x1="70" y1="50" x2="70" y2="145" class="d-line" marker-end="url(#a-db)"/><text x="55" y="190" class="d-small">checks every row (~30 s)</text>
<line x1="360" y1="20" x2="360" y2="240" class="d-line d-dash"/>
<text x="545" y="28" class="d-txt">B-tree index: O(log N)</text>
<rect x="500" y="45" width="90" height="30" rx="6" class="d-box"/><text x="545" y="64" class="d-small">root: M?</text>
<rect x="420" y="105" width="90" height="30" rx="6" class="d-box"/><text x="465" y="124" class="d-small">A–L</text>
<rect x="580" y="105" width="90" height="30" rx="6" class="d-box"/><text x="625" y="124" class="d-small">M–Z</text>
<line x1="525" y1="75" x2="475" y2="100" class="d-line" marker-end="url(#a-db)"/>
<line x1="565" y1="75" x2="615" y2="100" class="d-line" marker-end="url(#a-db)"/>
<rect x="580" y="170" width="110" height="26" rx="4" class="d-box2 d-goodborder"/><text x="635" y="187" class="d-small">target row ✓</text>
<line x1="625" y1="135" x2="632" y2="165" class="d-line" marker-end="url(#a-db)"/>
<text x="545" y="230" class="d-small">few tree hops (~5 ms), even at 100M rows</text>
</svg>`,
        example: `A social app stores user profiles (flexible, evolving fields) in MongoDB, but financial transactions in PostgreSQL — a payment must be ACID: money leaves one account and arrives in another atomically, or neither happens. The posts table gets an index on \`user_id\` because "all posts by user X" is the hottest query; without it, every profile view would scan the entire posts table. They deliberately don't index the rarely-queried \`bio\` column — it would just slow down writes.`,
        useCases: [
          "Banking/payments: SQL + ACID, non-negotiable — this is the canonical 'why SQL' answer.",
          "Shopping cart at Amazon scale: DynamoDB (key-value) — simple get/put by user ID, needs massive availability, no joins needed.",
          "Sensor/event firehose: Cassandra — millions of writes per second, append-heavy, reads by time range.",
          "The slow-query incident every engineer hits: a production query timing out because a column wasn't indexed — EXPLAIN, add index, 1000x faster.",
        ],
        practice: [
          "You have a table with 100M rows and a query filtering on \`email\` runs slowly. What do you do, and why does it help?",
          "Give a case where NoSQL is the wrong choice over SQL, and explain why.",
        ],
        sources: [{ title: "Designing Data-Intensive Applications (book)", url: "" }],
      },
      {
        id: "replication-sharding",
        title: "Replication & Sharding",
        section: "hld",
        why: `One database machine eventually hits two different walls: it can die (taking all your data with it), and it can run out of capacity for reads, writes, or storage. Replication solves the first wall (copies of the data) and read scaling; sharding solves the second (split the data itself). Nearly every "design X at scale" answer ends with some combination of the two — and the interviewer will probe whether you understand their failure modes.`,
        concept: `- **Replication**: keep full copies of the data on multiple machines. Leader-follower is the standard: all writes go to the leader, which streams changes to followers; reads can be served by any follower. You get durability (leader dies → promote a follower) and read scaling (add followers).
- Its catch — **replication lag**: followers trail the leader by milliseconds-to-seconds, so a read right after a write may see old data ("read-your-writes" problem). Fix: read your own recent writes from the leader.
- **Sharding (partitioning)**: when one machine can't hold the data or absorb the writes, split rows across machines by a shard key — e.g. \`hash(user_id) % N\`. Each shard holds a slice; writes now scale, not just reads.
- Its catches: cross-shard queries and joins become expensive; a **hot shard** forms when one key gets disproportionate traffic; resharding (changing N) is painful — consistent hashing reduces that pain.
- Real systems combine both: shard the data, then replicate each shard.`,
        diagram: `<svg viewBox="0 0 720 260" xmlns="http://www.w3.org/2000/svg">
<defs><marker id="a-rep" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="d-fill"/></marker></defs>
<text x="170" y="25" class="d-txt">Replication: copies</text>
<rect x="110" y="45" width="120" height="44" rx="8" class="d-box"/><text x="170" y="72" class="d-txt">Leader</text>
<line x1="40" y1="67" x2="105" y2="67" class="d-line" marker-end="url(#a-rep)"/><text x="60" y="58" class="d-small">writes</text>
<rect x="40" y="150" width="115" height="44" rx="8" class="d-box2"/><text x="97" y="177" class="d-txt">Follower 1</text>
<rect x="185" y="150" width="115" height="44" rx="8" class="d-box2"/><text x="242" y="177" class="d-txt">Follower 2</text>
<line x1="140" y1="89" x2="105" y2="145" class="d-line" marker-end="url(#a-rep)"/>
<line x1="200" y1="89" x2="235" y2="145" class="d-line" marker-end="url(#a-rep)"/>
<text x="170" y="125" class="d-small">replicate (lag!)</text>
<text x="170" y="225" class="d-small">reads served by followers</text>
<line x1="360" y1="15" x2="360" y2="250" class="d-line d-dash"/>
<text x="545" y="25" class="d-txt">Sharding: slices</text>
<rect x="490" y="45" width="110" height="40" rx="8" class="d-box2"/><text x="545" y="70" class="d-txt">Router</text>
<line x1="420" y1="65" x2="485" y2="65" class="d-line" marker-end="url(#a-rep)"/><text x="430" y="55" class="d-small">hash(user_id)</text>
<rect x="400" y="150" width="90" height="44" rx="8" class="d-box"/><text x="445" y="172" class="d-txt">Shard 0</text><text x="445" y="188" class="d-small">users A–H</text>
<rect x="505" y="150" width="90" height="44" rx="8" class="d-box"/><text x="550" y="172" class="d-txt">Shard 1</text><text x="550" y="188" class="d-small">users I–Q</text>
<rect x="610" y="150" width="90" height="44" rx="8" class="d-box"/><text x="655" y="172" class="d-txt">Shard 2</text><text x="655" y="188" class="d-small">users R–Z</text>
<line x1="520" y1="85" x2="455" y2="145" class="d-line" marker-end="url(#a-rep)"/>
<line x1="545" y1="85" x2="548" y2="145" class="d-line" marker-end="url(#a-rep)"/>
<line x1="570" y1="85" x2="645" y2="145" class="d-line" marker-end="url(#a-rep)"/>
<text x="545" y="225" class="d-small">each shard holds a slice — writes scale too</text>
</svg>`,
        example: `A messaging app shards conversations by \`hash(conversation_id)\` across 16 DB nodes, and each shard has 2 read replicas. One extremely active group chat (100k members) still lands on a single shard — a hot shard — so the team splits that conversation's messages by time range as a second-level partition. Separately, a user reports "I sent a message and it vanished": classic replication lag — their read hit a follower that hadn't received the write yet. Fix: route a user's reads to the leader for a few seconds after they write.`,
        useCases: [
          "Instagram: famously sharded Postgres by user ID — billions of rows across thousands of shards, each replicated.",
          "Every managed DB you'll use: RDS read replicas (replication) and DynamoDB partitions (sharding) are these concepts productized.",
          "Disaster recovery: cross-region replicas mean a data-center fire doesn't lose customer data — this is why replication is non-negotiable, not an optimization.",
        ],
        practice: [
          "What is 'replication lag' and what user-visible bug can it cause (give a concrete scenario)?",
          "What's a 'hot shard' and name one way to mitigate it.",
        ],
        sources: [{ title: "Designing Data-Intensive Applications (book)", url: "" }],
      },
      {
        id: "cap-theorem",
        title: "CAP Theorem",
        section: "hld",
        why: `Once data lives on multiple machines (which replication and sharding force), the network between them can fail — and the machines can't tell "slow" from "dead". CAP is the proof that in that moment you must pick: refuse to answer (stay consistent) or answer possibly-stale (stay available). It's not academic — it's the reasoning tool behind "which database should we use?", and interviewers use it to test whether you can argue trade-offs instead of memorizing them.`,
        concept: `During a network **P**artition (nodes can't reach each other), a distributed system must choose between:
- **C**onsistency: every read sees the latest write — which means a node that can't confirm it has the latest data must refuse to answer.
- **A**vailability: every request gets a response — which means answering even when the data might be stale.
- **CP systems** (ZooKeeper, etcd, traditional RDBMS clusters): correctness over uptime. Some requests fail during partitions.
- **AP systems** (Cassandra, DynamoDB): uptime over freshness. Divergent writes are reconciled after the partition heals ("eventual consistency").
- Partitions are rare: most of the time you get both C and A. The everyday trade-off is **PACELC**: Else (no partition), you choose **L**atency vs **C**onsistency — waiting for all replicas to confirm a write is consistent but slow.
- Interview framing: never say "I'd use Cassandra because it's AP." Say which *data* in your system tolerates staleness and which doesn't — different parts of one system make different choices.`,
        diagram: `<svg viewBox="0 0 720 240" xmlns="http://www.w3.org/2000/svg">
<rect x="60" y="30" width="130" height="50" rx="8" class="d-box"/><text x="125" y="60" class="d-txt">Node A</text>
<rect x="530" y="30" width="130" height="50" rx="8" class="d-box"/><text x="595" y="60" class="d-txt">Node B</text>
<path d="M195 55 L320 55 L340 40 L360 70 L380 55 L525 55" class="d-line d-warnline" fill="none"/>
<text x="360" y="95" class="d-small">network partition — A and B can't talk</text>
<text x="360" y="112" class="d-small">each must now decide alone:</text>
<rect x="80" y="140" width="250" height="75" rx="8" class="d-box2"/>
<text x="205" y="165" class="d-txt">Choose C (consistency)</text>
<text x="205" y="187" class="d-small">"I can't confirm I'm up to date</text>
<text x="205" y="203" class="d-small">→ reject the request" (CP)</text>
<rect x="390" y="140" width="250" height="75" rx="8" class="d-box2"/>
<text x="515" y="165" class="d-txt">Choose A (availability)</text>
<text x="515" y="187" class="d-small">"answer with what I have,</text>
<text x="515" y="203" class="d-small">maybe stale → reconcile later" (AP)</text>
</svg>`,
        example: `A banking ledger is CP — during a partition it's better to reject a withdrawal than let the same ₹10,000 be withdrawn from two ATMs that can't see each other's transactions. A social "like" counter is AP — showing 1,203 likes when the truth is 1,207 harms nobody, but the button going dead would be a visible outage. One product, two choices: Amazon's cart is famously AP (never block adding to cart — merge divergent carts later), while its payment processing is CP.`,
        useCases: [
          "Database selection in interviews: 'chat messages → AP with per-conversation ordering; payments → CP' is the expected level of reasoning.",
          "Amazon DynamoDB's origin: built AP-first because cart downtime measurably cost revenue, staleness didn't.",
          "Config/coordination stores (ZooKeeper, etcd): CP — serving stale cluster config could make two nodes both think they're the leader.",
        ],
        practice: [
          "For a shopping cart system, would you lean CP or AP? Justify with a concrete failure scenario.",
          "Explain why CAP theorem 'doesn't apply' when there's no network partition — what trade-off do you deal with then (hint: PACELC)?",
        ],
        sources: [{ title: "System Design Primer", url: "https://github.com/donnemartin/system-design-primer" }],
      },
      {
        id: "message-queues",
        title: "Message Queues & Async Processing",
        section: "hld",
        why: `Synchronous calls chain failures: if checkout calls the email service directly and email is down, checkout fails — even though the email was never worth failing an order over. Queues break that chain: the producer drops a message and moves on; consumers process it when they can. This decoupling is how large systems absorb traffic spikes, survive partial outages, and let teams deploy services independently. Almost every HLD answer includes a queue somewhere.`,
        concept: `Put work on a queue (Kafka, RabbitMQ, SQS) instead of calling services synchronously.
- **Decoupling**: producer and consumer don't need to be up at the same time, or even know about each other.
- **Buffering**: a traffic spike fills the queue instead of crushing the consumers; consumers drain it at their own pace. Queue depth becomes your early-warning metric.
- **Retries & dead-letter queues**: a failed message is retried; one that keeps failing is parked in a DLQ for inspection instead of being lost or blocking the queue.
- **Delivery guarantees**: at-most-once (may lose messages), at-least-once (may duplicate — the practical default), exactly-once (expensive, rarely truly needed). Since duplicates happen, **consumers must be idempotent**: processing the same message twice must be harmless (e.g. "set status=paid" is idempotent; "balance += 100" is not).
- **Pub/Sub**: one event, many independent subscribers — the publisher doesn't know or care who's listening, so adding a new consumer requires zero changes to existing code.`,
        diagram: `<svg viewBox="0 0 720 240" xmlns="http://www.w3.org/2000/svg">
<defs><marker id="a-mq" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="d-fill"/></marker></defs>
<rect x="30" y="95" width="130" height="50" rx="8" class="d-box"/><text x="95" y="118" class="d-txt">Checkout</text><text x="95" y="135" class="d-small">publishes &amp; moves on</text>
<rect x="250" y="95" width="180" height="50" rx="8" class="d-box2"/>
<rect x="265" y="108" width="24" height="24" rx="3" class="d-box"/><rect x="295" y="108" width="24" height="24" rx="3" class="d-box"/><rect x="325" y="108" width="24" height="24" rx="3" class="d-box"/>
<text x="390" y="124" class="d-small">queue</text>
<line x1="165" y1="120" x2="245" y2="120" class="d-line" marker-end="url(#a-mq)"/><text x="205" y="110" class="d-small">OrderPlaced</text>
<rect x="540" y="20" width="150" height="44" rx="8" class="d-box"/><text x="615" y="47" class="d-txt">Payment svc</text>
<rect x="540" y="98" width="150" height="44" rx="8" class="d-box"/><text x="615" y="125" class="d-txt">Inventory svc</text>
<rect x="540" y="176" width="150" height="44" rx="8" class="d-box2 d-warn"/><text x="615" y="196" class="d-txt">Email svc (down)</text><text x="615" y="212" class="d-small">catches up on recovery</text>
<line x1="435" y1="105" x2="535" y2="48" class="d-line" marker-end="url(#a-mq)"/>
<line x1="435" y1="120" x2="535" y2="120" class="d-line" marker-end="url(#a-mq)"/>
<line x1="435" y1="135" x2="535" y2="190" class="d-line d-dash"/>
<text x="330" y="175" class="d-small">one event, independent consumers —</text>
<text x="330" y="192" class="d-small">a down consumer doesn't block the order</text>
</svg>`,
        example: `Checkout publishes one "OrderPlaced" event and returns success to the user in 200 ms. The payment, inventory, and email services each consume it independently. The email service is down for an hour — orders keep flowing, and when it recovers it drains the backlog; customers just get their confirmation emails slightly late. One email message gets delivered twice (at-least-once delivery) — but the consumer checks "did I already send email for order #123?" before sending, so the duplicate is harmless. That check is idempotency.`,
        useCases: [
          "Food delivery (Swiggy/Zomato): order placed → events fan out to restaurant notification, rider assignment, user tracking, analytics — all async.",
          "Video processing (YouTube): upload returns instantly; transcoding to 10 resolutions happens via a work queue over the next minutes.",
          "Flash-sale order spikes: 100k orders/minute buffer in the queue while payment processing drains at its sustainable 10k/minute.",
          "Kafka as the event backbone: at LinkedIn/Uber scale, every service change is an event other teams subscribe to without coordination.",
        ],
        practice: [
          "Why must a queue consumer be idempotent if the queue guarantees at-least-once delivery? Give an example of a non-idempotent handler that breaks.",
          "When would you choose synchronous (direct API call) over async (queue) between two services?",
        ],
        sources: [{ title: "ByteByteGo blog", url: "https://bytebytego.com" }],
      },
      {
        id: "cdn-dns",
        title: "CDN & DNS at Scale",
        section: "hld",
        why: `Physics is the one bottleneck you can't optimize away: a request from Mumbai to a server in Virginia takes ~200ms round-trip no matter how fast your code is. CDNs fix this by moving content close to users; DNS-level routing decides which nearby location each user hits. Together they're why Netflix starts instantly and why "serve static assets from a CDN" is the expected first move in any design with global users or heavy media.`,
        concept: `- **CDN**: a network of edge servers spread across the globe, caching content close to users. A Mumbai user fetches images from a Mumbai edge node (~20ms) instead of your US origin (~200ms). On a cache miss the edge fetches from origin once, then serves thousands of users from its copy — slashing both latency and origin load.
- Best for **static content** (images, JS/CSS, video); modern CDNs also cache API responses briefly and run edge logic (Cloudflare Workers).
- **Cache invalidation at the edge**: versioned filenames (\`app.v42.js\`) sidestep it — deploy new files, old ones expire naturally.
- **DNS at scale**: GeoDNS answers the same domain name with different IPs by location — routing each user to the nearest data center. Health-checked DNS pulls a dead region out of answers (failover).
- **TTL trade-off**: long TTL = less DNS load but slow failover (clients keep cached dead IPs); short TTL = fast failover, more lookups. Critical endpoints run short TTLs (30-60s).`,
        diagram: `<svg viewBox="0 0 720 250" xmlns="http://www.w3.org/2000/svg">
<defs><marker id="a-cdn" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="d-fill"/></marker></defs>
<rect x="30" y="30" width="120" height="40" rx="8" class="d-box2"/><text x="90" y="55" class="d-txt">User Mumbai</text>
<rect x="30" y="105" width="120" height="40" rx="8" class="d-box2"/><text x="90" y="130" class="d-txt">User London</text>
<rect x="30" y="180" width="120" height="40" rx="8" class="d-box2"/><text x="90" y="205" class="d-txt">User NYC</text>
<rect x="280" y="30" width="130" height="40" rx="8" class="d-box"/><text x="345" y="55" class="d-txt">Edge Mumbai</text>
<rect x="280" y="105" width="130" height="40" rx="8" class="d-box"/><text x="345" y="130" class="d-txt">Edge London</text>
<rect x="280" y="180" width="130" height="40" rx="8" class="d-box"/><text x="345" y="205" class="d-txt">Edge NYC</text>
<line x1="155" y1="50" x2="275" y2="50" class="d-line d-good" marker-end="url(#a-cdn)"/><text x="213" y="42" class="d-small">~20 ms</text>
<line x1="155" y1="125" x2="275" y2="125" class="d-line d-good" marker-end="url(#a-cdn)"/><text x="213" y="117" class="d-small">~15 ms</text>
<line x1="155" y1="200" x2="275" y2="200" class="d-line d-good" marker-end="url(#a-cdn)"/><text x="213" y="192" class="d-small">~10 ms</text>
<rect x="560" y="105" width="130" height="50" rx="8" class="d-box2"/><text x="625" y="128" class="d-txt">Origin (US)</text><text x="625" y="145" class="d-small">uploads + misses only</text>
<line x1="415" y1="55" x2="555" y2="115" class="d-line d-dash" marker-end="url(#a-cdn)"/>
<line x1="415" y1="125" x2="555" y2="128" class="d-line d-dash" marker-end="url(#a-cdn)"/>
<line x1="415" y1="198" x2="555" y2="142" class="d-line d-dash" marker-end="url(#a-cdn)"/>
<text x="480" y="90" class="d-small">cache miss only (once per file)</text>
<text x="345" y="240" class="d-small">GeoDNS routes each user to their nearest edge automatically</text>
</svg>`,
        example: `A video platform serves video chunks from CDN edges near each user; the origin only handles uploads and cache misses — cutting origin bandwidth by ~95%. Its JS bundle ships as \`app.v42.js\` with a 1-year cache header: a deploy just references \`v43\`, no invalidation needed. The API endpoint, meanwhile, uses GeoDNS with a 60s TTL — when the Singapore region died last year, DNS stopped answering with Singapore IPs within a minute and Asian users transparently failed over to Tokyo.`,
        useCases: [
          "Netflix Open Connect: CDN boxes physically inside ISPs — the most extreme 'move content to users' in existence.",
          "Hotstar cricket streaming: 25M concurrent viewers only works because video flows from edges, not origin.",
          "Every production website: static assets behind CloudFront/Cloudflare/Akamai is table stakes, not an optimization.",
          "Global API routing: multi-region deployments use GeoDNS so EU users hit Frankfurt, not Virginia (also helps GDPR data locality).",
        ],
        practice: [
          "Why would a CDN not help for highly personalized, frequently-changing data (e.g. a live stock ticker)?",
          "What's the trade-off of setting a very long DNS TTL vs a very short one?",
        ],
        sources: [{ title: "ByteByteGo blog", url: "https://bytebytego.com" }],
      },
    ],
  },
];
