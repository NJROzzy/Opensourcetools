<div align="center">

# Amalgam · by NJR

### An Open Source Atlas across eleven domains of Computer Science

**🔗 Live site → [amalgambynjr.vercel.app](https://amalgambynjr.vercel.app)**

[![Live](https://img.shields.io/badge/live-amalgambynjr.vercel.app-000000?style=flat-square&logo=vercel&logoColor=white)](https://amalgambynjr.vercel.app)
![Domains](https://img.shields.io/badge/domains-11-000000?style=flat-square)
![Tools](https://img.shields.io/badge/tools-115-000000?style=flat-square)
![Projects](https://img.shields.io/badge/projects-51-000000?style=flat-square)
![Chains](https://img.shields.io/badge/recommendation%20chains-18-000000?style=flat-square)
![Stack](https://img.shields.io/badge/stack-HTML%20·%20CSS%20·%20JS-000000?style=flat-square)

![Amalgam hero](docs/hero.png)

</div>

---

## About

**Amalgam** is a research-style field guide to the **free and open-source tools** you can use to build a proper project across **eleven domains of computer science**, read alongside **current trends and live news**:

> Hardware · Software · Computation · Computer Networks · Data & Databases · Distributed Systems · Cybersecurity · Artificial Intelligence · Machine Learning · Robotics · Emerging Computing

A real project is rarely one tool, or one domain. It is an *amalgam*: ROS 2 braided with MuJoCo and PyTorch, or an IoT monitor built from KiCad, Zephyr, MQTT and Grafana across hardware, networks and data. This site catalogues those parts, shows which combinations produce which kinds of projects, and keeps you current with what is happening in the field.

The design is futuristic and monochrome, with black and white throughout and only the tool logos in colour, calligraphic script headings, a classical serif in the style of a research paper, and a drifting constellation that reacts to your cursor.

## Features

| Section | What it does |
|---|---|
| **§1 The Atlas** | 115 open-source tools, each with its full-colour logo, purpose, licence and every domain it serves. Filter by any of the 11 domains or search by name, purpose, domain or licence (e.g. `quantum`, `VPN`, `LLM`, `MIT`). |
| **§2 The Amalgam Map** | An interactive **Venn diagram of any three domains**, picked by hand or from presets (*AI · ML · Robotics*, *Networks · Distributed · Security*, *Hardware · Software · Computation*…). Each project and tool is tagged with its domains, so it lands in the matching overlap. **By project** writes project names inside each region; **by tool** places tool logos there, with *+N more* when a region is crowded. Select a region to see its tools and projects, or a logo to see every project the tool appears in, the role it plays and why it is needed. |
| **§3 Recommendation Chains** | Step-by-step tool chains for 18 projects spanning every domain. Every link names the tool, the **role** it plays, **why the project needs it**, and an alternative. Reach a chain from its project in the map via *Follow the chain →*. |
| **§4 Currents & Trends** | Twelve movements across the field: agentic AI, open-weight models, post-quantum cryptography, open hardware and RISC-V, community forks after licence changes, in-process analytics, OpenTelemetry, quantum error correction and more, each linked to its tools. |
| **§5 The Live Wire** | Headlines on AI, ML, Robotics, Security, Networking, Databases, Distributed Systems, Hardware, Quantum and Open Source, fetched live from the Hacker News index each time the page loads. |
| **§6 Method** | How tools were chosen, and a reminder to verify licences before you build. |

| By project | By tool |
|---|---|
| ![Map by project](docs/map.png) | ![Map by tool](docs/map-tools.png) |

### Example chain: Voice-commanded robot

![Recommendation chain](docs/chains.png)

| # | Stage | Tool | Role | Why it's needed |
|---|---|---|---|---|
| 1 | Hear | Whisper | Speech to text | Turns spoken commands into text, offline |
| 2 | Understand | Qwen | Language understanding | Converts free-form speech into a structured goal |
| 3 | Host | Ollama | On-board model server | Runs the model locally on the robot with no network needed |
| 4 | Connect | Model Context Protocol | Tool bridge | Lets the model call only the robot actions you allow |
| 5 | Dispatch | ROS 2 | Robot middleware | Routes the goal to the navigation stack |
| 6 | Move | Nav2 | Navigation | Drives to the location around obstacles |

### Example projects across the domains

| Domains | Project | Recipe |
|---|---|---|
| Hardware ∩ Computation | Design and simulate a RISC-V core | Git + Verilator + Yosys + OpenROAD |
| Hardware ∩ Networks ∩ Data | IoT environmental monitor | KiCad + Zephyr + PlatformIO + Mosquitto + PostgreSQL + Grafana |
| Software ∩ Data ∩ Networks | Full-stack web app | TypeScript + React + Node.js + PostgreSQL + Caddy + Docker |
| Computation ∩ Software | Formally verified algorithm | Lean 4 + Z3 + Rust |
| Networks ∩ Computation | Network lab on a laptop | Mininet + Wireshark + ns-3 |
| Data ∩ Distributed | Real-time analytics pipeline | Kafka + Spark + ClickHouse + Airflow + Grafana |
| Distributed ∩ Networks ∩ Software | Observable microservices | Go + gRPC + Envoy + Kubernetes + OpenTelemetry + Prometheus + Grafana |
| Security ∩ Networks | Home network intrusion detection | Linux + Zeek + Suricata + Wazuh + Grafana |
| Security ∩ Software ∩ Distributed | Secure CI/CD pipeline | Git + Semgrep + Docker + Trivy + OpenBao |
| AI ∩ Data | Private document assistant | Ollama + LlamaIndex + PostgreSQL + Qwen |
| AI ∩ ML ∩ Robotics | Vision-language-action robot | LeRobot + PyTorch + Transformers + MuJoCo + ROS 2 |
| Emerging ∩ Computation | Quantum algorithms playground | Jupyter + Qiskit + Cirq + QuTiP |
| Emerging ∩ ML ∩ Robotics | Spiking-network robot controller | snnTorch + Lava + ROS 2 + Gazebo |

## Tech stack

Plain **HTML, CSS and vanilla JavaScript**, with no framework and no build step.

- **Fonts:** Pinyon Script (calligraphy), Cormorant Garamond (research serif), IBM Plex Mono (instrument labels), from Google Fonts
- **Logos:** [Simple Icons](https://simpleicons.org) glyphs (CC0) and project GitHub avatars, stored in the repo. Logos are trademarks of their respective projects.
- **Venn diagram:** hand-built SVG using clip paths and masks to paint each exact intersection
- **Background:** canvas constellation animation (respects `prefers-reduced-motion`)
- **News:** [Hacker News Algolia API](https://hn.algolia.com/api), with no API key needed
- **Hosting:** [Vercel](https://vercel.com)

## Project structure

```
├── index.html   # Page structure and sections
├── styles.css   # Monochrome, research-style design
├── data.js      # Domains, tools, projects, chains, trends, map presets, news topics (edit content here)
├── app.js       # Atlas filtering, Venn map, chains, live wire, background animation
├── logos/       # Self-hosted tool logos
└── docs/        # README screenshots
```

## Run locally

```bash
git clone https://github.com/NJROzzy/Opensourcetools.git
cd Opensourcetools
python3 -m http.server 8000
# open http://localhost:8000
```

## Contributing a tool or recipe

All content lives in **`data.js`**.

- **Domains:** `hardware`, `software`, `computation`, `networks`, `data`, `distributed`, `security`, `ai`, `ml`, `robotics`, `emerging`.
- **Add a tool:** append to `tools` with `domains` (primary first, then any others it serves), `name`, `logo`, `kind`, `license`, `url` and `desc`. Set `foundation: true` for tools every project relies on; they sit on the map's ground when none of their domains is chosen.
- **Add a project:** append to `projects` with `name`, a `short` label for the map, its `domains`, `desc` and `tools`. Tool names must exactly match a tool's `name`. The map places it automatically.
- **Add a chain:** append to `chains` with `project` (matching a project name), `level`, `goal` and ordered `steps` of `{ stage, tool, role, why, alt? }`.
- **Add a map preset:** append `{ name, domains: [three ids] }` to `venn.presets`.
- **Logos:** put the file in `logos/` and set the tool's `logo` path. Logos are shown in full colour on light tiles; tools without one get a lettered tile.
- Only include tools that are **free to use** and published under an **open licence**.

## Deploy

```bash
vercel deploy --prod
```

---

<div align="center">

**[amalgambynjr.vercel.app](https://amalgambynjr.vercel.app)**

Compiled by **NJR**

*Licences change. Always verify the licence file in a project's repository before you build upon it.*

</div>
