# PROOF - COMPDIAGNOSTICS MIDDLE

Source: D:\phoenix-chat-logs\CHAT-LOGS-ONLY\COMPDIAGNOSTICS.txt

+   $watch | Where-Object { $_ -and $_ -in $_.ProcessName }
+                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (:) [], PropertyNotFoundException
    + FullyQualifiedErrorId : PropertyNotFoundStrict

The property 'ProcessName' cannot be found on this object. Verify that the property exists.
At line:89 char:27
+   $watch | Where-Object { $_ -and $_ -in $_.ProcessName }
+                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (:) [], PropertyNotFoundException
