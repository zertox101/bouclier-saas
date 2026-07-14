FROM mcr.microsoft.com/vscode/devcontainers/python:3.12

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    git \
    curl \
    wget \
    unzip \
    nmap \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
WORKDIR /app
COPY raptor-main/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Claude Code (required)
RUN npm install -g @anthropic-ai/claude-code

# Install Semgrep (required for scanning)
RUN pip install semgrep

# Install Z3 solver for SMT-based constraint analysis (optional but recommended)
RUN pip install z3-solver

# Optional: For web scanning package
RUN pip install beautifulsoup4>=4.12.0 playwright>=1.40.0

# Optional: Tree-sitter for enhanced code analysis
RUN pip install tree-sitter tree-sitter-python tree-sitter-java tree-sitter-javascript tree-sitter-c tree-sitter-go

# Copy RAPTOR source code
COPY raptor-main/ .

# Create necessary directories
RUN mkdir -p out logs

# Set working directory
WORKDIR /app

# Expose ports (though RAPTOR is primarily CLI-based)
EXPOSE 8000

# Copy health API server
COPY server.py /app/server.py

# Start health API server in background, then keep alive for docker exec usage
CMD ["sh", "-c", "python3 /app/server.py & echo 'RAPTOR container ready. Use \"docker exec -it bouclier-raptor claude\" to start interactive session.' && tail -f /dev/null"]
