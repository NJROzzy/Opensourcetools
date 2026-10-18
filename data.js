// Catalogue of free, open-source tools across eleven domains of computer
// science. Licences reflect each project's repository at time of writing;
// always verify before building on one.
window.ATLAS = {
  disciplines: [
    {id: "hardware", name: "Hardware", short: "Hardware"},
    {id: "software", name: "Software", short: "Software"},
    {id: "computation", name: "Computation", short: "Computation"},
    {id: "networks", name: "Computer Networks", short: "Networks"},
    {id: "data", name: "Data & Databases", short: "Data"},
    {id: "distributed", name: "Distributed Systems", short: "Distributed"},
    {id: "security", name: "Cybersecurity", short: "Security"},
    {id: "ai", name: "Artificial Intelligence", short: "AI"},
    {id: "ml", name: "Machine Learning", short: "ML"},
    {id: "robotics", name: "Robotics", short: "Robotics"},
    {id: "emerging", name: "Emerging Computing", short: "Emerging"},
  ],

  // Build tracks shown first on the page, in order, with each one's
  // common-path architecture in `architectures`.
  tracks: [
    {id: "web", group: "Software Engineering", name: "Web applications", blurb: "Sites, dashboards and full-stack products that run in the browser — from the interface down to the database and the server that delivers it."},
    {id: "mobile", group: "Software Engineering", name: "Mobile applications", blurb: "Apps for Android and iOS: cross-platform or native, offline-first, with a backend, notifications and an automated release path.", note: "Every tool here is open source. Publishing to Apple's App Store additionally requires Xcode, which is free but not open source; Android builds use the free Android SDK built from the Apache-2.0 Android Open Source Project."},
    {id: "aiml", group: "Intelligent Systems", name: "AI / ML", blurb: "From raw data to a served model and the applications on top — classical ML, deep learning and language-model systems."},
    {id: "robotics", group: "Intelligent Systems", name: "Robotics", blurb: "Machines that sense, decide and act — designed, simulated, programmed and taught with open tools."},
    {id: "data", group: "Systems & Infrastructure", name: "Data", blurb: "Moving, storing, transforming and analysing data, from a laptop to a cluster."},
    {id: "distributed", group: "Systems & Infrastructure", name: "Distributed systems", blurb: "Many machines acting as one reliable system: packaged, orchestrated, connected and observed."},
    {id: "networks", group: "Systems & Infrastructure", name: "Networks", blurb: "How computers reach each other — built, secured, inspected and studied."},
    {id: "security", group: "Systems & Infrastructure", name: "Security", blurb: "Protecting code, systems and networks: prevent, detect, respond and test."},
    {id: "hardware", group: "Foundations & Frontiers", name: "Hardware", blurb: "Boards, firmware and chips — from schematic to silicon layout."},
    {id: "computation", group: "Foundations & Frontiers", name: "Computation", blurb: "Mathematics, algorithms and proof: model it, compute it, optimise it, verify it."},
    {id: "emerging", group: "Foundations & Frontiers", name: "Emerging computing", blurb: "Paradigms beyond classical transistors — quantum and neuromorphic computing."},
  ],

  architectures: {
    web: {
      title: "The common path of a web application",
      stages: [
        {
          name: "Interface",
          role: "What the user sees and interacts with in the browser.",
          tools: [
            "React",
            "Vue.js",
            "Svelte",
            "Astro"
          ]
        },
        {
          name: "Build & style",
          role: "Types, bundling and styling that turn source into fast, consistent pages.",
          tools: [
            "TypeScript",
            "Vite",
            "Tailwind CSS"
          ]
        },
        {
          name: "Server & API",
          role: "Business logic and the API the interface calls; may also render pages on the server.",
          tools: [
            "Node.js",
            "Next.js",
            "Django",
            "FastAPI",
            "Go"
          ]
        },
        {
          name: "Data",
          role: "Durable storage, caching, search and the code that talks to them.",
          tools: [
            "PostgreSQL",
            "SQLite",
            "Prisma ORM",
            "Valkey",
            "Meilisearch"
          ]
        },
        {
          name: "Identity",
          role: "Sign-up, login and single sign-on, kept out of your own code.",
          tools: [
            "Keycloak",
            "Supabase",
            "PocketBase"
          ]
        },
        {
          name: "Test",
          role: "Automated checks that the app works the way users experience it.",
          tools: [
            "Playwright",
            "pytest"
          ]
        },
        {
          name: "Deliver",
          role: "HTTPS, routing and packaging that put the app on the internet.",
          tools: [
            "Caddy",
            "NGINX",
            "Docker Engine (Moby)"
          ]
        },
        {
          name: "Observe",
          role: "Metrics, traces and dashboards that show it working in production.",
          tools: [
            "OpenTelemetry",
            "Prometheus",
            "Grafana"
          ]
        }
      ]
    },
    mobile: {
      title: "The common path of a mobile application",
      stages: [
        {
          name: "UI framework",
          role: "How screens are built — one codebase for both platforms, or native Android.",
          tools: [
            "Flutter",
            "React Native",
            "Jetpack Compose",
            "Capacitor"
          ]
        },
        {
          name: "Language & tooling",
          role: "The language and project tooling around the framework.",
          tools: [
            "Kotlin",
            "TypeScript",
            "Expo"
          ]
        },
        {
          name: "On-device data",
          role: "Local storage so the app works offline and opens instantly.",
          tools: [
            "SQLite"
          ]
        },
        {
          name: "Backend & sync",
          role: "Accounts, data sync and files on a server you control.",
          tools: [
            "PocketBase",
            "Supabase",
            "Appwrite"
          ]
        },
        {
          name: "Notifications",
          role: "Reaching users when the app is closed.",
          tools: [
            "ntfy"
          ]
        },
        {
          name: "Test",
          role: "Driving the real app on emulators and devices.",
          tools: [
            "Maestro",
            "Detox"
          ]
        },
        {
          name: "Build & release",
          role: "Signing, versioning and publishing builds automatically.",
          tools: [
            "fastlane",
            "F-Droid"
          ]
        }
      ]
    },
    aiml: {
      title: "The common path of an AI / ML system",
      stages: [
        {
          name: "Data",
          role: "Collect, clean and version the data everything else depends on.",
          tools: [
            "pandas",
            "Polars",
            "DuckDB",
            "DVC"
          ]
        },
        {
          name: "Explore",
          role: "Understand the data and prototype ideas interactively.",
          tools: [
            "Jupyter"
          ]
        },
        {
          name: "Model",
          role: "Choose and train the model — classical, deep or pretrained.",
          tools: [
            "scikit-learn",
            "XGBoost",
            "PyTorch",
            "JAX",
            "Hugging Face Transformers"
          ]
        },
        {
          name: "Scale",
          role: "Spread training and data processing across machines.",
          tools: [
            "Ray",
            "Apache Spark"
          ]
        },
        {
          name: "Track",
          role: "Record every experiment so results can be compared and reproduced.",
          tools: [
            "MLflow"
          ]
        },
        {
          name: "Serve",
          role: "Run the model behind an API, on a server or on a device.",
          tools: [
            "vLLM",
            "Ollama",
            "ONNX Runtime",
            "llama.cpp"
          ]
        },
        {
          name: "Apply",
          role: "Retrieval, agents and tools that turn a model into a product.",
          tools: [
            "LlamaIndex",
            "LangChain",
            "Qdrant",
            "Model Context Protocol"
          ]
        },
        {
          name: "Monitor",
          role: "Watch latency, errors and drift once real users arrive.",
          tools: [
            "Prometheus",
            "Grafana"
          ]
        }
      ]
    },
    robotics: {
      title: "The common path of a robot",
      stages: [
        {
          name: "Design",
          role: "Mechanical parts and the electronics that carry sensors and motors.",
          tools: [
            "FreeCAD",
            "KiCad"
          ]
        },
        {
          name: "Low-level control",
          role: "Firmware on the microcontroller or flight controller.",
          tools: [
            "Arduino IDE",
            "PX4",
            "ArduPilot",
            "Zephyr RTOS"
          ]
        },
        {
          name: "Middleware",
          role: "The robot's nervous system — every component talks through it.",
          tools: [
            "ROS 2"
          ]
        },
        {
          name: "Perceive",
          role: "Turn camera and sensor data into an understanding of the world.",
          tools: [
            "OpenCV",
            "PyTorch"
          ]
        },
        {
          name: "Plan & act",
          role: "Decide where to go and how to move safely.",
          tools: [
            "Nav2",
            "MoveIt 2",
            "Drake"
          ]
        },
        {
          name: "Simulate",
          role: "Test everything in a virtual world before risking hardware.",
          tools: [
            "Gazebo",
            "MuJoCo",
            "Webots",
            "Genesis"
          ]
        },
        {
          name: "Learn",
          role: "Teach skills from demonstrations or trial and error.",
          tools: [
            "LeRobot",
            "Ray",
            "JAX"
          ]
        },
        {
          name: "Fleet",
          role: "Collect telemetry from many robots and watch them.",
          tools: [
            "NATS",
            "Grafana"
          ]
        }
      ]
    },
    data: {
      title: "The common path of a data platform",
      stages: [
        {
          name: "Ingest",
          role: "Capture events and records as they happen.",
          tools: [
            "Apache Kafka",
            "NATS"
          ]
        },
        {
          name: "Store",
          role: "Keep data in the engine that suits how it is queried.",
          tools: [
            "PostgreSQL",
            "ClickHouse",
            "DuckDB"
          ]
        },
        {
          name: "Transform",
          role: "Clean and model raw data into trustworthy tables.",
          tools: [
            "dbt Core",
            "Apache Spark",
            "Polars"
          ]
        },
        {
          name: "Orchestrate",
          role: "Run pipelines on schedule, with retries and lineage.",
          tools: [
            "Apache Airflow"
          ]
        },
        {
          name: "Exchange",
          role: "Move tables between tools without copying.",
          tools: [
            "Apache Arrow"
          ]
        },
        {
          name: "Search",
          role: "Find records by text or by meaning.",
          tools: [
            "Meilisearch",
            "Qdrant",
            "pgvector"
          ]
        },
        {
          name: "Visualise",
          role: "Put the numbers in front of people.",
          tools: [
            "Grafana",
            "Jupyter"
          ]
        }
      ]
    },
    distributed: {
      title: "The common path of a distributed system",
      stages: [
        {
          name: "Build",
          role: "Languages suited to concurrent network services.",
          tools: [
            "Go",
            "Rust"
          ]
        },
        {
          name: "Package",
          role: "Freeze each service with its dependencies.",
          tools: [
            "Docker Engine (Moby)"
          ]
        },
        {
          name: "Provision",
          role: "Declare servers, networks and clusters as code.",
          tools: [
            "OpenTofu"
          ]
        },
        {
          name: "Orchestrate",
          role: "Schedule, heal and scale services; agree on shared state.",
          tools: [
            "Kubernetes",
            "etcd"
          ]
        },
        {
          name: "Connect",
          role: "How services call and message each other.",
          tools: [
            "gRPC",
            "Envoy",
            "NATS",
            "Apache Kafka"
          ]
        },
        {
          name: "Observe",
          role: "Traces, metrics and dashboards across every service.",
          tools: [
            "OpenTelemetry",
            "Prometheus",
            "Grafana"
          ]
        },
        {
          name: "Secure",
          role: "Secrets and scanning built into the platform.",
          tools: [
            "OpenBao",
            "Trivy"
          ]
        }
      ]
    },
    networks: {
      title: "The common path of a networked system",
      stages: [
        {
          name: "Model",
          role: "Design and study a network before building it.",
          tools: [
            "Mininet",
            "ns-3"
          ]
        },
        {
          name: "Edge",
          role: "Serve and route traffic arriving from the internet.",
          tools: [
            "Caddy",
            "NGINX",
            "Envoy"
          ]
        },
        {
          name: "Encrypt",
          role: "Private tunnels and TLS for everything in transit.",
          tools: [
            "WireGuard",
            "OpenSSL",
            "Certbot"
          ]
        },
        {
          name: "Message",
          role: "Protocols for devices and services to talk.",
          tools: [
            "Eclipse Mosquitto",
            "NATS",
            "gRPC"
          ]
        },
        {
          name: "Inspect",
          role: "See exactly what is on the wire.",
          tools: [
            "Wireshark",
            "curl"
          ]
        },
        {
          name: "Monitor",
          role: "Watch traffic and health continuously.",
          tools: [
            "Zeek",
            "Prometheus",
            "Grafana"
          ]
        }
      ]
    },
    security: {
      title: "The common path of a secure system",
      stages: [
        {
          name: "Code",
          role: "Find insecure patterns before they are merged.",
          tools: [
            "Semgrep CE"
          ]
        },
        {
          name: "Supply chain",
          role: "Check dependencies and images for known flaws.",
          tools: [
            "Trivy"
          ]
        },
        {
          name: "Secrets & identity",
          role: "Keep keys out of code; centralise login.",
          tools: [
            "OpenBao",
            "Keycloak"
          ]
        },
        {
          name: "Transport",
          role: "Encrypt every connection.",
          tools: [
            "OpenSSL",
            "Certbot",
            "WireGuard"
          ]
        },
        {
          name: "Detect",
          role: "Spot attacks on the network as they happen.",
          tools: [
            "Zeek",
            "Suricata"
          ]
        },
        {
          name: "Respond",
          role: "Correlate events across machines and act.",
          tools: [
            "Wazuh"
          ]
        },
        {
          name: "Test & analyse",
          role: "Attack your own systems and take binaries apart — with permission.",
          tools: [
            "ZAP",
            "Metasploit Framework",
            "Ghidra",
            "Wireshark"
          ]
        }
      ]
    },
    hardware: {
      title: "The common path of a hardware project",
      stages: [
        {
          name: "Board",
          role: "Schematic and printed-circuit-board layout.",
          tools: [
            "KiCad"
          ]
        },
        {
          name: "Enclosure",
          role: "The mechanical parts that hold it together.",
          tools: [
            "FreeCAD"
          ]
        },
        {
          name: "Firmware",
          role: "Code that runs on the microcontroller.",
          tools: [
            "Zephyr RTOS",
            "Arduino IDE",
            "PlatformIO"
          ]
        },
        {
          name: "Emulate",
          role: "Run and test firmware without the board.",
          tools: [
            "QEMU"
          ]
        },
        {
          name: "Chip: simulate",
          role: "For custom silicon — prove the design computes correctly.",
          tools: [
            "Verilator"
          ]
        },
        {
          name: "Chip: synthesise",
          role: "Turn the design into gates, or an FPGA bitstream.",
          tools: [
            "Yosys"
          ]
        },
        {
          name: "Chip: lay out",
          role: "Place and route the gates into a manufacturable layout.",
          tools: [
            "OpenROAD"
          ]
        }
      ]
    },
    computation: {
      title: "The common path of a computational project",
      stages: [
        {
          name: "Model",
          role: "State the problem exactly, symbolically if possible.",
          tools: [
            "SymPy"
          ]
        },
        {
          name: "Compute",
          role: "Solve it numerically at speed.",
          tools: [
            "Julia",
            "NumPy",
            "GNU Octave",
            "JAX"
          ]
        },
        {
          name: "Optimise",
          role: "Search for the best answer under constraints.",
          tools: [
            "OR-Tools"
          ]
        },
        {
          name: "Verify",
          role: "Prove the method correct and check its edge cases.",
          tools: [
            "Lean 4",
            "Z3"
          ]
        },
        {
          name: "Implement",
          role: "Compile a fast, safe implementation.",
          tools: [
            "Rust",
            "GHC (Haskell)",
            "LLVM"
          ]
        },
        {
          name: "Communicate",
          role: "Share the reasoning alongside the results.",
          tools: [
            "Jupyter"
          ]
        }
      ]
    },
    emerging: {
      title: "The common path of an emerging-computing experiment",
      stages: [
        {
          name: "Notebook",
          role: "Where experiments are written and explained.",
          tools: [
            "Jupyter"
          ]
        },
        {
          name: "Circuits",
          role: "Build and run quantum circuits on simulators or hardware.",
          tools: [
            "Qiskit",
            "Cirq"
          ]
        },
        {
          name: "Physics",
          role: "Model noise and the physics of real devices.",
          tools: [
            "QuTiP"
          ]
        },
        {
          name: "Hybrid learning",
          role: "Train quantum circuits inside classical neural networks.",
          tools: [
            "PennyLane",
            "PyTorch"
          ]
        },
        {
          name: "Neuromorphic",
          role: "Brain-inspired spiking networks and chips.",
          tools: [
            "snnTorch",
            "Lava"
          ]
        }
      ]
    }
  },

  // domains: [primary, ...also]. foundation: shown on the map's ground when
  // none of its domains is among the three chosen.
  tools: [
    {domains: ["software"], name: "Linux", logo: "logos/linux.svg", kind: "Operating system", license: "GPL-2.0", url: "https://kernel.org", desc: "The kernel beneath nearly every server, robot, and research cluster.", foundation: true},
    {domains: ["software"], name: "Git", logo: "logos/git.svg", kind: "Version control", license: "GPL-2.0", url: "https://git-scm.com", desc: "Distributed version control — the ledger of every serious project.", foundation: true},
    {domains: ["software","computation"], name: "Python", logo: "logos/python.svg", kind: "Language", license: "PSF", url: "https://www.python.org", desc: "The lingua franca of research code, data work, and AI.", foundation: true},
    {domains: ["software"], name: "Rust", logo: "logos/rust.svg", kind: "Language", license: "MIT / Apache-2.0", url: "https://www.rust-lang.org", desc: "Memory-safe systems programming without a garbage collector."},
    {domains: ["computation","software"], name: "LLVM", logo: "logos/llvm.svg", kind: "Compiler infrastructure", license: "Apache-2.0", url: "https://llvm.org", desc: "Modular compiler toolchain behind Clang, Rust, Swift and ML compilers."},
    {domains: ["software"], name: "VS Code (Code OSS)", logo: "logos/vscode.png", kind: "Editor", license: "MIT", url: "https://github.com/microsoft/vscode", desc: "The open-source core of the most widely used code editor.", foundation: true},
    {domains: ["software"], name: "Neovim", logo: "logos/neovim.svg", kind: "Editor", license: "Apache-2.0", url: "https://neovim.io", desc: "Hyper-extensible, keyboard-driven editing with built-in LSP."},
    {domains: ["distributed","software"], name: "Docker Engine (Moby)", logo: "logos/docker.svg", kind: "Containers", license: "Apache-2.0", url: "https://mobyproject.org", desc: "Package software and its environment into reproducible containers.", foundation: true},
    {domains: ["distributed"], name: "Kubernetes", logo: "logos/kubernetes.svg", kind: "Orchestration", license: "Apache-2.0", url: "https://kubernetes.io", desc: "Schedule and scale containerised workloads across machines."},
    {domains: ["data"], name: "PostgreSQL", logo: "logos/postgresql.svg", kind: "Database", license: "PostgreSQL", url: "https://www.postgresql.org", desc: "The rigorous relational database; with pgvector, a vector store too."},
    {domains: ["data"], name: "SQLite", logo: "logos/sqlite.svg", kind: "Database", license: "Public domain", url: "https://sqlite.org", desc: "A full SQL engine in a single file — embedded everywhere."},
    {domains: ["data","distributed"], name: "Valkey", logo: "logos/valkey.png", kind: "In-memory store", license: "BSD-3-Clause", url: "https://valkey.io", desc: "Community-governed key-value store for caching, queues and pub/sub."},
    {domains: ["distributed","data"], name: "Grafana", logo: "logos/grafana.svg", kind: "Observability", license: "AGPL-3.0", url: "https://grafana.com/oss/grafana/", desc: "Dashboards and alerting over metrics, logs and traces."},
    {domains: ["ai","ml"], name: "Hugging Face Transformers", logo: "logos/transformers.svg", kind: "Model library", license: "Apache-2.0", url: "https://github.com/huggingface/transformers", desc: "Thousands of pretrained models for text, vision, audio and more."},
    {domains: ["ai"], name: "llama.cpp", logo: "logos/llamacpp.png", kind: "Local inference", license: "MIT", url: "https://github.com/ggml-org/llama.cpp", desc: "Run large language models on CPUs, laptops and edge devices."},
    {domains: ["ai"], name: "Ollama", logo: "logos/ollama.svg", kind: "Local inference", license: "MIT", url: "https://github.com/ollama/ollama", desc: "One command to pull and serve open-weight models locally."},
    {domains: ["ai","distributed"], name: "vLLM", logo: "logos/vllm.png", kind: "Serving", license: "Apache-2.0", url: "https://github.com/vllm-project/vllm", desc: "High-throughput LLM serving with PagedAttention."},
    {domains: ["ai"], name: "LangChain", logo: "logos/langchain.svg", kind: "Agent framework", license: "MIT", url: "https://github.com/langchain-ai/langchain", desc: "Compose models, tools and memory into LLM applications."},
    {domains: ["ai","data"], name: "LlamaIndex", logo: "logos/llamaindex.png", kind: "Retrieval (RAG)", license: "MIT", url: "https://github.com/run-llama/llama_index", desc: "Connect your documents and data to language models."},
    {domains: ["ai","robotics"], name: "Model Context Protocol", logo: "logos/mcp.svg", kind: "Agent standard", license: "MIT", url: "https://modelcontextprotocol.io", desc: "An open protocol for wiring AI agents to tools and data sources."},
    {domains: ["ai"], name: "Whisper", logo: "logos/whisper.png", kind: "Speech recognition", license: "MIT", url: "https://github.com/openai/whisper", desc: "Robust multilingual speech-to-text, runnable offline."},
    {domains: ["ai"], name: "ComfyUI", logo: "logos/comfyui.png", kind: "Image generation", license: "GPL-3.0", url: "https://github.com/comfyanonymous/ComfyUI", desc: "Node-graph workbench for diffusion and generative pipelines."},
    {domains: ["ai","ml"], name: "OLMo (AI2)", logo: "logos/olmo.png", kind: "Fully open model", license: "Apache-2.0", url: "https://allenai.org/olmo", desc: "Open weights, open data, open training code — a model you can study end to end."},
    {domains: ["ai"], name: "Qwen", logo: "logos/qwen.svg", kind: "Open-weight models", license: "Apache-2.0", url: "https://github.com/QwenLM", desc: "Capable open-weight language and vision models; use the Apache-2.0 releases."},
    {domains: ["ai"], name: "Mistral (open models)", logo: "logos/mistral.svg", kind: "Open-weight models", license: "Apache-2.0", url: "https://github.com/mistralai", desc: "Efficient open-weight models; use the Apache-2.0 releases such as Mistral Small."},
    {domains: ["ml","ai","robotics"], name: "PyTorch", logo: "logos/pytorch.svg", kind: "Deep learning", license: "BSD-3-Clause", url: "https://pytorch.org", desc: "The dominant research framework for neural networks."},
    {domains: ["ml","robotics","computation"], name: "JAX", logo: "logos/jax.png", kind: "Deep learning", license: "Apache-2.0", url: "https://github.com/jax-ml/jax", desc: "Composable transforms — grad, jit, vmap — for numerical research."},
    {domains: ["ml","ai"], name: "TensorFlow", logo: "logos/tensorflow.svg", kind: "Deep learning", license: "Apache-2.0", url: "https://www.tensorflow.org", desc: "Production-grade ML with mobile and edge deployment via LiteRT."},
    {domains: ["ml","ai"], name: "Keras", logo: "logos/keras.svg", kind: "High-level API", license: "Apache-2.0", url: "https://keras.io", desc: "Readable model building that runs atop JAX, PyTorch or TensorFlow."},
    {domains: ["ml"], name: "scikit-learn", logo: "logos/scikitlearn.svg", kind: "Classical ML", license: "BSD-3-Clause", url: "https://scikit-learn.org", desc: "The reference toolkit for regression, classification and clustering."},
    {domains: ["ml"], name: "XGBoost", logo: "logos/xgboost.png", kind: "Gradient boosting", license: "Apache-2.0", url: "https://xgboost.ai", desc: "Winning baseline for tabular data, at scale."},
    {domains: ["ml"], name: "LightGBM", logo: "logos/lightgbm.png", kind: "Gradient boosting", license: "MIT", url: "https://github.com/microsoft/LightGBM", desc: "Fast, memory-lean boosting on large tabular datasets."},
    {domains: ["ml","computation"], name: "NumPy", logo: "logos/numpy.svg", kind: "Numerics", license: "BSD-3-Clause", url: "https://numpy.org", desc: "N-dimensional arrays — the bedrock of scientific Python."},
    {domains: ["ml","data"], name: "Polars", logo: "logos/polars.svg", kind: "DataFrames", license: "MIT", url: "https://pola.rs", desc: "Lightning-fast columnar DataFrames written in Rust."},
    {domains: ["ml","data"], name: "pandas", logo: "logos/pandas.svg", kind: "DataFrames", license: "BSD-3-Clause", url: "https://pandas.pydata.org", desc: "The classic toolkit for wrangling tabular data."},
    {domains: ["ml","computation"], name: "Jupyter", logo: "logos/jupyter.svg", kind: "Notebooks", license: "BSD-3-Clause", url: "https://jupyter.org", desc: "Executable research notebooks mixing code, prose and plots."},
    {domains: ["ml"], name: "MLflow", logo: "logos/mlflow.svg", kind: "Experiment tracking", license: "Apache-2.0", url: "https://mlflow.org", desc: "Track runs, register models and reproduce results."},
    {domains: ["ml","data"], name: "DVC", logo: "logos/dvc.svg", kind: "Data versioning", license: "Apache-2.0", url: "https://dvc.org", desc: "Git-style versioning for datasets and pipelines."},
    {domains: ["ml","robotics","distributed"], name: "Ray", logo: "logos/ray.svg", kind: "Distributed compute", license: "Apache-2.0", url: "https://www.ray.io", desc: "Scale training, tuning and serving from a laptop to a cluster."},
    {domains: ["ml","robotics"], name: "ONNX Runtime", logo: "logos/onnx.svg", kind: "Inference", license: "MIT", url: "https://onnxruntime.ai", desc: "Portable, accelerated inference across hardware."},
    {domains: ["robotics","ai","ml"], name: "ROS 2", logo: "logos/ros2.svg", kind: "Middleware", license: "Apache-2.0", url: "https://www.ros.org", desc: "The standard nervous system for robot software."},
    {domains: ["robotics"], name: "Gazebo", logo: "logos/gazebo.png", kind: "Simulation", license: "Apache-2.0", url: "https://gazebosim.org", desc: "Physics simulation of robots and worlds, tightly paired with ROS 2."},
    {domains: ["robotics","ml"], name: "MuJoCo", logo: "logos/mujoco.png", kind: "Physics engine", license: "Apache-2.0", url: "https://mujoco.org", desc: "Fast, accurate contact dynamics for control and RL research."},
    {domains: ["robotics","ml"], name: "PyBullet", logo: "logos/pybullet.png", kind: "Physics engine", license: "zlib", url: "https://pybullet.org", desc: "Lightweight Python physics for prototyping and learning."},
    {domains: ["robotics","ml"], name: "Genesis", logo: "logos/genesis.png", kind: "Simulation", license: "Apache-2.0", url: "https://github.com/Genesis-Embodied-AI/Genesis", desc: "GPU-parallel generative physics platform for embodied AI."},
    {domains: ["robotics"], name: "Webots", logo: "logos/webots.png", kind: "Simulation", license: "Apache-2.0", url: "https://cyberbotics.com", desc: "Friendly desktop robot simulator with a large model library."},
    {domains: ["robotics"], name: "MoveIt 2", logo: "logos/moveit.png", kind: "Motion planning", license: "BSD-3-Clause", url: "https://moveit.ai", desc: "Manipulation, kinematics and collision-aware motion planning."},
    {domains: ["robotics"], name: "Nav2", logo: "logos/nav2.png", kind: "Navigation", license: "Apache-2.0", url: "https://nav2.org", desc: "Autonomous navigation stack for mobile robots on ROS 2."},
    {domains: ["robotics","computation"], name: "Drake", logo: "logos/drake.png", kind: "Modelling & control", license: "BSD-3-Clause", url: "https://drake.mit.edu", desc: "Model-based design, optimisation and verification of robots."},
    {domains: ["robotics","ai","ml"], name: "LeRobot", logo: "logos/lerobot.svg", kind: "Robot learning", license: "Apache-2.0", url: "https://github.com/huggingface/lerobot", desc: "Datasets, policies and tools for end-to-end learned robotics."},
    {domains: ["robotics","ai"], name: "OpenCV", logo: "logos/opencv.svg", kind: "Computer vision", license: "Apache-2.0", url: "https://opencv.org", desc: "Two decades of vision algorithms — cameras, calibration, tracking."},
    {domains: ["robotics","hardware"], name: "PX4", logo: "logos/px4.png", kind: "Flight control", license: "BSD-3-Clause", url: "https://px4.io", desc: "Autopilot firmware for drones and autonomous vehicles."},
    {domains: ["robotics","hardware"], name: "ArduPilot", logo: "logos/ardupilot.png", kind: "Flight control", license: "GPL-3.0", url: "https://ardupilot.org", desc: "Battle-tested autopilot for copters, planes, rovers and boats."},
    {domains: ["hardware"], name: "KiCad", logo: "logos/kicad.svg", kind: "PCB design", license: "GPL-3.0", url: "https://www.kicad.org", desc: "Schematic capture and printed-circuit-board layout, from idea to fabrication files."},
    {domains: ["hardware","computation"], name: "Verilator", logo: "logos/verilator.png", kind: "HDL simulation", license: "LGPL-3.0 / Artistic-2.0", url: "https://www.veripool.org/verilator/", desc: "The fastest open Verilog/SystemVerilog simulator — compiles hardware into C++."},
    {domains: ["hardware","computation"], name: "Yosys", logo: "logos/yosys.png", kind: "Logic synthesis", license: "ISC", url: "https://github.com/YosysHQ/yosys", desc: "Turns Verilog into gate-level netlists for FPGAs and chips."},
    {domains: ["hardware"], name: "OpenROAD", logo: "logos/openroad.png", kind: "Chip layout (RTL→GDS)", license: "BSD-3-Clause", url: "https://theopenroadproject.org", desc: "Automated place-and-route that takes a design all the way to silicon layout."},
    {domains: ["hardware","robotics"], name: "Arduino IDE", logo: "logos/arduino.svg", kind: "Microcontrollers", license: "AGPL-3.0", url: "https://github.com/arduino/arduino-ide", desc: "The friendliest path from a sketch to a blinking, sensing microcontroller."},
    {domains: ["hardware","software"], name: "Zephyr RTOS", logo: "logos/zephyr.png", kind: "Real-time OS", license: "Apache-2.0", url: "https://www.zephyrproject.org", desc: "A scalable real-time operating system for connected, resource-constrained devices."},
    {domains: ["hardware","software"], name: "PlatformIO", logo: "logos/platformio.svg", kind: "Embedded toolchain", license: "Apache-2.0", url: "https://platformio.org", desc: "One build system and library manager for hundreds of embedded boards."},
    {domains: ["hardware","software"], name: "QEMU", logo: "logos/qemu.svg", kind: "Emulator", license: "GPL-2.0", url: "https://www.qemu.org", desc: "Emulates whole machines and CPU architectures — run firmware without the board."},
    {domains: ["hardware","robotics"], name: "FreeCAD", logo: "logos/freecad.svg", kind: "Mechanical CAD", license: "LGPL-2.0+", url: "https://www.freecad.org", desc: "Parametric 3D modelling for enclosures, mechanisms and robot parts."},
    {domains: ["software","networks"], name: "Node.js", logo: "logos/nodejs.svg", kind: "JavaScript runtime", license: "MIT", url: "https://nodejs.org", desc: "Server-side JavaScript with a vast package ecosystem."},
    {domains: ["software"], name: "TypeScript", logo: "logos/typescript.svg", kind: "Language", license: "Apache-2.0", url: "https://www.typescriptlang.org", desc: "JavaScript with static types — large codebases stay understandable."},
    {domains: ["software","distributed"], name: "Go", logo: "logos/go.svg", kind: "Language", license: "BSD-3-Clause", url: "https://go.dev", desc: "Simple, fast, concurrent — the language of much cloud infrastructure."},
    {domains: ["software"], name: "React", logo: "logos/react.svg", kind: "UI library", license: "MIT", url: "https://react.dev", desc: "Component-based user interfaces for the web and beyond."},
    {domains: ["software"], name: "pytest", logo: "logos/pytest.svg", kind: "Testing", license: "MIT", url: "https://pytest.org", desc: "Readable, powerful tests for Python projects of any size."},
    {domains: ["computation","ml"], name: "Julia", logo: "logos/julia.svg", kind: "Language", license: "MIT", url: "https://julialang.org", desc: "High-performance numerical computing with the ease of a scripting language."},
    {domains: ["computation"], name: "SymPy", logo: "logos/sympy.svg", kind: "Symbolic maths", license: "BSD-3-Clause", url: "https://www.sympy.org", desc: "Computer algebra in pure Python — derive, simplify, solve exactly."},
    {domains: ["computation","software"], name: "Lean 4", logo: "logos/lean.png", kind: "Theorem prover", license: "Apache-2.0", url: "https://lean-lang.org", desc: "Write mathematics and programs, and have the machine check the proofs."},
    {domains: ["computation","security"], name: "Z3", logo: "logos/z3.png", kind: "SMT solver", license: "MIT", url: "https://github.com/Z3Prover/z3", desc: "Decides logical constraints — the engine behind many verifiers and security tools."},
    {domains: ["computation","software"], name: "GHC (Haskell)", logo: "logos/ghc.svg", kind: "Language", license: "BSD-3-Clause", url: "https://www.haskell.org/ghc/", desc: "Purely functional programming with a powerful type system."},
    {domains: ["computation","data"], name: "OR-Tools", logo: "logos/ortools.png", kind: "Optimisation", license: "Apache-2.0", url: "https://developers.google.com/optimization", desc: "Solvers for routing, scheduling, assignment and linear programming."},
    {domains: ["computation"], name: "GNU Octave", logo: "logos/octave.png", kind: "Numerical computing", license: "GPL-3.0", url: "https://octave.org", desc: "Matrix-oriented numerical computing, largely MATLAB-compatible."},
    {domains: ["networks","security"], name: "Wireshark", logo: "logos/wireshark.svg", kind: "Packet analysis", license: "GPL-2.0", url: "https://www.wireshark.org", desc: "See every packet on the wire, decoded across thousands of protocols."},
    {domains: ["networks"], name: "Mininet", logo: "logos/mininet.png", kind: "Network emulation", license: "BSD-style", url: "https://mininet.org", desc: "A realistic virtual network of hosts and switches on one laptop."},
    {domains: ["networks","computation"], name: "ns-3", logo: "logos/ns3.png", kind: "Network simulation", license: "GPL-2.0", url: "https://www.nsnam.org", desc: "Discrete-event simulation of networks, from Wi-Fi to 5G, for research."},
    {domains: ["networks","distributed"], name: "NGINX", logo: "logos/nginx.svg", kind: "Web server & proxy", license: "BSD-2-Clause", url: "https://nginx.org", desc: "High-performance web serving, reverse proxying and load balancing."},
    {domains: ["networks","security"], name: "Caddy", logo: "logos/caddy.svg", kind: "Web server", license: "Apache-2.0", url: "https://caddyserver.com", desc: "A web server with automatic HTTPS by default."},
    {domains: ["networks","security"], name: "WireGuard", logo: "logos/wireguard.svg", kind: "VPN", license: "GPL-2.0", url: "https://www.wireguard.com", desc: "A fast, modern VPN with a tiny, auditable codebase."},
    {domains: ["networks","distributed"], name: "Envoy", logo: "logos/envoy.svg", kind: "Service proxy", license: "Apache-2.0", url: "https://www.envoyproxy.io", desc: "Edge and service proxy for cloud-native applications."},
    {domains: ["networks","software"], name: "curl", logo: "logos/curl.svg", kind: "Transfer tool", license: "curl (MIT-style)", url: "https://curl.se", desc: "Transfers data over dozens of protocols — on billions of devices."},
    {domains: ["networks","distributed"], name: "gRPC", logo: "logos/grpc.png", kind: "RPC framework", license: "Apache-2.0", url: "https://grpc.io", desc: "Fast, typed remote procedure calls between services in any language."},
    {domains: ["networks","hardware"], name: "Eclipse Mosquitto", logo: "logos/mosquitto.svg", kind: "MQTT broker", license: "EPL-2.0 / EDL-1.0", url: "https://mosquitto.org", desc: "Lightweight publish/subscribe messaging for IoT devices."},
    {domains: ["data"], name: "DuckDB", logo: "logos/duckdb.svg", kind: "Analytical database", license: "MIT", url: "https://duckdb.org", desc: "In-process SQL analytics — query gigabytes of Parquet on a laptop."},
    {domains: ["data","distributed"], name: "Apache Kafka", logo: "logos/kafka.svg", kind: "Event streaming", license: "Apache-2.0", url: "https://kafka.apache.org", desc: "A durable, distributed log for real-time event streams."},
    {domains: ["data","distributed","ml"], name: "Apache Spark", logo: "logos/spark.svg", kind: "Distributed processing", license: "Apache-2.0", url: "https://spark.apache.org", desc: "Batch and streaming data processing across a cluster."},
    {domains: ["data"], name: "ClickHouse", logo: "logos/clickhouse.svg", kind: "Columnar database", license: "Apache-2.0", url: "https://clickhouse.com", desc: "Real-time analytical queries over billions of rows."},
    {domains: ["data","distributed"], name: "Apache Airflow", logo: "logos/airflow.svg", kind: "Workflow orchestration", license: "Apache-2.0", url: "https://airflow.apache.org", desc: "Schedule and monitor data pipelines written as Python code."},
    {domains: ["data"], name: "dbt Core", logo: "logos/dbt.png", kind: "Data transformation", license: "Apache-2.0", url: "https://github.com/dbt-labs/dbt-core", desc: "Version-controlled, tested SQL transformations for analytics."},
    {domains: ["data","computation"], name: "Apache Arrow", logo: "logos/arrow.svg", kind: "Columnar memory format", license: "Apache-2.0", url: "https://arrow.apache.org", desc: "A shared in-memory format so data tools exchange tables without copying."},
    {domains: ["data","ai"], name: "pgvector", logo: "logos/pgvector.png", kind: "Vector search", license: "PostgreSQL", url: "https://github.com/pgvector/pgvector", desc: "Vector similarity search inside PostgreSQL."},
    {domains: ["data","ai"], name: "Qdrant", logo: "logos/qdrant.svg", kind: "Vector database", license: "Apache-2.0", url: "https://qdrant.tech", desc: "A purpose-built engine for fast semantic and hybrid search."},
    {domains: ["distributed"], name: "Prometheus", logo: "logos/prometheus.svg", kind: "Monitoring", license: "Apache-2.0", url: "https://prometheus.io", desc: "Metrics collection and alerting for dynamic systems."},
    {domains: ["distributed"], name: "etcd", logo: "logos/etcd.svg", kind: "Consensus store", license: "Apache-2.0", url: "https://etcd.io", desc: "A Raft-based key-value store for configuration and coordination."},
    {domains: ["distributed","software"], name: "OpenTofu", logo: "logos/opentofu.svg", kind: "Infrastructure as code", license: "MPL-2.0", url: "https://opentofu.org", desc: "Declare infrastructure in code; the community-governed fork of Terraform."},
    {domains: ["distributed","networks"], name: "OpenTelemetry", logo: "logos/opentelemetry.svg", kind: "Observability standard", license: "Apache-2.0", url: "https://opentelemetry.io", desc: "Vendor-neutral traces, metrics and logs across services."},
    {domains: ["distributed","networks"], name: "NATS", logo: "logos/nats.svg", kind: "Messaging", license: "Apache-2.0", url: "https://nats.io", desc: "Simple, high-performance messaging from cloud to edge."},
    {domains: ["security","networks"], name: "OpenSSL", logo: "logos/openssl.svg", kind: "Cryptography", license: "Apache-2.0", url: "https://www.openssl.org", desc: "The TLS and crypto library securing much of the internet — now with post-quantum algorithms."},
    {domains: ["security","networks"], name: "Suricata", logo: "logos/suricata.png", kind: "Intrusion detection", license: "GPL-2.0", url: "https://suricata.io", desc: "High-performance intrusion detection and prevention engine."},
    {domains: ["security","networks"], name: "Zeek", logo: "logos/zeek.png", kind: "Network monitoring", license: "BSD-3-Clause", url: "https://zeek.org", desc: "Turns network traffic into rich, searchable security logs."},
    {domains: ["security"], name: "Metasploit Framework", logo: "logos/metasploit.svg", kind: "Penetration testing", license: "BSD-3-Clause", url: "https://github.com/rapid7/metasploit-framework", desc: "The standard framework for authorised exploit testing."},
    {domains: ["security","software"], name: "ZAP", logo: "logos/zap.svg", kind: "Web app scanner", license: "Apache-2.0", url: "https://www.zaproxy.org", desc: "Finds vulnerabilities in web applications while you browse or test."},
    {domains: ["security","software"], name: "Ghidra", logo: "logos/ghidra.png", kind: "Reverse engineering", license: "Apache-2.0", url: "https://ghidra-sre.org", desc: "Disassembles and decompiles binaries and firmware for analysis."},
    {domains: ["security","distributed"], name: "Trivy", logo: "logos/trivy.svg", kind: "Vulnerability scanner", license: "Apache-2.0", url: "https://trivy.dev", desc: "Scans containers, dependencies and infrastructure code for known flaws."},
    {domains: ["security","distributed"], name: "OpenBao", logo: "logos/openbao.png", kind: "Secrets management", license: "MPL-2.0", url: "https://openbao.org", desc: "Stores and issues secrets and keys; the community fork of Vault."},
    {domains: ["security"], name: "Wazuh", logo: "logos/wazuh.png", kind: "SIEM & XDR", license: "GPL-2.0", url: "https://wazuh.com", desc: "Collects and correlates security events across machines."},
    {domains: ["security","software"], name: "Semgrep CE", logo: "logos/semgrep.png", kind: "Static analysis", license: "LGPL-2.1", url: "https://github.com/semgrep/semgrep", desc: "Pattern-based code scanning for bugs and insecure code."},
    {domains: ["security","networks"], name: "Certbot", logo: "logos/certbot.svg", kind: "TLS certificates", license: "Apache-2.0", url: "https://certbot.eff.org", desc: "Obtains and renews free Let's Encrypt certificates automatically."},
    {domains: ["emerging","computation"], name: "Qiskit", logo: "logos/qiskit.svg", kind: "Quantum SDK", license: "Apache-2.0", url: "https://www.ibm.com/quantum/qiskit", desc: "Build, optimise and run quantum circuits on simulators and real hardware."},
    {domains: ["emerging","computation"], name: "Cirq", logo: "logos/cirq.png", kind: "Quantum SDK", license: "Apache-2.0", url: "https://quantumai.google/cirq", desc: "Write and simulate quantum circuits close to the hardware."},
    {domains: ["emerging","ml"], name: "PennyLane", logo: "logos/pennylane.png", kind: "Quantum ML", license: "Apache-2.0", url: "https://pennylane.ai", desc: "Differentiable quantum programming that plugs into PyTorch and JAX."},
    {domains: ["emerging","computation"], name: "QuTiP", logo: "logos/qutip.png", kind: "Quantum simulation", license: "BSD-3-Clause", url: "https://qutip.org", desc: "Simulates open quantum systems — noise, decoherence and dynamics."},
    {domains: ["emerging","ml"], name: "Lava", logo: "logos/lava.png", kind: "Neuromorphic framework", license: "BSD-3-Clause / LGPL-2.1", url: "https://lava-nc.org", desc: "Programs neuromorphic chips and simulates spiking networks."},
    {domains: ["emerging","ml"], name: "snnTorch", kind: "Spiking neural nets", license: "MIT", url: "https://snntorch.readthedocs.io", desc: "Trains brain-inspired spiking neural networks with PyTorch."},
    {domains: ["software"], name: "Vue.js", logo: "logos/vuejs.svg", kind: "UI framework", license: "MIT", url: "https://vuejs.org", desc: "An approachable, progressive framework for web interfaces."},
    {domains: ["software"], name: "Svelte", logo: "logos/svelte.svg", kind: "UI framework", license: "MIT", url: "https://svelte.dev", desc: "Compiles components to lean JavaScript; SvelteKit adds routing and server rendering."},
    {domains: ["software","networks"], name: "Next.js", logo: "logos/nextjs.svg", kind: "Full-stack React framework", license: "MIT", url: "https://nextjs.org", desc: "Server rendering, routing and API routes for React applications."},
    {domains: ["software"], name: "Astro", logo: "logos/astro.svg", kind: "Content site framework", license: "MIT", url: "https://astro.build", desc: "Fast content-first sites that ship almost no JavaScript by default."},
    {domains: ["software"], name: "Tailwind CSS", logo: "logos/tailwind.svg", kind: "Styling", license: "MIT", url: "https://tailwindcss.com", desc: "Utility-first CSS for building consistent designs quickly."},
    {domains: ["software"], name: "Vite", logo: "logos/vite.svg", kind: "Build tool", license: "MIT", url: "https://vite.dev", desc: "Instant dev server and optimised production builds for the web."},
    {domains: ["software","networks"], name: "Django", logo: "logos/django.svg", kind: "Web framework", license: "BSD-3-Clause", url: "https://www.djangoproject.com", desc: "Batteries-included Python web framework with an admin, ORM and auth."},
    {domains: ["software","networks"], name: "FastAPI", logo: "logos/fastapi.svg", kind: "API framework", license: "MIT", url: "https://fastapi.tiangolo.com", desc: "Typed, fast Python APIs with automatic interactive documentation."},
    {domains: ["software","data"], name: "Prisma ORM", logo: "logos/prisma.svg", kind: "Database toolkit", license: "Apache-2.0", url: "https://github.com/prisma/prisma", desc: "Type-safe database access and migrations for TypeScript."},
    {domains: ["software"], name: "Playwright", logo: "logos/playwright.svg", kind: "End-to-end testing", license: "Apache-2.0", url: "https://playwright.dev", desc: "Drives real browsers to test web apps exactly as users experience them."},
    {domains: ["security","software"], name: "Keycloak", logo: "logos/keycloak.svg", kind: "Identity & SSO", license: "Apache-2.0", url: "https://www.keycloak.org", desc: "Single sign-on, social login and user management you host yourself."},
    {domains: ["software","data"], name: "Supabase", logo: "logos/supabase.svg", kind: "Backend platform", license: "Apache-2.0", url: "https://github.com/supabase/supabase", desc: "Postgres with auth, storage, realtime and instant APIs — self-hostable."},
    {domains: ["data","software"], name: "Meilisearch", logo: "logos/meilisearch.svg", kind: "Search engine", license: "MIT", url: "https://www.meilisearch.com", desc: "Typo-tolerant instant search for sites and apps."},
    {domains: ["software","data"], name: "PocketBase", logo: "logos/pocketbase.svg", kind: "Backend in one file", license: "MIT", url: "https://pocketbase.io", desc: "Database, auth, files and realtime in a single executable."},
    {domains: ["software","data"], name: "Appwrite", logo: "logos/appwrite.svg", kind: "Backend platform", license: "BSD-3-Clause", url: "https://appwrite.io", desc: "Self-hosted backend for web and mobile: auth, databases, storage, functions."},
    {domains: ["software"], name: "Flutter", logo: "logos/flutter.svg", kind: "Cross-platform UI", license: "BSD-3-Clause", url: "https://flutter.dev", desc: "One Dart codebase for Android, iOS, web and desktop with native performance."},
    {domains: ["software"], name: "React Native", logo: "logos/reactnative.svg", kind: "Cross-platform UI", license: "MIT", url: "https://reactnative.dev", desc: "Native mobile apps written in React and TypeScript."},
    {domains: ["software"], name: "Expo", logo: "logos/expo.svg", kind: "React Native framework", license: "MIT", url: "https://github.com/expo/expo", desc: "Tooling and native modules that make React Native apps quick to build."},
    {domains: ["software"], name: "Kotlin", logo: "logos/kotlin.svg", kind: "Language", license: "Apache-2.0", url: "https://kotlinlang.org", desc: "The modern language for Android, also on server and multiplatform."},
    {domains: ["software"], name: "Jetpack Compose", logo: "logos/compose.svg", kind: "Android UI toolkit", license: "Apache-2.0", url: "https://developer.android.com/compose", desc: "Declarative native Android interfaces in Kotlin."},
    {domains: ["software"], name: "Capacitor", logo: "logos/capacitor.svg", kind: "Web-to-native runtime", license: "MIT", url: "https://capacitorjs.com", desc: "Ships an existing web app as a native mobile app with device APIs."},
    {domains: ["software"], name: "fastlane", logo: "logos/fastlane.svg", kind: "Release automation", license: "MIT", url: "https://fastlane.tools", desc: "Automates builds, signing, screenshots and store releases."},
    {domains: ["software"], name: "Maestro", logo: "logos/maestro.png", kind: "Mobile UI testing", license: "Apache-2.0", url: "https://github.com/mobile-dev-inc/maestro", desc: "Readable end-to-end UI tests for mobile apps."},
    {domains: ["software"], name: "Detox", logo: "logos/detox.png", kind: "Mobile UI testing", license: "MIT", url: "https://github.com/wix/Detox", desc: "Grey-box end-to-end testing for React Native apps."},
    {domains: ["software","security"], name: "F-Droid", logo: "logos/fdroid.svg", kind: "App distribution", license: "GPL-3.0 / AGPL-3.0", url: "https://f-droid.org", desc: "A catalogue and build service for free and open-source Android apps."},
    {domains: ["networks","software"], name: "ntfy", logo: "logos/ntfy.svg", kind: "Push notifications", license: "Apache-2.0 / GPL-2.0", url: "https://ntfy.sh", desc: "Self-hostable push notifications to phones over simple HTTP."},
  ],

  // Projects, each in one build track and tagged with the domains it
  // combines. The map places a project by its domains.
  projects: [
    {track: "aiml", name: "Private document assistant", short: "Doc assistant", domains: ["ai","data"], desc: "Chat with your own PDFs and notes, fully offline, using retrieval-augmented generation.", tools: ["Ollama","LlamaIndex","PostgreSQL","Qwen"]},
    {track: "aiml", name: "Meeting transcriber & summariser", short: "Meeting transcriber", domains: ["ai"], desc: "Record, transcribe, then summarise discussions into action items.", tools: ["Whisper","llama.cpp","SQLite"]},
    {track: "aiml", name: "Tool-using agent", short: "Tool-using agent", domains: ["ai","software"], desc: "An assistant that searches, files tickets and queries databases through open protocol servers.", tools: ["Model Context Protocol","LangChain","Ollama"]},
    {track: "aiml", name: "Tabular prediction model", short: "Tabular predictor", domains: ["ml","data"], desc: "Forecast churn, prices or risk from structured data with a tracked, reproducible pipeline.", tools: ["pandas","scikit-learn","XGBoost","MLflow"]},
    {track: "aiml", name: "Reproducible research pipeline", short: "Research pipeline", domains: ["ml","software"], desc: "Version data, notebooks and models so every figure in a paper can be regenerated.", tools: ["Jupyter","DVC","PyTorch","Git"]},
    {track: "aiml", name: "Large-scale data analysis", short: "Big-data analysis", domains: ["ml","data"], desc: "Explore millions of rows and train boosted models on a single machine.", tools: ["Polars","LightGBM","Jupyter"]},
    {track: "robotics", name: "Autonomous mobile robot", short: "Mobile robot", domains: ["robotics"], desc: "Map a room, localise and navigate around obstacles — first in simulation, then on hardware.", tools: ["ROS 2","Nav2","Gazebo"]},
    {track: "robotics", name: "Survey drone mission", short: "Survey drone", domains: ["robotics","hardware"], desc: "Plan and fly waypoint missions with failsafes, tested in software-in-the-loop.", tools: ["PX4","ROS 2","Gazebo"]},
    {track: "robotics", name: "Robot arm motion planner", short: "Arm planner", domains: ["robotics","computation"], desc: "Collision-free trajectories for a manipulator, with verified dynamics.", tools: ["MoveIt 2","Drake","ROS 2"]},
    {track: "aiml", name: "Fine-tune an open model", short: "Fine-tune an LLM", domains: ["ai","ml"], desc: "Adapt an open-weight language model to your domain, then serve it at speed.", tools: ["Hugging Face Transformers","PyTorch","OLMo (AI2)","vLLM"]},
    {track: "aiml", name: "Custom image generator", short: "Image generator", domains: ["ai","ml"], desc: "Train a style adapter and compose a reusable generation workflow.", tools: ["ComfyUI","PyTorch","Hugging Face Transformers"]},
    {track: "aiml", name: "Evaluated RAG system", short: "Evaluated RAG", domains: ["ai","ml","data"], desc: "Measure retrieval and answer quality across experiments, not by vibes.", tools: ["LlamaIndex","MLflow","Qwen","PostgreSQL"]},
    {track: "robotics", name: "Legged locomotion via RL", short: "RL walking", domains: ["ml","robotics"], desc: "Train a walking policy across thousands of parallel simulated robots.", tools: ["MuJoCo","JAX","Ray"]},
    {track: "robotics", name: "Vision-guided pick & place", short: "Pick & place", domains: ["ml","robotics"], desc: "Detect objects with a trained network and plan grasps for an arm.", tools: ["OpenCV","PyTorch","MoveIt 2","ROS 2"]},
    {track: "robotics", name: "Edge perception on a rover", short: "Edge rover", domains: ["ml","robotics","hardware"], desc: "Run a compact detector on-board for obstacle and lane awareness.", tools: ["ONNX Runtime","OpenCV","Nav2"]},
    {track: "robotics", name: "Voice-commanded robot", short: "Voice robot", domains: ["ai","robotics"], desc: "Speak a goal; the robot transcribes, reasons, and dispatches a navigation task.", tools: ["Whisper","Ollama","ROS 2","Nav2"]},
    {track: "robotics", name: "Agent-operated lab robot", short: "Agent lab robot", domains: ["ai","robotics"], desc: "Expose robot actions as protocol tools so an AI agent can run experiments.", tools: ["Model Context Protocol","ROS 2","MoveIt 2"]},
    {track: "robotics", name: "Vision-language-action robot", short: "VLA robot", domains: ["ai","ml","robotics"], desc: "Collect demonstrations, train a policy that maps camera + instruction to motion, deploy on a low-cost arm.", tools: ["LeRobot","PyTorch","Hugging Face Transformers","MuJoCo","ROS 2"]},
    {track: "robotics", name: "Sim-to-real humanoid skills", short: "Sim-to-real", domains: ["ai","ml","robotics"], desc: "Generate diverse simulated worlds, train at scale, and transfer behaviours to hardware.", tools: ["Genesis","PyTorch","Ray","ROS 2"]},
    {track: "distributed", name: "Self-hosted deployment platform", short: "Deploy platform", domains: ["distributed","software"], desc: "Containerise any project above, orchestrate it, and watch it in production.", tools: ["Docker Engine (Moby)","Kubernetes","Grafana","Linux"]},
    {track: "computation", name: "High-performance core library", short: "Core library", domains: ["software","computation"], desc: "Rewrite a hot path in a memory-safe systems language and bind it to Python.", tools: ["Rust","LLVM","Python"]},
    {track: "hardware", name: "Custom sensor PCB", short: "Sensor PCB", domains: ["hardware"], desc: "Design a sensor board, model its enclosure, and flash firmware onto it.", tools: ["KiCad","FreeCAD","PlatformIO"]},
    {track: "hardware", name: "Design and simulate a RISC-V core", short: "RISC-V core", domains: ["hardware","computation"], desc: "Write a small processor in Verilog, simulate it, synthesise it and lay it out as a chip.", tools: ["Git","Verilator","Yosys","OpenROAD"]},
    {track: "hardware", name: "IoT environmental monitor", short: "IoT monitor", domains: ["hardware","networks","data"], desc: "Battery sensors report temperature and air quality over MQTT to a dashboard.", tools: ["KiCad","Zephyr RTOS","PlatformIO","Eclipse Mosquitto","PostgreSQL","Grafana"]},
    {track: "hardware", name: "Firmware in an emulator", short: "Emulated firmware", domains: ["hardware","software"], desc: "Develop and test embedded firmware before the hardware even exists.", tools: ["QEMU","Zephyr RTOS","pytest"]},
    {track: "robotics", name: "Arduino robot car", short: "Robot car", domains: ["robotics","hardware"], desc: "A first robot: design the chassis, wire the board and program obstacle avoidance.", tools: ["Arduino IDE","FreeCAD","KiCad"]},
    {track: "web", name: "Full-stack web app", short: "Web app", domains: ["software","data","networks"], desc: "A typed web application with a database, served securely over HTTPS.", tools: ["TypeScript","React","Node.js","PostgreSQL","Caddy","Docker Engine (Moby)"]},
    {track: "computation", name: "Formally verified algorithm", short: "Verified algorithm", domains: ["computation","software"], desc: "Prove an algorithm correct, check edge cases automatically, then ship a fast implementation.", tools: ["Lean 4","Z3","Rust"]},
    {track: "computation", name: "Scientific simulation", short: "Scientific sim", domains: ["computation"], desc: "Derive equations symbolically and solve them numerically at speed.", tools: ["SymPy","Julia","Jupyter"]},
    {track: "computation", name: "Delivery route optimiser", short: "Route optimiser", domains: ["computation","data"], desc: "Plan the shortest delivery routes under time windows and vehicle limits.", tools: ["OR-Tools","Python","PostgreSQL"]},
    {track: "networks", name: "Network lab on a laptop", short: "Network lab", domains: ["networks","computation"], desc: "Build virtual topologies, watch protocols at the packet level, and simulate at scale.", tools: ["Mininet","Wireshark","ns-3"]},
    {track: "networks", name: "Self-hosted VPN & reverse proxy", short: "VPN & proxy", domains: ["networks","security"], desc: "Reach home services securely from anywhere, with automatic HTTPS.", tools: ["WireGuard","Caddy","Linux"]},
    {track: "data", name: "Real-time analytics pipeline", short: "Streaming analytics", domains: ["data","distributed"], desc: "Ingest events as they happen, process them in flight and query them in seconds.", tools: ["Apache Kafka","Apache Spark","ClickHouse","Apache Airflow","Grafana"]},
    {track: "data", name: "Analytics warehouse on a laptop", short: "Data warehouse", domains: ["data"], desc: "Model raw files into tested, documented analytics tables.", tools: ["DuckDB","dbt Core","Apache Airflow","Apache Arrow"]},
    {track: "data", name: "Semantic search engine", short: "Semantic search", domains: ["data","ai"], desc: "Search documents by meaning rather than keywords.", tools: ["Qdrant","Hugging Face Transformers","Python"]},
    {track: "data", name: "Big-data machine learning", short: "Big-data ML", domains: ["data","distributed","ml"], desc: "Train models on data too large for one machine, with every run tracked.", tools: ["Apache Spark","Apache Arrow","MLflow"]},
    {track: "distributed", name: "Observable microservices", short: "Microservices", domains: ["distributed","networks","software"], desc: "Services that talk over typed RPC, run on a cluster, and can be traced end to end.", tools: ["Go","gRPC","Envoy","Kubernetes","OpenTelemetry","Prometheus","Grafana"]},
    {track: "distributed", name: "Infrastructure as code", short: "Infra as code", domains: ["distributed","software"], desc: "Describe servers, networks and clusters in reviewed, versioned code.", tools: ["OpenTofu","Kubernetes","Git"]},
    {track: "distributed", name: "Build a Raft key-value store", short: "Raft KV store", domains: ["distributed","computation"], desc: "Implement consensus yourself, then compare with a production system.", tools: ["Go","etcd","gRPC"]},
    {track: "distributed", name: "Distributed LLM serving", short: "LLM cluster", domains: ["ai","distributed"], desc: "Serve open models to many users across GPUs, with autoscaling and metrics.", tools: ["vLLM","Kubernetes","Ray","Prometheus"]},
    {track: "distributed", name: "Robot fleet telemetry", short: "Fleet telemetry", domains: ["robotics","distributed","data"], desc: "Stream state from many robots into one queryable history.", tools: ["ROS 2","NATS","ClickHouse","Grafana"]},
    {track: "security", name: "Home network intrusion detection", short: "Intrusion detection", domains: ["security","networks"], desc: "Watch your own network for scans, malware and anomalies.", tools: ["Linux","Zeek","Suricata","Wazuh","Grafana"]},
    {track: "security", name: "Secure CI/CD pipeline", short: "Secure CI/CD", domains: ["security","software","distributed"], desc: "Every commit is scanned, every image checked, and no secret lives in code.", tools: ["Git","Semgrep CE","Docker Engine (Moby)","Trivy","OpenBao"]},
    {track: "security", name: "Firmware reverse-engineering lab", short: "Reverse-engineering lab", domains: ["security","hardware"], desc: "Take apart device firmware safely to understand and audit it.", tools: ["Ghidra","QEMU","Wireshark"]},
    {track: "security", name: "Web application pen-test lab", short: "Pen-test lab", domains: ["security","networks"], desc: "Practise authorised attacks against your own deliberately vulnerable apps.", tools: ["ZAP","Metasploit Framework","Wireshark"]},
    {track: "security", name: "Post-quantum TLS migration", short: "Post-quantum TLS", domains: ["security","networks"], desc: "Test servers and clients with post-quantum key exchange.", tools: ["OpenSSL","Caddy","Certbot"]},
    {track: "security", name: "AI-assisted security triage", short: "AI SOC triage", domains: ["ai","security"], desc: "Summarise and prioritise security alerts with a local model.", tools: ["Wazuh","Ollama","LlamaIndex"]},
    {track: "emerging", name: "Quantum algorithms playground", short: "Quantum algorithms", domains: ["emerging","computation"], desc: "Implement Grover and phase estimation, then study how noise degrades them.", tools: ["Jupyter","Qiskit","Cirq","QuTiP"]},
    {track: "emerging", name: "Hybrid quantum-classical ML", short: "Quantum ML", domains: ["emerging","ml"], desc: "Train a variational quantum circuit as a layer in a neural network.", tools: ["PennyLane","PyTorch","Jupyter"]},
    {track: "emerging", name: "Spiking-network robot controller", short: "Spiking controller", domains: ["emerging","ml","robotics"], desc: "Control a simulated robot with an energy-efficient spiking neural network.", tools: ["snnTorch","Lava","ROS 2","Gazebo"]},
    {track: "web", name: "Fast content site", short: "Content site", domains: ["software","networks"], desc: "A blog or documentation site that loads instantly, with search and HTTPS.", tools: ["Astro","Tailwind CSS","Meilisearch","Caddy"]},
    {track: "web", name: "Internal dashboard with single sign-on", short: "SSO dashboard", domains: ["software","security","data"], desc: "A company dashboard where staff sign in once and see live data.", tools: ["Svelte","FastAPI","PostgreSQL","Keycloak","Docker Engine (Moby)"]},
    {track: "web", name: "Search-first catalogue", short: "Search catalogue", domains: ["software","data"], desc: "A product or library catalogue where search is the main way in.", tools: ["Vue.js","Django","PostgreSQL","Meilisearch"]},
    {track: "web", name: "Realtime web app on a backend platform", short: "Realtime app", domains: ["software","data"], desc: "Live-updating collaborative features without writing a backend from scratch.", tools: ["Next.js","Supabase","Tailwind CSS","Playwright"]},
    {track: "mobile", name: "Cross-platform mobile app", short: "Cross-platform app", domains: ["software","data","networks"], desc: "One codebase on Android and iOS, offline-first, with accounts, sync and push notifications.", tools: ["Flutter","SQLite","PocketBase","ntfy","Maestro","fastlane"]},
    {track: "mobile", name: "React Native app with Expo", short: "Expo app", domains: ["software","data"], desc: "A JavaScript team's route to a native app, sharing skills with the web.", tools: ["React Native","Expo","TypeScript","Supabase","Detox"]},
    {track: "mobile", name: "Native Android app", short: "Android app", domains: ["software"], desc: "A fully native Android app published to an open app store.", tools: ["Kotlin","Jetpack Compose","SQLite","Maestro","F-Droid"]},
    {track: "mobile", name: "Offline-first field data app", short: "Field data app", domains: ["software","data"], desc: "Collect forms and photos where there is no signal; sync when back online.", tools: ["Flutter","SQLite","Appwrite"]},
    {track: "mobile", name: "Web app to mobile app", short: "Web-to-mobile", domains: ["software"], desc: "Wrap an existing web app as a store-ready mobile app with camera and storage access.", tools: ["Capacitor","Vue.js","Vite","fastlane"]},
  ],

  // Recommendation chains: tools in assembly order, with each one's role and
  // why it is needed. `project` matches a project name above.
  chains: [
    {
      project: "Private document assistant",
      level: "Beginner",
      goal: "Ask questions of your own PDFs and notes, with answers grounded in the source — fully offline.",
      steps: [
        {
          stage: "Ingest",
          tool: "LlamaIndex",
          role: "Loader & indexer",
          why: "Parses PDFs, docs and notes, splits them into passages and creates embeddings, so the right passage can be found for any question.",
          alt: "LangChain"
        },
        {
          stage: "Remember",
          tool: "PostgreSQL",
          role: "Vector memory",
          why: "With the pgvector extension it stores embeddings beside your metadata — one durable, queryable database instead of a separate vector store.",
          alt: "SQLite"
        },
        {
          stage: "Reason",
          tool: "Qwen",
          role: "The language model",
          why: "An open-weight model, Apache-2.0 for most sizes; small variants run on a laptop yet answer fluently from the retrieved passages.",
          alt: "Mistral (open models)"
        },
        {
          stage: "Serve",
          tool: "Ollama",
          role: "Local model server",
          why: "Downloads and runs the model with one command and exposes an API LlamaIndex can call — no data ever leaves your machine.",
          alt: "llama.cpp"
        },
        {
          stage: "Ship",
          tool: "Docker Engine (Moby)",
          role: "Packaging",
          why: "Bundles the app and database into containers so anyone can run the whole assistant with a single command."
        }
      ]
    },
    {
      project: "Tabular prediction model",
      level: "Beginner",
      goal: "Predict churn, prices or risk from spreadsheet-style data — with results you can reproduce and defend.",
      steps: [
        {
          stage: "Explore",
          tool: "Jupyter",
          role: "Lab notebook",
          why: "Interactive exploration: inspect distributions, plot relationships and write notes beside the code that produced them."
        },
        {
          stage: "Wrangle",
          tool: "pandas",
          role: "Data cleaning",
          why: "Joins tables, handles missing values and engineers features — the shape of your data decides the ceiling of your model.",
          alt: "Polars"
        },
        {
          stage: "Baseline",
          tool: "scikit-learn",
          role: "Splits, baselines & metrics",
          why: "Provides train/test splits, cross-validation and simple models; without an honest baseline you cannot tell if a fancier model helps."
        },
        {
          stage: "Model",
          tool: "XGBoost",
          role: "The predictor",
          why: "Gradient-boosted trees remain the strongest general method on tabular data, and handle mixed feature types well.",
          alt: "LightGBM"
        },
        {
          stage: "Record",
          tool: "MLflow",
          role: "Experiment ledger",
          why: "Logs every run's parameters, metrics and model file so you can compare attempts and reload the winner later."
        },
        {
          stage: "Version",
          tool: "DVC",
          role: "Data versioning",
          why: "Ties each dataset version to a Git commit, so a result months from now can be regenerated exactly."
        }
      ]
    },
    {
      project: "Autonomous mobile robot",
      level: "Intermediate",
      goal: "A wheeled robot that maps a room, knows where it is, and drives to a goal around obstacles.",
      steps: [
        {
          stage: "Foundation",
          tool: "Linux",
          role: "Operating system",
          why: "ROS 2 is developed and tested first on Ubuntu Linux; drivers, real-time tuning and tooling assume it."
        },
        {
          stage: "Backbone",
          tool: "ROS 2",
          role: "Robot middleware",
          why: "Connects sensors, drivers and algorithms as nodes that talk over topics — and gives you a huge library of existing drivers."
        },
        {
          stage: "Rehearse",
          tool: "Gazebo",
          role: "Simulator",
          why: "Simulated lidar, cameras and physics let you test navigation for hours before risking real hardware.",
          alt: "Webots"
        },
        {
          stage: "Perceive",
          tool: "OpenCV",
          role: "Camera processing",
          why: "Calibrates cameras and detects visual markers or features the robot can use as landmarks."
        },
        {
          stage: "Navigate",
          tool: "Nav2",
          role: "Planning & control",
          why: "Supplies localisation, global and local path planners, and recovery behaviours — the hardest parts of autonomy, ready to configure."
        }
      ]
    },
    {
      project: "Fine-tune an open model",
      level: "Advanced",
      goal: "Adapt an open language model to your domain's vocabulary and tasks, then serve it to users.",
      steps: [
        {
          stage: "Choose",
          tool: "OLMo (AI2)",
          role: "Base model",
          why: "Weights, training data and code are all open, so you can trace the model's behaviour back to what it learned.",
          alt: "Qwen"
        },
        {
          stage: "Load",
          tool: "Hugging Face Transformers",
          role: "Model toolkit",
          why: "Loads model and tokenizer in a few lines and provides training utilities, including parameter-efficient fine-tuning (LoRA)."
        },
        {
          stage: "Train",
          tool: "PyTorch",
          role: "Training engine",
          why: "Executes the forward and backward passes on your GPU; everything above it is built on PyTorch tensors.",
          alt: "JAX"
        },
        {
          stage: "Compare",
          tool: "MLflow",
          role: "Run comparison",
          why: "Fine-tuning is many small experiments — learning rates, data mixes — and you need a record of which one actually improved."
        },
        {
          stage: "Serve",
          tool: "vLLM",
          role: "High-throughput server",
          why: "Serves the fine-tuned model to many users at once, with an OpenAI-compatible API your apps can call.",
          alt: "Ollama"
        }
      ]
    },
    {
      project: "Vision-guided pick & place",
      level: "Advanced",
      goal: "A robot arm that recognises objects with a camera and picks them up reliably.",
      steps: [
        {
          stage: "Backbone",
          tool: "ROS 2",
          role: "Robot middleware",
          why: "Carries camera frames, detections and arm commands between components running at different rates."
        },
        {
          stage: "See",
          tool: "OpenCV",
          role: "Camera & calibration",
          why: "Captures images and performs hand-eye calibration, so a pixel can be converted into a position the arm can reach."
        },
        {
          stage: "Recognise",
          tool: "PyTorch",
          role: "Detector training",
          why: "Trains a neural network to find your specific objects in the camera image.",
          alt: "TensorFlow"
        },
        {
          stage: "Accelerate",
          tool: "ONNX Runtime",
          role: "On-robot inference",
          why: "Runs the exported detector fast on the robot's computer, without bringing the whole training framework along."
        },
        {
          stage: "Plan",
          tool: "MoveIt 2",
          role: "Motion planner",
          why: "Computes collision-free arm trajectories to the grasp pose — inverse kinematics and obstacle avoidance included."
        },
        {
          stage: "Rehearse",
          tool: "Gazebo",
          role: "Simulator",
          why: "Tests grasps in a simulated scene first, so planning bugs cost nothing.",
          alt: "MuJoCo"
        }
      ]
    },
    {
      project: "Voice-commanded robot",
      level: "Intermediate",
      goal: "Say “go to the kitchen” and the robot understands, plans and goes.",
      steps: [
        {
          stage: "Hear",
          tool: "Whisper",
          role: "Speech to text",
          why: "Turns spoken commands into text accurately and offline, even with accents and background noise."
        },
        {
          stage: "Understand",
          tool: "Qwen",
          role: "Language understanding",
          why: "Interprets free-form speech into a structured goal, e.g. {action: navigate, place: kitchen}.",
          alt: "Mistral (open models)"
        },
        {
          stage: "Host",
          tool: "Ollama",
          role: "On-board model server",
          why: "Runs the language model locally on the robot — no network dependency, low latency."
        },
        {
          stage: "Connect",
          tool: "Model Context Protocol",
          role: "Tool bridge",
          why: "Exposes a fixed set of robot actions as tools the model may call, so it can only request what you allow."
        },
        {
          stage: "Dispatch",
          tool: "ROS 2",
          role: "Robot middleware",
          why: "Receives the structured goal and routes it to the navigation stack."
        },
        {
          stage: "Move",
          tool: "Nav2",
          role: "Navigation",
          why: "Drives to the named location safely, avoiding obstacles along the way."
        }
      ]
    },
    {
      project: "Vision-language-action robot",
      level: "Advanced",
      goal: "Teach a low-cost arm new tasks by demonstration, guided by camera images and plain-language instructions.",
      steps: [
        {
          stage: "Rehearse",
          tool: "MuJoCo",
          role: "Physics simulation",
          why: "Fast, accurate contact physics for practice environments and repeatable policy evaluation.",
          alt: "Genesis"
        },
        {
          stage: "Collect",
          tool: "LeRobot",
          role: "Data & policies",
          why: "Records teleoperated demonstrations into shared dataset formats and provides ready-made learning policies and low-cost arm support."
        },
        {
          stage: "Perceive",
          tool: "Hugging Face Transformers",
          role: "Vision-language backbone",
          why: "Supplies a pretrained model that already understands images and text, so the policy learns actions, not vision from scratch."
        },
        {
          stage: "Train",
          tool: "PyTorch",
          role: "Training engine",
          why: "Trains the policy that maps camera frames plus an instruction to motor commands."
        },
        {
          stage: "Scale",
          tool: "Ray",
          role: "Distributed compute",
          why: "Spreads training and simulated evaluation across GPUs and machines when one is not enough."
        },
        {
          stage: "Deploy",
          tool: "ROS 2",
          role: "Robot integration",
          why: "Connects the trained policy to the real arm's drivers, cameras and safety stops."
        }
      ]
    },
    {
      project: "Self-hosted deployment platform",
      level: "Intermediate",
      goal: "Take any project above from a laptop to a reliable, observable service.",
      steps: [
        {
          stage: "Track",
          tool: "Git",
          role: "Version control",
          why: "Every change is recorded and reversible; collaboration and automated builds start here."
        },
        {
          stage: "Package",
          tool: "Docker Engine (Moby)",
          role: "Containers",
          why: "Freezes code, libraries and system dependencies together — “works on my machine” becomes works everywhere."
        },
        {
          stage: "Orchestrate",
          tool: "Kubernetes",
          role: "Scheduler",
          why: "Runs containers across machines, restarts failures and scales with demand."
        },
        {
          stage: "Observe",
          tool: "Grafana",
          role: "Dashboards & alerts",
          why: "Shows latency, errors and resource use, and alerts you before users notice a problem."
        }
      ]
    },
    {
      project: "Real-time analytics pipeline",
      level: "Intermediate",
      goal: "Turn a stream of live events into dashboards that update within seconds.",
      steps: [
        {
          stage: "Ingest",
          tool: "Apache Kafka",
          role: "Event log",
          why: "Durably buffers every event so producers and consumers can fail or scale independently.",
          alt: "NATS"
        },
        {
          stage: "Process",
          tool: "Apache Spark",
          role: "Stream processing",
          why: "Aggregates, joins and cleans events in flight, across as many machines as the load needs."
        },
        {
          stage: "Store",
          tool: "ClickHouse",
          role: "Analytical store",
          why: "Answers queries over billions of rows in milliseconds — the reason dashboards feel live.",
          alt: "DuckDB"
        },
        {
          stage: "Schedule",
          tool: "Apache Airflow",
          role: "Orchestrator",
          why: "Runs the batch side — backfills, daily rollups, data checks — on a schedule with retries."
        },
        {
          stage: "See",
          tool: "Grafana",
          role: "Dashboards",
          why: "Puts the numbers in front of people and alerts when they move."
        }
      ]
    },
    {
      project: "Home network intrusion detection",
      level: "Intermediate",
      goal: "Know when something on your network scans, beacons or behaves strangely.",
      steps: [
        {
          stage: "Foundation",
          tool: "Linux",
          role: "Sensor host",
          why: "A small Linux box on a mirrored switch port sees all traffic without sitting in its path."
        },
        {
          stage: "Observe",
          tool: "Zeek",
          role: "Traffic logger",
          why: "Converts raw packets into structured logs — connections, DNS, TLS, files — that you can actually search."
        },
        {
          stage: "Detect",
          tool: "Suricata",
          role: "Signature engine",
          why: "Matches traffic against thousands of known attack signatures in real time."
        },
        {
          stage: "Correlate",
          tool: "Wazuh",
          role: "SIEM",
          why: "Gathers alerts from the network and your machines, correlates them and ranks what matters."
        },
        {
          stage: "See",
          tool: "Grafana",
          role: "Dashboards",
          why: "Shows trends and spikes so a quiet anomaly does not hide in the logs."
        }
      ]
    },
    {
      project: "Observable microservices",
      level: "Advanced",
      goal: "Services that are easy to change, scale independently, and can be debugged in production.",
      steps: [
        {
          stage: "Build",
          tool: "Go",
          role: "Service language",
          why: "Small static binaries, fast start-up and simple concurrency suit many small services.",
          alt: "Rust"
        },
        {
          stage: "Talk",
          tool: "gRPC",
          role: "Service contracts",
          why: "Typed interfaces between services catch mismatches at compile time instead of in production."
        },
        {
          stage: "Route",
          tool: "Envoy",
          role: "Service proxy",
          why: "Handles retries, timeouts, TLS and load balancing so each service does not reimplement them.",
          alt: "NGINX"
        },
        {
          stage: "Run",
          tool: "Kubernetes",
          role: "Orchestrator",
          why: "Schedules, restarts and scales every service across the cluster."
        },
        {
          stage: "Trace",
          tool: "OpenTelemetry",
          role: "Instrumentation",
          why: "Follows one request across every service, so a slow hop is visible instead of guessed."
        },
        {
          stage: "Measure",
          tool: "Prometheus",
          role: "Metrics & alerts",
          why: "Records rates, errors and latency for every service and alerts on them."
        },
        {
          stage: "See",
          tool: "Grafana",
          role: "Dashboards",
          why: "Brings traces and metrics together on one screen."
        }
      ]
    },
    {
      project: "Design and simulate a RISC-V core",
      level: "Advanced",
      goal: "Go from a processor written in Verilog to a chip layout — with only open tools.",
      steps: [
        {
          stage: "Track",
          tool: "Git",
          role: "Version control",
          why: "Hardware design is code; every change to the core should be reviewable and reversible."
        },
        {
          stage: "Simulate",
          tool: "Verilator",
          role: "Fast simulator",
          why: "Runs real programs on your core at high speed to prove it computes correctly."
        },
        {
          stage: "Synthesise",
          tool: "Yosys",
          role: "Logic synthesis",
          why: "Turns the Verilog into gates, revealing size and timing — or deploys it to an FPGA."
        },
        {
          stage: "Lay out",
          tool: "OpenROAD",
          role: "Place & route",
          why: "Places and wires the gates into a manufacturable chip layout."
        }
      ]
    },
    {
      project: "IoT environmental monitor",
      level: "Intermediate",
      goal: "Sensors around a building report air quality to a live dashboard for months on a battery.",
      steps: [
        {
          stage: "Design",
          tool: "KiCad",
          role: "Board design",
          why: "A custom board puts the sensor, radio and battery circuitry in one small, cheap package."
        },
        {
          stage: "Firmware",
          tool: "Zephyr RTOS",
          role: "Device OS",
          why: "Provides drivers, networking and power management so firmware stays small and sleeps most of the time.",
          alt: "Arduino IDE"
        },
        {
          stage: "Build",
          tool: "PlatformIO",
          role: "Toolchain",
          why: "One command to compile and flash the same code to many boards."
        },
        {
          stage: "Transport",
          tool: "Eclipse Mosquitto",
          role: "MQTT broker",
          why: "Publish/subscribe messaging built for unreliable, low-power links.",
          alt: "NATS"
        },
        {
          stage: "Store",
          tool: "PostgreSQL",
          role: "Time-series history",
          why: "Keeps every reading queryable for months of trends."
        },
        {
          stage: "See",
          tool: "Grafana",
          role: "Dashboards",
          why: "Charts each room and alerts when air quality drops."
        }
      ]
    },
    {
      project: "Quantum algorithms playground",
      level: "Intermediate",
      goal: "Learn quantum computing by building algorithms and watching how noise affects them.",
      steps: [
        {
          stage: "Notebook",
          tool: "Jupyter",
          role: "Lab notebook",
          why: "Circuits, plots and explanations side by side — ideal for learning step by step."
        },
        {
          stage: "Build",
          tool: "Qiskit",
          role: "Circuit SDK",
          why: "Constructs and optimises circuits, simulates them, and can submit them to real quantum hardware."
        },
        {
          stage: "Cross-check",
          tool: "Cirq",
          role: "Second SDK",
          why: "Re-implementing in another framework exposes misunderstandings and hardware-specific details."
        },
        {
          stage: "Model noise",
          tool: "QuTiP",
          role: "Physics simulation",
          why: "Simulates decoherence and noise to explain why real devices give imperfect answers."
        }
      ]
    },
    {
      project: "Secure CI/CD pipeline",
      level: "Intermediate",
      goal: "Catch vulnerable code, dependencies and leaked secrets before they reach production.",
      steps: [
        {
          stage: "Track",
          tool: "Git",
          role: "Source of truth",
          why: "Every change arrives as a commit, so every change can be checked automatically."
        },
        {
          stage: "Scan code",
          tool: "Semgrep CE",
          role: "Static analysis",
          why: "Flags injection flaws and insecure patterns in the code you wrote."
        },
        {
          stage: "Package",
          tool: "Docker Engine (Moby)",
          role: "Build artefact",
          why: "Produces the exact image that will run, so that is what gets scanned."
        },
        {
          stage: "Scan image",
          tool: "Trivy",
          role: "Vulnerability scanner",
          why: "Finds known CVEs in the image's OS packages and third-party libraries."
        },
        {
          stage: "Protect secrets",
          tool: "OpenBao",
          role: "Secrets manager",
          why: "Issues credentials at deploy time so no password or key is ever stored in the repository."
        }
      ]
    },
    {
      project: "Full-stack web app",
      level: "Beginner",
      goal: "A typed web application with a real database, deployed securely.",
      steps: [
        {
          stage: "Language",
          tool: "TypeScript",
          role: "Typed JavaScript",
          why: "One typed language on both browser and server catches whole classes of bugs before running."
        },
        {
          stage: "Interface",
          tool: "React",
          role: "UI components",
          why: "Builds the interface from reusable components that update as data changes."
        },
        {
          stage: "Server",
          tool: "Node.js",
          role: "Back-end runtime",
          why: "Runs the API in the same language as the front end.",
          alt: "Go"
        },
        {
          stage: "Store",
          tool: "PostgreSQL",
          role: "Database",
          why: "Reliable relational storage with transactions for users and content.",
          alt: "SQLite"
        },
        {
          stage: "Serve",
          tool: "Caddy",
          role: "HTTPS server",
          why: "Serves the app with automatic, always-renewed HTTPS.",
          alt: "NGINX"
        },
        {
          stage: "Ship",
          tool: "Docker Engine (Moby)",
          role: "Packaging",
          why: "Runs identically on your laptop and on the server."
        }
      ]
    },
    {
      project: "Network lab on a laptop",
      level: "Beginner",
      goal: "Understand how networks really behave by building and breaking them safely.",
      steps: [
        {
          stage: "Emulate",
          tool: "Mininet",
          role: "Virtual network",
          why: "Creates real hosts and switches in software, so you can build any topology on one machine."
        },
        {
          stage: "Inspect",
          tool: "Wireshark",
          role: "Packet analyser",
          why: "Shows every packet decoded, turning protocol theory into something you can see."
        },
        {
          stage: "Scale",
          tool: "ns-3",
          role: "Simulator",
          why: "Simulates networks far larger than a laptop can emulate, for research-grade experiments."
        }
      ]
    },
    {
      project: "Formally verified algorithm",
      level: "Advanced",
      goal: "An algorithm proven correct, with a fast implementation you can trust.",
      steps: [
        {
          stage: "Prove",
          tool: "Lean 4",
          role: "Proof assistant",
          why: "States the algorithm's correctness as a theorem and has the computer check every step."
        },
        {
          stage: "Check",
          tool: "Z3",
          role: "Constraint solver",
          why: "Automatically searches for counter-examples and verifies bounds the proof relies on."
        },
        {
          stage: "Implement",
          tool: "Rust",
          role: "Fast, safe code",
          why: "Memory safety without a garbage collector keeps the implementation both quick and trustworthy."
        }
      ]
    },
    {
      project: "Cross-platform mobile app",
      level: "Intermediate",
      goal: "Ship one app to Android and iOS that works offline, syncs, and notifies users.",
      steps: [
        {
          stage: "Build UI",
          tool: "Flutter",
          role: "Cross-platform UI",
          why: "One codebase compiles to native apps on both platforms, halving the work of two native teams.",
          alt: "React Native"
        },
        {
          stage: "Work offline",
          tool: "SQLite",
          role: "On-device database",
          why: "The app reads and writes locally, so it opens instantly and keeps working without signal."
        },
        {
          stage: "Sync",
          tool: "PocketBase",
          role: "Backend",
          why: "Accounts, a database and realtime sync in a single self-hosted executable.",
          alt: "Supabase"
        },
        {
          stage: "Notify",
          tool: "ntfy",
          role: "Push notifications",
          why: "Reaches users when the app is closed, through a server you control."
        },
        {
          stage: "Test",
          tool: "Maestro",
          role: "UI tests",
          why: "Taps through real screens on emulators, catching broken flows before users do.",
          alt: "Detox"
        },
        {
          stage: "Release",
          tool: "fastlane",
          role: "Release automation",
          why: "Builds, signs and uploads every version the same way, every time."
        }
      ]
    },
    {
      project: "Fast content site",
      level: "Beginner",
      goal: "A site that is fast by default, easy to write for, and searchable.",
      steps: [
        {
          stage: "Build",
          tool: "Astro",
          role: "Site framework",
          why: "Renders pages to plain HTML at build time, so readers download almost no JavaScript.",
          alt: "Next.js"
        },
        {
          stage: "Style",
          tool: "Tailwind CSS",
          role: "Design system",
          why: "Consistent spacing, type and colour without a growing pile of custom CSS."
        },
        {
          stage: "Search",
          tool: "Meilisearch",
          role: "Instant search",
          why: "Typo-tolerant results as you type, which static sites otherwise lack."
        },
        {
          stage: "Serve",
          tool: "Caddy",
          role: "HTTPS server",
          why: "Serves the files with automatic HTTPS and sensible caching.",
          alt: "NGINX"
        }
      ]
    }
  ],

  trends: [
    {
      title: "Agentic AI and open tool protocols",
      body: "Language models are moving from chat to action: agents that plan, call tools and operate software. Open standards such as the Model Context Protocol let any agent reach any tool, without vendor lock-in.",
      tools: [
        "Model Context Protocol",
        "LangChain",
        "LlamaIndex"
      ]
    },
    {
      title: "Open-weight models closing the gap",
      body: "Openly released models now rival closed systems on many benchmarks, and fully open efforts publish their data and training code too — making genuine reproducibility possible in AI research.",
      tools: [
        "OLMo (AI2)",
        "Qwen",
        "Mistral (open models)",
        "Hugging Face Transformers"
      ]
    },
    {
      title: "Local and edge inference",
      body: "Quantisation and efficient runtimes put capable models on laptops, phones and robots — private by default, and free of per-token cost.",
      tools: [
        "llama.cpp",
        "Ollama",
        "ONNX Runtime"
      ]
    },
    {
      title: "Vision-language-action models for robots",
      body: "The methods behind language models are being applied to embodiment: policies that map camera pixels and instructions directly to motor commands, trained on shared open datasets.",
      tools: [
        "LeRobot",
        "PyTorch",
        "OpenCV"
      ]
    },
    {
      title: "Simulation-first robotics",
      body: "GPU-parallel simulators train thousands of robot instances at once, then transfer the policy to hardware — sim-to-real has become the default workflow for humanoids and manipulators.",
      tools: [
        "MuJoCo",
        "Genesis",
        "Gazebo",
        "ROS 2"
      ]
    },
    {
      title: "Retrieval inside the database",
      body: "Rather than separate vector stores, teams increasingly keep embeddings beside their relational data, simplifying retrieval-augmented systems.",
      tools: [
        "PostgreSQL",
        "SQLite",
        "LlamaIndex"
      ]
    },
    {
      title: "Post-quantum cryptography goes mainstream",
      body: "Standardised post-quantum algorithms are landing in everyday libraries, and organisations are beginning to migrate TLS and key exchange before large quantum computers arrive.",
      tools: [
        "OpenSSL",
        "Certbot",
        "WireGuard"
      ]
    },
    {
      title: "Open hardware and RISC-V",
      body: "Open instruction sets and fully open chip-design flows mean students and start-ups can now take a processor from Verilog to silicon layout without proprietary tools.",
      tools: [
        "Verilator",
        "Yosys",
        "OpenROAD",
        "KiCad"
      ]
    },
    {
      title: "Community forks after licence changes",
      body: "When popular infrastructure projects moved to source-available licences, foundations stepped in with open forks that keep the original promise.",
      tools: [
        "OpenTofu",
        "OpenBao",
        "Valkey"
      ]
    },
    {
      title: "In-process analytics and the lakehouse",
      body: "Columnar formats and embedded engines make serious analytics possible on a laptop, while the same open formats scale to clusters.",
      tools: [
        "DuckDB",
        "Apache Arrow",
        "ClickHouse",
        "Apache Spark"
      ]
    },
    {
      title: "Observability as a shared standard",
      body: "Traces, metrics and logs are converging on one open standard, so instrumentation written once works with any back end.",
      tools: [
        "OpenTelemetry",
        "Prometheus",
        "Grafana"
      ]
    },
    {
      title: "Quantum error correction and hybrid workflows",
      body: "Progress on error-corrected qubits is pushing quantum computing from demos toward utility, with classical and quantum code increasingly written together.",
      tools: [
        "Qiskit",
        "Cirq",
        "PennyLane",
        "QuTiP"
      ]
    }
  ],

  // Venn map: the three domains shown first, and quick presets
  venn: {
    default: [
      "ai",
      "ml",
      "robotics"
    ],
    presets: [
      {
        name: "AI · ML · Robotics",
        domains: [
          "ai",
          "ml",
          "robotics"
        ]
      },
      {
        name: "Networks · Distributed · Security",
        domains: [
          "networks",
          "distributed",
          "security"
        ]
      },
      {
        name: "Hardware · Software · Computation",
        domains: [
          "hardware",
          "software",
          "computation"
        ]
      },
      {
        name: "Data · Distributed · AI",
        domains: [
          "data",
          "distributed",
          "ai"
        ]
      },
      {
        name: "Emerging · Computation · ML",
        domains: [
          "emerging",
          "computation",
          "ml"
        ]
      },
      {
        name: "Hardware · Networks · Security",
        domains: [
          "hardware",
          "networks",
          "security"
        ]
      }
    ]
  },

  // Live headline topics, queried against the Hacker News Algolia API.
  wire: [
    {id: "ai", name: "AI", query: "AI"},
    {id: "ml", name: "Machine Learning", query: "machine learning"},
    {id: "robotics", name: "Robotics", query: "robot"},
    {id: "security", name: "Security", query: "security"},
    {id: "networks", name: "Networking", query: "network"},
    {id: "data", name: "Databases", query: "database"},
    {id: "distributed", name: "Distributed", query: "distributed"},
    {id: "hardware", name: "Hardware", query: "chip"},
    {id: "emerging", name: "Quantum", query: "quantum"},
    {id: "oss", name: "Open Source", query: "open source"},
  ],
};
