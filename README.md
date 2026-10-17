<div align="center">

# Amalgam · by NJR

### An Open Source Atlas for Computer Science, AI, Machine Learning & Robotics

**🔗 Live site → [amalgambynjr.vercel.app](https://amalgambynjr.vercel.app)**

[![Live](https://img.shields.io/badge/live-amalgambynjr.vercel.app-000000?style=flat-square&logo=vercel&logoColor=white)](https://amalgambynjr.vercel.app)
![Tools](https://img.shields.io/badge/tools-53-000000?style=flat-square)
![Projects](https://img.shields.io/badge/project%20recipes-20-000000?style=flat-square)
![Stack](https://img.shields.io/badge/stack-HTML%20·%20CSS%20·%20JS-000000?style=flat-square)

![Amalgam hero](docs/hero.png)

</div>

---

## About

**Amalgam** is a research-style field guide to the **free and open-source tools** you can use to build a proper project in **Computer Science, Artificial Intelligence, Machine Learning and Robotics**, read alongside **current trends and live news**.

A real project is rarely one tool. It is an *amalgam*: ROS 2 braided with MuJoCo and PyTorch, or llama.cpp with LlamaIndex and PostgreSQL. This site catalogues those parts, shows which combinations produce which kinds of projects, and keeps you current with what is happening in the field.

The design is futuristic and monochrome: black and white only, calligraphic script headings, a classical serif in the style of a research paper, and a drifting constellation that reacts to your cursor.

## Features

| Section | What it does |
|---|---|
| **§1 The Atlas** | 53 open-source tools across four disciplines, each with purpose and licence. Filter by discipline or search by name, purpose or licence (e.g. `simulation`, `LLM`, `MIT`). |
| **§2 The Amalgam Map** | An interactive **Venn diagram**: AI, ML and Robotics overlap on a Computer Science foundation. Select any region to see the projects you can build there and the exact **tool recipe** for each. Click a tool to jump to it in the Atlas. |
| **§3 Currents & Trends** | Key movements in the field (agentic AI and MCP, open-weight models, edge inference, vision-language-action robots, sim-to-real) and the tools they relate to. |
| **§4 The Live Wire** | Headlines on AI, ML, Robotics and Open Source, fetched live from the Hacker News index each time the page loads. |
| **§5 Method** | How tools were chosen, and a reminder to verify licences before you build. |

![The Amalgam Map](docs/map.png)

### Example recipes from the map

| Region | Project | Recipe |
|---|---|---|
| AI | Private document assistant | Ollama + LlamaIndex + PostgreSQL + Qwen |
| ML | Tabular prediction model | pandas + scikit-learn + XGBoost + MLflow |
| Robotics | Autonomous mobile robot | ROS 2 + Nav2 + Gazebo |
| AI ∩ ML | Fine-tune an open model | Transformers + PyTorch + OLMo + vLLM |
| ML ∩ Robotics | Legged locomotion via RL | MuJoCo + JAX + Ray |
| AI ∩ Robotics | Voice-commanded robot | Whisper + Ollama + ROS 2 + Nav2 |
| AI ∩ ML ∩ Robotics | Vision-language-action robot | LeRobot + PyTorch + Transformers + MuJoCo + ROS 2 |
| Computer Science | Self-hosted deployment platform | Docker + Kubernetes + Grafana + Linux |

## Tech stack

Plain **HTML, CSS and vanilla JavaScript**, with no framework and no build step.

- **Fonts:** Pinyon Script (calligraphy), Cormorant Garamond (research serif), IBM Plex Mono (instrument labels), from Google Fonts
- **Venn diagram:** hand-built SVG using clip paths and masks to paint each exact intersection
- **Background:** canvas constellation animation (respects `prefers-reduced-motion`)
- **News:** [Hacker News Algolia API](https://hn.algolia.com/api), with no API key needed
- **Hosting:** [Vercel](https://vercel.com)

## Project structure

```
├── index.html   # Page structure and sections
├── styles.css   # Monochrome, research-style design
├── data.js      # Tools, Venn map recipes, trends, news topics (edit content here)
├── app.js       # Atlas filtering, Venn map, live wire, background animation
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

- **Add a tool:** append to `tools` with `d` (`cs` | `ai` | `ml` | `robotics`), `name`, `kind`, `license`, `url` and `desc`.
- **Add a project recipe:** add to the matching region in `map`. Tool names must exactly match a tool's `name` in the Atlas.
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
