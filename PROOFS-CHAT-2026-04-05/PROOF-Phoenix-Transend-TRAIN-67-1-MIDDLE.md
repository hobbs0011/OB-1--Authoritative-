# PROOF - Phoenix-Transend-TRAIN-67-1 MIDDLE

Source: D:\phoenix-chat-logs\CHAT-LOGS-ONLY\Phoenix-Transend-TRAIN-67-1.txt


-- Fuel Barrels (Objectives)
local FuelBarrels = Instance.new("Folder")
FuelBarrels.Name = "FuelBarrels"
FuelBarrels.Parent = Workspace

for i = 1, 3 do
    local Barrel = Instance.new("Part")
    Barrel.Name = "FuelBarrel" .. i
    Barrel.Size = Vector3.new(3, 4, 3)
