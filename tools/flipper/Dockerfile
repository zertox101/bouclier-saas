FROM ubuntu:22.04

# Install dependencies for Flipper Build Tool (fbt)
RUN apt-get update && apt-get install -y \
    git \
    python3 \
    python3-pip \
    wget \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /flipper

# Clone the official firmware repository
RUN git clone --recursive https://github.com/flipperdevices/flipperzero-firmware.git .

# Initial build to setup environment
RUN ./fbt

CMD ["/bin/bash"]
