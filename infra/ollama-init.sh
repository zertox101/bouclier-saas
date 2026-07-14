#!/bin/bash
# BOUCLIER - Ollama Model Initialization & Warmup Script
# Ensures llama3.2:3b is always available and warm

set -e

OLLAMA_HOST="${OLLAMA_HOST:-0.0.0.0}"
OLLAMA_PORT="${OLLAMA_PORT:-11434}"
PRIMARY_MODEL="${OLLAMA_PRIMARY_MODEL:-llama3.2:3b}"
KEEP_WARM_INTERVAL="${KEEP_WARM_INTERVAL:-300}"  # 5 minutes default

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

wait_for_ollama() {
    log "Waiting for Ollama to start..."
    while ! curl -s "http://localhost:${OLLAMA_PORT}/api/tags" > /dev/null 2>&1; do
        sleep 2
    done
    log "Ollama is running!"
}

pull_model() {
    local model=$1
    log "Checking if model '$model' exists..."
    
    if curl -s "http://localhost:${OLLAMA_PORT}/api/tags" | grep -q "\"name\":\"$model\""; then
        log "Model '$model' already exists."
        return 0
    fi
    
    log "Pulling model '$model'... This may take several minutes."
    curl -X POST "http://localhost:${OLLAMA_PORT}/api/pull" \
        -H "Content-Type: application/json" \
        -d "{\"name\": \"$model\"}"
    
    log "Model '$model' pulled successfully!"
}

warmup_model() {
    local model=$1
    log "Warming up model '$model'..."
    
    curl -X POST "http://localhost:${OLLAMA_PORT}/api/generate" \
        -H "Content-Type: application/json" \
        -d "{
            \"model\": \"$model\",
            \"prompt\": \"Hello, this is a warmup request. Please respond briefly.\",
            \"stream\": false,
            \"keep_alive\": 24h
        }" > /dev/null 2>&1
    
    log "Model '$model' warmed up!"
}

keep_models_warm() {
    log "Starting model warmup keeper (interval: ${KEEP_WARM_INTERVAL}s)..."
    
    while true; do
        sleep ${KEEP_WARM_INTERVAL}
        
        log "Keeping models warm..."
        warmup_model "$PRIMARY_MODEL"
    done
}

# Main execution
log "=== BOUCLIER Ollama Initialization ==="

wait_for_ollama

# Pull primary model
pull_model "$PRIMARY_MODEL"

# Also pull tinyllama for fast responses if configured
if [ -n "$OLLAMA_FAST_MODEL" ]; then
    pull_model "$OLLAMA_FAST_MODEL"
fi

# Initial warmup
warmup_model "$PRIMARY_MODEL"

log "=== Initialization Complete ==="
log "Primary model: $PRIMARY_MODEL"
log "Keep warm interval: ${KEEP_WARM_INTERVAL}s"

# Start the keep-warm background process
keep_models_warm &

# Execute the original Ollama command
exec ollama serve --host "$OLLAMA_HOST" --port "$OLLAMA_PORT"