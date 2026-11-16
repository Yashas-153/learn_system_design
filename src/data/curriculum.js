import { phases as legacyPhases } from "./legacyTopics.js";
import { week1Lessons } from "./week1.js";

const legacy = Object.fromEntries(legacyPhases.flatMap((p) => p.topics).map((t) => [t.id, t]));
const L = (id) => legacy[id]; // a v1 lesson written before this curriculum
const stub = (id, title) => ({ id, title }); // outline only, written when its week is reached

export const phases = {
  foundations: "Phase 1 · Foundations",
  distributed: "Phase 2 · Distributed systems",
  hld: "Phase 3 · High-level design",
  lld: "Phase 4 · Low-level design",
  practice: "Phase 5 · Interview practice",
};

// Colour language used by every simulation.
export const kinds = [
  ["client", "Client"],
  ["service", "Service"],
  ["database", "Database"],
  ["cache", "Cache"],
  ["queue", "Queue"],
  ["external", "External system"],
];

// pos = node position in the dependency graph; prereqs = week numbers.
export const weeks = [
  {
    n: 1, phase: "foundations", short: "Networking & APIs", title: "How machines talk: networking, HTTP and APIs",
    prereqs: [], pos: { x: 10, y: 30 },
    objectives: [
      "Trace one request from browser to database and back, naming every protocol",
      "Explain TCP vs UDP, DNS resolution and the TLS handshake",
      "Design a clean REST API with pagination and idempotency",
      "Choose between REST, gRPC, WebSockets, SSE and polling",
    ],
    lessons: week1Lessons,
  },
  {
    n: 2, phase: "foundations", short: "Data, caches & OS", title: "Storing and serving: databases, caching, load balancing, concurrency",
    prereqs: [1], pos: { x: 170, y: 30 },
    objectives: [
      "Model data relationally, normalise it, and know when to break the rules",
      "Explain how indexes work and choose SQL vs NoSQL for a workload",
      "Place caches and load balancers correctly and reason about invalidation",
      "Explain processes, threads, locks and race conditions",
    ],
    lessons: [
      L("databases"),
      stub("w2-acid", "Normalisation, transactions and ACID"),
      L("caching"),
      L("load-balancing"),
      stub("w2-proxies", "Proxies: forward, reverse and API gateways"),
      stub("w2-os", "OS fundamentals: processes, threads and concurrency"),
      stub("w2-checkpoint", "Week 2 checkpoint"),
    ],
  },
  {
    n: 3, phase: "distributed", short: "Scaling & consistency", title: "Scaling data: replication, partitioning, consistency, consensus",
    prereqs: [2], pos: { x: 330, y: 30 },
    objectives: [
      "Scale reads with replication and writes with sharding, and name each one's failure modes",
      "Apply consistent hashing to partition data",
      "Use CAP and consistency models to justify a database choice",
      "Explain how a cluster elects a leader and agrees on a value (Raft)",
    ],
    lessons: [
      L("scalability"),
      L("replication-sharding"),
      stub("w3-partitioning", "Partitioning strategies and consistent hashing"),
      L("cap-theorem"),
      stub("w3-consistency", "Consistency models and quorums"),
      stub("w3-consensus", "Consensus and leader election (Raft)"),
      stub("w3-checkpoint", "Week 3 checkpoint"),
    ],
  },
  {
    n: 4, phase: "distributed", short: "Async & fault tolerance", title: "Asynchronous systems: queues, events, Kafka, Redis, retries",
    prereqs: [3], pos: { x: 490, y: 30 },
    objectives: [
      "Decouple services with queues and events and pick delivery guarantees",
      "Explain Kafka's log, partitions and consumer groups",
      "Use Redis as a cache, a lock and a pub/sub channel",
      "Make any operation safe to retry: timeouts, backoff, idempotency",
    ],
    lessons: [
      L("message-queues"),
      stub("w4-events", "Event-driven architecture and pub/sub patterns"),
      stub("w4-kafka", "Kafka internals: logs, partitions, consumer groups"),
      stub("w4-redis", "Redis and distributed caching"),
      stub("w4-fault-tolerance", "Fault tolerance: timeouts, retries and backoff"),
      stub("w4-idempotency", "Idempotency and delivery semantics"),
      stub("w4-checkpoint", "Week 4 checkpoint"),
    ],
  },
  {
    n: 5, phase: "distributed", short: "Resilience & operations", title: "Running in production: protection, discovery, observability, recovery",
    prereqs: [4], pos: { x: 650, y: 30 },
    objectives: [
      "Implement and compare rate-limiting algorithms",
      "Stop cascading failures with circuit breakers and bulkheads",
      "Explain service discovery, CDNs and global traffic routing",
      "Define SLOs and design for disaster recovery (RPO/RTO)",
    ],
    lessons: [
      stub("w5-rate-limiting", "Rate limiting algorithms"),
      stub("w5-circuit-breakers", "Circuit breakers and bulkheads"),
      stub("w5-discovery", "Service discovery and API gateways"),
      L("cdn-dns"),
      stub("w5-observability", "Observability: logs, metrics, traces and SLOs"),
      stub("w5-dr", "Disaster recovery and multi-region design"),
      stub("w5-checkpoint", "Week 5 checkpoint"),
    ],
  },
  {
    n: 6, phase: "hld", short: "HLD framework", title: "The HLD method: requirements to defended design",
    prereqs: [5], pos: { x: 650, y: 140 },
    objectives: [
      "Run a repeatable framework: requirements → estimation → API → data → design → deep dive",
      "Estimate QPS, storage and bandwidth in two minutes",
      "Choose databases and design schemas from access patterns",
      "Find bottlenecks and argue trade-offs under questioning",
    ],
    lessons: [
      stub("w6-framework", "The HLD interview framework"),
      stub("w6-estimation", "Capacity estimation: QPS, storage, bandwidth"),
      stub("w6-data", "Database selection and schema design"),
      stub("w6-api-flows", "API contracts and data flows"),
      stub("w6-tradeoffs", "Bottlenecks, trade-offs and security"),
      stub("w6-url-shortener", "Worked problem: URL shortener"),
      stub("w6-checkpoint", "Week 6 checkpoint"),
    ],
  },
  {
    n: 7, phase: "lld", short: "OOP, SOLID & UML", title: "Object-oriented design: OOP, SOLID, UML, object modelling",
    prereqs: [], pos: { x: 10, y: 250 },
    objectives: [
      "Model a domain with classes, interfaces and composition",
      "Apply each SOLID principle and spot violations",
      "Draw class and sequence diagrams fluently",
      "Run a repeatable LLD interview framework",
    ],
    lessons: [
      L("oop-basics"),
      stub("w7-interfaces", "Interfaces, abstractions and composition"),
      L("solid"),
      L("uml-basics"),
      stub("w7-sequence", "Sequence diagrams and object modelling"),
      stub("w7-framework", "The LLD interview framework"),
      stub("w7-checkpoint", "Week 7 checkpoint"),
    ],
  },
  {
    n: 8, phase: "lld", short: "Patterns & concurrency", title: "Design patterns, clean architecture and thread safety",
    prereqs: [7, 2], pos: { x: 170, y: 250 },
    objectives: [
      "Recognise when a design pattern solves a real problem (and when it is noise)",
      "Structure code with dependency injection and clean boundaries",
      "Write thread-safe classes and explain locks, deadlocks and atomicity",
      "Complete two LLD problems end to end",
    ],
    lessons: [
      stub("w8-creational", "Creational patterns: Factory, Builder, Singleton"),
      stub("w8-structural", "Structural patterns: Adapter, Decorator, Composite"),
      stub("w8-behavioural", "Behavioural patterns: Strategy, Observer, State, Command"),
      stub("w8-di", "Dependency injection and clean architecture"),
      stub("w8-concurrency", "Concurrency and thread safety"),
      stub("w8-worked", "Worked problems: Parking Lot and Logger Framework"),
      stub("w8-checkpoint", "Week 8 checkpoint"),
    ],
  },
  {
    n: 9, phase: "practice", short: "HLD problems I", title: "HLD practice I: infrastructure and messaging systems",
    prereqs: [6], pos: { x: 490, y: 140 },
    objectives: [
      "Design five systems end to end within 45 minutes each",
      "Reuse building blocks deliberately instead of memorising solutions",
      "Handle follow-ups on scale, failure and consistency",
    ],
    lessons: [
      stub("w9-rate-limiter", "Design a distributed rate limiter"),
      stub("w9-notifications", "Design a notification system"),
      stub("w9-autocomplete", "Design search autocomplete"),
      stub("w9-whatsapp", "Design WhatsApp"),
      stub("w9-twitter", "Design Twitter/X"),
      stub("w9-mock", "Mock HLD interview #1 with rubric"),
      stub("w9-checkpoint", "Week 9 checkpoint"),
    ],
  },
  {
    n: 10, phase: "practice", short: "HLD problems II", title: "HLD practice II: media, feeds and geo systems",
    prereqs: [9], pos: { x: 330, y: 140 },
    objectives: [
      "Design media pipelines, feeds and location-based systems",
      "Recognise recurring patterns: fan-out, geo-indexing, transcoding, CDNs",
      "Defend decisions against a pushing interviewer",
    ],
    lessons: [
      stub("w10-instagram", "Design Instagram"),
      stub("w10-youtube", "Design YouTube"),
      stub("w10-netflix", "Design Netflix"),
      stub("w10-uber", "Design Uber"),
      stub("w10-patterns", "Cross-problem patterns and revision"),
      stub("w10-mock", "Mock HLD interview #2 with rubric"),
      stub("w10-checkpoint", "Week 10 checkpoint"),
    ],
  },
  {
    n: 11, phase: "practice", short: "LLD problems", title: "LLD practice: six classic machine-coding problems",
    prereqs: [8], pos: { x: 490, y: 250 },
    objectives: [
      "Go from requirements to working, extensible code in 60–90 minutes",
      "Absorb follow-up requirements without rewriting",
      "Explain each class's responsibility and each pattern's reason",
    ],
    lessons: [
      stub("w11-elevator", "Design an elevator system"),
      stub("w11-splitwise", "Design Splitwise"),
      stub("w11-bookmyshow", "Design BookMyShow"),
      stub("w11-food-delivery", "Design a food delivery system"),
      stub("w11-cart", "Design the Amazon shopping cart"),
      stub("w11-chess", "Design chess"),
      stub("w11-checkpoint", "Week 11 checkpoint"),
    ],
  },
  {
    n: 12, phase: "practice", short: "Mocks & revision", title: "Interview simulation: full mocks, cheat sheets, final review",
    prereqs: [10, 11], pos: { x: 330, y: 360 },
    objectives: [
      "Pass full-length HLD and LLD mocks against the SDE-2 rubric",
      "Consolidate every week into one-page cheat sheets",
      "Practise clarifying, estimating and defending under time pressure",
    ],
    lessons: [
      stub("w12-ride-booking", "Design ride booking (LLD)"),
      stub("w12-atm", "Design an ATM (LLD)"),
      stub("w12-mock-lld", "Full mock: LLD round with rubric"),
      stub("w12-mock-hld", "Full mock: HLD round with rubric"),
      stub("w12-cheatsheets", "Cheat sheets and question bank review"),
      stub("w12-defend", "Defending decisions under questioning"),
      stub("w12-final", "Final mastery check"),
    ],
  },
];

