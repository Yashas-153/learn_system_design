// Week 1 — How machines talk. Full 10-part lessons.
// Lesson shape: intuition, analogy, problem, internals, sim[] (FlowSim scenarios), code[],
// production, tradeoffs, interview, practice[{level,q,a}], sources[].

const s = (from, to, label, note, fail = false) => ({ from, to, label, note, fail });

const browser = { id: "c", label: "Browser", kind: "client" };
const client = { id: "c", label: "Client", kind: "client" };
const server = { id: "s", label: "Server", kind: "service" };
const db = { id: "d", label: "Database", kind: "database" };

export const week1Lessons = [
  {
    id: "w1-client-server",
    title: "Client–server architecture & the journey of a request",
    minutes: 60,
    prereqs: [],
    intuition: `Almost every system you will design has the same skeleton: a **client** that asks and a **server** that answers.
- The **client** (browser, mobile app, another service) always *starts* the conversation.
- The **server** is a program that never exits. It sits at a known address, waits, and responds to whoever asks.
- The server usually doesn't hold the data itself. It asks a **database** — so the server is also a client of something else. Real systems are chains of these relationships.
Once this is second nature, every architecture diagram becomes readable: each arrow is one side asking and the other answering.`,
    analogy: `A restaurant. You (the client) never walk into the kitchen. You give an order to the waiter using the menu (the **API** — the fixed list of things you may ask for). The kitchen (the **server**) does the work, fetching ingredients from the pantry (the **database**). You don't know or care how the kitchen is organised, and the kitchen can be rebuilt without retraining customers — as long as the menu stays the same.`,
    problem: `Why not put all the logic and data inside each user's app?
- **Shared truth**: a million users must see the same inventory, the same messages, the same balance. That needs one authoritative place.
- **Control**: you can't trust or update code on devices you don't own. Server code is patched once, for everyone, instantly.
- **Power**: a phone can't search a billion products; a fleet of servers can.
The price is that everything now depends on a network hop — which is slow and can fail. Most of system design is managing that price.`,
    internals: `What actually happens between "user taps" and "screen updates":
- **1. Find the server.** The client turns a name (\`example.com\`) into an IP address using DNS (Day 3).
- **2. Open a connection.** The client opens a TCP connection to that IP on a **port** — a number that identifies which program on the machine should get the data (443 for HTTPS). IP address + port = one specific listening program (Day 2).
- **3. Secure it.** A TLS handshake encrypts the connection (Day 4).
- **4. Ask.** The client sends an HTTP request: a method, a path, headers, sometimes a body.
- **5. Work.** The server parses it, runs business logic, queries its database.
- **6. Answer.** The server sends an HTTP response: a status code, headers, a body. The client renders it.
On the server side, "listening" means the OS holds a socket bound to a port. Each incoming connection is handed to the program, which serves many clients at once using threads or an event loop (Week 2).
One property to notice now: if the server keeps **no memory of a client between requests** (it is *stateless*), then any copy of the server can handle any request. That single property is what makes scaling possible in Week 3.`,
    sim: [
      {
        name: "One request, end to end",
        intro: "The full path of a single page load. Step through it and say each hop out loud — this is the opening of every HLD interview.",
        actors: [browser, { id: "n", label: "DNS", kind: "external" }, { id: "s", label: "App server", kind: "service" }, db],
        steps: [
          s("c", "n", "example.com → IP?", "The browser only has a name. It asks DNS for the IP address. (Usually answered from a cache in under a millisecond.)"),
          s("n", "c", "203.0.113.7", "DNS returns the address. The browser caches it for the record's TTL."),
          s("c", "s", "TCP + TLS handshake", "Before any data flows, client and server set up a reliable connection (TCP) and encrypt it (TLS). This costs 2–3 network round trips — which is why connections are reused."),
          s("c", "s", "GET /products/42", "The actual HTTP request travels over the encrypted connection."),
          s("s", "d", "SELECT … WHERE id = 42", "The server is now itself a client: it asks the database for the product row."),
          s("d", "s", "1 row", "The database answers. For a well-indexed lookup this takes about a millisecond."),
          s("s", "c", "200 OK + JSON", "The server builds the response and sends it back on the same connection."),
          s("c", "c", "render the page", "The browser parses the response and paints. A real page repeats steps 4–7 dozens of times for images, scripts and API calls."),
        ],
      },
      {
        name: "Failure: the only server is down",
        intro: "What a single point of failure looks like from the client's side.",
        actors: [browser, { id: "s", label: "App server (crashed)", kind: "service" }],
        steps: [
          s("c", "s", "SYN — can we connect?", "The browser tries to open a TCP connection. Nobody is listening.", true),
          s("c", "c", "no reply… wait, retry", "TCP waits about a second, then retries with a longer wait each time (exponential backoff)."),
          s("c", "s", "SYN (retry)", "Still nothing. The client cannot tell whether the server is dead, slow, or the network is broken — this ambiguity is the central difficulty of distributed systems.", true),
          s("c", "c", "timeout → error page", "After the timeout the user sees an error. With one server, one crash is a total outage. The fix — several servers behind a load balancer — is Week 2."),
        ],
      },
    ],
    code: [
      {
        title: "A complete web server in ~20 lines (Python, standard library only)",
        lang: "python",
        source: String.raw`import socket

server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)   # a TCP socket
server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
server.bind(("0.0.0.0", 8080))     # claim port 8080 on every network interface
server.listen()                     # tell the OS to queue incoming connections

while True:                         # a server never "finishes"
    conn, addr = server.accept()    # blocks until a client connects
    request = conn.recv(4096).decode()
    if not request:                 # client connected but sent nothing
        conn.close()
        continue
    print(addr, "asked:", request.splitlines()[0])    # e.g. GET / HTTP/1.1

    body = "Hello from a tiny server!"
    conn.sendall((
        "HTTP/1.1 200 OK\r\n"
        "Content-Type: text/plain\r\n"
        f"Content-Length: {len(body)}\r\n"
        "Connection: close\r\n"
        "\r\n" + body
    ).encode())
    conn.close()`,
        explain: `Run it, then open \`http://localhost:8080\` in a browser. Everything a web framework does is layered on these calls: **bind** a port, **accept** connections, read bytes, write bytes. Notice the weakness: while it serves one client, everyone else waits. Removing that limit (threads, event loops, more machines) is the story of the next two weeks.`,
      },
    ],
    production: `- **Three tiers are the default shape**: clients → stateless application servers → databases. Almost every architecture you will draw is an elaboration of this.
- **Netflix** puts an edge gateway (Zuul) in front of everything: every device talks to the gateway, which routes to hundreds of backend services. Clients know one address; the backend can be rearranged freely.
- **AWS Well-Architected** (reliability pillar) recommends stateless application tiers for exactly the reason above: any instance can serve any request, so instances can be added, removed or replaced at will.`,
    tradeoffs: `- **Client–server vs peer-to-peer**: P2P (BitTorrent, WebRTC calls) removes the central server and its cost, but gives up central control, consistency and easy updates. Use it when the data flows naturally between users (calls, file transfer), not for shared authoritative state.
- **Thin vs thick client**: logic on the server is easy to change and trust; logic on the client feels instant and works offline. Rule: validate and decide on the server, make it feel fast on the client.
- **Stateless vs stateful servers**: stateless scales and recovers trivially but must fetch state on every request; stateful (a game server, a WebSocket server) is faster per request but hard to scale and fail over. Default to stateless; go stateful only with a reason.`,
    interview: `- Start every HLD answer with this skeleton: clients → entry point → services → data stores. Draw it before any detail.
- Label every arrow with **what protocol** and **who initiates**. "The app calls the API over HTTPS" beats an unlabelled line.
- Say the word **stateless** when you draw application servers, and say where the state lives instead. Interviewers listen for it.
- When asked "what happens if this box dies?", you should already know the answer for every box you drew.`,
    practice: [
      { level: "Warm-up", q: "In a food-delivery app, name the client(s), the server(s) and the data store(s). Which components are both a client and a server?", a: "Clients: customer app, rider app, restaurant tablet. Servers: the API/backend services. Stores: order DB, menu DB. The backend is a server to the apps and a client to its databases and to external services such as the payment gateway and maps." },
      { level: "Core", q: "Run the 20-line server and open it from two browser tabs at once while adding time.sleep(5) before the response. What happens, and why?", a: "The second tab waits ~5 s longer. The loop handles one connection at a time: accept → serve → close. The second connection sits in the OS accept queue. Fixes: a thread per connection, an event loop, or several processes — Week 2." },
      { level: "Core", q: "Why does keeping login sessions in the server's memory make it hard to add a second server?", a: "The second request may land on a server that has never seen this user, so they appear logged out. Either pin users to servers (fragile) or move session state to a shared store such as Redis or a signed token, making servers stateless." },
      { level: "Stretch", q: "A client sends a request and gets no response for 30 seconds. List every distinct thing that could have happened.", a: "Request lost on the way; server crashed before processing; server processed it and crashed before replying; reply lost on the way back; server is alive but slow; a network partition. The client cannot distinguish these — which is why retries must be safe (idempotency, Day 5)." },
    ],
    sources: [
      { title: "AWS Well-Architected Framework", url: "https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html" },
      { title: "Netflix Tech Blog — Open Sourcing Zuul 2", url: "https://netflixtechblog.com/open-sourcing-zuul-2-82ea476cb2b3" },
      { title: "System Design Primer", url: "https://github.com/donnemartin/system-design-primer" },
    ],
  },

  {
    id: "w1-networking",
    title: "Networking: IP, TCP and UDP",
    minutes: 75,
    prereqs: ["w1-client-server"],
    intuition: `The internet is built in layers, each solving one problem:
- **IP** moves a packet from one address to another, *best effort*. Packets can be lost, duplicated, delayed or arrive out of order, and IP will not tell you.
- **TCP** sits on top and turns that mess into a **reliable, ordered stream of bytes**. It numbers everything, waits for acknowledgements and resends what goes missing.
- **UDP** sits on top of IP and adds almost nothing: you send a datagram and hope. No setup, no guarantee, no delay.
- **Ports** let one machine run many networked programs: the IP address finds the machine, the port finds the program.
The whole choice is: do you want *correct and complete* (TCP) or *fast and fresh* (UDP)?`,
    analogy: `IP is the postal service for postcards: each has an address, most arrive, some don't, and they may arrive in any order. **TCP** is two careful people exchanging a long letter by postcard: they number every card, confirm each one received and resend any that is missing, so the letter is always reassembled perfectly — at the cost of waiting. **UDP** is shouting scores across a field during a match: if one shout is missed, nobody repeats it, because the next one matters more.`,
    problem: `Physical networks are unreliable by nature: routers drop packets when overloaded, links flip bits, routes change mid-conversation. Applications, however, want to think in terms of "I sent these bytes, they arrived". Someone has to bridge that gap. TCP does it once, inside the operating system, so every application doesn't have to reinvent it. UDP exists for the cases where the bridge itself (waiting, resending) is worse than the loss.`,
    internals: `**TCP, step by step**
- **Three-way handshake**: client sends SYN (with a starting sequence number), server replies SYN-ACK, client replies ACK. One full round trip passes before any data can be sent.
- **Sequence numbers and ACKs**: every byte is numbered. The receiver replies "I have everything up to N". Anything unacknowledged when a timer fires is sent again.
- **Ordering**: out-of-order segments are held back until the gap is filled. This is **head-of-line blocking** — one lost packet stalls everything behind it.
- **Flow control**: the receiver advertises a window ("I can take 64 KB more") so a fast sender cannot drown a slow receiver.
- **Congestion control**: the sender starts slowly, speeds up, and backs off sharply when it detects loss, so the network itself isn't overwhelmed.
- **Teardown**: FIN/ACK in each direction.
**UDP**: an 8-byte header (ports, length, checksum) and your data. No handshake, no ordering, no retransmission, no congestion control.
**Why this matters for design**: opening a TCP connection is expensive (a round trip, plus more for TLS), so real systems *reuse* connections — HTTP keep-alive, database connection pools. And when TCP's head-of-line blocking hurts, protocols build their own reliability on UDP: that is exactly what QUIC, the transport under HTTP/3, does.`,
    sim: [
      {
        name: "TCP: handshake, loss and recovery",
        intro: "Watch TCP set up a connection, lose a packet, and repair the damage without the application ever knowing.",
        actors: [client, server],
        steps: [
          s("c", "s", "SYN  seq=100", "Client: \"I want to talk. My byte numbering starts at 100.\""),
          s("s", "c", "SYN-ACK  seq=300, ack=101", "Server: \"Agreed. Mine starts at 300, and I expect your byte 101 next.\""),
          s("c", "s", "ACK  ack=301", "Handshake complete after one round trip. Both sides now hold connection state in memory."),
          s("c", "s", "DATA  seq=101 (50 bytes)", "The first segment of the request is dropped by an overloaded router somewhere in between.", true),
          s("c", "c", "no ACK… timer fires", "The client never hears \"ack=151\". Its retransmission timer expires."),
          s("c", "s", "DATA  seq=101 (resent)", "The same bytes are sent again. The application above knows nothing about this."),
          s("s", "c", "ACK  ack=151", "\"I now have everything up to byte 150.\" The stream is intact — it just arrived later. Reliability is paid for in latency."),
        ],
      },
      {
        name: "UDP: fire and forget",
        intro: "The same lossy network, without TCP's machinery. Think of a video call sending one frame per datagram.",
        actors: [client, server],
        steps: [
          s("c", "s", "datagram 1 (frame 1)", "No handshake: the very first packet already carries data."),
          s("c", "s", "datagram 2 (frame 2)", "Lost. Nobody notices, nobody resends.", true),
          s("c", "s", "datagram 3 (frame 3)", "Arrives on time. The call shows a brief glitch instead of freezing to wait for an old frame nobody wants any more."),
          s("s", "s", "app decides what loss means", "With UDP, reliability is the application's job: ignore the gap (video), ask again (DNS), or build full reliability yourself (QUIC)."),
        ],
      },
    ],
    code: [
      {
        title: "TCP vs UDP from a program's point of view (Python)",
        lang: "python",
        source: String.raw`import socket

# TCP: connect first (the 3-way handshake happens inside this call),
# then you have a reliable byte stream.
tcp = socket.create_connection(("example.com", 80))
tcp.sendall(b"GET / HTTP/1.1\r\nHost: example.com\r\nConnection: close\r\n\r\n")
print(tcp.recv(200))     # bytes arrive in order, or the call fails - never silently missing
tcp.close()

# UDP: no connection. Each sendto() is one independent datagram that may never arrive.
udp = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
udp.settimeout(2)
udp.sendto(b"ping", ("127.0.0.1", 9999))      # nothing is listening on 9999
try:
    data, sender = udp.recvfrom(1024)
except socket.timeout:
    print("no reply - UDP will not tell you why, and it will not retry")`,
        explain: `The API difference mirrors the protocol difference: TCP has a \`connect\` step and then behaves like a file you read and write; UDP has only "send this packet there". Any retry logic for UDP is code *you* write.`,
      },
    ],
    production: `- **TCP** carries the web (HTTP/1.1 and HTTP/2), database connections, SSH, email — anything where a missing byte is a bug.
- **UDP** carries DNS lookups, voice and video calls (WebRTC), online games and live streaming — anything where late data is useless data.
- **QUIC / HTTP/3** runs over UDP and re-implements reliability per stream, so one lost packet no longer stalls unrelated requests. Uber reported 10–30% better tail latencies for HTTPS traffic after moving to QUIC.
- **Connection pooling** is everywhere because handshakes are expensive: your service keeps a pool of open TCP connections to its database instead of opening one per query.`,
    tradeoffs: `- **Use TCP when** correctness and completeness matter more than a few milliseconds: APIs, payments, file transfer, databases.
- **Use UDP when** freshness matters more than completeness, or messages are tiny and independent: real-time media, game state, DNS, metrics.
- **TCP's costs**: a round trip before data, head-of-line blocking, per-connection memory on the server (which is what limits how many clients a server can hold).
- **UDP's costs**: you own loss, ordering, duplication and congestion. Most teams should not rebuild TCP badly — use QUIC or a library.`,
    interview: `- Be able to say which transport each component uses and why: "chat messages over TCP via WebSockets; voice over UDP because a late audio packet is worthless."
- Know that the handshake costs a round trip and name the fix: **keep-alive and connection pools**.
- When an interviewer mentions millions of concurrent connections, connect it to TCP: each connection is state (memory and a file descriptor) on the server.
- A classic follow-up: "Why is HTTP/3 on UDP?" — to escape TCP's head-of-line blocking and its slow, kernel-bound evolution.`,
    practice: [
      { level: "Warm-up", q: "TCP or UDP: (a) bank transfer API, (b) multiplayer shooter position updates, (c) file download, (d) live cricket-score ticker inside a video stream?", a: "(a) TCP. (b) UDP — an old position is useless. (c) TCP. (d) UDP-based media transport for the video; the score data itself is typically delivered reliably over HTTP/WebSocket (TCP)." },
      { level: "Core", q: "The server's reply to SYN is lost. Walk through what each side does next.", a: "The client's SYN timer expires and it resends SYN (with backoff). The server, having sent SYN-ACK and received no ACK, also retransmits SYN-ACK. Whichever arrives first lets the handshake continue. The half-open entry on the server times out if the client vanishes — the mechanism a SYN-flood attack abuses." },
      { level: "Core", q: "Your service opens a new TCP+TLS connection to the database for every query and p99 latency is poor. Explain the cause and the fix.", a: "Each query pays 1 round trip for TCP plus 1–2 for TLS plus authentication before doing any work. A connection pool keeps N authenticated connections open and lends them out per query, removing the setup cost and capping load on the database." },
      { level: "Stretch", q: "Why does HTTP/2's multiplexing make TCP head-of-line blocking worse than it was under HTTP/1.1, and how does HTTP/3 fix it?", a: "HTTP/2 puts all requests on ONE TCP connection, so a single lost packet stalls every stream until it is retransmitted; with HTTP/1.1's six parallel connections a loss stalled only one. QUIC keeps separate ordering per stream, so loss in one stream doesn't block the others." },
    ],
    sources: [
      { title: "RFC 9293 — Transmission Control Protocol", url: "https://www.rfc-editor.org/info/rfc9293" },
      { title: "Uber Engineering — Next Gen Push Platform on gRPC (QUIC results)", url: "https://www.uber.com/blog/ubers-next-gen-push-platform-on-grpc/" },
      { title: "Designing Data-Intensive Applications — unreliable networks chapter", url: "https://dataintensive.net/" },
    ],
  },

  {
    id: "w1-dns",
    title: "DNS: how names become addresses",
    minutes: 60,
    prereqs: ["w1-client-server", "w1-networking"],
    intuition: `Computers find each other by IP address; people remember names. **DNS** is the lookup service that turns \`example.com\` into \`203.0.113.7\`.
Two ideas make it work at planet scale:
- **Hierarchy**: nobody holds the whole list. The root servers know who runs \`.com\`; the \`.com\` servers know who runs \`example.com\`; that owner's servers know the actual address.
- **Caching**: every answer comes with a **TTL** (time to live). Everyone along the way remembers the answer until it expires, so the full lookup is rare.
DNS is also your first *indirection layer*: because clients look the address up, you can change what's behind the name without touching a single client.`,
    analogy: `Finding a person's phone number. First you check your own contacts (cache). If it isn't there you call directory enquiries (the **resolver**), who doesn't know either but knows how to find out: the national office points to the city office, the city office points to the company switchboard, and the switchboard gives the extension. The operator then remembers it for a while, so the next caller gets an instant answer.`,
    problem: `- **Humans can't remember IPs**, and IPv6 addresses made that hopeless.
- **Addresses change**: servers are replaced, data centres move, traffic shifts between regions. A stable name hides all of it.
- **One name, many machines**: a name can map to several addresses, or to different addresses depending on where you are — the first, coarse form of load balancing and failover.
- **No central registry could scale**: delegation lets each organisation manage only its own names.`,
    internals: `**The lookup chain**
- **Caches first**: browser cache → operating-system cache → the **recursive resolver** (run by your ISP, or public ones like 8.8.8.8 and 1.1.1.1).
- On a miss the resolver walks the hierarchy: a **root** server refers it to the **TLD** servers (\`.com\`), which refer it to the domain's **authoritative** nameservers, which return the record.
- The resolver caches the answer for its **TTL** and returns it. The root and TLD referrals are cached too, so even "cold" lookups usually skip most of the walk.
**Record types you should know**
- \`A\` name → IPv4 address. \`AAAA\` name → IPv6 address.
- \`CNAME\` name → another name (an alias; how \`www\` points at a CDN).
- \`NS\` which nameservers are authoritative for a zone. \`MX\` where mail goes. \`TXT\` free text, used for domain verification.
**Transport**: queries are small and independent, so DNS uses UDP on port 53 by default and falls back to TCP for large answers.
**The TTL dial**: a long TTL means fewer lookups but slow changes — a dead IP stays cached until expiry. A short TTL means fast failover and more query load.`,
    sim: [
      {
        name: "Cold lookup — nothing cached",
        intro: "The full walk down the hierarchy. In practice this happens rarely, because of the last two steps.",
        actors: [
          browser,
          { id: "r", label: "Resolver", kind: "service" },
          { id: "root", label: "Root", kind: "external" },
          { id: "tld", label: ".com TLD", kind: "external" },
          { id: "auth", label: "Authoritative", kind: "external" },
        ],
        steps: [
          s("c", "r", "example.com?", "Browser and OS caches missed, so the question goes to the recursive resolver, which does the legwork on the client's behalf."),
          s("r", "root", "example.com?", "The resolver asks a root server. There are 13 root server identities, each served from hundreds of locations."),
          s("root", "r", "ask .com servers", "The root doesn't know the answer — it knows who is responsible for .com. This is a referral, not an answer."),
          s("r", "tld", "example.com?", "The same question, one level down."),
          s("tld", "r", "ask ns1.example.com", "Another referral: the TLD knows which nameservers the owner of example.com registered."),
          s("r", "auth", "example.com?", "Finally the resolver asks the servers that actually hold the records."),
          s("auth", "r", "A 203.0.113.7 · TTL 300", "The authoritative answer, with a TTL: \"you may reuse this for 300 seconds\"."),
          s("r", "r", "cache for 300 s", "The resolver stores the answer. Everyone who uses this resolver benefits for the next five minutes."),
          s("r", "c", "203.0.113.7", "The browser gets its address, caches it too, and can finally open a TCP connection."),
        ],
      },
      {
        name: "Warm lookup — cached",
        intro: "The common case: same question a few seconds later, from any user of the same resolver.",
        actors: [browser, { id: "r", label: "Resolver", kind: "service" }, { id: "auth", label: "Authoritative", kind: "external" }],
        steps: [
          s("c", "r", "example.com?", "Another user of the same resolver asks the same question."),
          s("r", "r", "cache hit (TTL 240 s left)", "No root, no TLD, no authoritative server is contacted."),
          s("r", "c", "203.0.113.7", "Answer in about a millisecond. The flip side: if the owner changed the IP 10 seconds ago, this user keeps getting the old one for another 240 seconds."),
        ],
      },
    ],
    code: [
      {
        title: "A TTL cache — the mechanism inside every resolver (Python)",
        lang: "python",
        source: String.raw`import socket, time

class DnsCache:
    """Remember each answer until its TTL expires."""

    def __init__(self):
        self._store = {}                         # name -> (ip, expires_at)

    def resolve(self, name, ttl=300):
        ip, expires_at = self._store.get(name, (None, 0))
        if time.monotonic() < expires_at:
            return ip, "cache hit"
        ip = socket.gethostbyname(name)          # slow path: ask the real resolver
        self._store[name] = (ip, time.monotonic() + ttl)
        return ip, "cache miss"

cache = DnsCache()
print(cache.resolve("example.com"))    # (..., 'cache miss')   tens of milliseconds
print(cache.resolve("example.com"))    # (..., 'cache hit')    microseconds`,
        explain: `A real resolver takes the TTL from the record itself rather than a parameter, but the logic is the same dozen lines. Keep this pattern in mind: **store with an expiry, serve if fresh, refetch if stale** is the same idea behind browser caches, CDNs and Redis (Week 2). To watch a real hierarchy walk, run \`dig +trace example.com\` in a terminal.`,
      },
    ],
    production: `- **Traffic steering**: managed DNS services answer the same name with different IPs by client location or latency, sending users to the nearest region, and stop returning a region whose health checks fail.
- **CDNs** are attached with a CNAME: \`www.yoursite.com\` → the CDN's name, and the CDN's DNS picks an edge server near each user.
- **DNS failures are total failures.** On 4 October 2021 a maintenance command disconnected Facebook's backbone; its DNS servers then withdrew their own routes from the internet. Every Facebook, Instagram and WhatsApp name stopped resolving for about six hours — the servers were running, but nobody could find them.
- **Internal service discovery** often reuses DNS: services find each other by name (\`payments.internal\`) rather than by hard-coded IP.`,
    tradeoffs: `- **Long TTL** (hours): fewer queries, faster page loads, resilience if your DNS provider blips — but changes and failovers are slow.
- **Short TTL** (30–60 s): quick failover and traffic shifts — but more query load and more dependence on DNS being up.
- **DNS as a load balancer** is coarse: clients cache answers, some ignore TTLs, and DNS has no idea how busy a server is. Use it to choose a *region*; use a real load balancer to choose a *server*.
- **Single DNS provider** is a single point of failure for your entire product; large sites use more than one.`,
    interview: `- In "what happens when you type a URL", DNS is step one. Mention the cache layers and the recursive resolver → root → TLD → authoritative chain in two sentences, then move on.
- For any global system, say how users reach the right region: "GeoDNS or latency-based routing sends the user to the nearest region; within the region a load balancer picks a server."
- Know the TTL trade-off cold; it is the standard follow-up.
- Be honest about the limit: DNS failover takes at least a TTL, and some clients cache longer.`,
    practice: [
      { level: "Warm-up", q: "You change your site's A record. Some users see the new server immediately, others an hour later. Why?", a: "Caches. Each resolver and client keeps the old answer until its copy's TTL expires, and they each cached it at a different moment. Lower the TTL well before a planned migration." },
      { level: "Core", q: "What record setup puts www.shop.com behind a CDN, and why is a CNAME used instead of an A record?", a: "www.shop.com CNAME shop.cdn-provider.net. The CDN controls the answer for its own name and can return a different edge IP per user and change IPs freely; an A record would pin you to fixed addresses." },
      { level: "Core", q: "Design the DNS records and TTLs for an API served from Mumbai and Frankfurt, where either region must be able to take all traffic.", a: "Latency- or geo-based records for api.example.com pointing at each region's load balancer, with health checks, TTL around 60 s. When a region fails its record stops being returned and clients shift within about a TTL. Each region must be sized to carry the full load." },
      { level: "Stretch", q: "Why is 'DNS-based failover' alone not enough for a 99.99% availability target?", a: "99.99% allows about 52 minutes of downtime a year. Detection time plus TTL plus clients that cache longer than the TTL can easily add up to minutes per incident, and DNS can't see per-server health. You need load balancers with fast health checks inside each region, with DNS only for region-level shifts." },
    ],
    sources: [
      { title: "Cloudflare Learning — What is DNS?", url: "https://www.cloudflare.com/learning/dns/what-is-dns/" },
      { title: "Meta Engineering — More details about the October 4 outage", url: "https://engineering.fb.com/2021/10/05/networking-traffic/outage-details/" },
    ],
  },

  {
    id: "w1-http",
    title: "HTTP and HTTPS",
    minutes: 90,
    prereqs: ["w1-networking", "w1-dns"],
    intuition: `TCP gives two programs a reliable pipe; it says nothing about what to *say*. **HTTP** is the agreed format:
- A **request**: a method (what to do), a path (to what), headers (metadata), an optional body.
- A **response**: a status code (what happened), headers, an optional body.
- It is **stateless**: each request stands alone. The server doesn't remember the previous one unless the client sends something (a cookie, a token) to remind it.
**HTTPS** is the same conversation inside an encrypted, authenticated tunnel (TLS), so nobody between the two ends can read it, change it, or impersonate the server.`,
    analogy: `HTTP is a standard order form. Every form has the same boxes — action, item, notes — so any clerk anywhere can process any customer's form, and every reply comes back with a standard stamp: done, moved, your mistake, our mistake. Plain HTTP sends that form as a postcard. **HTTPS** puts it in a locked box that only the real shop can open — and before you send anything, the shop shows an identity card issued by an authority you already trust (its **certificate**).`,
    problem: `- **A universal language**: any client can talk to any server without a private agreement — the reason the web and public APIs exist at all.
- **Intermediaries**: because the format is standard, caches, proxies, load balancers and CDNs can understand and speed up traffic they didn't create.
- **Security**, which plain HTTP lacks entirely: anyone on the path (café Wi-Fi, an ISP) can **read** it, **modify** it or **pretend to be the server**. TLS solves those three problems: confidentiality, integrity, authentication.`,
    internals: `**Methods and their guarantees** — these matter for retries
- \`GET\` reads. **Safe** (changes nothing) and **idempotent** (repeating it has the same effect as doing it once).
- \`PUT\` replaces, \`DELETE\` removes: not safe, but **idempotent**.
- \`POST\` creates or triggers: **not idempotent** — sending it twice may create two orders. \`PATCH\` partially updates and is not guaranteed idempotent.
**Status codes worth memorising**
- **2xx success**: 200 OK, 201 Created, 204 No Content.
- **3xx redirect / cache**: 301 Moved Permanently, 304 Not Modified.
- **4xx the client's fault**: 400 bad request, 401 not authenticated, 403 authenticated but not allowed, 404 not found, 409 conflict, 429 too many requests.
- **5xx the server's fault**: 500 internal error, 502 bad gateway, 503 unavailable, 504 gateway timeout.
**Versions**
- **HTTP/1.1**: text format, keep-alive connections, but one request at a time per connection — browsers open about six connections per site to compensate.
- **HTTP/2**: binary, many concurrent **streams** multiplexed on one TCP connection, compressed headers.
- **HTTP/3**: the same semantics over QUIC (UDP), removing TCP's head-of-line blocking and merging the transport and TLS handshakes.
**TLS 1.3 in one paragraph**: the client sends *ClientHello* with a key share; the server replies with its key share and its **certificate**; the client verifies the certificate chain up to a trusted authority, both sides derive the same session keys, and everything after is encrypted with fast symmetric cryptography. Slow public-key cryptography is used only to authenticate and agree on keys. Cost: one extra round trip on a new connection.`,
    sim: [
      {
        name: "An HTTPS request (TLS 1.3)",
        intro: "What a new secure connection costs before your request is even sent.",
        actors: [client, server],
        steps: [
          s("c", "s", "TCP handshake (SYN → SYN-ACK → ACK)", "One round trip to establish the reliable connection (yesterday's lesson, collapsed into one arrow)."),
          s("c", "s", "ClientHello + key share", "The client proposes cipher suites and sends half of a key exchange."),
          s("s", "c", "ServerHello + key share + certificate", "The server sends its half and proves its identity with a certificate signed by a certificate authority."),
          s("c", "c", "verify certificate, derive keys", "The client checks the name, expiry and signature chain. Both sides now compute the same secret keys without ever having sent them."),
          s("c", "s", "Finished + GET /account  🔒", "The handshake completes and the first encrypted request goes out — two round trips after the user clicked."),
          s("s", "c", "200 OK  🔒", "The response is encrypted too. Observers see only that these two IPs exchanged some bytes. Later requests reuse this connection at zero setup cost."),
        ],
      },
      {
        name: "Conditional GET — caching with ETag",
        intro: "How HTTP avoids re-sending data that hasn't changed. This is the basis of browser and CDN caching.",
        actors: [browser, server],
        steps: [
          s("c", "s", "GET /logo.png", "First visit: nothing cached."),
          s("s", "c", "200 OK · ETag: \"v7\" · max-age=60", "The full image, plus a version tag and permission to reuse it for 60 seconds without asking."),
          s("c", "c", "within 60 s: use the copy", "No network at all. The fastest request is the one never sent."),
          s("c", "s", "GET /logo.png · If-None-Match: \"v7\"", "After 60 s the copy is stale. The browser asks: \"has it changed from v7?\""),
          s("s", "c", "304 Not Modified (no body)", "A few hundred bytes instead of the whole image. The cached copy is declared fresh for another 60 s."),
        ],
      },
      {
        name: "Failure: plain HTTP on shared Wi-Fi",
        intro: "Why HTTPS is not optional. The attacker only needs to be on the path.",
        actors: [client, { id: "a", label: "Attacker on Wi-Fi", kind: "external" }, server],
        steps: [
          s("c", "a", "POST /login  pw=hunter2", "Unencrypted traffic passes through whoever controls the network: here, a fake access point."),
          s("a", "a", "reads the password", "Confidentiality is gone. The attacker could also change the request (integrity) or answer it himself (authentication)."),
          s("a", "s", "POST /login  pw=hunter2", "The request is forwarded so nothing looks wrong to the user. With TLS the attacker would see only ciphertext, and could not present a valid certificate for the site."),
        ],
      },
    ],
    code: [
      {
        title: "What actually travels on the wire",
        lang: "http",
        source: String.raw`> GET /products/42 HTTP/1.1            <- method, path, version
> Host: shop.example                   <- which site on this IP
> Accept: application/json             <- formats the client understands
> Authorization: Bearer eyJhbGciOi...  <- who is asking (HTTP itself is stateless)
>
< HTTP/1.1 200 OK                      <- status line
< Content-Type: application/json
< Cache-Control: max-age=60            <- may be reused for 60 seconds
< ETag: "v7"                           <- version tag of this representation
<
< {"id": 42, "name": "Keyboard", "price": 2499}`,
        explain: `See this for any real site with \`curl -v https://example.com\`. Lines starting with \`>\` are sent, \`<\` are received. Read one real exchange a day this week until nothing in it is mysterious.`,
      },
      {
        title: "A conditional request in Python",
        lang: "python",
        source: String.raw`import urllib.request, urllib.error

url = "https://example.com/"
first = urllib.request.urlopen(url)
etag = first.headers.get("ETag")
print(first.status, etag)                         # 200 and the server's version tag

if etag:                                          # not every server sends one
    again = urllib.request.Request(url, headers={"If-None-Match": etag})
    try:
        urllib.request.urlopen(again)
    except urllib.error.HTTPError as e:
        print(e.code)                             # 304: unchanged, body not re-sent`,
        explain: `\`urllib\` reports 304 as an exception because there is no body to return. Browsers and CDNs do exactly this dance automatically for every cached asset.`,
      },
    ],
    production: `- **HTTPS everywhere**: free automated certificates made encryption the default; browsers now mark plain HTTP as "not secure".
- **TLS termination**: large systems usually decrypt at the load balancer or edge proxy, which holds the certificates, and forward to backend services over the internal network (often re-encrypted).
- **HTTP/2** is the norm between browsers and servers and is what gRPC is built on (Day 6). **HTTP/3** is widely deployed by the large CDNs and by Google and Meta for mobile users on lossy networks.
- **Cache headers are a scaling tool**: static assets get long \`max-age\` values and versioned file names, so most requests never reach the origin servers at all.`,
    tradeoffs: `- **Terminate TLS at the edge** (simple certificates, cheap backends, the proxy can inspect and route) **vs end-to-end encryption** (required in zero-trust or regulated environments; costs CPU and operational effort).
- **HTTP/1.1** is simple and universal; **HTTP/2** wins with many small concurrent requests; **HTTP/3** wins on lossy mobile networks but is harder to debug and sometimes blocked by networks that drop UDP.
- **Statelessness** makes servers interchangeable but means every request must carry its own identity (a cookie or token) and be re-authenticated.
- **Aggressive caching** saves enormous load but serves stale data unless you plan invalidation (versioned URLs, short TTLs for things that change).`,
    interview: `- Know **which methods are idempotent** — it decides what is safe to retry, and retries come up in every design.
- Use precise status codes in API discussions: 401 vs 403, 404 vs 409, 429 for rate limits, 503 vs 504.
- Have a 60-second answer to "what happens when you type a URL": DNS → TCP → TLS → HTTP request → load balancer → app → database → response → render.
- When you draw a load balancer, say where TLS terminates. When you draw static content, say \`Cache-Control\` and CDN.`,
    practice: [
      { level: "Warm-up", q: "Pick the status code: (a) wrong password, (b) logged in but not an admin, (c) JSON body is malformed, (d) the database behind the API timed out, (e) too many requests from this client.", a: "(a) 401. (b) 403. (c) 400. (d) 504 if a gateway timed out waiting for an upstream, otherwise 503/500 from the service. (e) 429, ideally with a Retry-After header." },
      { level: "Core", q: "A mobile client's POST /payments times out. Is it safe to retry? What about PUT /users/42/email?", a: "POST is not idempotent: the first attempt may have succeeded, so a blind retry can charge twice — it needs an idempotency key (tomorrow). PUT sets the email to a specific value, so repeating it yields the same state: safe to retry." },
      { level: "Core", q: "Run curl -v against any HTTPS site. Identify the TLS version, the certificate's subject, the HTTP version and every cache-related response header.", a: "Look for the 'SSL connection using TLSv1.3' line, 'subject:' and 'issuer:' in the certificate block, the 'HTTP/2' or 'HTTP/1.1' status line, and headers such as cache-control, etag, age, expires and vary." },
      { level: "Stretch", q: "Your site's CSS is cached for a year (max-age=31536000). How do you ship a CSS change so every user gets it immediately?", a: "Change the URL, not the cache: put a content hash or version in the file name (app.3f9a2c.css) and reference the new name from the HTML, which itself has a short max-age. Old files simply stop being requested." },
    ],
    sources: [
      { title: "MDN — An overview of HTTP", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview" },
      { title: "RFC 9110 — HTTP Semantics", url: "https://www.rfc-editor.org/info/rfc9110" },
      { title: "RFC 8446 — TLS 1.3", url: "https://www.rfc-editor.org/info/rfc8446" },
    ],
  },

  {
    id: "w1-rest",
    title: "API design with REST",
    minutes: 90,
    prereqs: ["w1-http"],
    intuition: `An **API** is the menu of things other programs may ask your system to do. **REST** is the most common style for writing that menu on top of HTTP:
- Everything is a **resource** — a noun with its own URL: \`/users/42\`, \`/users/42/orders\`.
- You act on resources with the standard HTTP methods: \`GET\` to read, \`POST\` to create, \`PUT\`/\`PATCH\` to change, \`DELETE\` to remove.
- The server answers with standard status codes and a representation of the resource, usually JSON.
- Each request carries everything needed to process it (**stateless**).
The point is predictability: someone who has used one well-designed REST API can guess how yours works.`,
    analogy: `A library. Every book has a shelf mark that identifies exactly one book (the URL). There are only a few things you can do with any book — look at it, add one, replace one, remove one — and they work the same for every shelf (the methods). You never learn a special procedure for each book; you learn the system once.`,
    problem: `- **A contract between teams**: front-end, mobile and partner developers build against the API while the backend changes freely behind it.
- **Without conventions** every endpoint is a one-off (\`/getUserData\`, \`/doCreateOrder2\`), impossible to guess and painful to evolve.
- **Reuse of HTTP's machinery**: caching, authentication, status codes, retries and tooling come for free when you use the protocol as intended instead of tunnelling everything through \`POST /api\`.`,
    internals: `**The design rules that matter**
- **Nouns, plural, hierarchical**: \`GET /v1/users/42/orders\`. No verbs in paths; the method is the verb.
- **Right method, right status**: \`POST /orders\` → 201 Created with a \`Location\` header; \`DELETE\` → 204; validation failure → 400 with a machine-readable error body.
- **Pagination** for every list. *Offset* (\`?page=3\`) is simple but slow on deep pages and unstable when items are inserted. *Cursor* (\`?cursor=abc&limit=20\`) means "the items after this one": stable and fast — the choice for feeds.
- **Filtering and sorting** through query parameters: \`?status=shipped&sort=-created_at\`.
- **Versioning**: \`/v1/…\` in the path so you can make breaking changes without breaking existing clients.
- **Idempotency keys**: \`POST\` is not idempotent, but networks force clients to retry. The client sends a unique \`Idempotency-Key\` header; the server stores the key with the result and, on a retry, replays the saved response instead of acting twice.
- **Consistent errors**: one shape everywhere, e.g. \`{"error": {"code": "insufficient_funds", "message": "…"}}\`.
- **Auth and limits**: a token in the \`Authorization\` header on every request; 429 with \`Retry-After\` when a client exceeds its quota.`,
    sim: [
      {
        name: "Safe retries with an idempotency key",
        intro: "The most important failure scenario in API design: the request worked, but the client never found out.",
        actors: [client, { id: "s", label: "API server", kind: "service" }, db],
        steps: [
          s("c", "s", "POST /v1/orders  (key = k1)", "The client generates a unique key for this one logical action and sends it in the Idempotency-Key header."),
          s("s", "d", "INSERT order #981 + key k1", "The order and the key are stored together, in one transaction."),
          s("d", "s", "committed", "The order now exists."),
          s("s", "c", "201 Created (order #981)", "The response is lost — the user's train entered a tunnel. The client has no idea whether the order exists.", true),
          s("c", "c", "timeout → retry, same key", "Without the key this retry would create a second order and charge the customer twice."),
          s("c", "s", "POST /v1/orders  (key = k1)", "The identical request, with the identical key."),
          s("s", "d", "look up key k1 → found #981", "The server recognises the key and does not execute the action again."),
          s("s", "c", "201 Created (order #981)", "The saved response is replayed. One order, one charge, and the client finally knows. The retry was safe."),
        ],
      },
      {
        name: "Cursor pagination",
        intro: "Paging through a feed that keeps changing, newest first.",
        actors: [client, { id: "s", label: "API server", kind: "service" }, db],
        steps: [
          s("c", "s", "GET /v1/posts?limit=2", "First page: no cursor."),
          s("s", "d", "ORDER BY id DESC LIMIT 2", "Newest two posts."),
          s("s", "c", "[p9, p8] · next_cursor = p8", "The response includes a cursor: a pointer to the last item returned."),
          s("s", "s", "meanwhile: p10 is published", "A new post lands on top. With offset paging, \"page 2\" would now start one item early and show p8 again."),
          s("c", "s", "GET /v1/posts?limit=2&cursor=p8", "\"Give me two items after p8.\""),
          s("s", "d", "WHERE id < p8 … LIMIT 2", "An index seek straight to the position — just as fast on page 5,000 as on page 1."),
          s("s", "c", "[p7, p6] · next_cursor = p6", "No duplicates, no gaps, regardless of what was inserted meanwhile."),
        ],
      },
    ],
    code: [
      {
        title: "Create with an idempotency key, list with a cursor (Python + Flask)",
        lang: "python",
        source: String.raw`from flask import Flask, request, jsonify    # pip install flask

app = Flask(__name__)
orders = {}        # order_id -> order
seen_keys = {}     # idempotency key -> order_id

@app.post("/v1/orders")
def create_order():
    key = request.headers.get("Idempotency-Key")
    if key in seen_keys:                           # a retry: replay the original result
        return jsonify(orders[seen_keys[key]]), 201

    body = request.get_json(silent=True)
    if not body or "item_id" not in body:
        return jsonify(error={"code": "invalid_request",
                              "message": "item_id is required"}), 400

    order_id = len(orders) + 1
    orders[order_id] = {"id": order_id, "item_id": body["item_id"], "status": "created"}
    if key:
        seen_keys[key] = order_id
    return jsonify(orders[order_id]), 201, {"Location": f"/v1/orders/{order_id}"}

@app.get("/v1/orders")
def list_orders():                                 # cursor = "items after this id"
    limit = min(int(request.args.get("limit", 20)), 100)
    cursor = int(request.args.get("cursor", 0))
    page = [o for o in orders.values() if o["id"] > cursor][:limit]
    next_cursor = page[-1]["id"] if len(page) == limit else None
    return jsonify(items=page, next_cursor=next_cursor)`,
        explain: `Try it: \`curl -X POST localhost:5000/v1/orders -H "Idempotency-Key: k1" -H "Content-Type: application/json" -d '{"item_id": 7}'\` — run it twice and you get the same order back. In production the two dictionaries are database tables, and the key lookup plus insert must be **atomic** (a unique index on the key, inside the same transaction as the order). Otherwise two simultaneous retries can both pass the check — a race condition you will meet again in Week 4.`,
      },
    ],
    production: `- **Stripe** popularised idempotency keys for payments: it saves the status code and body of the first request made with a key and returns that same result for any retry — so a client can retry a charge after a network failure without double-charging.
- **Cursor pagination** is standard for large or fast-moving collections; public APIs such as Stripe's, Slack's and GitHub's return a cursor or next-page link rather than expecting page numbers.
- **Versioned public APIs** stay alive for years: a breaking change ships as a new version while old clients keep working.
- **Richardson Maturity Model** (Martin Fowler) is the usual yardstick for "how RESTful" an API is: resources → HTTP verbs → hypermedia. Most production APIs stop at level 2, and that is fine.`,
    tradeoffs: `- **REST vs GraphQL**: REST is simple, cacheable and familiar, but a screen may need several calls or receive more than it needs. GraphQL lets the client ask for exactly the fields it wants in one request, at the cost of harder caching, rate limiting and server complexity.
- **REST vs gRPC**: REST with JSON is readable and works in every browser; gRPC is faster and strictly typed, better for internal service-to-service calls (tomorrow).
- **Offset vs cursor**: offset allows "jump to page 50" and is fine for small, stable admin lists; cursor is the choice for feeds and large tables.
- **Idempotency keys** cost storage and an extra lookup per write — worth it for anything that moves money or sends messages, unnecessary for naturally idempotent \`PUT\`/\`DELETE\`.`,
    interview: `- Every HLD round has an **"API design" step**. Write 3–5 endpoints: method, path, key request fields, response, main error codes. Thirty seconds each.
- Volunteer the three things that separate a strong answer: **pagination** on lists, **idempotency** on creates that matter, **auth** on everything.
- Derive endpoints from the functional requirements, one per user action — it shows the API follows the requirements instead of being recited.
- Expect the follow-up "the client retried and we created two orders — fix it". The answer is the simulation above.`,
    practice: [
      { level: "Warm-up", q: "Rewrite these as REST: POST /getUser?id=5, POST /deleteOrder, GET /createComment?text=hi.", a: "GET /v1/users/5 · DELETE /v1/orders/{id} · POST /v1/posts/{id}/comments with a JSON body. GET must never change state — crawlers, prefetchers and caches will happily repeat it." },
      { level: "Core", q: "Design the API for a URL shortener: create a short link, follow it, see its click count. Give method, path, request, response and status codes.", a: "POST /v1/links {url} → 201 {code, short_url} (accept an Idempotency-Key). GET /{code} → 301/302 with a Location header (302 if you need to count every click, because 301 is cached by browsers). GET /v1/links/{code}/stats → 200 {clicks}. Errors: 400 invalid URL, 404 unknown code, 429 rate limited." },
      { level: "Core", q: "Why does page 10,000 of ?page=N&size=20 get slow, and how does a cursor avoid it?", a: "OFFSET 200000 makes the database produce and discard 200,000 rows before returning 20. A cursor turns the query into WHERE id < :cursor ORDER BY id DESC LIMIT 20, which an index answers by seeking directly to the position." },
      { level: "Stretch", q: "Two retries with the same idempotency key arrive at two different servers at the same instant. How do you guarantee the order is created once?", a: "Make the database the arbiter: a unique constraint on the key, inserted in the same transaction as the order. One insert wins; the loser gets a constraint violation and then reads and returns the winner's stored result (or responds 409 'in progress' for the client to retry shortly). An in-memory check alone cannot work across servers." },
    ],
    sources: [
      { title: "Stripe API — Idempotent requests", url: "https://docs.stripe.com/api/idempotent_requests" },
      { title: "Stripe Engineering — Designing robust and predictable APIs with idempotency", url: "https://stripe.com/blog/idempotency" },
      { title: "Martin Fowler — Richardson Maturity Model", url: "https://martinfowler.com/articles/richardsonMaturityModel.html" },
    ],
  },

  {
    id: "w1-realtime",
    title: "Beyond request/response: gRPC and WebSockets",
    minutes: 90,
    prereqs: ["w1-http", "w1-rest"],
    intuition: `REST over HTTP has two blind spots, and each has a standard answer.
- **Services talking to services.** Inside a backend, thousands of calls a second pass between your own services. Readable JSON and loose contracts become overhead. **gRPC** makes a remote call look like a local function call: you define the functions and message types once, tools generate the code for both sides, and the data travels as compact binary over HTTP/2.
- **The server needs to speak first.** In HTTP the client always asks. But a chat message, a price change or a driver's new location originates on the server side. **WebSockets** upgrade one HTTP connection into a permanent two-way pipe that either side can write to at any time.
Between "ask repeatedly" and "full two-way pipe" there are cheaper steps — long polling and server-sent events — and choosing the right one is a standard interview decision.`,
    analogy: `Waiting for a parcel. **Polling** is phoning the depot every five minutes: "Is it there yet?" **Long polling** is phoning once and staying on hold until they have news. **Server-sent events** is a radio channel you tune into: the depot broadcasts updates, but you can't talk back on it. A **WebSocket** is an open phone line where either of you can speak whenever you like. **gRPC** is different in kind: it's the internal extension system between departments — short numbers, an agreed script, no small talk.`,
    problem: `- **Polling wastes work**: most answers are "nothing new", yet each costs a full request. Poll rarely and updates feel slow; poll often and you flood your own servers.
- **Real-time products need push**: chat, live location, collaborative editing, trading and multiplayer games cannot be built on "ask again later".
- **Internal calls need speed and safety**: with hundreds of services, a renamed JSON field becomes a production incident. A typed, generated contract catches it at build time, and binary encoding cuts CPU and bandwidth.`,
    internals: `**gRPC**
- You write a \`.proto\` file listing **services** (functions) and **messages** (typed fields, each with a number). A compiler generates client stubs and server skeletons in any major language.
- **Protocol Buffers** encode a message as field number + value in binary — no field names on the wire, so it is far smaller and faster to parse than JSON.
- It runs on **HTTP/2**, so many calls share one connection, and it supports four call shapes: unary (request → response), server streaming, client streaming and bidirectional streaming.
- Calls carry **deadlines**, which propagate down the call chain so work is abandoned once the caller has given up.
- Browsers cannot speak it natively — it needs a proxy (gRPC-Web). That is why public APIs stay REST.
**WebSockets**
- Starts as a normal HTTP request with \`Upgrade: websocket\`. The server replies \`101 Switching Protocols\`, and from then on the same TCP connection carries small framed messages in both directions.
- Either side sends whenever it wants; ping/pong frames detect dead connections.
- **The connection is state.** The server must remember every open socket, so a user is pinned to one particular server. To deliver a message to a user connected elsewhere, servers need a shared **pub/sub backplane** (for example Redis) — the central design problem of every chat system (Week 9).
**The cheaper alternatives**
- **Long polling**: the server holds the request open until it has something to say. Works everywhere, one message per request.
- **Server-sent events (SSE)**: one long-lived HTTP response that streams events server → client only, with automatic reconnection.`,
    sim: [
      {
        name: "Short polling",
        intro: "The naive way to get updates. Count the wasted requests.",
        actors: [client, server],
        steps: [
          s("c", "s", "GET /messages?since=41", "\"Anything new?\""),
          s("s", "c", "200 []", "No. A full request and response to learn nothing."),
          s("c", "s", "GET /messages?since=41", "Five seconds later, again."),
          s("s", "c", "200 []", "Still nothing. Multiply by a million idle users."),
          s("c", "s", "GET /messages?since=41", "A message arrived just after the previous poll, so it has been waiting almost five seconds."),
          s("s", "c", "200 [\"hi\"]", "Delivered — late, after two wasted round trips."),
        ],
      },
      {
        name: "Long polling",
        intro: "Same HTTP, but the server waits before answering.",
        actors: [client, server],
        steps: [
          s("c", "s", "GET /messages?since=41", "\"Anything new? I'll wait.\""),
          s("s", "s", "hold the request open…", "The server parks the request instead of answering \"no\". It costs an open connection, not repeated requests."),
          s("s", "c", "200 [\"hi\"]", "The moment a message exists, the parked request is answered. Latency is near zero."),
          s("c", "s", "GET /messages?since=42", "The client immediately asks again. Simple and works through every proxy, but each message costs a request, and the server still can't be reached by the client mid-wait."),
        ],
      },
      {
        name: "WebSocket",
        intro: "One upgrade, then a two-way pipe.",
        actors: [client, server],
        steps: [
          s("c", "s", "GET /chat · Upgrade: websocket", "An ordinary HTTP request that asks to change protocol."),
          s("s", "c", "101 Switching Protocols", "From here on this TCP connection is no longer HTTP. It stays open."),
          s("s", "c", "frame: \"hi\"", "The server pushes the instant it has something. Nobody asked."),
          s("c", "s", "frame: \"hello!\"", "The client sends on the same connection — no new request, no headers, a few bytes of framing."),
          s("s", "c", "frame: \"Asha is typing…\"", "Cheap enough for events that would be absurd as individual HTTP requests."),
          s("c", "s", "ping / pong", "Periodic heartbeats let each side notice a dead connection. The cost of all this: the server must hold this socket in memory for as long as the user is online."),
        ],
      },
      {
        name: "gRPC between two services",
        intro: "A typed function call that happens to cross the network.",
        actors: [
          { id: "o", label: "Order service", kind: "service" },
          { id: "p", label: "Payment service", kind: "service" },
        ],
        steps: [
          s("o", "o", "payments.Charge(order, amount)", "The developer calls what looks like a local method on a generated stub."),
          s("o", "p", "HTTP/2 stream: protobuf bytes + deadline", "The stub serialises the arguments to compact binary and sends them on an existing HTTP/2 connection, with a deadline: \"I will wait 200 ms\"."),
          s("p", "p", "decode → run Charge()", "Generated server code decodes the message and calls the real implementation. Both sides were generated from the same .proto, so the types cannot drift apart silently."),
          s("p", "o", "ChargeReply { ok, charge_id }", "The reply returns on the same stream. Other calls were using the same connection in parallel the whole time."),
        ],
      },
    ],
    code: [
      {
        title: "A gRPC contract (.proto)",
        lang: "protobuf",
        source: String.raw`syntax = "proto3";

service Payments {
  rpc Charge (ChargeRequest) returns (ChargeReply);                // unary
  rpc WatchStatus (StatusRequest) returns (stream StatusUpdate);   // server streaming
}

message ChargeRequest {
  string order_id     = 1;   // these numbers go on the wire; the names do not
  int64  amount_paise = 2;
}
message ChargeReply   { bool ok = 1; string charge_id = 2; }
message StatusRequest { string charge_id = 1; }
message StatusUpdate  { string state = 1; }`,
        explain: `This file *is* the API. The \`protoc\` compiler turns it into client and server code for Python, Java, C++, Go and others. Field numbers must never be reused or changed — they are how old and new versions of a service stay compatible.`,
      },
      {
        title: "A WebSocket chat server (Python)",
        lang: "python",
        source: String.raw`import asyncio, websockets          # pip install websockets

clients = set()

async def handler(ws):
    clients.add(ws)                               # the open connection IS state
    try:
        async for message in ws:                  # each time this client sends something
            websockets.broadcast(clients, message)   # push to everyone; nobody asked
    finally:
        clients.remove(ws)

async def main():
    async with websockets.serve(handler, "localhost", 8765):
        await asyncio.Future()                    # run forever

asyncio.run(main())`,
        explain: `Fifteen lines for a working chat room — on **one** server. The \`clients\` set lives in this process's memory, so a second server would know nothing about these users. Making the broadcast reach users on other servers is exactly what a pub/sub backplane is for.`,
      },
    ],
    production: `- **Discord** delivers real-time events to clients over WebSocket connections, and has written about scaling that system to millions of concurrent users with Elixir.
- **Uber's** push platform (RAMEN) started on server-sent events and later moved to gRPC bidirectional streaming over QUIC/HTTP3, citing first-class two-way streaming and faster, more reliable acknowledgements.
- **gRPC** grew out of Google's internal RPC system and is a common default for service-to-service calls in microservice backends.
- **Typical split**: REST/JSON at the public edge, gRPC between internal services, WebSockets or SSE for anything live.`,
    tradeoffs: `- **REST**: public APIs, CRUD, anything cache-friendly. Avoid for high-frequency internal calls or server push.
- **gRPC**: internal service-to-service, strict contracts, streaming. Avoid for browser-facing or third-party APIs; binary payloads are harder to debug by eye.
- **WebSocket**: true two-way, low-latency, high-frequency (chat, games, collaboration). Costs: stateful servers, sticky connections, harder load balancing and deployments, a connection per online user.
- **SSE**: server → client streams (notifications, live scores, dashboards). Simpler than WebSockets, automatic reconnect, plain HTTP; one direction only.
- **Long polling**: the fallback when nothing else gets through; fine for low message rates.
- **Rule of thumb**: pick the least powerful tool that meets the latency requirement. Most "real-time" features only need SSE.`,
    interview: `- Know the default mapping and say it with the reason: public API → REST; service-to-service → gRPC; chat/collaboration → WebSocket; one-way live updates → SSE.
- When you choose WebSockets, **immediately address the consequences**: connections are stateful, so how do you route a message to a user on another server (pub/sub), how do you load-balance long-lived connections, and what happens on reconnect?
- Do a quick estimate: "10 million online users is 10 million open connections; at ~100k connections per server that is on the order of 100 gateway servers."
- Don't reach for WebSockets for a notification bell that changes twice an hour — interviewers reward proportionate choices.`,
    practice: [
      { level: "Warm-up", q: "Choose a mechanism for each: (a) stock price ticker on a web page, (b) Google Docs-style co-editing, (c) recommendation service calling a ranking service, (d) a mobile app checking whether an export job finished.", a: "(a) SSE — one-way and frequent. (b) WebSocket — two-way and low-latency. (c) gRPC — internal, typed, high volume. (d) Polling every few seconds (or a push notification) — rare and not latency-critical." },
      { level: "Core", q: "Run the WebSocket server and connect two browser consoles with new WebSocket('ws://localhost:8765'). Send a message from one. Then explain what breaks if you start a second server on another port and connect one client to each.", a: "The message appears in both consoles on one server. With two servers, each process has its own clients set, so a message sent via server A never reaches the user on server B. Both servers must subscribe to a shared channel (e.g. Redis pub/sub) and publish every message to it." },
      { level: "Core", q: "Why can a load balancer spread REST requests evenly across servers but struggle to do the same for WebSocket connections?", a: "REST requests are short and independent, so each is balanced separately. A WebSocket is balanced once, at connect time, and then lives for hours: servers that were up longest accumulate connections, and a restarted server comes back empty. After a deploy, every client reconnects at once (a thundering herd) unless reconnects are staggered with jitter." },
      { level: "Stretch", q: "In a .proto file a teammate wants to change `int64 amount_paise = 2` to `string amount = 2`. What happens to services that haven't been redeployed, and what is the safe procedure?", a: "Old services will misread field 2, because the wire type changed under the same field number. The safe procedure: add a NEW field with a NEW number, have writers populate both, migrate readers, then stop writing the old field and mark its number reserved. Never reuse or retype a field number." },
    ],
    sources: [
      { title: "gRPC — Core concepts, architecture and lifecycle", url: "https://grpc.io/docs/what-is-grpc/core-concepts/" },
      { title: "RFC 6455 — The WebSocket Protocol", url: "https://www.rfc-editor.org/info/rfc6455" },
      { title: "Discord — How Discord Scaled Elixir to 5,000,000 Concurrent Users", url: "https://discord.com/blog/how-discord-scaled-elixir-to-5-000-000-concurrent-users" },
      { title: "Uber Engineering — Next Gen Push Platform on gRPC", url: "https://www.uber.com/blog/ubers-next-gen-push-platform-on-grpc/" },
    ],
  },

  {
    id: "w1-checkpoint",
    title: "Week 1 checkpoint: revise, build, get interviewed",
    minutes: 150,
    prereqs: ["w1-realtime"],
    checkpoint: true,
    cheatSheet: `**The request path**: DNS → TCP handshake → TLS handshake → HTTP request → server work → response. Each new connection costs 2–3 round trips, so connections are reused.
**Transport**
- TCP = reliable, ordered, connection-based. Costs a handshake, has head-of-line blocking, holds state per connection.
- UDP = no guarantees, no setup. Used for media, games, DNS and as the base of QUIC/HTTP/3.
**DNS**
- Caches → recursive resolver → root → TLD → authoritative. Records: A, AAAA, CNAME, NS, MX, TXT.
- TTL: long = fewer lookups, slow changes. Short = fast failover, more load.
**HTTP**
- Idempotent: GET, PUT, DELETE. Not idempotent: POST (and PATCH in general).
- 401 unauthenticated · 403 forbidden · 404 not found · 409 conflict · 429 rate limited · 502/503/504 upstream trouble.
- HTTP/1.1 one request per connection at a time · HTTP/2 multiplexed streams on one TCP connection · HTTP/3 over QUIC.
- TLS gives confidentiality, integrity and authentication (certificates).
**API design**
- Nouns in paths, methods as verbs, versioned (\`/v1\`), paginated lists (cursor for feeds), idempotency keys on important POSTs, one error format.
**Choosing a communication style**
- Public API → REST. Internal service-to-service → gRPC. Two-way live → WebSocket. One-way live → SSE. Fallback → long polling.
- WebSockets make servers stateful: you need sticky connections and a pub/sub backplane.`,
    quiz: [
      { q: "A client sends a TCP segment and receives no acknowledgement. What does TCP do?", options: ["Reports an error to the application immediately", "Retransmits the segment after a timeout", "Switches the connection to UDP", "Closes the connection"], answer: 1, why: "Unacknowledged data is resent when the retransmission timer fires. The application never sees the loss — only the delay." },
      { q: "Which pair of HTTP methods is safe to retry blindly after a timeout?", options: ["POST and PATCH", "POST and PUT", "PUT and DELETE", "PATCH and DELETE"], answer: 2, why: "PUT and DELETE are idempotent: repeating them leaves the same state. POST may create a duplicate; PATCH is not guaranteed idempotent." },
      { q: "You lower a DNS record's TTL from 1 hour to 60 seconds. What is the main cost?", options: ["Lookups become less secure", "Resolvers query your authoritative servers far more often", "Clients can no longer cache the answer at all", "The record can no longer be a CNAME"], answer: 1, why: "A short TTL means caches expire sooner, so query volume rises and you depend more on your DNS provider being up. The benefit is faster failover." },
      { q: "A user is logged in but requests another user's invoice. Which status code?", options: ["400", "401", "403", "404"], answer: 2, why: "403: the server knows who you are and refuses. 401 means 'I don't know who you are'. (Some APIs deliberately return 404 to avoid revealing that the resource exists, but 403 is the semantic answer.)" },
      { q: "Why does HTTP/3 run over UDP instead of TCP?", options: ["UDP is encrypted by default", "To avoid TCP's head-of-line blocking across multiplexed streams", "UDP guarantees delivery order", "Browsers no longer support TCP"], answer: 1, why: "On TCP, one lost packet stalls every HTTP/2 stream on the connection. QUIC implements reliability per stream on top of UDP, so streams don't block each other." },
      { q: "A payment POST times out and the client retries. What prevents a double charge?", options: ["Using HTTPS", "A longer client timeout", "An idempotency key stored with the result on the server", "Sending the retry as a GET"], answer: 2, why: "The server recognises the key and replays the stored result instead of executing the action again." },
      { q: "Which is the best fit for live cricket scores shown to millions of viewers on a web page?", options: ["Short polling every 100 ms", "Server-sent events", "gRPC unary calls from the browser", "A new TCP connection per update"], answer: 1, why: "Updates flow one way, server to client. SSE is plain HTTP with automatic reconnection — simpler and cheaper than WebSockets when the client doesn't need to talk back." },
      { q: "You add a second WebSocket chat server. Users on different servers can't see each other's messages. What is missing?", options: ["A larger TCP window", "A shared pub/sub channel between the servers", "HTTP/2", "A shorter DNS TTL"], answer: 1, why: "Each server only knows its own connections. A pub/sub backplane lets every server receive every message and forward it to its local connections." },
    ],
    project: {
      title: "Mini-project: TinyNotes — one service, three ways to talk to it",
      parts: [
        ["Problem statement", "Build a small notes service you can reach by raw sockets, by a REST API and by a live WebSocket feed. The aim is to have *typed* every concept from this week at least once. Any language is fine; Python is the fastest route, C++ is a good stretch if you want to reuse your existing practice."],
        ["Functional requirements", "- Create, read, list and delete notes (a note has an id, text and created_at).\n- Listing is paginated with a cursor.\n- Creating a note is safe to retry.\n- Connected clients see new notes appear live."],
        ["Non-functional requirements", "- Correct status codes and one consistent error format.\n- A retried create with the same key never produces two notes.\n- The server survives malformed requests without crashing."],
        ["API contract", "- `POST /v1/notes` body `{text}`, header `Idempotency-Key` → 201 `{id, text, created_at}`; 400 if text is missing.\n- `GET /v1/notes?limit=&cursor=` → 200 `{items, next_cursor}`.\n- `GET /v1/notes/{id}` → 200 or 404.\n- `DELETE /v1/notes/{id}` → 204 (and 204 again if repeated — idempotent).\n- `ws://…/v1/feed` → server pushes `{event: \"note_created\", note}`."],
        ["Data model", "In memory is enough: `notes: id → note`, `idempotency_keys: key → note_id`. Write down which of the two you would put a unique index on in a real database, and why."],
        ["Milestones", "- **M1** Extend the 20-line socket server to route `GET /health` and return 404 for anything else. Parse the request line yourself.\n- **M2** Rebuild it with a framework (Flask or similar): the four REST endpoints, cursor pagination, idempotency key.\n- **M3** Add the WebSocket feed; broadcast on every successful create.\n- **M4** Observe it: `curl -v` every endpoint, read every header, and write down the status code for five different mistakes."],
        ["Testing strategy", "- Send the same POST twice with one key → one note. Without a key → two notes.\n- Create 25 notes, page through with limit=10, confirm no duplicates or gaps while creating more in between.\n- DELETE twice → 204 both times. GET a deleted note → 404.\n- Open two WebSocket clients; create a note; both receive it."],
        ["Scalability challenges to think about", "- What breaks when you run two copies of this server? (In-memory notes, in-memory keys, and the WebSocket client list.)\n- Where would each piece of state have to move? Keep your answer — Weeks 2–4 give you the vocabulary to check it."],
        ["Failure scenarios", "- The client loses the response to a create.\n- A WebSocket client disappears without closing the connection.\n- A request arrives with a body that isn't valid JSON."],
        ["Interview discussion points", "- Why is DELETE idempotent but POST not?\n- Why a cursor instead of page numbers?\n- What makes the WebSocket part the hard one to scale?"],
      ],
    },
    mock: {
      question: "\"Walk me through everything that happens from typing https://www.example.com/orders into a browser and pressing Enter, until the page is displayed.\"",
      how: "Answer out loud, with a timer, in under four minutes. Record yourself. Then score against the rubric — an SDE-2 answer should reach the third level.",
      rubric: [
        ["Baseline (SDE-1)", "Names DNS, TCP, HTTP and a server returning HTML in the right order."],
        ["Solid", "Adds the DNS cache layers and resolver chain, the TCP handshake, TLS with certificate verification, HTTP method/headers/status, and the server querying a database."],
        ["Strong (SDE-2 bar)", "Adds what a production path looks like: CDN and caching headers for static assets, a load balancer and where TLS terminates, stateless application servers, connection reuse, and the many follow-up requests a page makes. Mentions at least one failure case."],
        ["Exceptional", "Reasons about cost: counts round trips, explains what HTTP/2 or HTTP/3 change, and adapts depth to the interviewer's interest instead of reciting."],
      ],
      followUps: [
        "The page loads in 4 seconds for users in Brazil but 400 ms in India. Where would you look first?",
        "DNS resolves, but the browser shows 502 Bad Gateway. Which component produced that, and what does it tell you?",
        "The orders page shows live delivery status. How does the status reach the browser, and what would you change at 5 million concurrent users?",
        "A user double-clicks \"Place order\" on a slow connection. Walk me through how the system avoids two orders.",
      ],
    },
    mastery: [
      "I can draw the client → DNS → server → database path from memory and label every arrow with its protocol.",
      "I can explain what TCP guarantees, what it costs, and name two things that deliberately use UDP.",
      "I can describe a DNS lookup and argue for a specific TTL in a given situation.",
      "I can say which HTTP methods are idempotent and pick the right status code for ten common situations.",
      "I can design a five-endpoint REST API with pagination, errors and idempotency in under ten minutes.",
      "I can choose between REST, gRPC, WebSockets, SSE and polling for a feature and defend the choice.",
      "I scored at least 7/8 on the quiz and reached the 'Strong' level on the mock question.",
    ],
    sources: [],
  },
];
