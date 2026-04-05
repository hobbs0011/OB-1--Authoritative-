# PROOF - RAW-PHOENIX-GPT-23 MIDDLE

Source: D:\phoenix-chat-logs\CHAT-LOGS-ONLY\RAW-PHOENIX-GPT-23.txt

mkdir -p \
  contracts plex/{middleware,routes,util} \
  sim/{fixtures} planner capabilities/adapters \
  executor/{runners} ledger

############################################
# wrangler.toml
############################################
cat > wrangler.toml <<'EOF'
name = "phoenix-magic-chat"