export const allLessons = weeks.flatMap((w) => w.lessons.map((l, i) => ({ ...l, week: w.n, day: i + 1 })));

// "ready" = full 10-part lesson, "draft" = v1 lesson, "outline" = not written yet
export const lessonStatus = (l) => (l.intuition || l.checkpoint ? "ready" : l.concept ? "draft" : "outline");

export const resources = [
  {
    group: "Core books",
    items: [
      { title: "Designing Data-Intensive Applications — Martin Kleppmann", url: "https://dataintensive.net/", note: "The reference for Weeks 2–4: storage, replication, partitioning, consistency. A second edition (with Chris Riccomini) was published in 2026." },
      { title: "System Design Interview, Volumes 1 & 2 — Alex Xu", url: "https://bytebytego.com", note: "Worked interview problems; the model for Weeks 6, 9 and 10. Volume 2 goes deeper on correctness and failure handling." },
      { title: "Fundamentals of Software Architecture — Richards & Ford", url: "https://nealford.com/books/SAF2e.html", note: "Architecture styles and trade-off thinking. Useful background for Weeks 6 and 8." },
      { title: "Head First Design Patterns", url: "", note: "The gentlest route into patterns for Weeks 7–8." },
    ],
  },
  {
    group: "Free references",
    items: [
      { title: "Google SRE Book and Workbook", url: "https://sre.google/books/", note: "Free online. SLOs, overload, cascading failures — Week 5." },
      { title: "AWS Well-Architected Framework", url: "https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html", note: "Six pillars; a checklist for reliability and scalability reasoning." },
      { title: "Martin Fowler — software architecture guide", url: "https://martinfowler.com/architecture/", note: "Precise definitions of patterns you will name in interviews." },
      { title: "System Design Primer", url: "https://github.com/donnemartin/system-design-primer", note: "A broad free overview with practice questions." },
      { title: "Awesome Low-Level Design", url: "https://github.com/ashishps1/awesome-low-level-design", note: "LLD problems with reference solutions for Weeks 8, 11 and 12." },
    ],
  },
  {
    group: "Engineering blogs and case studies",
    items: [
      { title: "High Scalability", url: "https://highscalability.com/", note: "Architecture write-ups of real systems." },
      { title: "Netflix Tech Blog", url: "https://netflixtechblog.com/", note: "Edge gateways, resilience, streaming." },
      { title: "Uber Engineering — Next Gen Push Platform on gRPC", url: "https://www.uber.com/blog/ubers-next-gen-push-platform-on-grpc/", note: "Used in Week 1: SSE → gRPC streaming over QUIC." },
      { title: "Discord — scaling Elixir to 5,000,000 concurrent users", url: "https://discord.com/blog/how-discord-scaled-elixir-to-5-000-000-concurrent-users", note: "Used in Week 1: WebSocket fan-out at scale." },
      { title: "Meta Engineering — the October 4, 2021 outage", url: "https://engineering.fb.com/2021/10/05/networking-traffic/outage-details/", note: "Used in Week 1: what a DNS/BGP failure looks like." },
      { title: "Stripe Engineering — idempotency", url: "https://stripe.com/blog/idempotency", note: "Used in Week 1: safe retries." },
    ],
  },
  {
    group: "Week 1 specifications and primers",
    items: [
      { title: "MDN — An overview of HTTP", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview", note: "" },
      { title: "Cloudflare Learning — What is DNS?", url: "https://www.cloudflare.com/learning/dns/what-is-dns/", note: "" },
      { title: "gRPC — core concepts", url: "https://grpc.io/docs/what-is-grpc/core-concepts/", note: "" },
      { title: "RFC 9110 HTTP Semantics", url: "https://www.rfc-editor.org/info/rfc9110", note: "" },
      { title: "RFC 9293 TCP", url: "https://www.rfc-editor.org/info/rfc9293", note: "" },
      { title: "RFC 8446 TLS 1.3", url: "https://www.rfc-editor.org/info/rfc8446", note: "" },
      { title: "RFC 6455 WebSocket", url: "https://www.rfc-editor.org/info/rfc6455", note: "" },
    ],
  },
];
