// Catalogue of free, open-source tools. Licences reflect each project's
// repository at time of writing; always verify before building on one.
window.ATLAS = {
  disciplines: [
    { id: "cs", name: "Computer Science" },
    { id: "ai", name: "Artificial Intelligence" },
    { id: "ml", name: "Machine Learning" },
    { id: "robotics", name: "Robotics" },
  ],

  tools: [
    // Computer Science — foundations, languages, infrastructure
    { d: "cs", name: "Linux", logo: "logos/linux.svg", kind: "Operating system", license: "GPL-2.0", url: "https://kernel.org", desc: "The kernel beneath nearly every server, robot, and research cluster." },
    { d: "cs", name: "Git", logo: "logos/git.svg", kind: "Version control", license: "GPL-2.0", url: "https://git-scm.com", desc: "Distributed version control — the ledger of every serious project." },
    { d: "cs", name: "Python", logo: "logos/python.svg", kind: "Language", license: "PSF", url: "https://www.python.org", desc: "The lingua franca of research code, data work, and AI." },
    { d: "cs", name: "Rust", logo: "logos/rust.svg", kind: "Language", license: "MIT / Apache-2.0", url: "https://www.rust-lang.org", desc: "Memory-safe systems programming without a garbage collector." },
    { d: "cs", name: "LLVM", logo: "logos/llvm.svg", kind: "Compiler infrastructure", license: "Apache-2.0", url: "https://llvm.org", desc: "Modular compiler toolchain behind Clang, Rust, Swift and ML compilers." },
    { d: "cs", name: "VS Code (Code OSS)", logo: "logos/vscode.png", kind: "Editor", license: "MIT", url: "https://github.com/microsoft/vscode", desc: "The open-source core of the most widely used code editor." },
    { d: "cs", name: "Neovim", logo: "logos/neovim.svg", kind: "Editor", license: "Apache-2.0", url: "https://neovim.io", desc: "Hyper-extensible, keyboard-driven editing with built-in LSP." },
    { d: "cs", name: "Docker Engine (Moby)", logo: "logos/docker.svg", kind: "Containers", license: "Apache-2.0", url: "https://mobyproject.org", desc: "Package software and its environment into reproducible containers." },
    { d: "cs", name: "Kubernetes", logo: "logos/kubernetes.svg", kind: "Orchestration", license: "Apache-2.0", url: "https://kubernetes.io", desc: "Schedule and scale containerised workloads across machines." },
    { d: "cs", name: "PostgreSQL", logo: "logos/postgresql.svg", kind: "Database", license: "PostgreSQL", url: "https://www.postgresql.org", desc: "The rigorous relational database; with pgvector, a vector store too." },
    { d: "cs", name: "SQLite", logo: "logos/sqlite.svg", kind: "Database", license: "Public domain", url: "https://sqlite.org", desc: "A full SQL engine in a single file — embedded everywhere." },
    { d: "cs", name: "Valkey", logo: "logos/valkey.png", kind: "In-memory store", license: "BSD-3-Clause", url: "https://valkey.io", desc: "Community-governed key-value store for caching, queues and pub/sub." },
    { d: "cs", name: "Grafana", logo: "logos/grafana.svg", kind: "Observability", license: "AGPL-3.0", url: "https://grafana.com/oss/grafana/", desc: "Dashboards and alerting over metrics, logs and traces." },

    // Artificial Intelligence — models, inference, agents
    { d: "ai", name: "Hugging Face Transformers", logo: "logos/transformers.svg", kind: "Model library", license: "Apache-2.0", url: "https://github.com/huggingface/transformers", desc: "Thousands of pretrained models for text, vision, audio and more." },
    { d: "ai", name: "llama.cpp", logo: "logos/llamacpp.png", kind: "Local inference", license: "MIT", url: "https://github.com/ggml-org/llama.cpp", desc: "Run large language models on CPUs, laptops and edge devices." },
    { d: "ai", name: "Ollama", logo: "logos/ollama.svg", kind: "Local inference", license: "MIT", url: "https://github.com/ollama/ollama", desc: "One command to pull and serve open-weight models locally." },
    { d: "ai", name: "vLLM", logo: "logos/vllm.png", kind: "Serving", license: "Apache-2.0", url: "https://github.com/vllm-project/vllm", desc: "High-throughput LLM serving with PagedAttention." },
    { d: "ai", name: "LangChain", logo: "logos/langchain.svg", kind: "Agent framework", license: "MIT", url: "https://github.com/langchain-ai/langchain", desc: "Compose models, tools and memory into LLM applications." },
    { d: "ai", name: "LlamaIndex", logo: "logos/llamaindex.png", kind: "Retrieval (RAG)", license: "MIT", url: "https://github.com/run-llama/llama_index", desc: "Connect your documents and data to language models." },
    { d: "ai", name: "Model Context Protocol", logo: "logos/mcp.svg", kind: "Agent standard", license: "MIT", url: "https://modelcontextprotocol.io", desc: "An open protocol for wiring AI agents to tools and data sources." },
    { d: "ai", name: "Whisper", logo: "logos/whisper.png", kind: "Speech recognition", license: "MIT", url: "https://github.com/openai/whisper", desc: "Robust multilingual speech-to-text, runnable offline." },
    { d: "ai", name: "ComfyUI", logo: "logos/comfyui.png", kind: "Image generation", license: "GPL-3.0", url: "https://github.com/comfyanonymous/ComfyUI", desc: "Node-graph workbench for diffusion and generative pipelines." },
    { d: "ai", name: "OLMo (AI2)", logo: "logos/olmo.png", kind: "Fully open model", license: "Apache-2.0", url: "https://allenai.org/olmo", desc: "Open weights, open data, open training code — a model you can study end to end." },
    { d: "ai", name: "Qwen", logo: "logos/qwen.svg", kind: "Open-weight models", license: "Apache-2.0 (most)", url: "https://github.com/QwenLM", desc: "Capable open-weight language and vision models in many sizes." },
    { d: "ai", name: "Mistral (open models)", logo: "logos/mistral.svg", kind: "Open-weight models", license: "Apache-2.0 (select)", url: "https://github.com/mistralai", desc: "Efficient European open-weight models; check each model's licence." },

    // Machine Learning — frameworks, data, experiment tooling
    { d: "ml", name: "PyTorch", logo: "logos/pytorch.svg", kind: "Deep learning", license: "BSD-3-Clause", url: "https://pytorch.org", desc: "The dominant research framework for neural networks." },
    { d: "ml", name: "JAX", logo: "logos/jax.png", kind: "Deep learning", license: "Apache-2.0", url: "https://github.com/jax-ml/jax", desc: "Composable transforms — grad, jit, vmap — for numerical research." },
    { d: "ml", name: "TensorFlow", logo: "logos/tensorflow.svg", kind: "Deep learning", license: "Apache-2.0", url: "https://www.tensorflow.org", desc: "Production-grade ML with mobile and edge deployment via LiteRT." },
    { d: "ml", name: "Keras", logo: "logos/keras.svg", kind: "High-level API", license: "Apache-2.0", url: "https://keras.io", desc: "Readable model building that runs atop JAX, PyTorch or TensorFlow." },
    { d: "ml", name: "scikit-learn", logo: "logos/scikitlearn.svg", kind: "Classical ML", license: "BSD-3-Clause", url: "https://scikit-learn.org", desc: "The reference toolkit for regression, classification and clustering." },
    { d: "ml", name: "XGBoost", logo: "logos/xgboost.png", kind: "Gradient boosting", license: "Apache-2.0", url: "https://xgboost.ai", desc: "Winning baseline for tabular data, at scale." },
    { d: "ml", name: "LightGBM", logo: "logos/lightgbm.png", kind: "Gradient boosting", license: "MIT", url: "https://github.com/microsoft/LightGBM", desc: "Fast, memory-lean boosting on large tabular datasets." },
    { d: "ml", name: "NumPy", logo: "logos/numpy.svg", kind: "Numerics", license: "BSD-3-Clause", url: "https://numpy.org", desc: "N-dimensional arrays — the bedrock of scientific Python." },
    { d: "ml", name: "Polars", logo: "logos/polars.svg", kind: "DataFrames", license: "MIT", url: "https://pola.rs", desc: "Lightning-fast columnar DataFrames written in Rust." },
    { d: "ml", name: "pandas", logo: "logos/pandas.svg", kind: "DataFrames", license: "BSD-3-Clause", url: "https://pandas.pydata.org", desc: "The classic toolkit for wrangling tabular data." },
    { d: "ml", name: "Jupyter", logo: "logos/jupyter.svg", kind: "Notebooks", license: "BSD-3-Clause", url: "https://jupyter.org", desc: "Executable research notebooks mixing code, prose and plots." },
    { d: "ml", name: "MLflow", logo: "logos/mlflow.svg", kind: "Experiment tracking", license: "Apache-2.0", url: "https://mlflow.org", desc: "Track runs, register models and reproduce results." },
    { d: "ml", name: "DVC", logo: "logos/dvc.svg", kind: "Data versioning", license: "Apache-2.0", url: "https://dvc.org", desc: "Git-style versioning for datasets and pipelines." },
    { d: "ml", name: "Ray", logo: "logos/ray.svg", kind: "Distributed compute", license: "Apache-2.0", url: "https://www.ray.io", desc: "Scale training, tuning and serving from a laptop to a cluster." },
    { d: "ml", name: "ONNX Runtime", logo: "logos/onnx.svg", kind: "Inference", license: "MIT", url: "https://onnxruntime.ai", desc: "Portable, accelerated inference across hardware." },

    // Robotics — middleware, simulation, perception, control
    { d: "robotics", name: "ROS 2", logo: "logos/ros2.svg", kind: "Middleware", license: "Apache-2.0", url: "https://www.ros.org", desc: "The standard nervous system for robot software." },
    { d: "robotics", name: "Gazebo", logo: "logos/gazebo.png", kind: "Simulation", license: "Apache-2.0", url: "https://gazebosim.org", desc: "Physics simulation of robots and worlds, tightly paired with ROS 2." },
    { d: "robotics", name: "MuJoCo", logo: "logos/mujoco.png", kind: "Physics engine", license: "Apache-2.0", url: "https://mujoco.org", desc: "Fast, accurate contact dynamics for control and RL research." },
    { d: "robotics", name: "PyBullet", logo: "logos/pybullet.png", kind: "Physics engine", license: "zlib", url: "https://pybullet.org", desc: "Lightweight Python physics for prototyping and learning." },
    { d: "robotics", name: "Genesis", logo: "logos/genesis.png", kind: "Simulation", license: "Apache-2.0", url: "https://github.com/Genesis-Embodied-AI/Genesis", desc: "GPU-parallel generative physics platform for embodied AI." },
    { d: "robotics", name: "Webots", logo: "logos/webots.png", kind: "Simulation", license: "Apache-2.0", url: "https://cyberbotics.com", desc: "Friendly desktop robot simulator with a large model library." },
    { d: "robotics", name: "MoveIt 2", logo: "logos/moveit.png", kind: "Motion planning", license: "BSD-3-Clause", url: "https://moveit.ai", desc: "Manipulation, kinematics and collision-aware motion planning." },
    { d: "robotics", name: "Nav2", logo: "logos/nav2.png", kind: "Navigation", license: "Apache-2.0", url: "https://nav2.org", desc: "Autonomous navigation stack for mobile robots on ROS 2." },
    { d: "robotics", name: "Drake", logo: "logos/drake.png", kind: "Modelling & control", license: "BSD-3-Clause", url: "https://drake.mit.edu", desc: "Model-based design, optimisation and verification of robots." },
    { d: "robotics", name: "LeRobot", logo: "logos/lerobot.svg", kind: "Robot learning", license: "Apache-2.0", url: "https://github.com/huggingface/lerobot", desc: "Datasets, policies and tools for end-to-end learned robotics." },
    { d: "robotics", name: "OpenCV", logo: "logos/opencv.svg", kind: "Computer vision", license: "Apache-2.0", url: "https://opencv.org", desc: "Two decades of vision algorithms — cameras, calibration, tracking." },
    { d: "robotics", name: "PX4", logo: "logos/px4.png", kind: "Flight control", license: "BSD-3-Clause", url: "https://px4.io", desc: "Autopilot firmware for drones and autonomous vehicles." },
    { d: "robotics", name: "ArduPilot", logo: "logos/ardupilot.png", kind: "Flight control", license: "GPL-3.0", url: "https://ardupilot.org", desc: "Battle-tested autopilot for copters, planes, rovers and boats." },
  ],

  trends: [
    {
      title: "Agentic AI and open tool protocols",
      body: "Language models are moving from chat to action: agents that plan, call tools and operate software. Open standards such as the Model Context Protocol let any agent reach any tool, without vendor lock-in.",
      tools: ["Model Context Protocol", "LangChain", "LlamaIndex"],
    },
    {
      title: "Open-weight models closing the gap",
      body: "Openly released models now rival closed systems on many benchmarks, and fully open efforts publish their data and training code too — making genuine reproducibility possible in AI research.",
      tools: ["OLMo (AI2)", "Qwen", "Mistral (open models)", "Hugging Face Transformers"],
    },
    {
      title: "Local and edge inference",
      body: "Quantisation and efficient runtimes put capable models on laptops, phones and robots — private by default, and free of per-token cost.",
      tools: ["llama.cpp", "Ollama", "ONNX Runtime"],
    },
    {
      title: "Vision-language-action models for robots",
      body: "The methods behind language models are being applied to embodiment: policies that map camera pixels and instructions directly to motor commands, trained on shared open datasets.",
      tools: ["LeRobot", "PyTorch", "OpenCV"],
    },
    {
      title: "Simulation-first robotics",
      body: "GPU-parallel simulators train thousands of robot instances at once, then transfer the policy to hardware — sim-to-real has become the default workflow for humanoids and manipulators.",
      tools: ["MuJoCo", "Genesis", "Gazebo", "ROS 2"],
    },
    {
      title: "Retrieval inside the database",
      body: "Rather than separate vector stores, teams increasingly keep embeddings beside their relational data, simplifying retrieval-augmented systems.",
      tools: ["PostgreSQL", "SQLite", "LlamaIndex"],
    },
  ],

  // Venn map: each region is a combination of disciplines, with projects
  // and the Atlas tools (by exact name) that combine to build them.
  map: [
    {
      sets: ["ai"], title: "Artificial Intelligence",
      note: "Language, speech and generative systems — no learning loop of your own required.",
      projects: [
        { name: "Private document assistant", desc: "Chat with your own PDFs and notes, fully offline, using retrieval-augmented generation.", tools: ["Ollama", "LlamaIndex", "PostgreSQL", "Qwen"] },
        { name: "Meeting transcriber & summariser", desc: "Record, transcribe, then summarise discussions into action items.", tools: ["Whisper", "llama.cpp", "SQLite"] },
        { name: "Tool-using agent", desc: "An assistant that searches, files tickets and queries databases through open protocol servers.", tools: ["Model Context Protocol", "LangChain", "Ollama"] },
      ],
    },
    {
      sets: ["ml"], title: "Machine Learning",
      note: "Learning from data — prediction, analysis and rigorous experimentation.",
      projects: [
        { name: "Tabular prediction model", desc: "Forecast churn, prices or risk from structured data with a tracked, reproducible pipeline.", tools: ["pandas", "scikit-learn", "XGBoost", "MLflow"] },
        { name: "Reproducible research pipeline", desc: "Version data, notebooks and models so every figure in a paper can be regenerated.", tools: ["Jupyter", "DVC", "PyTorch", "Git"] },
        { name: "Large-scale data analysis", desc: "Explore millions of rows and train boosted models on a single machine.", tools: ["Polars", "LightGBM", "Jupyter"] },
      ],
    },
    {
      sets: ["robotics"], title: "Robotics",
      note: "Classical autonomy — perception, planning and control without learned policies.",
      projects: [
        { name: "Autonomous mobile robot", desc: "Map a room, localise and navigate around obstacles — first in simulation, then on hardware.", tools: ["ROS 2", "Nav2", "Gazebo"] },
        { name: "Survey drone mission", desc: "Plan and fly waypoint missions with failsafes, tested in software-in-the-loop.", tools: ["PX4", "ROS 2", "Gazebo"] },
        { name: "Robot arm motion planner", desc: "Collision-free trajectories for a manipulator, with verified dynamics.", tools: ["MoveIt 2", "Drake", "ROS 2"] },
      ],
    },
    {
      sets: ["ai", "ml"], title: "AI ∩ Machine Learning",
      note: "Training and adapting models yourself — where generative AI meets the learning loop.",
      projects: [
        { name: "Fine-tune an open model", desc: "Adapt an open-weight language model to your domain, then serve it at speed.", tools: ["Hugging Face Transformers", "PyTorch", "OLMo (AI2)", "vLLM"] },
        { name: "Custom image generator", desc: "Train a style adapter and compose a reusable generation workflow.", tools: ["ComfyUI", "PyTorch", "Hugging Face Transformers"] },
        { name: "Evaluated RAG system", desc: "Measure retrieval and answer quality across experiments, not by vibes.", tools: ["LlamaIndex", "MLflow", "Qwen", "PostgreSQL"] },
      ],
    },
    {
      sets: ["ml", "robotics"], title: "ML ∩ Robotics",
      note: "Learning to move and see — reinforcement learning and perception for machines.",
      projects: [
        { name: "Legged locomotion via RL", desc: "Train a walking policy across thousands of parallel simulated robots.", tools: ["MuJoCo", "JAX", "Ray"] },
        { name: "Vision-guided pick & place", desc: "Detect objects with a trained network and plan grasps for an arm.", tools: ["OpenCV", "PyTorch", "MoveIt 2", "ROS 2"] },
        { name: "Edge perception on a rover", desc: "Run a compact detector on-board for obstacle and lane awareness.", tools: ["ONNX Runtime", "OpenCV", "Nav2"] },
      ],
    },
    {
      sets: ["ai", "robotics"], title: "AI ∩ Robotics",
      note: "Robots you can talk to — language models as the interface and planner.",
      projects: [
        { name: "Voice-commanded robot", desc: "Speak a goal; the robot transcribes, reasons, and dispatches a navigation task.", tools: ["Whisper", "Ollama", "ROS 2", "Nav2"] },
        { name: "Agent-operated lab robot", desc: "Expose robot actions as protocol tools so an AI agent can run experiments.", tools: ["Model Context Protocol", "ROS 2", "MoveIt 2"] },
      ],
    },
    {
      sets: ["ai", "ml", "robotics"], title: "AI ∩ ML ∩ Robotics",
      note: "The frontier: embodied foundation models that see, read and act.",
      projects: [
        { name: "Vision-language-action robot", desc: "Collect demonstrations, train a policy that maps camera + instruction to motion, deploy on a low-cost arm.", tools: ["LeRobot", "PyTorch", "Hugging Face Transformers", "MuJoCo", "ROS 2"] },
        { name: "Sim-to-real humanoid skills", desc: "Generate diverse simulated worlds, train at scale, and transfer behaviours to hardware.", tools: ["Genesis", "PyTorch", "Ray", "ROS 2"] },
      ],
    },
    {
      sets: [], title: "Computer Science — the ground",
      note: "Every region above stands on this. These tools ship, scale and observe whatever you build.",
      projects: [
        { name: "Self-hosted deployment platform", desc: "Containerise any project above, orchestrate it, and watch it in production.", tools: ["Docker Engine (Moby)", "Kubernetes", "Grafana", "Linux"] },
        { name: "High-performance core library", desc: "Rewrite a hot path in a memory-safe systems language and bind it to Python.", tools: ["Rust", "LLVM", "Python"] },
      ],
    },
  ],

  // Live headline topics, queried against the Hacker News Algolia API.
  wire: [
    { id: "ai", name: "AI", query: "AI" },
    { id: "ml", name: "Machine Learning", query: "machine learning" },
    { id: "robotics", name: "Robotics", query: "robot" },
    { id: "oss", name: "Open Source", query: "open source" },
  ],
};
