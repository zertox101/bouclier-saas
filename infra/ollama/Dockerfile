# BOUCLIER - Custom Ollama Image with Model Warmup
# Based on official Ollama image with added model management capabilities

FROM ollama/ollama:latest

# Install curl for health checks and model management
USER root
RUN apk add --no-cache curl bash

# Copy initialization script
COPY ollama-init.sh /usr/local/bin/ollama-init.sh
RUN chmod +x /usr/local/bin/ollama-init.sh

# Switch back to ollama user
USER ollama

# Set environment variables
ENV OLLAMA_HOST=0.0.0.0
ENV OLLAMA_PORT=11434
ENV OLLAMA_PRIMARY_MODEL=llama3.2:3b
ENV KEEP_WARM_INTERVAL=300

# Expose the Ollama port
EXPOSE 11434

# Health check that verifies both Ollama is running AND the model is available
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=5 \
    CMD curl -f http://localhost:11434/api/tags | grep -q "llama3.2:3b" || exit 1

# Run the initialization script which will pull models and keep them warm
CMD ["/usr/local/bin/ollama-init.sh"]