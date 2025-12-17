#!/bin/bash
set -e

GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}Starting Bot Update...${NC}"

# 1. Pull latest code
echo -e "${GREEN}Pulling latest changes from git...${NC}"
git pull

# 2. Check for .env file
if [ ! -f .env ]; then
    echo -e "\033[0;31mError: .env file not found! Please create it before deploying.\033[0m"
    exit 1
fi

# 3. Rebuild and Restart
echo -e "${GREEN}Rebuilding and starting containers...${NC}"
# Use docker compose (v2) syntax
docker compose up -d --build

# 4. Cleanup unused images to save space
echo -e "${GREEN}Cleaning up old images...${NC}"
docker image prune -f

echo -e "${GREEN}Update functionality complete. Logs:${NC}"
docker compose logs -f bot
