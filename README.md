# 🧬 CRISPR Guide Design Mini-Tool (Educational Web App)

An interactive web-based tool for **CRISPR guide RNA (gRNA) identification, scoring, and sequence visualization**, developed for **educational and learning purposes**.

This application demonstrates the **computational logic behind CRISPR guide design**, including PAM detection, guide extraction, heuristic scoring, and intuitive visualization of nucleotide sequences.

> ⚠️ This tool is intended **only for educational and visualization purposes** and is **not suitable for experimental, clinical, or therapeutic use**.

---

## 🚀 Features

- 🔍 **CRISPR system selection**
  - Supports SpCas9, SaCas9, StCas9, Cas12a variants, and Type I systems
- 🧬 **PAM-aware scanning**
  - Detects PAMs using IUPAC ambiguity codes (e.g., NGG, TTTN)
- ✂️ **Guide RNA extraction**
  - Automatically extracts fixed-length guides upstream of PAM sites
- 📊 **Heuristic scoring**
  - GC content
  - Self-complementarity (hairpin risk)
  - Local off-target-like similarity (within input sequence)
- 🏆 **Guide ranking**
  - Composite score (lower score ≈ better guide)
- 🧠 **Interactive visualization**
  - Guides highlighted in green
  - PAMs highlighted in red
- 📁 **CSV report export**
- 🧪 **FASTA / raw DNA input support**

---

## 🧠 How It Works (Conceptual Workflow)

1. User inputs a DNA sequence (raw or FASTA)
2. A CRISPR system is selected (defines the PAM pattern)
3. The sequence is scanned for PAM matches using IUPAC rules
4. Guide RNAs upstream of PAMs are extracted
5. Each guide is evaluated using heuristic metrics
6. Guides are ranked and visualized directly on the sequence
7. Results can be exported as a CSV report

---

## 🧬 Supported CRISPR Systems

| System | PAM |
|------|-----|
| SpCas9 (S. pyogenes) | NGG |
| SaCas9 (S. aureus) | NNGRRT |
| StCas9 (S. thermophilus) | NNAGAA |
| FnCas12a | TTTN |
| AsCas12a | TTTN |
| Type I systems | CCN / TCN / AWG / CC |

---

## 📂 Project Structure



**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm install

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

