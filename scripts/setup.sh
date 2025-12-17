#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting BTC-Bot Server Setup for Amazon Linux 2023...${NC}"

# 1. Update System
echo -e "${GREEN}Updating system packages...${NC}"
sudo dnf update -y

# 2. Install Git and Docker
echo -e "${GREEN}Installing Git and Docker...${NC}"
sudo dnf install -y docker git

# 3. Start and Enable Docker
echo -e "${GREEN}Starting Docker service...${NC}"
sudo systemctl start docker
sudo systemctl enable docker

# 4. Add current user to docker group (so you don't need sudo for docker commands)
echo -e "${GREEN}Adding user to docker group...${NC}"
sudo usermod -aG docker $USER

# 5. Install Docker Compose (Plugin)
echo -e "${GREEN}Installing Docker Compose...${NC}"
sudo mkdir -p /usr/local/lib/docker/cli-plugins/
sudo curl -SL https://github.com/docker/compose/releases/download/v2.29.1/docker-compose-linux-$(uname -m) -o /usr/local/lib/docker/cli-plugins/docker-compose
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# 5.1 Install Docker Buildx (Required for compose build)
echo -e "${GREEN}Installing Docker Buildx...${NC}"
sudo curl -SL https://github.com/docker/buildx/releases/download/v0.16.2/buildx-linux-$(uname -m) -o /usr/local/lib/docker/cli-plugins/docker-buildx
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-buildx

# 6. Setup Swap Memory (Crucial for t2.micro)
# Check if swap exists
if [ $(free | grep -i swap | awk '{print $2}') -eq 0 ]; then
    echo -e "${GREEN}Setting up 2GB Swap file for t2.micro...${NC}"
    sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    # Make persistent
    echo '/swapfile swap swap defaults 0 0' | sudo tee -a /etc/fstab
    echo -e "${GREEN}Swap created.${NC}"
else
    echo -e "${GREEN}Swap already exists. Skipping.${NC}"
fi

echo -e "${GREEN}Setup Complete!${NC}"
echo -e "Please log out and log back in for the 'docker' group changes to take effect."
