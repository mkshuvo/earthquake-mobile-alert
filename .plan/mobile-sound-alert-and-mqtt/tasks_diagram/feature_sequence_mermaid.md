sequenceDiagram
    participant User
    participant App as Mobile App
    participant Loc as LocationService
    participant MQTT as MQTT Broker
    participant Svc as EarthquakeService
    participant Snd as SoundService

    User->>App: Launch App
    App->>Loc: Request Permissions
    Loc-->>App: Granted
    App->>Loc: Get Current Position
    Loc-->>App: {lat, lon}
    App->>Svc: Update User Location
    
    App->>Svc: Initialize MQTT
    Svc->>MQTT: Connect & Subscribe "earthquakes/alerts"
    
    MQTT-->>Svc: Message: {id, lat, lon, mag: 6.5}
    Svc->>Svc: Calculate Distance(User, Quake)
    
    alt Distance < 100km AND Mag >= 5.0
        Svc->>Snd: playAlert()
        Snd-->>User: 🔊 LOUD SIREN
        Svc->>App: Show Emergency Banner
    else Far or Weak
        Svc->>App: Update Map/List
    end
    
    User->>App: Tap "I'm Safe"
    App->>Snd: stopAlert()
