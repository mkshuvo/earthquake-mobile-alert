flowchart TD
    Start[App Launch] --> Perms{Location Perms?}
    Perms -- No --> VisualOnly[Visual Alerts Only]
    Perms -- Yes --> GetLoc[Get GPS Coordinates]
    GetLoc --> StoreLoc[Store User Location]
    
    StoreLoc --> ConnectMQTT[Connect MQTT Broker]
    ConnectMQTT --> Sub[Subscribe earthquakes/alerts]
    
    Sub --> Msg{Message Received?}
    Msg -- Yes --> Parse[Parse Earthquake Data]
    
    Parse --> CalcDist[Calculate Distance to User]
    
    CalcDist --> CheckCrit{Is Critical?}
    CheckCrit -- "Mag >= 5.0 & Dist <= 100km" --> TriggerSound[Play Loud Siren]
    CheckCrit -- "Else" --> UpdateUI[Update Map/List]
    
    TriggerSound --> ShowAlert[Show Emergency UI]
    ShowAlert --> UserAck{User Dismiss?}
    UserAck -- Yes --> StopSound[Stop Siren]
