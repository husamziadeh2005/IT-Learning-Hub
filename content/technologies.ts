import type { TechnologySeed } from "./types";

const LANGUAGE_TOPICS = [
  "Introduction and setup",
  "Syntax and core concepts",
  "Variables and data types",
  "Control flow",
  "Functions",
  "Data structures",
  "Error handling",
  "Modules and packages",
  "Testing",
  "Advanced concepts",
  "Practical exercises",
  "Projects",
];

export const technologies: TechnologySeed[] = [
  // ── Programming languages ────────────────────────────────────────────────
  {
    slug: "python",
    name: "Python",
    department: "programming-languages",
    short: "Readable, batteries-included language for automation, data, AI and the web.",
    description:
      "Python is the most widely taught first language and the default language of data science and machine learning. Its clear syntax lets beginners focus on problem solving, while its ecosystem scales to web backends, automation and research.",
    officialUrl: "https://docs.python.org/3/",
    icon: "terminal",
    featured: true,
    topics: [...LANGUAGE_TOPICS.slice(0, 5), "Object-oriented programming", "Data structures", "Error handling and exceptions", "Modules, packages and virtual environments", "Iterators, generators and decorators", "Typing and testing", "Projects"],
  },
  {
    slug: "java",
    name: "Java",
    department: "programming-languages",
    short: "Strongly typed, object-oriented language behind enterprise and Android software.",
    description:
      "Java powers large backend systems, financial services and much of Android. Learning it builds a solid understanding of static typing, object-oriented design, the JVM and concurrency.",
    officialUrl: "https://dev.java/",
    icon: "coffee",
    featured: true,
    topics: ["Introduction and the JDK", "Syntax, variables and types", "Control flow and methods", "Classes and objects", "Inheritance, interfaces and polymorphism", "Collections framework", "Exceptions", "Generics and lambdas", "Streams API", "Concurrency", "Build tools and testing", "Projects"],
  },
  {
    slug: "c",
    name: "C",
    department: "programming-languages",
    short: "The minimal, close-to-the-metal language behind operating systems and embedded devices.",
    description:
      "C teaches how programs really use memory: pointers, the stack and heap, and manual resource management. It is the language of operating system kernels, embedded firmware and many language runtimes.",
    officialUrl: "https://www.open-std.org/jtc1/sc22/wg14/",
    icon: "binary",
    topics: ["Compiling and running C", "Variables, types and operators", "Control flow", "Functions", "Arrays and strings", "Pointers and memory", "Structs and unions", "Dynamic memory allocation", "File I/O", "Error handling", "The preprocessor and build systems", "Projects"],
  },
  {
    slug: "cpp",
    name: "C++",
    department: "programming-languages",
    short: "High-performance language for games, systems, finance and real-time software.",
    description:
      "Modern C++ combines low-level control with powerful abstractions: classes, templates, RAII and the standard library. It is used wherever performance is critical, from game engines to trading systems.",
    officialUrl: "https://isocpp.org/",
    icon: "cpu",
    featured: true,
    topics: ["Toolchains and compiling", "Types, variables and control flow", "Functions and references", "Classes and object-oriented design", "RAII and resource management", "Smart pointers", "The standard library and containers", "Templates and generic programming", "Error handling and exceptions", "Move semantics", "Concurrency", "Projects"],
  },
  {
    slug: "javascript",
    name: "JavaScript",
    department: "programming-languages",
    short: "The language of the web, running in every browser and on the server with Node.js.",
    description:
      "JavaScript makes web pages interactive and, through Node.js, also runs servers and tooling. Understanding closures, the event loop, promises and modules is essential for any web developer.",
    officialUrl: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
    icon: "file-code",
    featured: true,
    topics: ["Introduction and the browser console", "Variables, types and operators", "Control flow", "Functions and scope", "Objects and arrays", "Closures and this", "Prototypes and classes", "Error handling", "The DOM and events", "Asynchronous JavaScript: promises and async/await", "Modules", "Projects"],
  },
  {
    slug: "typescript",
    name: "TypeScript",
    department: "programming-languages",
    short: "JavaScript with a static type system for safer, more maintainable code.",
    description:
      "TypeScript adds types to JavaScript, catching mistakes before code runs and making large codebases easier to navigate and refactor. It is now the default for professional frontend and Node.js work.",
    officialUrl: "https://www.typescriptlang.org/",
    icon: "file-type",
    featured: true,
    topics: ["Why TypeScript and setup", "Basic types", "Functions", "Objects, interfaces and type aliases", "Unions and narrowing", "Generics", "Classes", "Modules", "Utility and mapped types", "Declaration files", "Configuring tsconfig", "Projects"],
  },
  {
    slug: "csharp",
    name: "C#",
    department: "programming-languages",
    short: "Microsoft's modern, multi-paradigm language for .NET, games and cloud services.",
    description:
      "C# is the main language of the .NET platform, used for web APIs with ASP.NET Core, desktop apps, cloud services on Azure and game development with Unity.",
    officialUrl: "https://learn.microsoft.com/en-us/dotnet/csharp/",
    icon: "hash",
    topics: ["The .NET SDK and first program", "Types and variables", "Control flow", "Methods", "Classes, structs and records", "Inheritance and interfaces", "Collections and LINQ", "Exceptions", "Generics", "Async and await", "Testing", "Projects"],
  },
  {
    slug: "go",
    name: "Go",
    department: "programming-languages",
    short: "Simple, fast, statically typed language built for cloud services and tooling.",
    description:
      "Go was designed at Google for building reliable networked software. Its small language, fast compiler and built-in concurrency make it the language of Docker, Kubernetes and much cloud infrastructure.",
    officialUrl: "https://go.dev/",
    icon: "rabbit",
    topics: ["Installing Go and modules", "Variables, types and constants", "Control flow", "Functions and multiple returns", "Structs and methods", "Interfaces", "Slices and maps", "Error handling", "Goroutines and channels", "Packages and testing", "Generics", "Projects"],
  },

  // ── Web development: frontend ────────────────────────────────────────────
  {
    slug: "html",
    name: "HTML",
    department: "web-development",
    short: "The semantic structure of every web page.",
    description:
      "HTML describes the meaning and structure of content. Writing semantic HTML is the foundation of accessible, search-friendly and maintainable websites.",
    officialUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML",
    icon: "code-xml",
    featured: true,
    topics: ["Document structure", "Text and semantics", "Links and navigation", "Images and media", "Lists and tables", "Forms and validation", "Semantic layout elements", "Accessibility basics", "Metadata and SEO"],
  },
  {
    slug: "css",
    name: "CSS",
    department: "web-development",
    short: "Styling, layout and responsive design for the web.",
    description:
      "CSS controls how HTML looks: colour, typography, spacing and layout. Modern CSS with Flexbox, Grid, custom properties and container queries can build almost any interface without frameworks.",
    officialUrl: "https://developer.mozilla.org/en-US/docs/Web/CSS",
    icon: "paintbrush",
    featured: true,
    topics: ["Selectors and the cascade", "The box model", "Typography and colour", "Flexbox", "CSS Grid", "Responsive design and media queries", "Custom properties", "Transitions and animations", "Container queries", "Architecture and naming"],
  },
  {
    slug: "react",
    name: "React",
    department: "web-development",
    short: "The component library for building interactive user interfaces.",
    description:
      "React lets you build interfaces from small, reusable components that describe what the UI should look like for a given state. It is the most widely used frontend library.",
    officialUrl: "https://react.dev/",
    icon: "atom",
    featured: true,
    topics: ["Thinking in components", "JSX", "Props and state", "Rendering lists and conditions", "Events", "Hooks: useState and useEffect", "Managing state", "Context", "Refs", "Server Components", "Performance", "Testing components"],
  },
  {
    slug: "nextjs",
    name: "Next.js",
    department: "web-development",
    short: "The React framework for full-stack web applications.",
    description:
      "Next.js adds routing, server rendering, data fetching, caching and deployment conventions on top of React, so teams can build complete production applications.",
    officialUrl: "https://nextjs.org/",
    icon: "layers",
    featured: true,
    topics: ["The App Router", "Layouts and pages", "Server and Client Components", "Data fetching", "Caching and revalidation", "Server Actions and mutations", "Route handlers", "Authentication patterns", "Metadata and SEO", "Images and fonts", "Deployment"],
  },
  {
    slug: "responsive-design",
    name: "Responsive Design",
    department: "web-development",
    short: "Interfaces that adapt to every screen, from phones to wide monitors.",
    description:
      "Responsive design uses fluid layouts, flexible media and breakpoints chosen by content so the same site works well on phones, tablets and desktops.",
    officialUrl: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design",
    icon: "monitor-smartphone",
    topics: ["Mobile-first thinking", "Viewport and media queries", "Fluid typography and spacing", "Flexible grids", "Responsive images", "Container queries", "Touch targets", "Testing on devices"],
  },
  {
    slug: "state-management",
    name: "State Management",
    department: "web-development",
    short: "Patterns and libraries for keeping UI state predictable.",
    description:
      "As applications grow, deciding where state lives — local, lifted, context, URL, server cache or a global store — becomes one of the most important architectural decisions.",
    icon: "workflow",
    topics: ["Local vs shared state", "Lifting state up", "Context", "URL as state", "Server state and caching", "Reducers", "Global stores", "Derived state"],
  },
  {
    slug: "frontend-architecture",
    name: "Frontend Architecture",
    department: "web-development",
    short: "Structuring large frontend codebases so teams can move fast safely.",
    description:
      "Frontend architecture covers project structure, component boundaries, rendering strategies, data flow, design systems and tooling choices for applications that live for years.",
    icon: "blocks",
    topics: ["Project structure", "Component design", "Rendering strategies (CSR, SSR, SSG)", "Data fetching patterns", "Design systems", "Monorepos", "Build tooling", "Micro-frontends"],
  },
  {
    slug: "web-accessibility",
    name: "Web Accessibility",
    department: "web-development",
    short: "Building products that everyone can use, including people with disabilities.",
    description:
      "Accessibility (a11y) ensures people using screen readers, keyboards, magnification or other assistive technologies can use your product. WCAG is the international standard.",
    officialUrl: "https://www.w3.org/WAI/",
    icon: "accessibility",
    topics: ["Why accessibility matters", "WCAG principles (POUR)", "Semantic HTML", "Keyboard navigation and focus", "Colour contrast", "ARIA, used correctly", "Accessible forms", "Testing with screen readers", "Automated audits"],
  },
  {
    slug: "web-performance",
    name: "Web Performance",
    department: "web-development",
    short: "Fast loading and responsive interaction, measured with Core Web Vitals.",
    description:
      "Performance directly affects user satisfaction and conversion. Learn to measure LCP, INP and CLS, then optimise images, fonts, JavaScript and caching.",
    officialUrl: "https://web.dev/explore/learn-core-web-vitals",
    icon: "gauge",
    topics: ["Core Web Vitals", "Measuring in the lab and field", "Images and media", "Fonts", "JavaScript cost", "Caching and CDNs", "Rendering strategies", "Performance budgets"],
  },
  {
    slug: "frontend-testing",
    name: "Frontend Testing",
    department: "web-development",
    short: "Unit, component and end-to-end tests for user interfaces.",
    description:
      "Good frontend tests exercise behaviour the way users do. Learn the testing pyramid, component testing with Testing Library and browser automation with Playwright.",
    officialUrl: "https://testing-library.com/",
    icon: "flask-conical",
    topics: ["The testing pyramid", "Unit tests", "Component tests", "Mocking network requests", "End-to-end tests", "Visual regression", "Accessibility checks", "Testing in CI"],
  },

  // ── Web development: backend ─────────────────────────────────────────────
  {
    slug: "nodejs",
    name: "Node.js",
    department: "web-development",
    short: "JavaScript on the server, built on an event-driven, non-blocking runtime.",
    description:
      "Node.js runs JavaScript outside the browser. Its event loop and huge package ecosystem make it a popular choice for APIs, real-time services and developer tooling.",
    officialUrl: "https://nodejs.org/en",
    icon: "hexagon",
    featured: true,
    topics: ["Installing Node and npm", "Modules", "The event loop", "File system and streams", "HTTP servers", "Packages and npm", "Environment and configuration", "Error handling", "Testing", "Security best practices"],
  },
  {
    slug: "express",
    name: "Express.js",
    department: "web-development",
    short: "Minimal, flexible web framework for Node.js.",
    description:
      "Express provides routing and middleware for building HTTP APIs and web apps on Node.js. Its simplicity makes it the best place to learn how backends handle requests.",
    officialUrl: "https://expressjs.com/",
    icon: "route",
    topics: ["Routing", "Middleware", "Request and response", "Error handling", "Serving static files", "Templating", "Security middleware", "Structuring larger apps"],
  },
  {
    slug: "rest-apis",
    name: "REST APIs",
    department: "web-development",
    short: "Designing resource-oriented HTTP APIs.",
    description:
      "REST is the dominant style for web APIs. Good API design covers resources, HTTP methods and status codes, pagination, versioning, errors and documentation with OpenAPI.",
    officialUrl: "https://openapis.org/",
    icon: "plug",
    topics: ["HTTP fundamentals", "Resources and URLs", "Methods and status codes", "Request validation", "Pagination and filtering", "Versioning", "Error formats", "OpenAPI documentation"],
  },
  {
    slug: "graphql",
    name: "GraphQL",
    department: "web-development",
    short: "A query language that lets clients ask for exactly the data they need.",
    description:
      "GraphQL exposes a typed schema that clients query precisely. Learn schemas, resolvers, queries, mutations and subscriptions, and the performance and security trade-offs.",
    officialUrl: "https://graphql.org/",
    icon: "share-2",
    topics: ["Schemas and types", "Queries", "Mutations", "Resolvers", "Pagination", "Subscriptions", "N+1 and batching", "Security and limits"],
  },
  {
    slug: "authentication",
    name: "Authentication & Authorization",
    department: "web-development",
    short: "Proving who users are and controlling what they can do.",
    description:
      "Learn sessions and tokens, password storage, OAuth 2.0 and OpenID Connect, multi-factor authentication, and authorisation models such as role-based access control.",
    officialUrl: "https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html",
    icon: "key-round",
    topics: ["Authentication vs authorization", "Password storage", "Sessions and cookies", "Tokens and JWTs", "OAuth 2.0 and OpenID Connect", "Multi-factor authentication", "Role-based access control", "Common vulnerabilities"],
  },
  {
    slug: "api-security",
    name: "API Security",
    department: "web-development",
    short: "Protecting APIs against the most common real-world attacks.",
    description:
      "API security covers authentication, object-level authorisation, input validation, rate limiting and the OWASP API Security Top 10.",
    officialUrl: "https://api-security.owasp.org/",
    icon: "shield-check",
    topics: ["OWASP API Security Top 10", "Broken object-level authorization", "Input validation", "Rate limiting", "Secrets management", "Transport security", "Logging and monitoring"],
  },
  {
    slug: "backend-architecture",
    name: "Backend Architecture",
    department: "web-development",
    short: "Structuring server applications for clarity, change and scale.",
    description:
      "Layered and hexagonal architectures, domain modelling, monoliths versus services, and the trade-offs that shape long-lived backends.",
    icon: "server",
    topics: ["Layered architecture", "Hexagonal / ports and adapters", "Domain modelling", "Modular monoliths", "Configuration and environments", "Background jobs", "Twelve-factor apps"],
  },
  {
    slug: "microservices",
    name: "Microservices",
    department: "web-development",
    short: "Building systems as independently deployable services.",
    description:
      "Microservices trade operational complexity for independent deployment and scaling. Learn when they make sense, how services communicate and how to keep data consistent.",
    officialUrl: "https://microservices.io/",
    icon: "boxes",
    topics: ["When to use microservices", "Service boundaries", "Synchronous vs asynchronous communication", "API gateways", "Data ownership", "Sagas", "Observability", "Deployment"],
  },
  {
    slug: "caching",
    name: "Caching",
    department: "web-development",
    short: "Serving repeated work from memory to make systems fast and cheap.",
    description:
      "Caching appears at every layer: HTTP caches, CDNs, application caches and database buffers. Learn cache strategies, invalidation and consistency trade-offs.",
    officialUrl: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching",
    icon: "zap",
    topics: ["HTTP caching headers", "CDNs", "Application caches", "Cache-aside and write-through", "Invalidation", "Eviction policies", "Consistency trade-offs"],
  },
  {
    slug: "message-queues",
    name: "Message Queues",
    department: "web-development",
    short: "Asynchronous communication with brokers such as RabbitMQ and Kafka.",
    description:
      "Queues and event streams decouple services, absorb traffic spikes and enable event-driven architectures.",
    icon: "inbox",
    topics: ["Why asynchronous messaging", "Queues vs streams", "Delivery guarantees", "RabbitMQ", "Apache Kafka", "Dead-letter queues", "Idempotency", "Event-driven design"],
  },
  {
    slug: "api-testing",
    name: "API Testing",
    department: "web-development",
    short: "Verifying APIs with automated functional, contract and load tests.",
    description:
      "Test APIs at the HTTP level with tools such as Postman, write integration tests in code, and verify performance under load.",
    icon: "test-tube",
    topics: ["Manual exploration", "Automated functional tests", "Integration tests", "Contract testing", "Mocking dependencies", "Load testing", "Testing in CI"],
  },
  {
    slug: "web-deployment",
    name: "Web Deployment",
    department: "web-development",
    short: "Getting web applications online securely and repeatably.",
    description:
      "Deploy static sites, server-rendered apps and APIs; configure domains, HTTPS and environment variables; and automate releases.",
    icon: "rocket",
    topics: ["Static hosting", "Platform-as-a-service", "Containers", "Environment variables and secrets", "Domains and HTTPS", "CDNs", "Zero-downtime releases", "Rollbacks"],
  },

  // ── Cloud computing ──────────────────────────────────────────────────────
  {
    slug: "cloud-fundamentals",
    name: "Cloud Fundamentals",
    department: "cloud-computing",
    short: "Provider-neutral concepts every cloud engineer needs.",
    description:
      "What cloud computing is; IaaS, PaaS and SaaS; public, private and hybrid clouds; virtualisation; compute, storage and networking; scalability and high availability; identity, security and the shared responsibility model; and pricing.",
    icon: "cloud",
    featured: true,
    topics: ["What is cloud computing?", "IaaS, PaaS and SaaS", "Public, private and hybrid clouds", "Virtualisation", "Compute services", "Storage", "Networking", "Scalability and elasticity", "High availability and disaster recovery", "Cloud security and shared responsibility", "Identity and access management (IAM)", "Pricing and cost management"],
  },
  {
    slug: "cloud-architecture",
    name: "Cloud Architecture",
    department: "cloud-computing",
    short: "Designing reliable, secure, efficient systems in the cloud.",
    description:
      "Well-architected frameworks from AWS, Azure and Google Cloud describe how to balance reliability, security, cost, performance and operational excellence.",
    icon: "drafting-compass",
    topics: ["Well-architected pillars", "Reliability patterns", "Multi-region design", "Serverless architectures", "Event-driven architectures", "Reference architectures"],
  },
  {
    slug: "cloud-security",
    name: "Cloud Security",
    department: "cloud-computing",
    short: "Identity, network controls, encryption and compliance in the cloud.",
    description:
      "Cloud security starts with identity and least privilege, then layers network isolation, encryption, logging, posture management and incident response.",
    icon: "shield",
    topics: ["Shared responsibility model", "IAM and least privilege", "Network security", "Encryption and key management", "Logging and detection", "Compliance frameworks"],
  },
  {
    slug: "cloud-cost-management",
    name: "Cloud Cost Management",
    department: "cloud-computing",
    short: "Understanding cloud pricing and practising FinOps.",
    description:
      "Learn how cloud services are billed, how to estimate costs before you build and how teams practise FinOps to keep spending under control.",
    officialUrl: "https://www.finops.org/",
    icon: "coins",
    topics: ["Pricing models", "Pricing calculators", "Budgets and alerts", "Reserved and spot capacity", "Tagging and allocation", "FinOps practices"],
  },
  {
    slug: "azure",
    name: "Microsoft Azure",
    department: "cloud-computing",
    short: "Microsoft's cloud platform, with free Microsoft Learn paths and certifications.",
    description:
      "Azure is widely used by enterprises and integrates closely with Microsoft 365, Entra ID and .NET. Microsoft Learn provides free, structured learning paths for every Azure certification.",
    officialUrl: "https://learn.microsoft.com/en-us/azure/",
    icon: "cloud-cog",
    featured: true,
    topics: ["Azure fundamentals", "Core services and resource management", "Compute: VMs, App Service, Functions, AKS", "Storage", "Networking", "Security and Microsoft Entra ID", "Databases", "Deployment and DevOps", "Monitoring with Azure Monitor", "Architecture (Well-Architected Framework)", "Certifications", "Practical labs"],
  },
  {
    slug: "aws",
    name: "Amazon Web Services",
    department: "cloud-computing",
    short: "The largest public cloud, with AWS Skill Builder training and certifications.",
    description:
      "AWS offers the broadest catalogue of cloud services. Start with Cloud Practitioner concepts, then learn EC2, S3, VPC, IAM, RDS and serverless before working towards associate certifications.",
    officialUrl: "https://docs.aws.amazon.com/",
    icon: "server-cog",
    featured: true,
    topics: ["AWS fundamentals and global infrastructure", "Core services", "Compute: EC2, Lambda, ECS", "Storage: S3, EBS", "Networking: VPC", "Security: IAM", "Databases: RDS, DynamoDB", "Deployment", "Monitoring with CloudWatch", "Architecture (Well-Architected Framework)", "Certifications", "Practical labs"],
  },
  {
    slug: "gcp",
    name: "Google Cloud",
    department: "cloud-computing",
    short: "Google's cloud platform, strong in data, Kubernetes and AI.",
    description:
      "Google Cloud is known for BigQuery, Google Kubernetes Engine and Vertex AI. Google Cloud Skills Boost offers hands-on labs and learning paths for its certifications.",
    officialUrl: "https://docs.cloud.google.com/docs",
    icon: "cloud-sun",
    featured: true,
    topics: ["Google Cloud fundamentals", "Resource hierarchy and core services", "Compute: Compute Engine, Cloud Run, GKE", "Storage", "Networking: VPC", "Security and IAM", "Databases: Cloud SQL, Spanner, BigQuery", "Deployment", "Monitoring with Cloud Monitoring", "Architecture Framework", "Certifications", "Practical labs"],
  },

  // ── DevOps ───────────────────────────────────────────────────────────────
  {
    slug: "linux",
    name: "Linux",
    department: "devops",
    short: "The operating system of servers, containers and the cloud.",
    description:
      "Almost every server and container runs Linux. Learn the filesystem, users and permissions, processes, package management, services and networking from the command line.",
    officialUrl: "https://www.kernel.org/",
    icon: "terminal-square",
    featured: true,
    topics: ["The Linux filesystem", "Essential commands", "Users, groups and permissions", "Processes and signals", "Package management", "Services and systemd", "Logs", "Networking commands", "SSH", "Text processing"],
  },
  {
    slug: "bash",
    name: "Bash Scripting",
    department: "devops",
    short: "Automating the command line with shell scripts.",
    description:
      "Bash scripts glue together commands to automate repetitive operational work: backups, deployments, log processing and environment setup.",
    officialUrl: "https://www.gnu.org/software/bash/manual/",
    icon: "square-terminal",
    topics: ["Variables and quoting", "Conditionals", "Loops", "Functions", "Exit codes and error handling", "Pipes and redirection", "Text processing with grep, sed and awk", "Scheduling with cron"],
  },
  {
    slug: "git",
    name: "Git",
    department: "devops",
    short: "Distributed version control for tracking and collaborating on code.",
    description:
      "Git records the history of your project and makes collaboration safe. Branching, merging, rebasing and resolving conflicts are everyday skills for every developer.",
    officialUrl: "https://git-scm.com/",
    icon: "git-branch",
    featured: true,
    topics: ["Repositories and commits", "Staging and history", "Branches", "Merging and conflicts", "Rebasing", "Remotes", "Undoing changes", "Workflows"],
  },
  {
    slug: "github",
    name: "GitHub",
    department: "devops",
    short: "Hosting, code review and collaboration on top of Git.",
    description:
      "GitHub adds pull requests, code review, issues, projects and automation with GitHub Actions to Git repositories.",
    officialUrl: "https://docs.github.com/en",
    icon: "git-pull-request",
    topics: ["Repositories", "Pull requests and code review", "Issues and projects", "Forks and open source", "Branch protection", "GitHub Actions", "Security features"],
  },
  {
    slug: "networking",
    name: "Networking Fundamentals",
    department: "devops",
    short: "IP, DNS, TCP/UDP, HTTP, load balancers and firewalls.",
    description:
      "Operating infrastructure requires understanding how packets move: addressing and subnets, DNS, TCP and UDP, HTTP and TLS, routing, NAT, load balancing and firewalls.",
    icon: "network",
    topics: ["The OSI and TCP/IP models", "IP addressing and subnets", "DNS", "TCP and UDP", "HTTP and TLS", "Routing and NAT", "Load balancers", "Firewalls", "Troubleshooting tools"],
  },
  {
    slug: "docker",
    name: "Docker",
    department: "devops",
    short: "Packaging applications and their dependencies into portable containers.",
    description:
      "Docker builds and runs containers: lightweight, reproducible environments that behave the same on a laptop, in CI and in production.",
    officialUrl: "https://docs.docker.com/",
    icon: "container",
    featured: true,
    topics: ["Containers vs virtual machines", "Images and containers", "Writing Dockerfiles", "Volumes and persistence", "Networking", "Docker Compose", "Image optimisation", "Registries", "Container security"],
  },
  {
    slug: "kubernetes",
    name: "Kubernetes",
    department: "devops",
    short: "Orchestrating containers across clusters of machines.",
    description:
      "Kubernetes schedules, scales and heals containerised workloads. Learn pods, deployments, services, configuration, storage, ingress and how to operate clusters.",
    officialUrl: "https://kubernetes.io/docs/home/",
    icon: "ship-wheel",
    featured: true,
    topics: ["Cluster architecture", "Pods", "Deployments and ReplicaSets", "Services", "ConfigMaps and Secrets", "Storage", "Ingress", "Scaling", "Helm", "Security and RBAC", "Observability"],
  },
  {
    slug: "ci-cd",
    name: "CI/CD",
    department: "devops",
    short: "Continuous integration and continuous delivery pipelines.",
    description:
      "CI/CD automatically builds, tests and releases every change, shortening feedback loops and making deployments routine.",
    icon: "repeat",
    topics: ["Continuous integration", "Continuous delivery vs deployment", "Pipeline design", "Automated testing", "Artifacts", "Environments and promotion", "Secrets in pipelines"],
  },
  {
    slug: "github-actions",
    name: "GitHub Actions",
    department: "devops",
    short: "CI/CD and automation built into GitHub.",
    description:
      "GitHub Actions runs workflows on events such as pushes and pull requests, from running tests to deploying to the cloud.",
    officialUrl: "https://docs.github.com/en/actions",
    icon: "play",
    topics: ["Workflows, jobs and steps", "Triggers", "Runners", "Using actions from the marketplace", "Matrix builds", "Secrets and environments", "Caching", "Deployments"],
  },
  {
    slug: "jenkins",
    name: "Jenkins",
    department: "devops",
    short: "The extensible, self-hosted automation server.",
    description:
      "Jenkins is a long-established open-source CI/CD server with a large plugin ecosystem, still widely used in enterprises.",
    officialUrl: "https://www.jenkins.io/",
    icon: "wrench",
    topics: ["Installing Jenkins", "Jobs and pipelines", "Jenkinsfile", "Agents", "Plugins", "Credentials", "Pipeline best practices"],
  },
  {
    slug: "terraform",
    name: "Terraform",
    department: "devops",
    short: "Declarative infrastructure as code for any cloud.",
    description:
      "Terraform describes infrastructure in configuration files and creates, changes and destroys it safely through a plan-and-apply workflow.",
    officialUrl: "https://developer.hashicorp.com/terraform",
    icon: "file-cog",
    topics: ["Infrastructure as code", "Providers and resources", "Variables and outputs", "State", "Modules", "Workspaces", "Plan and apply workflow", "Testing and policy"],
  },
  {
    slug: "ansible",
    name: "Ansible",
    department: "devops",
    short: "Agentless configuration management and automation.",
    description:
      "Ansible uses simple YAML playbooks to configure servers, deploy applications and orchestrate tasks over SSH.",
    officialUrl: "https://docs.ansible.com/",
    icon: "list-checks",
    topics: ["Inventory", "Ad-hoc commands", "Playbooks", "Modules", "Variables and templates", "Roles", "Vault for secrets"],
  },
  {
    slug: "observability",
    name: "Monitoring & Logging",
    department: "devops",
    short: "Metrics, logs and traces for understanding production systems.",
    description:
      "Observability is the ability to understand a system from its outputs. Learn the three signals, alerting on symptoms, SLOs, and OpenTelemetry.",
    officialUrl: "https://opentelemetry.io/docs/",
    icon: "activity",
    topics: ["Metrics, logs and traces", "Instrumentation", "Structured logging", "Alerting", "SLIs, SLOs and error budgets", "Distributed tracing", "OpenTelemetry"],
  },
  {
    slug: "prometheus",
    name: "Prometheus",
    department: "devops",
    short: "Open-source metrics collection and alerting.",
    description:
      "Prometheus scrapes time-series metrics, stores them efficiently and evaluates alerting rules. It is the standard for monitoring Kubernetes.",
    officialUrl: "https://prometheus.io/docs/introduction/overview/",
    icon: "flame",
    topics: ["Data model", "Exporters", "PromQL", "Recording and alerting rules", "Alertmanager", "Monitoring Kubernetes"],
  },
  {
    slug: "grafana",
    name: "Grafana",
    department: "devops",
    short: "Dashboards and visualisation for metrics, logs and traces.",
    description:
      "Grafana queries data sources such as Prometheus and Loki and turns them into dashboards and alerts.",
    officialUrl: "https://grafana.com/docs/grafana/latest/",
    icon: "chart-line",
    topics: ["Data sources", "Dashboards and panels", "Variables", "Alerting", "Logs with Loki", "Dashboards as code"],
  },
  {
    slug: "deployment-strategies",
    name: "Deployment Strategies",
    department: "devops",
    short: "Blue-green, canary, rolling and feature-flagged releases.",
    description:
      "Deployment strategies reduce the risk of releasing software by controlling how traffic moves to new versions and how quickly you can roll back.",
    icon: "git-pull-request-arrow",
    topics: ["Recreate and rolling deployments", "Blue-green deployments", "Canary releases", "Feature flags", "Rollbacks", "Database migrations during deploys"],
  },

  // ── Databases ────────────────────────────────────────────────────────────
  {
    slug: "sql",
    name: "SQL",
    department: "databases",
    short: "The standard language for querying and managing relational data.",
    description:
      "SQL lets you ask precise questions of data. Learn SELECT, filtering, joins, grouping, subqueries, window functions and data modification.",
    icon: "table",
    featured: true,
    topics: ["The relational model", "SELECT and filtering", "Sorting and limiting", "Joins", "Aggregation and GROUP BY", "Subqueries and CTEs", "Window functions", "INSERT, UPDATE and DELETE", "Constraints", "Views", "Practical exercises"],
  },
  {
    slug: "postgresql",
    name: "PostgreSQL",
    department: "databases",
    short: "The advanced open-source relational database.",
    description:
      "PostgreSQL is a powerful, standards-compliant open-source database with rich types, JSON support, extensions and excellent documentation.",
    officialUrl: "https://www.postgresql.org/docs/",
    icon: "database",
    featured: true,
    topics: ["Installation and psql", "Data types", "Schemas and tables", "Indexes", "Transactions and MVCC", "JSON and JSONB", "Functions and triggers", "Row-level security", "Backup and restore", "Performance tuning"],
  },
  {
    slug: "mysql",
    name: "MySQL",
    department: "databases",
    short: "The popular open-source relational database behind much of the web.",
    description:
      "MySQL powers countless web applications. Learn its SQL dialect, the InnoDB storage engine, replication and administration.",
    officialUrl: "https://dev.mysql.com/doc/",
    icon: "database-zap",
    topics: ["Installation", "SQL in MySQL", "InnoDB", "Indexes", "Transactions", "Users and privileges", "Replication", "Backup"],
  },
  {
    slug: "sql-server",
    name: "Microsoft SQL Server",
    department: "databases",
    short: "Microsoft's enterprise relational database and T-SQL.",
    description:
      "SQL Server and Azure SQL are widely used in enterprises. Learn T-SQL, database design, security, high availability and administration.",
    officialUrl: "https://learn.microsoft.com/en-us/sql/sql-server/",
    icon: "server",
    topics: ["T-SQL fundamentals", "Database design", "Indexes and query plans", "Stored procedures", "Security", "Backup and high availability", "Azure SQL"],
  },
  {
    slug: "mongodb",
    name: "MongoDB",
    department: "databases",
    short: "A document database with flexible JSON-like schemas.",
    description:
      "MongoDB stores data as documents, which suits evolving schemas and hierarchical data. Learn CRUD, schema design, indexes and the aggregation pipeline.",
    officialUrl: "https://www.mongodb.com/docs/",
    icon: "leaf",
    topics: ["Documents and collections", "CRUD operations", "Data modelling", "Indexes", "Aggregation pipeline", "Transactions", "Replication and sharding"],
  },
  {
    slug: "redis",
    name: "Redis",
    department: "databases",
    short: "An in-memory data store for caching, queues and real-time features.",
    description:
      "Redis keeps data in memory for microsecond access, with rich data structures such as hashes, lists, sets, sorted sets and streams.",
    officialUrl: "https://redis.io/docs/latest/",
    icon: "layers-3",
    topics: ["Data types", "Caching patterns", "Expiry and eviction", "Pub/sub and streams", "Persistence", "Replication"],
  },
  {
    slug: "database-design",
    name: "Database Design",
    department: "databases",
    short: "ER diagrams, normalisation and relationships that keep data correct.",
    description:
      "Good schemas prevent bugs. Learn entity-relationship modelling, keys and relationships, normalisation to third normal form, and when to denormalise.",
    icon: "network",
    topics: ["Requirements to entities", "ER diagrams", "Keys and relationships", "One-to-many and many-to-many", "Normalisation (1NF–BCNF)", "Constraints and integrity", "Denormalisation trade-offs", "Real-world schema projects"],
  },
  {
    slug: "query-optimization",
    name: "Indexing, Transactions & Query Optimisation",
    department: "databases",
    short: "Making queries fast and data changes safe.",
    description:
      "Understand B-tree and other indexes, read query plans, use transactions and isolation levels correctly, and avoid locking problems.",
    icon: "gauge",
    topics: ["How indexes work", "Composite and partial indexes", "Reading EXPLAIN plans", "Transactions and ACID", "Isolation levels", "Locking and deadlocks", "Common anti-patterns"],
  },
  {
    slug: "database-administration",
    name: "Database Administration & Security",
    department: "databases",
    short: "Operating databases: backups, replication, access control and monitoring.",
    description:
      "Database administrators keep data safe and available: backup and recovery, replication and failover, user management, security hardening and performance monitoring.",
    icon: "shield-check",
    topics: ["Installation and configuration", "Users, roles and least privilege", "Backup and point-in-time recovery", "Replication and high availability", "Monitoring", "Encryption", "SQL injection prevention", "Auditing"],
  },
  {
    slug: "data-warehousing",
    name: "Data Warehousing",
    department: "databases",
    short: "Analytical databases, dimensional modelling and the modern data stack.",
    description:
      "Data warehouses store data for analysis. Learn OLTP vs OLAP, star and snowflake schemas, columnar storage and cloud warehouses such as BigQuery.",
    icon: "warehouse",
    topics: ["OLTP vs OLAP", "Dimensional modelling", "Star and snowflake schemas", "Columnar storage", "Cloud data warehouses", "Data lakes and lakehouses"],
  },
  {
    slug: "etl-elt",
    name: "ETL & ELT",
    department: "databases",
    short: "Pipelines that move and transform data for analytics.",
    description:
      "Extract-transform-load and extract-load-transform pipelines feed analytics. Learn batch and streaming pipelines, orchestration and data quality.",
    icon: "arrow-right-left",
    topics: ["ETL vs ELT", "Batch pipelines", "Streaming", "Orchestration", "Transformations with SQL", "Data quality and testing"],
  },

  // ── Computer science ─────────────────────────────────────────────────────
  {
    slug: "data-structures",
    name: "Data Structures",
    department: "computer-science",
    short: "Arrays, lists, stacks, queues, trees, heaps, hash tables and graphs.",
    description:
      "Choosing the right data structure is the difference between a program that scales and one that does not.",
    icon: "list-tree",
    featured: true,
    topics: ["Arrays and dynamic arrays", "Linked lists", "Stacks and queues", "Hash tables", "Trees and binary search trees", "Balanced trees", "Heaps and priority queues", "Graphs", "Tries"],
  },
  {
    slug: "algorithms",
    name: "Algorithms & Complexity",
    department: "computer-science",
    short: "Algorithm design, analysis and time and space complexity.",
    description:
      "Learn to analyse algorithms with Big-O notation and design them with techniques such as divide and conquer, greedy methods, dynamic programming and graph search.",
    icon: "git-fork",
    featured: true,
    topics: ["Algorithm analysis", "Time and space complexity", "Sorting and searching", "Recursion", "Divide and conquer", "Greedy algorithms", "Dynamic programming", "Graph algorithms", "NP-completeness"],
  },
  {
    slug: "oop",
    name: "Object-Oriented Programming",
    department: "computer-science",
    short: "Encapsulation, inheritance, polymorphism and object-oriented design.",
    description:
      "OOP organises code around objects that combine data and behaviour. Learn the core principles and SOLID design guidelines.",
    icon: "box",
    topics: ["Classes and objects", "Encapsulation", "Inheritance", "Polymorphism", "Abstraction and interfaces", "Composition over inheritance", "SOLID principles"],
  },
  {
    slug: "design-patterns",
    name: "Design Patterns",
    department: "computer-science",
    short: "Proven solutions to recurring software design problems.",
    description:
      "Creational, structural and behavioural patterns give teams a shared vocabulary for designing flexible software.",
    officialUrl: "https://refactoring.guru/design-patterns",
    icon: "shapes",
    topics: ["Creational patterns", "Structural patterns", "Behavioural patterns", "Refactoring", "Anti-patterns"],
  },
  {
    slug: "operating-systems",
    name: "Operating Systems",
    department: "computer-science",
    short: "Processes, threads, scheduling, memory, file systems and concurrency.",
    description:
      "Operating systems manage hardware and share it safely between programs. Understanding them explains performance, concurrency bugs and security boundaries.",
    icon: "monitor-cog",
    topics: ["Processes and threads", "CPU scheduling", "Concurrency and synchronisation", "Deadlocks", "Virtual memory", "File systems", "I/O", "Security"],
  },
  {
    slug: "computer-networks",
    name: "Computer Networks",
    department: "computer-science",
    short: "How the internet works, layer by layer.",
    description:
      "A rigorous treatment of network layers, protocols, routing, congestion control and network security.",
    icon: "globe-lock",
    topics: ["Network layers", "Application layer protocols", "Transport: TCP and UDP", "Congestion control", "The network layer and routing", "The link layer", "Wireless networks", "Network security"],
  },
  {
    slug: "computer-architecture",
    name: "Computer Architecture",
    department: "computer-science",
    short: "How processors, memory and instruction sets really work.",
    description:
      "From logic gates to pipelined processors and cache hierarchies: what the hardware does when your code runs.",
    icon: "microchip",
    topics: ["Digital logic", "Number representation", "Instruction set architectures", "Datapath and control", "Pipelining", "Memory hierarchy and caches", "Parallelism"],
  },
  {
    slug: "assembly",
    name: "Assembly Language",
    department: "computer-science",
    short: "Programming the processor directly.",
    description:
      "Assembly reveals how high-level code maps to machine instructions, registers, the stack and calling conventions.",
    icon: "binary",
    topics: ["Registers", "Instructions and addressing modes", "The stack", "Calling conventions", "Control flow", "Reading compiler output"],
  },
  {
    slug: "software-engineering",
    name: "Software Engineering",
    department: "computer-science",
    short: "Processes and practices for building software in teams.",
    description:
      "Requirements, design, version control, code review, agile methods, maintenance and professional practice.",
    icon: "hammer",
    topics: ["Software development life cycle", "Requirements", "Agile and Scrum", "Code quality and review", "Refactoring", "Documentation", "Maintenance"],
  },
  {
    slug: "software-testing",
    name: "Software Testing",
    department: "computer-science",
    short: "Verifying software with unit, integration and system tests.",
    description:
      "Testing techniques and strategy: test design, test-driven development, mocking, coverage and automated test suites.",
    icon: "flask-conical",
    topics: ["Testing levels", "Test design techniques", "Unit testing", "Integration testing", "Test-driven development", "Mocks and fakes", "Coverage", "Test automation"],
  },
  {
    slug: "system-design",
    name: "System Design",
    department: "computer-science",
    short: "Designing large-scale systems: scalability, reliability and trade-offs.",
    description:
      "System design brings together load balancing, caching, databases, partitioning, replication and queues to design services for millions of users.",
    icon: "drafting-compass",
    featured: true,
    topics: ["Requirements and estimation", "Scalability", "Load balancing", "Caching", "Databases, replication and partitioning", "Queues and asynchronous processing", "Consistency and availability", "Case studies"],
  },
  {
    slug: "distributed-systems",
    name: "Distributed Systems",
    department: "computer-science",
    short: "Consistency, consensus and fault tolerance across many machines.",
    description:
      "Distributed systems coordinate independent machines that fail independently. Learn time, replication, consensus (Raft, Paxos) and consistency models.",
    icon: "waypoints",
    topics: ["Models and failures", "Time and clocks", "Replication", "Consistency models", "Consensus: Raft and Paxos", "Distributed transactions", "Case studies"],
  },
  {
    slug: "compilers",
    name: "Compilers",
    department: "computer-science",
    short: "How source code becomes executable programs.",
    description:
      "Lexing, parsing, semantic analysis, intermediate representations, optimisation and code generation — and building interpreters yourself.",
    icon: "file-cog",
    topics: ["Lexical analysis", "Parsing", "Abstract syntax trees", "Semantic analysis", "Interpreters", "Intermediate representations", "Optimisation", "Code generation"],
  },
  {
    slug: "theory-of-computation",
    name: "Theory of Computation",
    department: "computer-science",
    short: "Automata, formal languages, computability and complexity.",
    description:
      "What can computers compute, and how efficiently? Finite automata, context-free grammars, Turing machines, decidability and complexity classes.",
    icon: "infinity",
    topics: ["Finite automata", "Regular expressions", "Context-free grammars", "Turing machines", "Decidability", "Complexity classes", "NP-completeness"],
  },
  {
    slug: "discrete-math",
    name: "Discrete Mathematics",
    department: "computer-science",
    short: "Logic, proofs, sets, combinatorics, graphs and probability for CS.",
    description:
      "The mathematical language of computer science: logic and proof techniques, induction, sets and relations, counting, graph theory and discrete probability.",
    icon: "sigma",
    topics: ["Logic", "Proof techniques", "Induction", "Sets, relations and functions", "Combinatorics", "Graph theory", "Number theory", "Discrete probability"],
  },

  // ── Mobile development ───────────────────────────────────────────────────
  {
    slug: "android",
    name: "Android Development",
    department: "mobile-development",
    short: "Building native Android apps with Android Studio.",
    description:
      "The Android platform: Android Studio, app architecture, UI, networking, local storage with Room and DataStore, testing and publishing on Google Play.",
    officialUrl: "https://developer.android.com/",
    icon: "smartphone",
    featured: true,
    topics: ["Android Studio", "App architecture", "UI with Jetpack Compose", "Navigation", "Networking", "Local storage", "Background work", "Testing", "Publishing on Google Play"],
  },
  {
    slug: "kotlin",
    name: "Kotlin",
    department: "mobile-development",
    short: "The modern, concise language recommended for Android.",
    description:
      "Kotlin is Google's preferred language for Android, also used on the server. It is concise, null-safe and fully interoperable with Java.",
    officialUrl: "https://kotlinlang.org/",
    icon: "code",
    topics: ["Basic syntax", "Null safety", "Functions and lambdas", "Classes and data classes", "Collections", "Coroutines", "Flows"],
  },
  {
    slug: "jetpack-compose",
    name: "Jetpack Compose",
    department: "mobile-development",
    short: "Android's modern declarative UI toolkit.",
    description:
      "Jetpack Compose builds native Android UI with composable Kotlin functions, replacing XML layouts.",
    officialUrl: "https://developer.android.com/compose",
    icon: "layout-template",
    topics: ["Composables", "Layouts", "State and recomposition", "Lists", "Theming with Material 3", "Navigation", "Animation", "Testing"],
  },
  {
    slug: "ios",
    name: "iOS Development",
    department: "mobile-development",
    short: "Building native apps for iPhone and iPad with Xcode.",
    description:
      "The Apple platform: Xcode, app architecture, SwiftUI and UIKit, networking, data persistence with SwiftData and Core Data, testing and App Store publishing.",
    officialUrl: "https://developer.apple.com/documentation/",
    icon: "tablet-smartphone",
    featured: true,
    topics: ["Xcode", "App architecture", "SwiftUI", "UIKit fundamentals", "Networking", "Data persistence", "Testing", "App Store publishing"],
  },
  {
    slug: "swift",
    name: "Swift",
    department: "mobile-development",
    short: "Apple's safe, fast language for all its platforms.",
    description:
      "Swift is the language of iOS, macOS, watchOS and visionOS development, combining safety with performance.",
    officialUrl: "https://www.swift.org/",
    icon: "bird",
    topics: ["The basics", "Optionals", "Collections", "Functions and closures", "Structures and classes", "Protocols", "Error handling", "Concurrency with async/await"],
  },
  {
    slug: "swiftui",
    name: "SwiftUI",
    department: "mobile-development",
    short: "Apple's declarative UI framework.",
    description:
      "SwiftUI builds interfaces for every Apple platform with declarative Swift code and live previews.",
    officialUrl: "https://developer.apple.com/xcode/swiftui/",
    icon: "layout-dashboard",
    topics: ["Views and modifiers", "Layout", "State and data flow", "Lists and navigation", "Animations", "Integrating UIKit"],
  },
  {
    slug: "uikit",
    name: "UIKit",
    department: "mobile-development",
    short: "The established imperative UI framework for iOS.",
    description:
      "UIKit still underpins many production iOS apps. Learn view controllers, Auto Layout and the app life cycle.",
    officialUrl: "https://developer.apple.com/documentation/uikit",
    icon: "panels-top-left",
    topics: ["App and scene life cycle", "View controllers", "Auto Layout", "Table and collection views", "Navigation"],
  },
  {
    slug: "flutter",
    name: "Flutter",
    department: "mobile-development",
    short: "Google's toolkit for natively compiled apps from a single codebase.",
    description:
      "Flutter renders its own widgets, giving consistent, fast UIs on Android, iOS, web and desktop from one Dart codebase.",
    officialUrl: "https://docs.flutter.dev/",
    icon: "feather",
    featured: true,
    topics: ["Widgets", "Layouts", "State management", "Navigation and routing", "Networking and APIs", "Local storage", "Testing", "Deployment to stores"],
  },
  {
    slug: "dart",
    name: "Dart",
    department: "mobile-development",
    short: "The client-optimised language behind Flutter.",
    description:
      "Dart is a type-safe language with sound null safety and async support, optimised for building user interfaces.",
    officialUrl: "https://dart.dev/",
    icon: "target",
    topics: ["Syntax basics", "Types and null safety", "Functions", "Classes and mixins", "Collections", "Asynchronous programming"],
  },
  {
    slug: "react-native",
    name: "React Native",
    department: "mobile-development",
    short: "Native mobile apps with React and JavaScript or TypeScript.",
    description:
      "React Native renders real native components from React code, letting web developers build iOS and Android apps.",
    officialUrl: "https://reactnative.dev/",
    icon: "atom",
    featured: true,
    topics: ["Core components", "Styling and layout", "Navigation", "State management", "Networking and APIs", "Local storage", "Native modules", "Publishing"],
  },
  {
    slug: "expo",
    name: "Expo",
    department: "mobile-development",
    short: "The framework and tooling that make React Native development fast.",
    description:
      "Expo provides a framework, SDK and cloud build service (EAS) for creating, building and shipping React Native apps.",
    officialUrl: "https://docs.expo.dev/",
    icon: "rocket",
    topics: ["Creating a project", "Expo Router", "Using device APIs", "Development builds", "EAS Build", "EAS Submit and updates"],
  },

  // ── AI & machine learning ────────────────────────────────────────────────
  {
    slug: "math-for-ml",
    name: "Mathematics for Machine Learning",
    department: "ai-machine-learning",
    short: "Linear algebra, calculus and optimisation for ML.",
    description:
      "Vectors, matrices and decompositions; derivatives, gradients and the chain rule; and optimisation — the mathematics that explains how models learn.",
    icon: "sigma",
    topics: ["Vectors and matrices", "Matrix decompositions", "Derivatives and gradients", "The chain rule", "Optimisation and gradient descent", "Probability distributions"],
  },
  {
    slug: "statistics",
    name: "Statistics & Probability",
    department: "ai-machine-learning",
    short: "Reasoning about data and uncertainty.",
    description:
      "Descriptive statistics, probability, distributions, sampling, hypothesis testing and regression — essential for data science and ML evaluation.",
    icon: "chart-bar",
    topics: ["Descriptive statistics", "Probability", "Distributions", "Sampling", "Hypothesis testing", "Confidence intervals", "Regression"],
  },
  {
    slug: "numpy",
    name: "NumPy",
    department: "ai-machine-learning",
    short: "Fast n-dimensional arrays for numerical Python.",
    description:
      "NumPy is the foundation of scientific Python: vectorised array operations, broadcasting and linear algebra.",
    officialUrl: "https://numpy.org/doc/stable/",
    icon: "grid-3x3",
    topics: ["Arrays", "Indexing and slicing", "Broadcasting", "Vectorised operations", "Linear algebra", "Random numbers"],
  },
  {
    slug: "pandas",
    name: "pandas",
    department: "ai-machine-learning",
    short: "DataFrames for data cleaning, preprocessing and analysis.",
    description:
      "pandas loads, cleans, reshapes and analyses tabular data — the core of data preprocessing for machine learning.",
    officialUrl: "https://pandas.pydata.org/docs/",
    icon: "sheet",
    topics: ["Series and DataFrames", "Loading data", "Selecting and filtering", "Cleaning and missing values", "Grouping and aggregation", "Merging and reshaping", "Time series", "Data preprocessing"],
  },
  {
    slug: "machine-learning",
    name: "Machine Learning",
    department: "ai-machine-learning",
    short: "Algorithms that learn patterns from data, and how to evaluate them.",
    description:
      "Supervised and unsupervised learning, feature engineering, model selection, overfitting and evaluation metrics.",
    icon: "brain",
    featured: true,
    topics: ["Supervised vs unsupervised learning", "Linear and logistic regression", "Decision trees and ensembles", "Clustering", "Feature engineering", "Overfitting and regularisation", "Cross-validation", "Model evaluation metrics"],
  },
  {
    slug: "scikit-learn",
    name: "scikit-learn",
    department: "ai-machine-learning",
    short: "The standard Python library for classical machine learning.",
    description:
      "scikit-learn offers consistent APIs for preprocessing, classical models, pipelines and model evaluation.",
    officialUrl: "https://scikit-learn.org/stable/",
    icon: "flask-round",
    topics: ["Estimators and the fit/predict API", "Preprocessing", "Pipelines", "Model selection", "Metrics", "Hyperparameter search"],
  },
  {
    slug: "deep-learning",
    name: "Deep Learning & Neural Networks",
    department: "ai-machine-learning",
    short: "Neural networks, backpropagation and modern architectures.",
    description:
      "How neural networks learn, from perceptrons and backpropagation to convolutional networks and transformers.",
    icon: "brain-circuit",
    featured: true,
    topics: ["Neurons and activation functions", "Backpropagation", "Training and optimisers", "Regularisation", "Convolutional networks", "Recurrent networks", "Transformers"],
  },
  {
    slug: "pytorch",
    name: "PyTorch",
    department: "ai-machine-learning",
    short: "The leading framework for deep-learning research and production.",
    description:
      "PyTorch provides tensors, automatic differentiation and neural-network building blocks with a Pythonic API.",
    officialUrl: "https://docs.pytorch.org/docs/stable/index.html",
    icon: "flame",
    topics: ["Tensors", "Autograd", "Building models with nn.Module", "Datasets and DataLoaders", "Training loops", "Saving and loading models", "GPU training"],
  },
  {
    slug: "tensorflow",
    name: "TensorFlow",
    department: "ai-machine-learning",
    short: "Google's end-to-end machine-learning platform, with Keras.",
    description:
      "TensorFlow and its high-level Keras API build, train and deploy models from servers to mobile devices.",
    officialUrl: "https://www.tensorflow.org/",
    icon: "orbit",
    topics: ["Tensors", "Keras models", "Training and callbacks", "Data pipelines with tf.data", "Saving models", "Deployment with TensorFlow Lite and Serving"],
  },
  {
    slug: "nlp",
    name: "Natural Language Processing",
    department: "ai-machine-learning",
    short: "Teaching machines to understand and generate human language.",
    description:
      "Tokenisation, embeddings, sequence models and transformers for classification, translation, summarisation and question answering.",
    icon: "languages",
    topics: ["Text preprocessing and tokenisation", "Word embeddings", "Sequence models", "Attention and transformers", "Pretrained language models", "Fine-tuning"],
  },
  {
    slug: "computer-vision",
    name: "Computer Vision",
    department: "ai-machine-learning",
    short: "Models that understand images and video.",
    description:
      "Image classification, object detection and segmentation with convolutional networks and vision transformers.",
    icon: "scan-eye",
    topics: ["Images as data", "Convolutional neural networks", "Image classification", "Object detection", "Segmentation", "Transfer learning", "Vision transformers"],
  },
  {
    slug: "generative-ai",
    name: "Generative AI",
    department: "ai-machine-learning",
    short: "Models that create text, images, audio and code.",
    description:
      "How generative models work — from autoregressive language models to diffusion — and how to build responsibly with them.",
    icon: "sparkles",
    topics: ["What generative models are", "Language models", "Diffusion models", "Multimodal models", "Safety and responsible AI", "Use cases"],
  },
  {
    slug: "llms",
    name: "Large Language Models",
    department: "ai-machine-learning",
    short: "How LLMs are built, trained and used.",
    description:
      "Tokenisation, transformer architecture, pre-training, fine-tuning and alignment, plus practical use through APIs.",
    icon: "message-square-code",
    featured: true,
    topics: ["Tokens and embeddings", "The transformer architecture", "Pre-training", "Fine-tuning and alignment", "Inference and sampling", "Using LLM APIs", "Limitations and hallucination"],
  },
  {
    slug: "prompt-engineering",
    name: "Prompt Engineering",
    department: "ai-machine-learning",
    short: "Getting reliable results from language models.",
    description:
      "Clear instructions, examples, structured output, chain-of-thought and evaluation-driven prompt iteration.",
    icon: "pencil-line",
    topics: ["Clear instructions", "Few-shot examples", "System prompts and roles", "Structured output", "Step-by-step reasoning", "Evaluating prompts"],
  },
  {
    slug: "rag",
    name: "Retrieval-Augmented Generation",
    department: "ai-machine-learning",
    short: "Grounding LLM answers in your own documents.",
    description:
      "RAG retrieves relevant documents with embeddings and vector search, then gives them to the model as context to produce grounded answers.",
    icon: "file-search",
    topics: ["Why RAG", "Embeddings", "Chunking", "Vector databases", "Retrieval and reranking", "Prompting with context", "Evaluating RAG systems"],
  },
  {
    slug: "ai-agents",
    name: "AI Agents & Agentic AI",
    department: "ai-machine-learning",
    short: "LLM systems that plan, use tools and act.",
    description:
      "Agents combine language models with tools, memory and control loops to complete multi-step tasks. Learn tool use, workflows versus agents, and guardrails.",
    icon: "bot",
    topics: ["Tool use and function calling", "Workflows vs agents", "Planning and reflection", "Memory", "Multi-agent systems", "Model Context Protocol", "Safety and guardrails", "Evaluating agents"],
  },
  {
    slug: "mlops",
    name: "MLOps & AI Engineering",
    department: "ai-machine-learning",
    short: "Deploying, monitoring and evaluating models in production.",
    description:
      "Experiment tracking, model registries, serving, monitoring for drift, evaluation pipelines and the engineering discipline of shipping AI products.",
    icon: "settings-2",
    topics: ["The ML life cycle", "Experiment tracking", "Model registries", "Serving and deployment", "Monitoring and drift", "Evaluation pipelines", "CI/CD for ML"],
  },

  // ── UI/UX design ─────────────────────────────────────────────────────────
  {
    slug: "ux-fundamentals",
    name: "UI/UX Fundamentals",
    department: "ui-ux-design",
    short: "What UX and UI design are, and the principles behind good interfaces.",
    description:
      "Usability heuristics, mental models, affordances, feedback and the design process from discovery to delivery.",
    icon: "mouse-pointer-click",
    featured: true,
    topics: ["UX vs UI", "The design process", "Usability heuristics", "Mental models", "Affordances and signifiers", "Feedback and error prevention", "Information architecture"],
  },
  {
    slug: "visual-design",
    name: "Visual Design",
    department: "ui-ux-design",
    short: "Typography, colour, spacing, layout and visual hierarchy.",
    description:
      "Visual design makes interfaces clear and attractive: type scales, colour systems with accessible contrast, spacing systems, grids and hierarchy.",
    icon: "type",
    topics: ["Design principles", "Typography", "Colour theory", "Spacing and layout grids", "Visual hierarchy", "Iconography", "Imagery"],
  },
  {
    slug: "user-research",
    name: "User Research",
    department: "ui-ux-design",
    short: "Interviews, personas and journey maps grounded in real people.",
    description:
      "Plan and run user interviews and surveys, synthesise findings, and capture them as personas, jobs-to-be-done and journey maps.",
    icon: "users",
    topics: ["Research planning", "User interviews", "Surveys", "Synthesis and affinity mapping", "Personas", "User journeys", "Jobs to be done"],
  },
  {
    slug: "usability-testing",
    name: "Usability Testing",
    department: "ui-ux-design",
    short: "Watching people use your design and learning from it.",
    description:
      "Plan moderated and unmoderated usability tests, write good tasks, observe without leading and turn findings into improvements.",
    icon: "eye",
    topics: ["Test planning", "Writing tasks", "Moderated testing", "Unmoderated testing", "Think-aloud", "Analysing findings"],
  },
  {
    slug: "wireframing-prototyping",
    name: "Wireframing & Prototyping",
    department: "ui-ux-design",
    short: "From low-fidelity sketches to interactive prototypes.",
    description:
      "Sketch flows, build wireframes to explore structure, then create interactive prototypes to test ideas before building them.",
    icon: "frame",
    topics: ["Sketching", "User flows", "Low-fidelity wireframes", "High-fidelity mockups", "Interactive prototypes", "Testing prototypes"],
  },
  {
    slug: "figma",
    name: "Figma",
    department: "ui-ux-design",
    short: "The collaborative interface design tool.",
    description:
      "Figma is the industry-standard tool for interface design, prototyping and design systems, with real-time collaboration.",
    officialUrl: "https://help.figma.com/hc/en-us",
    icon: "pen-tool",
    featured: true,
    topics: ["Frames and layers", "Auto layout", "Components and variants", "Styles and variables", "Prototyping", "Dev Mode and handoff"],
  },
  {
    slug: "design-systems",
    name: "Design Systems",
    department: "ui-ux-design",
    short: "Tokens, components and guidelines that scale design quality.",
    description:
      "A design system combines design tokens, a component library, patterns and documentation so teams ship consistent interfaces faster.",
    icon: "component",
    topics: ["Design tokens", "Component libraries", "Patterns", "Documentation", "Governance", "Accessibility in systems"],
  },
  {
    slug: "design-handoff",
    name: "Design Handoff",
    department: "ui-ux-design",
    short: "Turning designs into specifications engineers can build from.",
    description:
      "Specify layout, tokens, states, responsive behaviour and edge cases so implementation matches intent.",
    icon: "hand-helping",
    topics: ["Specs and annotations", "States and edge cases", "Responsive behaviour", "Tokens in code", "Design QA"],
  },
];
