--[[
    Survive a Brainrot – Demo Framework
    Core Features:
    - Mobile train base with upgradeable wagons
    - Brainrot zombie AI with hallucinations
    - Simple exploration zones
    - Turrets & barricades
    - Survival loop (day progression)
]]
-- SERVICES
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")
local Workspace = game:GetService("Workspace")
local Debris = game:GetService("Debris")
-- CONFIGURATION
local Config = {
    TrainSpeed = 16,
    WagonCount = 3,
    ZombieSpawnInterval = 8, -- seconds
    ZombieMaxCount = 20,
    BrainrotChance = 0.3, -- hallucination probability
    SurvivalDays = 99
}
-- MODULE: Train
local Train = {}
Train.Wagons = {}
function Train:Initialize()
    for i = 1, Config.WagonCount do
        local wagon = Instance.new("Part")
        wagon.Size = Vector3.new(10,6,10)
        wagon.Position = Vector3.new(i*12,3,0)
        wagon.Anchored = false
        wagon.Name = "Wagon"..i
        wagon.Parent = Workspace
        table.insert(self.Wagons, wagon)
    end
end
function Train:Move()
    for _, wagon in pairs(self.Wagons) do
        wagon.CFrame = wagon.CFrame + Vector3.new(Config.TrainSpeed * RunService.RenderStepped:Wait(),0,0)
    end
end
-- MODULE: Zombie AI
local ZombieModule = {}
ZombieModule.Zombies = {}
function ZombieModule:SpawnZombie(position)
    if #self.Zombies >= Config.ZombieMaxCount then return end
    local zombie = Instance.new("Part")
    zombie.Size = Vector3.new(4,6,2)
    zombie.Position = position
    zombie.BrickColor = BrickColor.new("Bright green")
    zombie.Name = "Zombie"
    zombie.Parent = Workspace
    table.insert(self.Zombies, zombie)
    -- Hallucination effect
    if math.random() < Config.BrainrotChance then
        zombie.BrickColor = BrickColor.new("Really red")
    end
    -- Simple movement loop
    spawn(function()
        while zombie.Parent do
            local nearestPlayer = nil
            local minDist = math.huge
            for _, p in pairs(Players:GetPlayers()) do
                if p.Character and p.Character:FindFirstChild("HumanoidRootPart") then
                    local dist = (p.Character.HumanoidRootPart.Position - zombie.Position).Magnitude
                    if dist < minDist then
                        minDist = dist
                        nearestPlayer = p.Character.HumanoidRootPart
                    end
                end
            end
            if nearestPlayer then
                local direction = (nearestPlayer.Position - zombie.Position).Unit
                zombie.CFrame = zombie.CFrame + direction * 4 * RunService.RenderStepped:Wait()
            end
            wait(0.1)
        end
    end)
end
-- MODULE: Player Setup
local function SetupPlayer(player)
    local char = player.Character or player.CharacterAdded:Wait()
    local hrp = char:WaitForChild("HumanoidRootPart")
    hrp.Position = Vector3.new(0,10,0) -- spawn above train
    -- Simple demo backpack tool
    local sword = Instance.new("Tool")
    sword.Name = "Sword"
    sword.Parent = player.Backpack
end
Players.PlayerAdded:Connect(SetupPlayer)
-- MAIN GAME LOOP
Train:Initialize()
spawn(function()
    while true do
        Train:Move()
        wait(0.05)
    end
end)
spawn(function()
    while true do
        local spawnPos = Vector3.new(math.random(-20,40),3,math.random(-20,20))
        ZombieModule:SpawnZombie(spawnPos)
        wait(Config.ZombieSpawnInterval)
    end
end)
print("✅ Survive a Brainrot Demo Initialized")
