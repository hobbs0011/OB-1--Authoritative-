net stop LightingService
net stop ArmouryCrateService
net stop ArmouryCrateControlInterface
net stop AsusAppService
net stop AsusCertService
net stop ASUSOptimization
net stop AsusPTPService
net stop ASUSSoftwareManager
net stop ASUSSwitch
net stop ASUSSystemAnalysis
net stop ASUSSystemDiagnosis
net stop Aura Wallpaper Service
taskkill /F /FI "SERVICES eq LightingService"
taskkill /F /FI "SERVICES eq ArmouryCrateService"
echo DONE
