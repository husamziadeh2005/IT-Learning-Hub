import type { DepartmentSeed } from "./types";

export const departments: DepartmentSeed[] = [
  {
    slug: "programming-languages",
    name: "Programming Languages",
    tagline: "Learn to think in code with the languages that run the world.",
    description:
      "Start with the fundamentals — syntax, variables, functions, data structures and error handling — then go deep on object-oriented design, concurrency and idiomatic, production-quality code. Every language is organised from first program to advanced concepts, with official documentation first.",
    icon: "braces",
    accent: "amber",
    subcategories: [
      {
        slug: "general-purpose",
        name: "General-purpose & scripting",
        description: "Approachable languages for automation, data, the web and beyond.",
        technologies: ["python", "javascript", "typescript"],
      },
      {
        slug: "managed-languages",
        name: "Enterprise & managed runtimes",
        description: "Statically typed languages behind large-scale backend and enterprise systems.",
        technologies: ["java", "csharp", "go"],
      },
      {
        slug: "systems-programming",
        name: "Systems programming",
        description: "Languages that give you control over memory, performance and hardware.",
        technologies: ["c", "cpp", "go"],
      },
    ],
  },
  {
    slug: "web-development",
    name: "Web Development",
    tagline: "Build fast, accessible products for the browser and the server.",
    description:
      "From semantic HTML to distributed backends. The frontend track covers HTML, CSS, JavaScript, TypeScript, React and Next.js alongside accessibility, performance and testing. The backend track covers Node.js, APIs, authentication, security, caching, queues and deployment.",
    icon: "globe",
    accent: "blue",
    subcategories: [
      {
        slug: "frontend",
        name: "Frontend development",
        description: "Everything that runs in the browser, from markup to application architecture.",
        technologies: [
          "html",
          "css",
          "javascript",
          "typescript",
          "react",
          "nextjs",
          "responsive-design",
          "state-management",
          "frontend-architecture",
          "web-accessibility",
          "web-performance",
          "frontend-testing",
        ],
      },
      {
        slug: "backend",
        name: "Backend development",
        description: "Servers, APIs, data and the infrastructure that keeps them reliable.",
        technologies: [
          "nodejs",
          "express",
          "rest-apis",
          "graphql",
          "authentication",
          "api-security",
          "backend-architecture",
          "microservices",
          "caching",
          "message-queues",
          "system-design",
          "api-testing",
          "web-deployment",
        ],
      },
    ],
  },
  {
    slug: "cloud-computing",
    name: "Cloud Computing",
    tagline: "Understand the cloud, then build on Azure, AWS and Google Cloud.",
    description:
      "Learn the concepts that every provider shares — service models, virtualisation, compute, storage, networking, identity, high availability and cost — before specialising in Microsoft Azure, Amazon Web Services or Google Cloud with official learning paths, labs and certification guides.",
    icon: "cloud",
    accent: "sky",
    subcategories: [
      {
        slug: "cloud-fundamentals",
        name: "Cloud fundamentals",
        description: "Provider-neutral concepts: IaaS/PaaS/SaaS, virtualisation, scalability, security and pricing.",
        technologies: ["cloud-fundamentals", "cloud-architecture", "cloud-security", "cloud-cost-management"],
      },
      {
        slug: "cloud-providers",
        name: "Cloud providers",
        description: "Hands-on paths for the three major public clouds.",
        technologies: ["azure", "aws", "gcp"],
      },
    ],
  },
  {
    slug: "devops",
    name: "DevOps & Infrastructure",
    tagline: "Ship reliably: Linux, containers, automation and observability.",
    description:
      "A deliberate sequence from the command line and Git to Docker, Kubernetes, CI/CD, infrastructure as code and monitoring — finishing with deployment strategies on real cloud platforms.",
    icon: "infinity",
    accent: "emerald",
    subcategories: [
      {
        slug: "foundations",
        name: "Foundations",
        description: "Linux, the shell, version control and networking basics.",
        technologies: ["linux", "bash", "git", "github", "networking"],
      },
      {
        slug: "containers",
        name: "Containers & orchestration",
        description: "Package applications once and run them anywhere.",
        technologies: ["docker", "kubernetes"],
      },
      {
        slug: "ci-cd",
        name: "CI/CD & automation",
        description: "Build, test and release on every commit.",
        technologies: ["ci-cd", "github-actions", "jenkins"],
      },
      {
        slug: "infrastructure-as-code",
        name: "Infrastructure as code",
        description: "Describe infrastructure in version-controlled files.",
        technologies: ["terraform", "ansible"],
      },
      {
        slug: "observability",
        name: "Monitoring & observability",
        description: "Metrics, logs and traces that tell you what production is doing.",
        technologies: ["observability", "prometheus", "grafana"],
      },
      {
        slug: "cloud-devops",
        name: "Cloud DevOps & deployment",
        description: "Deployment strategies and DevOps on the major clouds.",
        technologies: ["deployment-strategies", "aws", "azure", "gcp"],
      },
    ],
  },
  {
    slug: "databases",
    name: "Databases & Data",
    tagline: "Model, query, tune and protect the data your software depends on.",
    description:
      "SQL first, then PostgreSQL, MySQL, SQL Server, MongoDB and Redis. Learn design (ER diagrams, normalisation, relationships), performance (indexing, transactions, query plans), administration and security, and the data-engineering foundations of warehousing and ETL/ELT.",
    icon: "database",
    accent: "violet",
    subcategories: [
      {
        slug: "relational",
        name: "SQL & relational databases",
        description: "The relational model and the engines that implement it.",
        technologies: ["sql", "postgresql", "mysql", "sql-server"],
      },
      {
        slug: "nosql",
        name: "NoSQL & in-memory stores",
        description: "Document and key-value databases for flexible or very fast access.",
        technologies: ["mongodb", "redis"],
      },
      {
        slug: "design-and-performance",
        name: "Design & performance",
        description: "Schemas that stay correct and queries that stay fast.",
        technologies: ["database-design", "query-optimization"],
      },
      {
        slug: "administration",
        name: "Administration & security",
        description: "Backups, replication, access control and operations.",
        technologies: ["database-administration"],
      },
      {
        slug: "data-engineering",
        name: "Data engineering",
        description: "Warehouses, pipelines, ETL and ELT.",
        technologies: ["data-warehousing", "etl-elt"],
      },
    ],
  },
  {
    slug: "computer-science",
    name: "Computer Science",
    tagline: "The foundations that make every other skill easier.",
    description:
      "University-level material on data structures, algorithms and complexity, programming paradigms and design patterns, operating systems, networks, architecture and assembly, software engineering and testing, system design, distributed systems, compilers, theory of computation and discrete mathematics.",
    icon: "cpu",
    accent: "rose",
    subcategories: [
      {
        slug: "algorithms",
        name: "Algorithms & data structures",
        description: "Analysis, complexity and the core toolkit of every engineer.",
        technologies: ["data-structures", "algorithms"],
      },
      {
        slug: "paradigms",
        name: "Paradigms & design",
        description: "Object-oriented programming and reusable design patterns.",
        technologies: ["oop", "design-patterns"],
      },
      {
        slug: "systems",
        name: "Computer systems",
        description: "Operating systems, networks, architecture and assembly.",
        technologies: ["operating-systems", "computer-networks", "computer-architecture", "assembly"],
      },
      {
        slug: "software-engineering",
        name: "Software engineering",
        description: "Building, testing and scaling real systems.",
        technologies: ["software-engineering", "software-testing", "system-design", "distributed-systems"],
      },
      {
        slug: "theory",
        name: "Theory & mathematics",
        description: "Compilers, computability and the mathematics underneath it all.",
        technologies: ["compilers", "theory-of-computation", "discrete-math"],
      },
    ],
  },
  {
    slug: "mobile-development",
    name: "Mobile Development",
    tagline: "Native Android and iOS, or one codebase for both.",
    description:
      "Android with Kotlin and Jetpack Compose, iOS with Swift and SwiftUI, and cross-platform apps with Flutter or React Native and Expo. Every track covers architecture, networking, local storage, testing and publishing to the stores.",
    icon: "smartphone",
    accent: "teal",
    subcategories: [
      {
        slug: "android",
        name: "Android development",
        description: "Kotlin, Jetpack Compose and the Android platform.",
        technologies: ["android", "kotlin", "jetpack-compose", "java"],
      },
      {
        slug: "ios",
        name: "iOS development",
        description: "Swift, SwiftUI, UIKit and Xcode.",
        technologies: ["ios", "swift", "swiftui", "uikit"],
      },
      {
        slug: "cross-platform",
        name: "Cross-platform development",
        description: "Ship to Android and iOS from one codebase.",
        technologies: ["flutter", "dart", "react-native", "expo"],
      },
    ],
  },
  {
    slug: "ai-machine-learning",
    name: "AI & Machine Learning",
    tagline: "From the maths of learning to building with large language models.",
    description:
      "Three clearly separated layers: AI foundations (Python, mathematics, statistics, NumPy and pandas), machine and deep learning (classical ML, neural networks, PyTorch, TensorFlow, NLP and computer vision), and modern AI engineering (LLMs, prompt engineering, RAG, agents, evaluation and MLOps).",
    icon: "brain-circuit",
    accent: "indigo",
    subcategories: [
      {
        slug: "ai-foundations",
        name: "AI foundations",
        description: "The programming, mathematics and data skills underneath every model.",
        technologies: ["python", "math-for-ml", "statistics", "numpy", "pandas"],
      },
      {
        slug: "machine-learning",
        name: "Machine learning",
        description: "Classical algorithms, model evaluation and scikit-learn.",
        technologies: ["machine-learning", "scikit-learn"],
      },
      {
        slug: "deep-learning",
        name: "Deep learning",
        description: "Neural networks and the frameworks that train them.",
        technologies: ["deep-learning", "pytorch", "tensorflow", "nlp", "computer-vision"],
      },
      {
        slug: "ai-engineering",
        name: "Modern AI engineering",
        description: "Building products on top of foundation models.",
        technologies: ["generative-ai", "llms", "prompt-engineering", "rag", "ai-agents", "mlops"],
      },
    ],
  },
  {
    slug: "ui-ux-design",
    name: "UI/UX Design",
    tagline: "Design interfaces people understand, enjoy and can actually use.",
    description:
      "Design principles, typography, colour, layout and hierarchy; user research, personas and journeys; wireframing, prototyping and Figma; and the systems, accessibility and handoff practices that turn designs into shipped products.",
    icon: "palette",
    accent: "orange",
    subcategories: [
      {
        slug: "design-foundations",
        name: "Design foundations",
        description: "Principles, typography, colour, spacing and visual hierarchy.",
        technologies: ["ux-fundamentals", "visual-design"],
      },
      {
        slug: "research",
        name: "Research & usability",
        description: "Understand people before you design for them, then test with them.",
        technologies: ["user-research", "usability-testing"],
      },
      {
        slug: "design-process",
        name: "Wireframes, prototypes & tools",
        description: "From sketch to interactive prototype.",
        technologies: ["wireframing-prototyping", "figma"],
      },
      {
        slug: "design-delivery",
        name: "Systems, accessibility & handoff",
        description: "Scale design quality and ship it faithfully.",
        technologies: ["design-systems", "web-accessibility", "responsive-design", "design-handoff"],
      },
    ],
  },
];
